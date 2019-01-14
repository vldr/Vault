using ImageMagick;
using Ionic.Zip;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Vault.Models;

namespace Vault.Models
{
    public class ProcessService
    {
        // Our vault database context...
        private VaultContext _context { get; set; }

        // Instance of our hub...
        private readonly IHubContext<VaultHub> _hubContext;

        // Instance of our configuration...
        private IConfiguration _configuration;

        /// <summary>
        /// Sets up a simple enum to represent attribute types....
        /// </summary>
        public enum AttributeTypes
        {
            FolderIcon = 1,
            FolderStyle = 2,

            FileIcon = 3,
            FileAction = 4,
            FileShareIcon = 5,
            FileIconNoPreview = 6
        }

        /// <summary>
        /// Constructor...
        /// </summary>
        /// <param name="context"></param>
        /// <param name="configuration"></param>
        /// <param name="hubContext"></param>
        public ProcessService(VaultContext context, IConfiguration configuration, IHubContext<VaultHub> hubContext) {
            _context = context;
            _hubContext = hubContext;
            _configuration = configuration;
        }

        /// <summary>
        /// Checks if the userid even exists
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        public bool UserExists(int id)
            => _context.Users.Any(b => b.Id == id);

        /// <summary>
        /// Gets the hashed password from the database!
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        public string GetPasswordHash(int id) 
            => _context.Users.Where(b => b.Id == id).FirstOrDefault().Password;

        /// <summary>
        /// Checks if the folder even exists
        /// </summary>
        /// <param name="ownerId"></param>
        /// <param name="id"></param>
        /// <returns></returns>
        public bool IsFolderValid(int ownerId, int id)
            => _context.Folders.Any(b => b.Id == id && b.Owner == ownerId);

        /// <summary>
        /// Checks whether a folder matching params exists, if it does it returns it, otherwise
        /// it creates a brand new fresh folder...
        /// </summary>
        /// <param name="owner">The owner of the folder...</param>
        /// <param name="folderName">The folder's name...</param>
        /// <returns>Folder Instance</returns>
        public Folder FolderCreateOrExists(User owner, string folderName)
        { 
            // Attempt to find the folder matching our criteria...
            Folder folder = _context.Folders
            .Where(b => b.FolderId == owner.Folder 
            && b.Owner == owner.Id
            && b.Name == folderName).FirstOrDefault();

            // If we haven't found a folder matching our criteria, then gohead and make a new one...
            if (folder == null)
            {
                // Attempt to add our folder to the database...
                // Return our newly created folder object...
                return AddNewFolder(owner.Id, folderName, owner.Folder).folder;
            }
            else
                // Otherwise, return the folder that is already there...
                return folder;
        }

        /// <summary>
        /// Gets a folder given an id...
        /// </summary>
        /// <param name="ownerId"></param>
        /// <param name="folderId"></param>
        /// <returns></returns>
        public IEnumerable<Folder> GetFolders(int ownerId, int folderId) 
            => _context.Folders.Where(b => b.FolderId == folderId && b.Owner == ownerId);

        /// <summary>
        /// Gets a list of folder listings with matching owners and folder id...
        /// </summary>
        /// <param name="ownerId"></param>
        /// <param name="folderId"></param>
        /// <returns></returns>
        public int GetFileCount(int ownerId, int folderId)
            => _context.Files.Where(b => b.Folder == folderId && b.Owner == ownerId).Count();

        /// <summary>
        /// Gets a list of folder listings with matching owners and folder id...
        /// </summary>
        /// <param name="ownerId"></param>
        /// <param name="folderId"></param>
        /// <returns></returns>
        public IEnumerable<FolderListing> GetFolderListings(int ownerId, int folderId)
            => _context.Folders.Where(b => b.FolderId == folderId && b.Owner == ownerId)
            .Select(x => new FolderListing
            {
                Id = x.Id,
                Name = x.Name,
                Icon = GetFolderAttribute(x.Colour, AttributeTypes.FolderIcon),
                Style = GetFolderAttribute(x.Colour, AttributeTypes.FolderStyle),
                IsSharing = x.IsSharing,
                ShareId = x.ShareId
            });

        /// <summary>
        /// Gets a list of file listings with matching owners and folder id...
        /// </summary>
        /// <param name="ownerId"></param>
        /// <param name="folderId"></param>
        /// <param name="sortBy"></param>
        /// <param name="offset"></param>
        /// <returns></returns>
        public IEnumerable<FileListing> GetFileListings(int ownerId, int folderId, int sortBy, int offset = 0)
            => SortFiles(_context.Files.Where(b => b.Folder == folderId && b.Owner == ownerId), sortBy)
            .Select(x => new FileListing
            {
                Id = x.Id,
                Name = x.Name,
                Icon = GetFileAttribute(x.Id.ToString(), x.Ext, AttributeTypes.FileIcon),
                Date = x.Created.ToString(),
                Size = GetBytesReadable(x.Size),
                IsSharing = x.IsSharing,
                ShareId = x.ShareId
            }).Skip(offset).Take(50);

        /// <summary>
        /// Gets a list of file listings which have been shared...
        /// </summary>
        /// <param name="ownerId"></param>
        /// <param name="folderId"></param>
        /// <param name="sortBy"></param>
        /// <param name="offset"></param>
        /// <returns></returns>
        public IEnumerable<FileListing> GetSharedFileListings(int ownerId, int folderId, string shareId, int sortBy, int offset = 0)
           => SortFiles(_context.Files.Where(b => b.Folder == folderId && b.Owner == ownerId), sortBy)
           .Select(x => new FileListing
           {
               Id = x.Id,
               Name = x.Name,
               Icon = GetFileAttribute($"{shareId}/{x.Id}/{folderId}", x.Ext, AttributeTypes.FileShareIcon),
               Folder = x.Folder,
               Size = GetBytesReadable(x.Size),
               Date = x.Created.ToString()
           }).Skip(offset).Take(50);

        /// <summary>
        /// Gives all the files inside a folder...
        /// </summary>
        /// <param name="ownerId"></param>
        /// <param name="folderId"></param>
        /// <returns></returns>
        public IEnumerable<File> GetFiles(int ownerId, int folderId) 
            => _context.Files.Where(b => b.Folder == folderId && b.Owner == ownerId);

        /// <summary>
        /// Gives all the files inside a folder using a List...
        /// </summary>
        /// <param name="ownerId"></param>
        /// <param name="folderId"></param>
        /// <returns></returns>
        public List<File> GetFilesList(int ownerId, int folderId) 
            => _context.Files.Where(b => b.Folder == folderId && b.Owner == ownerId).ToList();


        /// <summary>
        /// Gets a folders unique attribute depending on its colour...
        /// </summary>
        /// <param name="colour"></param>
        /// <param name="type"></param>
        /// <returns></returns>
        public string GetFolderAttribute(int colour, AttributeTypes type = AttributeTypes.FolderIcon)
        {
            switch (colour)
            {
                case 1:
                    if (type == AttributeTypes.FolderIcon)
                        return "images/folder-icon2.png";
                    else
                        return "purple-icon";
                case 2:
                    if (type == AttributeTypes.FolderIcon)
                        return "images/folder-icon3.png";
                    else
                        return "green-icon";
                case 3:
                    if (type == AttributeTypes.FolderIcon)
                        return "images/folder-icon4.png";
                    else
                        return "red-icon";
                case 4:
                    if (type == AttributeTypes.FolderIcon)
                        return "images/folder-icon5.png";
                    else
                        return "blue-icon";
                default:
                    if (type == AttributeTypes.FolderIcon)
                        return "images/folder-icon.png";
                    else
                        return "orange-icon";
            }
        }

        /// <summary>
        /// Gets a folders unique attribute depending on its colour...
        /// </summary>
        /// <param name="id"></param>
        /// <param name="ext"></param>
        /// <param name="type"></param>
        /// <returns></returns>
        public string GetFileAttribute(string id, string ext, AttributeTypes type = AttributeTypes.FileIcon)
        {
            // Setup our default action so we don't repeat ourselves...
            var defaultAction = "0";

            switch (ext)
            {
                case ".zip":
                case ".rar":
                case ".tar":
                case ".gz":
                case ".zipx":
                    if (type == AttributeTypes.FileIcon 
                        || type == AttributeTypes.FileIconNoPreview
                        || type == AttributeTypes.FileShareIcon)
                        return "images/zip-icon.png";
                    else
                        return defaultAction;
                case ".mov":
                case ".mp4":
                case ".webm":
                    if (type == AttributeTypes.FileIcon
                        || type == AttributeTypes.FileIconNoPreview
                        || type == AttributeTypes.FileShareIcon)
                        return "images/video-icon.png";
                    else
                        return "2";
                case ".docx":
                case ".asd":
                case ".dotx":
                case ".dotm":
                case ".wbk":
                case ".docm":
                    if (type == AttributeTypes.FileIcon
                        || type == AttributeTypes.FileIconNoPreview
                        || type == AttributeTypes.FileShareIcon)
                        return "images/word-icon.png";
                    else
                        return defaultAction;
                case ".pptx":
                case ".pps":
                    if (type == AttributeTypes.FileIcon
                        || type == AttributeTypes.FileIconNoPreview
                        || type == AttributeTypes.FileShareIcon)
                        return "images/PowerPoint-icon.png";
                    else
                        return defaultAction;
                case ".pub":
                    if (type == AttributeTypes.FileIcon
                        || type == AttributeTypes.FileIconNoPreview
                        || type == AttributeTypes.FileShareIcon)
                        return "images/Publisher-icon.png";
                    else
                        return defaultAction;
                case ".exe":
                case ".app":
                case ".dmg":
                case ".bat":
                case ".elf":
                case ".sys":
                case ".msi":
                case ".sh":
                case ".deb":
                case ".com":
                    if (type == AttributeTypes.FileIcon
                        || type == AttributeTypes.FileIconNoPreview
                        || type == AttributeTypes.FileShareIcon)
                        return "images/shell-icon.png";
                    else
                        return defaultAction;
                case ".xlsx":
                case ".xls":
                    if (type == AttributeTypes.FileIcon
                        || type == AttributeTypes.FileIconNoPreview
                        || type == AttributeTypes.FileShareIcon)
                        return "images/Excel-icon.png";
                    else
                        return defaultAction;
                case ".pdf":
                    if (type == AttributeTypes.FileIcon
                        || type == AttributeTypes.FileIconNoPreview
                        || type == AttributeTypes.FileShareIcon)
                        return "images/pdf-icon.png";
                    else
                        return "3";
                case ".png":
                case ".jpg":
                case ".jpeg":
                case ".bmp":
                case ".pjpeg":
                case ".gif":
                    if (type == AttributeTypes.FileIcon) return "process/thumbnail/" + id;
                    else if (type == AttributeTypes.FileShareIcon) return "share/thumbnail/" + id;
                    else if (type == AttributeTypes.FileIconNoPreview) return "images/image-icon.png";
                    else return "1";
                default:
                    if (type == AttributeTypes.FileIcon 
                        || type == AttributeTypes.FileIconNoPreview 
                        || type == AttributeTypes.FileShareIcon)
                        return "images/unknown-icon.png";
                    else
                        return defaultAction;
            }
        }

        /// <summary>
        /// Gets the bytes as a readable string...
        /// </summary>
        /// <param name="i"></param>
        /// <returns></returns>
        public string GetBytesReadable(long i)
        {
            // Get absolute value
            long absolute_i = (i < 0 ? -i : i);

            // Determine the suffix and readable value
            string suffix;
            double readable;

            if (absolute_i >= 0x1000000000000000) // Exabyte
            {
                suffix = "EB";
                readable = (i >> 50);
            }
            else if (absolute_i >= 0x4000000000000) // Petabyte
            {
                suffix = "PB";
                readable = (i >> 40);
            }
            else if (absolute_i >= 0x10000000000) // Terabyte
            {
                suffix = "TB";
                readable = (i >> 30);
            }
            else if (absolute_i >= 0x40000000) // Gigabyte
            {
                suffix = "GB";
                readable = (i >> 20);
            }
            else if (absolute_i >= 0x100000) // Megabyte
            {
                suffix = "MB";
                readable = (i >> 10);
            }
            else if (absolute_i >= 0x400) // Kilobyte
            {
                suffix = "KB";
                readable = i;
            }
            else
            {
                return i.ToString("0 B"); // Byte
            }

            // Divide by 1024 to get fractional value
            readable = (readable / 1024);

            // Return formatted number with suffix
            return readable.ToString("0.### ") + suffix;
        }


        /// <summary>
        /// Gets a folder given an id using a list...
        /// </summary>
        /// <param name="ownerId"></param>
        /// <param name="folderId"></param>
        /// <returns></returns>
        public List<Folder> GetFoldersList(int ownerId, int folderId)
        {
            return _context.Folders.Where(b => b.FolderId == folderId && b.Owner == ownerId).ToList();
        }

        /// <summary>
        /// Gives all the files inside a folder... (Sorted)
        /// </summary>
        /// <param name="query"></param>
        /// <param name="sortBy"></param>
        /// <returns></returns>
        public IQueryable<File> SortFiles(IQueryable<File> query, int sortBy = 0)
        {
            switch (sortBy)
            {
                // Size
                case 1:
                    return query.OrderBy(b => b.Size);
                // Size (descending)
                case -1:
                    return query.OrderByDescending(b => b.Size);
                // Name
                case 2:
                    return query.OrderBy(b => b.Name);
                // Name (descending)
                case -2:
                    return query.OrderByDescending(b => b.Name);
                // Id
                case 3:
                    return query.OrderBy(b => b.Id);
                // Id (descending)
                case -3:
                    return query.OrderByDescending(b => b.Id);
                // Type (descending)
                case -4:
                    return query.OrderByDescending(b => b.Ext);
                // Type
                default:
                    return query.OrderBy(b => b.Ext);
            }
        }

        /// <summary>
        /// Generates thumbnails to be used to display images
        /// </summary>
        /// <param name="ext"></param>
        /// <param name="path"></param>
        public void GenerateThumbnails(string ext, string path)
        {
            // Check if our file is a PNG, JPEG, or JPG....
            if ( !(ext == ".png" || ext == ".jpeg" || ext == ".jpg") )
                return;

            // Setup a magick image and see if this file is an image!
            var magickImage = new MagickImage(path);

            ///////////////////////////////////////////////

            try
            {
                // Constant variables to help us figure out what is going on!
                const int NONE = 0;
                const int HORIZONTAL = 1;
                const int VERTICAL = 2;
                int[][] OPERATIONS = new int[][] {
                        new int[] {  0, NONE},
                        new int[] {  0, HORIZONTAL},
                        new int[] {180, NONE},
                        new int[] {  0, VERTICAL},
                        new int[] { 90, HORIZONTAL},
                        new int[] { 90, NONE},
                        new int[] {-90, HORIZONTAL},
                        new int[] {-90, NONE},
                    };

                // Get our files attribute!
                string exifAttribute = magickImage.GetAttribute("EXIF:Orientation");

                // Get the index from the attribute EXIF:Orientation...
                if (exifAttribute != null)
                {
                    int index = int.Parse(exifAttribute) - 1;

                    // Translate that into degrees!
                    int degrees = OPERATIONS[index][0];

                    // If the degrees exist then actually rotate the image!
                    if (degrees != 0)
                    {
                        magickImage.Rotate(degrees);
                    }

                    // Figure out if we need to flip or flop the image!
                    switch (OPERATIONS[index][1])
                    {
                        case HORIZONTAL:
                            magickImage.Flop();
                            break;
                        case VERTICAL:
                            magickImage.Flip();
                            break;
                    }

                }
            }
            catch { }

            ///////////////////////////////////////////////

            // Full path to the file image thumbnail...
            string filePathPreview = $"{path}.preview";

            // Strip all the metadata...
            magickImage.Strip();

            // Set the quality to around 50%...
            magickImage.Quality = 50;

            // Set our format to be a jpeg for that amazing compression...
            magickImage.Format = MagickFormat.Jpeg;

            // Write the file!
            magickImage.Write(filePathPreview);

            ///////////////////////////////////////////////

            // Full path to the file image thumbnail...
            string filePathThumbnail = $"{path}.thumb";

            // Use MagickImage to resize it!
            magickImage.Resize(32, 32);

            // Strip all the metadata...
            magickImage.Strip();

            // Set to the lowest quality possible...
            magickImage.Quality = 25;

            // Write the file!
            magickImage.Write(filePathThumbnail);
        }

        /// <summary>
        /// Uses recursion to zip files!
        /// </summary>
        /// <param name="folderId"></param>
        /// <param name="userId"></param>
        /// <param name="zip"></param>
        /// <param name="limit"></param>
        /// <returns></returns>
        public async Task ZipFiles(int folderId, int userId, ZipOutputStream zip, CancellationToken cancellationToken, int limit = 0)
        {
            // Check if our task was cancelled before we even venture in...
            if (cancellationToken.IsCancellationRequested)
                return;

            // Get our folder!
            var folder = GetFolder(userId, folderId);

            // Get our files!
            var files = GetFilesList(userId, folderId);

            // For every file compress it! 
            foreach (var file in files)
            {
                // Check if our task was cancelled for every file...
                if (cancellationToken.IsCancellationRequested)
                    return;

                // If the file doesn't exist, continue...
                if (!System.IO.File.Exists(file.Path))
                    continue;

                // Setup our folder location.
                string folderLocation = GetFolderLocation(folder, limit);

                // Setup our file name variable which will contain a safer version of the file name...
                string fileName = file.Name.Replace('/', '_');

                // Setup our entry name...
                StringBuilder entryName = new StringBuilder($"{folderLocation}{fileName}");

                // Loop until we've found an entry that doesn't exist!
                for (int count = 1; zip.ContainsEntry(entryName.ToString());)
                {
                    // Clear out our entry name...
                    entryName.Clear();

                    // Append our new entry which includes our 
                    entryName.Append($"{folderLocation}({count++}){fileName}");
                }

                // Set the file name as the next entry...
                var entry = zip.PutNextEntry(entryName.ToString());

                // Setup our compression level to not compress at all...
                entry.CompressionLevel = Ionic.Zlib.CompressionLevel.None;

                // Setup a filestream and stream contents to the zip stream!
                using (var stream = new FileStream(file.Path, FileMode.Open, FileAccess.Read, FileShare.ReadWrite, 4096, true))
                {
                    // Place our copy to async inside a try catch...
                    try
                    {
                        // Copy all our data to the zip stream...
                        await stream.CopyToAsync(zip, cancellationToken);
                    }
                    catch { };
                }
            }

            // Get all the folders inside our folder!
            var folders = GetFoldersList(userId, folderId);

            // Iterate throughout all our folders!
            foreach (var folderItem in folders)
            {
                // Check if our task was cancelled for every folder...
                if (cancellationToken.IsCancellationRequested)
                    return;

                // Zip those files up!
                await ZipFiles(folderItem.Id, userId, zip, cancellationToken, limit);
            }
        }

        /// <summary>
        /// Checks if a folder can move there...
        /// </summary>
        /// <param name="ownerId"></param>
        /// <param name="fileId"></param>
        /// <param name="shareId"></param>
        /// <returns></returns>
        public bool IsShareIdTaken(int ownerId, int fileId, string shareId)
            => _context.Files.Any(b => b.Id == fileId && b.Owner == ownerId && b.ShareId == shareId);

        /// <summary>
        /// Check whether a folder's share id is already taken...
        /// </summary>
        /// <param name="ownerId"></param>
        /// <param name="folderId"></param>
        /// <param name="shareId"></param>
        /// <returns></returns>
        public bool IsShareIdTakenFolder(int ownerId, int folderId, string shareId)
            => _context.Folders.Any(b => b.Id == folderId && b.Owner == ownerId && b.ShareId == shareId);

        /// <summary>
        /// Checks if a folder can move there...
        /// </summary>
        /// <param name="ownerId"></param>
        /// <param name="id"></param>
        /// <param name="folderId"></param>
        /// <returns></returns>
        public bool CanFolderMove(int ownerId, int id, int folderId) 
            => _context.Folders.Any(b => b.Id == id && b.Owner == ownerId && b.FolderId == folderId);

        /// <summary>
        /// Checks if a file can move there...
        /// </summary>
        /// <param name="ownerId"></param>
        /// <param name="id"></param>
        /// <param name="folderId"></param>
        /// <returns></returns>        
        public bool CanFileMove(int ownerId, int id, int folderId) 
            => _context.Files.Any(b => b.Id == id && b.Owner == ownerId && b.Folder == folderId);

        /// <summary>
        /// Gets a folder when asked for one...
        /// </summary>
        /// <param name="ownerId"></param>
        /// <param name="folderId"></param>
        /// <returns></returns>
        public Folder GetFolder(int ownerId, int folderId)
            => _context.Folders.Where(b => b.Id == folderId && b.Owner == ownerId).FirstOrDefault();

        /// <summary>
        /// Gets a file when asked for one...
        /// </summary>
        /// <param name="ownerId"></param>
        /// <param name="fileId"></param>
        /// <returns></returns>
        public File GetFile(int ownerId, int fileId) 
            => _context.Files.Where(b => b.Id == fileId && b.Owner == ownerId).FirstOrDefault();

        /// <summary>
        /// Gets a file using the shareId, only works if it is being shared!
        /// </summary>
        /// <param name="shareId"></param>
        /// <returns></returns>
        public File GetSharedFile(string shareId)
            => _context.Files.Where(b => b.IsSharing == true && b.ShareId == shareId).FirstOrDefault();

        /// <summary>
        /// Gets a shared file given the owner, folder it resides, and its file id...
        /// </summary>
        /// <param name="fileId"></param>
        /// <param name="folderId"></param>
        /// <param name="ownerId"></param>
        /// <returns></returns>
        public File GetSharedFile(int fileId, int folderId, int ownerId)
            => _context.Files.Where(b => b.Id == fileId
            && b.Folder == folderId 
            && b.Owner == ownerId).FirstOrDefault();

        /// <summary>
        /// Gets a folder that is being shared, given the shareId...
        /// </summary>
        /// <param name="shareId"></param>
        /// <returns></returns>
        public Folder GetSharedFolder(string shareId)
            => _context.Folders.Where(b => b.IsSharing == true && b.ShareId == shareId).FirstOrDefault();

        /// <summary>
        /// Gets a user by their api key only if the api is enabled...
        /// </summary>
        /// <param name="apiKey"></param>
        /// <returns></returns>
        public User GetUserAPI(string apiKey) => _context.Users.Where(b => b.APIEnabled == true && b.APIKey == apiKey).FirstOrDefault();

        /// <summary>
        /// Handles adding, and generating thumbnails...
        /// </summary>
        /// <param name="userId"></param>
        /// <param name="size"></param>
        /// <param name="name"></param>
        /// <param name="ext"></param>
        /// <param name="fileId"></param>
        /// <param name="path"></param>
        /// <returns></returns>
        public (bool success, int fileId) AddNewFile(int userId, long size, string name, string ext, int folderId, string path)
        {
            // Get our user following with that user id...
            User user = _context.Users.Where(b => b.Id == userId).FirstOrDefault();

            // Check if the user exists...
            if (user == null)
                return (false, -1);

            // Call our generate thumbnail which will generate a thumbnails...
            GenerateThumbnails(ext, path);

            // Generate a file object...
            File fileObj = new File
            {
                Owner = userId,
                Size = size,
                Name = WebUtility.HtmlEncode(name),
                Ext = WebUtility.HtmlEncode(ext),
                Created = DateTime.Now,
                Folder = folderId,
                Path = path
            };

            // Add the file object to the files context...
            _context.Files.Add(fileObj);

            // Save all our changes...
            _context.SaveChanges();

            // Return true that the operation was successful...
            return (true, fileObj.Id);
        }

        /// <summary>
        /// Shares a file using the AddNewFile as a backbone and while 
        /// also placing files inside a folder "API" on the home screen...
        /// </summary>
        /// <param name="user"></param>
        /// <param name="size"></param>
        /// <param name="name"></param>
        /// <param name="ext"></param>
        /// <param name="path"></param>
        /// <returns>Tuple, (success and the shareId filled if it was successful...)</returns>
        public (bool success, string shareId) AddNewFileAPI(User user, long size, string name, string ext, string path)
        {
            // Add new folder or use folder if it already exists...
            Folder folder = FolderCreateOrExists(user, "API");

            // Check if the folder was able to be used or created...
            if (folder == null) return (false, string.Empty);

            // Call our original add new file...
            var result = AddNewFile(user.Id, size, name, ext, folder.Id, path);

            // Make sure adding our file was successful, if not, return false...
            if (!result.success) return (false, string.Empty);

            // Respond with a tuple...
            return ToggleShareFile(user.Id, result.fileId);
        }

        /// <summary>
        /// Adds a new folder to the dataset...
        /// </summary>
        /// <param name="ownerId"></param>
        /// <param name="folderName"></param>
        /// <param name="rootFolder"></param>
        /// <returns></returns>
        public (bool success, Folder folder) AddNewFolder(int ownerId, string folderName, int rootFolder)
        {
            // Catch any exceptions...
            try
            {
                // Filter out our folder name...
                if (string.IsNullOrWhiteSpace(folderName)) return (false, null);

                // Create a new folder object...
                Folder folder = new Folder
                {
                    Owner = ownerId,
                    Name = WebUtility.HtmlEncode(folderName),
                    FolderId = rootFolder
                };

                // Add our folder to the context...
                _context.Folders.Add(folder);

                // Save our changes!
                _context.SaveChanges();

                // Return the folder object...
                return (true, folder);
            }
            catch
            {
                // Exception, false...
                return (false, null);
            }
        }

        /// <summary>
        /// Share our file!
        /// </summary>
        /// <param name="id"></param>
        /// <param name="fileId"></param>
        /// <returns></returns>
        public (bool success, string shareId) ToggleShareFile(int id, int fileId)
        {
            // Catch any exceptions...
            try
            {
                // Get our actual user...
                File file = _context.Files.Where(b => b.Id == fileId && b.Owner == id).FirstOrDefault();

                // Check if our user is null!
                if (file == null)
                    return (false, string.Empty);

                // If we want to toggle off our share, then it is simple!
                if (file.IsSharing)
                {
                    // Set our is sharing accordingly!
                    file.IsSharing = false;

                    // Empty our share id!
                    file.ShareId = string.Empty;                
                }
                // Otherwise, turn everything on...
                else
                {
                    // Set our is sharing accordingly!
                    file.IsSharing = true;

                    // Setup a variable to store our share id!
                    string shareId = $"{RandomString(7)}";

                    // Check if our share id is taken!
                    if (IsShareIdTaken(id, fileId, shareId))
                        // Return false if it is taken!
                        return (false, string.Empty);

                    // Generate our random string for our share id!
                    file.ShareId = shareId;
                }

                // Save our changes!
                _context.SaveChanges();

                // Return true as it was successful...
                return (true, file.ShareId);
            }
            catch
            {
                // Exception, false...
                return (false, string.Empty);
            }
        }

        /// <summary>
        /// Enables or disables the share functionality of a folder...
        /// </summary>
        /// <param name="id"></param>
        /// <param name="folderId"></param>
        /// <returns></returns>
        public (bool success, string shareId) ToggleShareFolder(int id, int folderId)
        {
            // Catch any exceptions...
            try
            {
                // Get our actual user...
                Folder folder = _context.Folders.Where(b => b.Id == folderId && b.Owner == id).FirstOrDefault();

                // Check if our user is null!
                if (folder == null) return (false, string.Empty);

                // Get our user...
                User user = _context.Users.Where(b => b.Id == id).FirstOrDefault();

                // Check if our user exists...
                if (user == null) return (false, string.Empty);

                // Check if we aren't about to start sharing our home folder...
                if (user.Folder == folder.Id) return (false, string.Empty);

                // If we want to toggle off our share, then it is simple!
                if (folder.IsSharing)
                {
                    // Set our is sharing accordingly!
                    folder.IsSharing = false;

                    // Empty our share id!
                    folder.ShareId = string.Empty;
                }
                // Otherwise, turn everything on...
                else
                {
                    // Set our is sharing accordingly!
                    folder.IsSharing = true;

                    // Setup a variable to store our share id!
                    string shareId = $"{RandomString(25)}";

                    // Check if our share id is taken!
                    if (IsShareIdTakenFolder(id, folderId, shareId))
                        // Return false if it is taken!
                        return (false, string.Empty);

                    // Generate our random string for our share id!
                    folder.ShareId = shareId;
                }

                // Save our changes!
                _context.SaveChanges();

                // Return true as it was successful...
                return (true, folder.ShareId);
            }
            catch
            {
                // Exception, false...
                return (false, string.Empty);
            }
        }

        /// <summary>
        /// Enables or disables the api system for the user...
        /// </summary>
        /// <param name="userId"></param>
        /// <returns></returns>
        public bool ToggleAPI(int userId, out string apiKey)
        {
            // Setup a dumby api key value...
            apiKey = string.Empty;

            // Catch any exceptions...
            try
            {
                // Get our actual user...
                User user = _context.Users.Where(b => b.Id == userId).FirstOrDefault();

                // Check if our user is null!
                if (user == null)
                    return false;

                // If our api is already enabled, then disable it...
                if (user.APIEnabled)
                {
                    // Disable our api...
                    user.APIEnabled = false;

                    // Set their api key to be empty...
                    user.APIKey = string.Empty;
                }
                // If our api is disabled, then enable it...
                else
                {
                    // Enable our api...
                    user.APIEnabled = true;

                    // Setup a random key for them...
                    user.APIKey = $"token_{RandomString(32)}";
                }

                // Save our changes!
                _context.SaveChanges();

                // Pop out our api key...
                apiKey = user.APIKey;

                // Return true as it was successful...
                return true;
            }
            catch
            {
                // Exception, false...
                return false;
            }
        }

        /// <summary>
        /// Update our file name!
        /// </summary>
        /// <param name="id"></param>
        /// <param name="fileId"></param>
        /// <param name="newName"></param>
        /// <returns></returns>
        public bool UpdateFileName(int id, int fileId, string newName)
        {
            // Catch any exceptions...
            try
            {
                // Get our actual user...
                File file = _context.Files.Where(b => b.Id == fileId && b.Owner == id).FirstOrDefault();

                // Check if our user is null!
                if (file == null) return false;

                // Double check if we aren't getting null or whitespace...
                if (string.IsNullOrWhiteSpace(newName)) return false;

                // Update our users name!
                file.Name = WebUtility.HtmlEncode(newName);

                // Save our changes!
                _context.SaveChanges();

                // Return true as it was successful...
                return true;
            }
            catch
            {
                // Exception, false...
                return false;
            }
        }

        /// <summary>
        /// Update our folder name!
        /// </summary>
        /// <param name="id"></param>
        /// <param name="folderId"></param>
        /// <param name="newName"></param>
        /// <returns></returns>
        public bool UpdateFolderName(int id, int folderId, string newName)
        {
            // Catch any exceptions...
            try
            {
                // Get our actual user...
                Folder folder = _context.Folders.Where(b => b.Id == folderId && b.Owner == id).FirstOrDefault();

                // Check if our user is null!
                if (folder == null)
                    return false;

                // Double check if we aren't getting null or whitespace...
                if (string.IsNullOrWhiteSpace(newName)) return false;

                // Update our users name!
                folder.Name = WebUtility.HtmlEncode(newName);

                // Save our changes!
                _context.SaveChanges();

                // Return true as it was successful...
                return true;
            }
            catch
            {
                // Exception, false...
                return false;
            }
        }

        /// <summary>
        /// Update our folder colour!
        /// </summary>
        /// <param name="id"></param>
        /// <param name="folderId"></param>
        /// <param name="newColour"></param>
        /// <returns></returns>
        public bool UpdateFolderColour(int id, int folderId, int newColour)
        {
            // Catch any exceptions...
            try
            {
                // Get our actual user...
                Folder folder = _context.Folders.Where(b => b.Id == folderId && b.Owner == id).FirstOrDefault();

                // Check if our user is null!
                if (folder == null)
                    return false;

                // Update our users name!
                folder.Colour = newColour;

                // Save our changes!
                _context.SaveChanges();

                // Return true as it was successful...
                return true;
            }
            catch
            {
                // Exception, false...
                return false;
            }
        }

        /// <summary>
        /// Returns the string representation of the folder's location...
        /// </summary>
        /// <param name="folder"></param>
        /// <param name="limit"></param>
        /// <param name="location"></param>
        /// <returns></returns>
        public string GetFolderLocation(Folder folder, int limit = 0, StringBuilder location = null)
        {
            // If our location parameter is null then initialize it.
            if (location == null) location = new StringBuilder();

            // Insert our folder's name at the start of the string builder 
            // and also remove a special character from the folder name...
            location.Insert(0, folder.Name.Replace('/', '_') + "/");

            // Easy case, check if we're on the root folder.
            if (folder.FolderId == limit)
            {
                // Return the final location string!
                return location.ToString();
            }

            // Call our get folder location once more to get the next folder!
            return GetFolderLocation(GetFolder(folder.Owner, folder.FolderId), limit, location);
        }

        /// <summary>
        /// Returns the string representation of the folder's location in html format...
        /// </summary>
        /// <param name="folder"></param>
        /// <param name="limit"></param>
        /// <param name="location"></param>
        /// <returns></returns>
        public string GetFolderLocationFormatted(Folder folder, int limit = 0, StringBuilder location = null)
        {
            // If our location parameter is null then initialize it.
            if (location == null) location = new StringBuilder();

            // Loop until we've hit our limit folder!
            while (folder.FolderId != limit)
            {
                // Insert our folder's name at the start of the string builder.
                location.Insert(0, $"<a href='#' data-folder-id='{folder.Id}' onclick='processMove(event)'>{folder.Name}</a> / ");

                // Get the next folder in the chain!
                folder = GetFolder(folder.Owner, folder.FolderId);
            }

            // Return the final location string!
            return location.ToString();
        }

        /// <summary>
        /// Gets the selected shared folder relative to the root folder...
        /// </summary>
        /// <param name="folder"></param>
        /// <param name="limitFolder"></param>
        /// <param name="location"></param>
        /// <returns></returns>
        public Folder GetSharedFolderRelative(int folderId, string shareId)
        {
            // Attempt to get our shared folder...
            Folder sharedFolder = GetSharedFolder(shareId);

            // Check if our shared folder is null...
            if (sharedFolder == null) return null;
            
            // Setup our target folder...
            Folder targetFolder = GetFolder(sharedFolder.Owner, folderId);

            // Check if the folder we are targetting even exists...
            if (targetFolder == null) return sharedFolder;

            // Setup our temp folder...
            Folder tempFolder = targetFolder;

            // Loop until we've found our shared folder or until we reach null!
            while (tempFolder != null && tempFolder != sharedFolder)
            {
                // Get the next folder in the chain!
                tempFolder = GetFolder(sharedFolder.Owner, tempFolder.FolderId);
            }

            // Check if our target folder does equal our shared folder...
            if (tempFolder == sharedFolder)
                // Then we've found our folder...
                return targetFolder;
            else
                // Otherwise, return the shared folder since something is off...
                return sharedFolder;
        }

        /// <summary>
        /// Update our sort by field!
        /// </summary>
        /// <param name="id"></param>
        /// <param name="newSortBy"></param>
        /// <returns></returns>
        public bool UpdateSortBy(int id, int newSortBy)
        {
            // Catch any exceptions...
            try
            {
                // Get our actual user...
                User user = _context.Users.Where(b => b.Id == id).FirstOrDefault();

                // Check if our user is null!
                if (user == null)
                    return false;

                // Update our users name!
                user.SortBy = newSortBy;

                // Save our changes!
                _context.SaveChanges();

                // Return true as it was successful...
                return true;
            }
            catch
            {
                // Exception, false...
                return false;
            }
        }

        /// <summary>
        /// Update our password...
        /// </summary>
        /// <param name="id"></param>
        /// <param name="currentPassword"></param>
        /// <param name="newPassword"></param>
        /// <returns></returns>
        public bool UpdatePassword(int id, string currentPassword, string newPassword)
        {
            // Catch any exceptions...
            try
            {
                // Get our actual user...
                User user = _context.Users.Where(b => b.Id == id).FirstOrDefault();

                // Check if our user is null!
                if (user == null)
                    return false;

                // If our user's password matches then proceed!
                if (BCrypt.BCryptHelper.CheckPassword(currentPassword, user.Password))
                {
                    // Update our user's password!
                    user.Password = BCrypt.BCryptHelper.HashPassword(newPassword, BCrypt.BCryptHelper.GenerateSalt());

                    // Save our changes!
                    _context.SaveChanges();
                    
                    // Return true as it was successful...
                    return true;
                }
            }
            catch
            {
                // Exception, false...
                return false;
            }

            return false;
        }

        /// <summary>
        /// Updates a user's name...
        /// </summary>
        /// <param name="id"></param>
        /// <param name="currentPassword"></param>
        /// <param name="newPassword"></param>
        /// <returns></returns>
        public bool UpdateName(int id, string name)
        {
            // Catch any exceptions...
            try
            {
                // Get our actual user...
                User user = _context.Users.Where(b => b.Id == id).FirstOrDefault();

                // Check if our user is null!
                if (user == null) return false;

                // Make sure our name isn't just white space or null
                if (string.IsNullOrWhiteSpace(name)) return false;

                // Okay, set up the new name...
                user.Name = WebUtility.HtmlEncode(name);

                // Save our changes!
                _context.SaveChanges();

                // If everything went smooth then return true.
                return true;
            }
            catch
            {
                // Exception, false...
                return false;
            }
        }

        /// <summary>
        /// Deletes a file from the dataset...
        /// </summary>
        /// <param name="ownerId"></param>
        /// <param name="folderId"></param>
        /// <returns></returns>
        public bool DeleteFolder(int ownerId, int folderId)
        {
            // Catch any exceptions...
            try
            {
                // Get our file...
                var files = GetFiles(ownerId, folderId);

                // Check if the file even exists...
                if (files == null)
                    return false;

                // Iterate through all our files in the folder...
                foreach (var file in files)
                {
                    // Dispose all our related files off of the disk!
                    DisposeFileOnDisk(file.Path);

                    // Remove each file from the dataset...
                    _context.Files.Remove(file);
                } 

                // Get our current folder...
                Folder currentFolder = GetFolder(ownerId, folderId);

                // Get our new folder...
                int newFolderId = currentFolder.FolderId;

                // Get all folders inside our folder...
                var folders = GetFolders(ownerId, folderId);

                // Replace all their folder id's with the new folder id...
                foreach (var folder in folders)
                {
                    folder.FolderId = newFolderId;
                }
                
                _context.Folders.Remove(currentFolder);

                // Remove our file...
                _context.SaveChanges();

                // Return true as it was successful...
                return true;
            }
            catch
            {
                // Exception, false...
                return false;
            }
        }

        /// <summary>
        /// Disposes all the files related to the file path!
        /// </summary>
        /// <param name="filePath"></param>
        public void DisposeFileOnDisk(string filePath)
        {
            try
            {
                // Get our files inside our vault storage location and starting with  the file path...
                var files = Directory.GetFiles(_configuration["VaultStorageLocation"], "*")
                    .Where(x => x.StartsWith(filePath));

                // For every file iterate throughout!
                foreach (var file in files)
                {
                    // If the file exists!
                    if (System.IO.File.Exists(file))
                        // Delete it!
                        System.IO.File.Delete(file);
                }
                
            }
            catch { }
        }

        /// <summary>
        /// Deletes a file from the dataset...
        /// </summary>
        /// <param name="ownerId"></param>
        /// <param name="fileId"></param>
        /// <returns></returns>
        public bool DeleteFile(int ownerId, int fileId)
        {
            // Catch any exceptions...
            try
            {
                // Get our file...
                File file = GetFile(ownerId, fileId);

                // Check if the file even exists...
                if (file == null)
                    return false;

                ///////////////////////////////////////////

                // Dispose all our related files off of the disk!
                DisposeFileOnDisk(file.Path);

                ///////////////////////////////////////////

                // Remove our file...
                _context.Files.Remove(file);

                // Save our changes.
                _context.SaveChanges();

                // Return true as it was successful...
                return true;
            }
            catch
            {
                // Exception, false...
                return false;
            }
        }

        /// <summary>
        /// Moves a folder to a different folder location...
        /// folder.Id -> newFolderId
        /// </summary>
        /// <param name="ownerId"></param>
        /// <param name="folderId"></param>
        /// <param name="newFolderId"></param>
        /// <returns></returns>
        public bool MoveFolder(int ownerId, int folderId, int newFolderId)
        {
            // Catch any exceptions...
            try
            {
                // Get our folders as objects...
                Folder folder = _context.Folders.Where(b => b.Id == folderId && b.Owner == ownerId).FirstOrDefault();
                Folder newFolder = _context.Folders.Where(b => b.Id == newFolderId && b.Owner == ownerId).FirstOrDefault();

                // Check if our new folder and our current folder isn't null...
                if (folder != null && newFolder != null)
                {
                    // Modify
                    folder.FolderId = newFolder.Id;

                    // Save our changes...
                    _context.SaveChanges();

                    // Respond with a true...
                    return true;
                }
                else
                    // Otherwise return false...
                    return false;
            }
            catch
            {
                // Exception, false...
                return false;
            }
        }

        /// <summary>
        /// Moves a file to a different folder location...
        /// </summary>
        /// <param name="ownerId"></param>
        /// <param name="fileId"></param>
        /// <param name="folderId"></param>
        /// <returns></returns>
        public bool MoveFile(int ownerId, int fileId, int folderId)
        {
            // Catch any exceptions...
            try
            {
                // Get our folders as objects...
                File file = _context.Files.Where(b => b.Id == fileId && b.Owner == ownerId).FirstOrDefault();
                Folder newFolder = _context.Folders.Where(b => b.Id == folderId && b.Owner == ownerId).FirstOrDefault();

                // Check if our new folder and our current folder isn't null...
                if (file != null && newFolder != null)
                {
                    // Modify
                    file.Folder = newFolder.Id;

                    // Save our changes...
                    _context.SaveChanges();

                    // Respond with a true...
                    return true;
                }
                else
                    // Otherwise return false...
                    return false;
            }
            catch
            {
                // Exception, false...
                return false;
            }
        }

        /// <summary>
        /// Responds with whether a user can upload with the given file size...
        /// </summary>
        /// <param name="userId"></param>
        /// <param name="size"></param>
        /// <returns></returns>
        public bool CanUpload(int userId, long size)
        {
            try
            {
                // Setup our user...
                User user = _context.Users.Where(b => b.Id == userId).FirstOrDefault();

                // Check if our user exists...
                if (user == null)
                    // If it doesn't then return here...
                    return false;

                // Setup our max bytes variable...
                var max = user.MaxBytes;

                // Setup our total bytes variable...
                var total = _context.Files.Where(b => b.Owner == userId).Sum(b => b.Size);

                // Setup a boolean condition to check if we're beyond our limit...
                return !(total + size > max);
            }
            catch
            {
                return false;
            }
        }

        /// <summary>
        /// Responds with whether a user can upload with the given file size...
        /// </summary>
        /// <param name="user"></param>
        /// <param name="size"></param>
        /// <returns></returns>
        public bool CanUpload(User user, long size)
        {
            try
            {
                // Setup our max bytes variable...
                var max = user.MaxBytes;

                // Setup our total bytes variable...
                var total = _context.Files.Where(b => b.Owner == user.Id).Sum(b => b.Size);

                // Setup a boolean condition to check if we're beyond our limit...
                return !(total + size > max);
            }
            catch
            {
                return false;
            }
        }

        /// <summary>
        /// Returns a formatted string of the remaining storage space...
        /// </summary>
        /// <param name="user"></param>
        /// <returns></returns>
        public string StorageFormatted(User user)
        {
            try
            {
                // Setup our total bytes variable...
                var total = GetBytesReadable(_context.Files.Where(b => b.Owner == user.Id).Sum(b => b.Size));

                // Setup our max bytes...
                var max = GetBytesReadable(user.MaxBytes);

                // Setup a boolean condition to check if we're beyond our limit...
                return $"{total} / {max} used";
            }
            catch
            {
                return string.Empty;
            }
        }

        /// <summary>
        /// Generates a random string given the count...
        /// </summary>
        /// <param name="count">Number of random characters...</param>
        /// <returns></returns>
        public string RandomString(int count)
        {
            string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
            var stringChars = new char[count];
            var random = new Random();

            for (int i = 0; i < stringChars.Length; i++)
            {
                stringChars[i] = chars[random.Next(chars.Length)];
            }

            return new string(stringChars);
        }

        /// <summary>
        /// Keeps the session id alive...
        /// </summary>
        public void KeepAlive(HttpRequest httpRequest)
        {
            // Get our value of the cookie...
            string key = httpRequest.Cookies[_configuration["SyncCookieName"]];

            // Check if the key doesn't equal null...
            if (key != null && VaultHub.Connections.ContainsKey(key))
            {
                // Setup our brand new expiry
                VaultHub.Connections[key].Expiry = DateTime.Now + TimeSpan.FromMinutes(double.Parse(_configuration["SessionExpiry"]));
            }
        }

        /// <summary>
        /// Keeps the session id alive and updates the name of the user...
        /// </summary>
        /// <param name="httpRequest"></param>
        public void KeepAliveAndUpdateName(HttpRequest httpRequest, string name)
        {
            // Get our value of the cookie...
            string key = httpRequest.Cookies[_configuration["SyncCookieName"]];

            // Check if the key doesn't equal null...
            if (key != null && VaultHub.Connections.ContainsKey(key))
            {
                // Setup our brand new expiry...
                VaultHub.Connections[key].Expiry = DateTime.Now + TimeSpan.FromMinutes(double.Parse(_configuration["SessionExpiry"]));

                // Setup our brand new name...
                VaultHub.Connections[key].Name = WebUtility.HtmlEncode(name);
            }
        }

        /// <summary>
        /// Updates the listings for all our user sessions...
        /// </summary>
        /// <param name="userId"></param>
        public void UpdateListings(int userId, HttpRequest httpRequest)
        {
            // Let all our connections know of what happened...
            foreach (var item in VaultHub.Connections)
            {
                // If our user id matches then we've found the right client...
                if (item.Value.Expiry > DateTime.Now && item.Value.Id == userId)
                {
                    // Send a message to the client telling them to update their listings...
                    _hubContext.Clients.Client(item.Value.ConnectionId).SendAsync("UpdateListing");
                }
            }

            // Keep our session alive...
            KeepAlive(httpRequest);
        }
    }
}
