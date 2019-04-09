﻿using GrapeCity.Documents.Word;
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

        // Save our little session tag...
        private readonly string _sessionName;

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
            _sessionName = configuration["SessionTagId"];
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
        /// Checks whether a folder is empty or not.
        /// </summary>
        /// <param name="folder"></param>
        /// <returns></returns>
        public bool IsEmpty(int ownerId, int folderId)
        {
            return _context.Files.Where(b => b.Folder == folderId && b.Owner == ownerId).Any() 
                || _context.Folders.Where(b => b.FolderId == folderId && b.Owner == ownerId).Any();
        }

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
                IsRecycleBin = x.IsRecycleBin,
                Empty = !(_context.Files.Where(b => b.Folder == x.Id && b.Owner == ownerId).Any()
                || _context.Folders.Where(b => b.FolderId == x.Id && b.Owner == ownerId).Any()),
                IsSharing = x.IsSharing,
                ShareId = x.ShareId
            });

        /// <summary>
        /// Searches for folders matching the search term criteria...
        /// </summary>
        /// <param name="ownerId"></param>
        /// <param name="term"></param>
        /// <returns></returns>
        public IEnumerable<FolderListing> SearchFolderListings(int ownerId, string term)
            => _context.Folders.Where(b => b.Name.ToLower().Contains(term) && b.Owner == ownerId).OrderByDescending(b => b.Id)
            .Select(x => new FolderListing
            {
                Id = x.Id,
                Name = x.Name,
                Icon = GetFolderAttribute(x.Colour, AttributeTypes.FolderIcon),
                Style = GetFolderAttribute(x.Colour, AttributeTypes.FolderStyle),
                IsRecycleBin = x.IsRecycleBin,
                Empty = !(_context.Files.Where(b => b.Folder == x.Id && b.Owner == ownerId).Any()
                || _context.Folders.Where(b => b.FolderId == x.Id && b.Owner == ownerId).Any()),
                IsSharing = x.IsSharing,
                ShareId = x.ShareId
            }).Take(10);

        /// <summary>
        /// Searches for files matching the search term criteria...
        /// </summary>
        /// <param name="ownerId"></param>
        /// <param name="term"></param>
        /// <returns></returns>
        public IEnumerable<FileListing> SearchFileListings(int ownerId, string term)
           => _context.Files.Where(b => b.Name.ToLower().Contains(term) && b.Owner == ownerId).OrderByDescending(b => b.Id)
           .Select(x => new FileListing
           {
               Id = x.Id,
               Name = x.Name,
               Icon = GetFileAttribute(x.Id.ToString(), x.Ext, AttributeTypes.FileIcon),
               Date = x.Created.ToString(),
               Size = GetBytesReadable(x.Size),
               IsSharing = x.IsSharing,
               ShareId = x.ShareId
           }).Take(10);

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
                        return "images/file/folder-icon2.svg";
                    else
                        return "purple-icon";
                case 2:
                    if (type == AttributeTypes.FolderIcon)
                        return "images/file/folder-icon3.svg";
                    else
                        return "green-icon";
                case 3:
                    if (type == AttributeTypes.FolderIcon)
                        return "images/file/folder-icon4.svg";
                    else
                        return "red-icon";
                case 4:
                    if (type == AttributeTypes.FolderIcon)
                        return "images/file/folder-icon5.svg";
                    else
                        return "blue-icon";
                default:
                    if (type == AttributeTypes.FolderIcon)
                        return "images/file/folder-icon.svg";
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
        public string GetFileAttribute(string id = null, string ext = ".svg", AttributeTypes type = AttributeTypes.FileIcon)
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
                        return "images/file/zip-icon.svg";
                    else
                        return defaultAction;
                case ".mov":
                case ".mp4":
                case ".webm":
                    if (type == AttributeTypes.FileIcon
                        || type == AttributeTypes.FileIconNoPreview
                        || type == AttributeTypes.FileShareIcon)
                        return "images/file/video-icon.svg";
                    else
                        return "2";
                case ".mp3":
                case ".ogg":
                case ".wav":
                case ".flac":
                    if (type == AttributeTypes.FileIcon
                        || type == AttributeTypes.FileIconNoPreview
                        || type == AttributeTypes.FileShareIcon)
                        return "images/file/music-icon.svg";
                    else
                        return "4";
                case ".docx":
                    if (type == AttributeTypes.FileIcon
                        || type == AttributeTypes.FileIconNoPreview
                        || type == AttributeTypes.FileShareIcon)
                        return "images/file/word-icon.svg";
                    else
                        return "3";
                case ".asd":
                case ".dotx":
                case ".dotm":
                case ".wbk":
                case ".docm":
                    if (type == AttributeTypes.FileIcon
                        || type == AttributeTypes.FileIconNoPreview
                        || type == AttributeTypes.FileShareIcon)
                        return "images/file/word-icon.svg";
                    else
                        return defaultAction;
                case ".pptx":
                case ".pps":
                    if (type == AttributeTypes.FileIcon
                        || type == AttributeTypes.FileIconNoPreview
                        || type == AttributeTypes.FileShareIcon)
                        return "images/file/powerpoint-icon.svg";
                    else
                        return defaultAction;
                case ".pub":
                    if (type == AttributeTypes.FileIcon
                        || type == AttributeTypes.FileIconNoPreview
                        || type == AttributeTypes.FileShareIcon)
                        return "images/file/pub-icon.svg";
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
                        return "images/file/shell-icon.svg";
                    else
                        return defaultAction;
                case ".dll":
                case ".a":
                case ".so":
                    if (type == AttributeTypes.FileIcon
                        || type == AttributeTypes.FileIconNoPreview
                        || type == AttributeTypes.FileShareIcon)
                        return "images/file/dll-icon.svg";
                    else return defaultAction;
                case ".xlsx":
                case ".xls":
                    if (type == AttributeTypes.FileIcon
                        || type == AttributeTypes.FileIconNoPreview
                        || type == AttributeTypes.FileShareIcon)
                        return "images/file/excel-icon.svg";
                    else
                        return defaultAction;
                case ".pdf":
                    if (type == AttributeTypes.FileIcon
                        || type == AttributeTypes.FileIconNoPreview
                        || type == AttributeTypes.FileShareIcon)
                        return "images/file/pdf-icon.svg";
                    else
                        return "3";
                case ".svg":
                    if (type == AttributeTypes.FileIcon
                        || type == AttributeTypes.FileIconNoPreview
                        || type == AttributeTypes.FileShareIcon)
                        return "images/file/image-icon.svg";
                    else
                        return "1";
                case ".png":
                case ".jpg":
                case ".jpeg":
                case ".bmp":
                case ".pjpeg":
                case ".gif":
                    if (type == AttributeTypes.FileIcon) return "process/thumbnail/" + id;
                    else if (type == AttributeTypes.FileShareIcon) return "share/thumbnail/" + id;
                    else if (type == AttributeTypes.FileIconNoPreview) return "images/file/image-icon.svg";
                    else return "1";
                default:
                    if (type == AttributeTypes.FileIcon 
                        || type == AttributeTypes.FileIconNoPreview 
                        || type == AttributeTypes.FileShareIcon)
                        return "images/file/unknown-icon.svg";
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
            // Generate a PDF representation of our DOCX...
            if (ext == ".docx")
            {
                // Add a try statement because GcWordDocument
                // might fail for some odd reasons...
                try
                {
                    // Initialize our word document...
                    var doc = new GcWordDocument();

                    // Load up our document...
                    doc.Load(path);

                    // Save it as a preview file...
                    doc.SaveAsPdf($"{path}.preview.pdf");
                }
                catch {}

                // Return here...
                return;
            }

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

            //// Full path to the file image thumbnail...
            //string filePathPreview = $"{path}.preview";

            //// Strip all the metadata...
            //magickImage.Strip();

            //// Set to the medium quality...
            //magickImage.Quality = 50;

            //// Set our format to be a webp for that amazing compression...
            //magickImage.Format = MagickFormat.Jpg;

            //// Write the file!
            //magickImage.Write(filePathPreview);

            ///////////////////////////////////////////////

            // Full path to the file image thumbnail...
            string filePathThumbnail = $"{path}.thumb";

            // Use MagickImage to resize it!
            magickImage.Resize(32, 32);

            // Strip all the metadata...
            magickImage.Strip();

            // Set to the lowest quality possible...
            magickImage.Quality = 25;

            // Set our format to be a webp for that amazing compression...
            magickImage.Format = MagickFormat.Png;

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
        /// For internal use. Gets the user from a user id...
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        private User GetUser(int userId) => _context.Users.Where(b => b.Id == userId).FirstOrDefault();

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
        /// Setups a preview path...
        /// </summary>
        /// <param name="path"></param>
        /// <returns></returns>
        public void SetupPreview(ref string contentType, ref string path)
        {
            // Check we're dealing with a DOCX preview...
            if (System.IO.File.Exists($"{path}.preview.pdf"))
            {
                // Update our path...
                path = $"{path}.preview.pdf";

                // Update our content type...
                contentType = "application/pdf";
            }
            //// Check if we're dealing with an image preview...
            //else if (System.IO.File.Exists($"{path}.preview"))
            //{
            //    // Update our path...
            //    path = $"{path}.preview";
            //}
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
        public (bool success, Folder folder) AddNewFolder(int ownerId, string folderName, int rootFolder, bool isRecycleBin = false)
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
                    FolderId = rootFolder,
                    IsRecycleBin = isRecycleBin
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
                Folder folder = _context.Folders.Where(b => b.Id == folderId && b.Owner == id && b.IsRecycleBin == false).FirstOrDefault();

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
        public bool UpdateFileName(int id, File file, string newName)
        {
            // Catch any exceptions...
            try
            {
                // Check if our user is null!
                if (file == null || file.Owner != id) return false;

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
                Folder folder = _context.Folders.Where(b => b.Id == folderId && b.Owner == id && b.IsRecycleBin == false).FirstOrDefault();

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
                location.Insert(0, $"<a href='#' onclick='processMoveId({folder.Id})'>{folder.Name}</a> / ");

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
        /// Check whether a folder is inside a certain folder...
        /// </summary>
        /// <param name="ownerId"></param>
        /// <param name="folderId"></param>
        /// <param name="insideOfFolderId"></param>
        /// <returns></returns>
        public bool IsFolderInsideFolder(int ownerId, int folderId, int insideOfFolderId)
        {
            // Attempt to get our inside of folder...
            Folder insideFolder = GetFolder(ownerId, insideOfFolderId);

            // Check if our inside folder is null...
            if (insideFolder == null) return false;

            // Setup our target folder...
            Folder targetFolder = GetFolder(ownerId, folderId);

            // Check if the folder we are targetting even exists...
            if (targetFolder == null) return false;

            // Setup our temp folder...
            Folder tempFolder = targetFolder;

            // Loop until we've found our inside of folder or until we reach null!
            while (tempFolder != null && tempFolder != insideFolder)
            {
                // Get the next folder in the chain!
                tempFolder = GetFolder(insideFolder.Owner, tempFolder.FolderId);
            }

            // Check if our target folder does equal our inside folder...
            if (tempFolder == insideFolder)
                // Then we're inside our selected folder...
                return true;
            else
                // Otherwise, we're not inside a folder...
                return false;
        }

        /// <summary>
        /// Checks wether a certain file is inside a certain folder...
        /// </summary>
        /// <param name="ownerId"></param>
        /// <param name="fileId"></param>
        /// <param name="insideOfFolderId"></param>
        /// <returns></returns>
        public bool IsFileInsideFolder(int ownerId, int fileId, int insideOfFolderId)
        {
            // Attempt to get our inside of folder...
            Folder insideFolder = GetFolder(ownerId, insideOfFolderId);

            // Check if our inside folder is null...
            if (insideFolder == null) return false;

            // Setup our target file...
            File targetFile = GetFile(ownerId, fileId);

            // Check if the file we are targetting even exists...
            if (targetFile == null) return false;

            // Check if the folder our file is inside of is inside of the folder...
            return IsFolderInsideFolder(ownerId, targetFile.Folder, insideFolder.Id);
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
        /// Attempts to generate a recycle bin...
        /// </summary>
        /// <param name="owner"></param>
        public Folder GetRecycleBin(User owner)
        {
            // Check if we were able to find the user...
            if (owner == null) return null;

            // Attempt to find the folder matching our criteria...
            Folder recycleBin = _context.Folders.Where(b => b.Owner == owner.Id && b.IsRecycleBin == true).FirstOrDefault();

            // If we haven't found a folder matching our criteria, then gohead and make a new one...
            if (recycleBin == null)
            {
                // Attempt to add our folder to the database...
                var response = AddNewFolder(owner.Id, "Recycle Bin", owner.Folder, true);

                // Check if we got a successful response...
                if (!response.success)
                    // If we got a bad response throw an exception...
                    throw new InvalidDataException();

                // If everything checks out, then goahead and setup the folder's reference...
                recycleBin = response.folder;
            }

            // Return the instance of the recycle bin...
            return recycleBin;
        }

        /// <summary>
        /// Recycles a folder...
        /// </summary>
        /// <param name="ownerId"></param>
        /// <param name="folder"></param>
        /// <returns></returns>
        public bool RecycleFolder(int ownerId, Folder folder)
        {
            // Attempt to find the user...
            User user = GetUser(ownerId);

            // Check if we were able to find the user...
            if (user == null) return false;

            // Attempt to get the recycle bin instance...
            var recycleBin = GetRecycleBin(user);

            // Check if we actually we're given one...
            if (recycleBin == null) return false;

            // Check if the recycling bin is inside of the folder we want to delete...
            if (!folder.IsRecycleBin && IsFolderInsideFolder(ownerId, recycleBin.Id, folder.Id))
                // If so, then move the recycle bin outside to the home folder...
                MoveFolder(user.Id, recycleBin.Id, user.Folder);

            // Check if our file is already inside our recycle bin...
            // If so, return true saying that we can proceed to destroy the file...
            if (IsFolderInsideFolder(ownerId, folder.Id, recycleBin.Id)) return true;

            // Now move our file to the recycle bin...
            MoveFolder(user.Id, folder.Id, recycleBin.Id);

            // Then finally return false indicating 
            // that we do not want to destroy our file...
            return false;
        }

        /// <summary>
        /// Deletes a file from the dataset...
        /// </summary>
        /// <param name="ownerId"></param>
        /// <param name="folderId"></param>
        /// <returns></returns>
        public bool DeleteFolder(int ownerId, int folderId, bool doNotRecycle = false)
        {
            // Catch any exceptions...
            try
            {
                // Get our selected folder that we are going to delete...
                Folder selectedFolder = GetFolder(ownerId, folderId);

                // Check if our selected folder even exists...
                if (selectedFolder == null) return false;

                // Attempt to recycle our folder...
                if (!doNotRecycle && !RecycleFolder(ownerId, selectedFolder)) return true;

                // Get our file...
                var files = GetFiles(ownerId, selectedFolder.Id);

                // Iterate through all our files in the folder...
                foreach (var file in files)
                {
                    // Dispose all our related files off of the disk!
                    DisposeFileOnDisk(file.Path);

                    // Remove each file from the dataset...
                    _context.Files.Remove(file);
                } 

                // Get all folders inside our folder...
                var folders = GetFolders(ownerId, selectedFolder.Id);

                // Go to every folder and delete them...
                foreach (var folder in folders)
                {
                    // Delete each folder instance by calling this method...
                    DeleteFolder(ownerId, folder.Id, true);
                }

                // Don't delete our folder if it is a recycling bin.
                if (!selectedFolder.IsRecycleBin)
                    // Remove our folder from the database...
                    _context.Folders.Remove(selectedFolder);

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
        /// Moves a file to the recycle bin...
        /// </summary>
        /// <param name="ownerId"></param>
        /// <param name="file"></param>
        public bool RecycleFile(int ownerId, File file)
        {
            // Attempt to find the user...
            User user = GetUser(ownerId);

            // Check if we were able to find the user...
            if (user == null) return false;

            // Check if the file even exists and the owner of it is the correct one...
            if (file == null || file.Owner != user.Id) return false;

            // Attempt to get the recycle bin instance...
            var recycleBin = GetRecycleBin(user);

            // Check if we actually we're given one...
            if (recycleBin == null) return false;

            // Check if our file is already inside our recycle bin...
            // If so, return true saying that we can proceed to destroy the file...
            if (IsFileInsideFolder(ownerId, file.Id, recycleBin.Id)) return true;

            // Now move our file to the recycle bin...
            MoveFile(user.Id, file.Id, recycleBin.Id);

            // Then finally return false indicating 
            // that we do not want to destroy our file...
            return false;
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

                // Attempt to recycle the file...
                // Otherwise, delete the file...
                if (!RecycleFile(ownerId, file)) return true;

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

        public bool MoveFolders(int ownerId, int[] folders, int destination)
        {
            // Catch any exceptions...
            try
            {
                // Setup our destination folder...
                Folder destinationFolder = _context.Folders
                    .Where(b => b.Id == destination && b.Owner == ownerId)
                    .FirstOrDefault();

                // Check if our destination folder isn't null...
                if (destinationFolder == null) return false;

                // Iterate throughout all our folders...
                foreach (var folderId in folders)
                {
                    // Setup our folder for this iteration...
                    Folder folder = _context.Folders
                        .Where(b => b.Id == folderId && b.Owner == ownerId)
                        .FirstOrDefault();

                    // Check if we even found a folder...
                    if (folder == null) continue;

                    // Modify location of each folder...
                    folder.FolderId = destinationFolder.Id;
                }

                // Save our changes...
                _context.SaveChanges();

                // Respond with a true...
                return true;
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
        /// Duplicates a file...
        /// </summary>
        /// <param name="ownerId">The owning user of the file.</param>
        /// <param name="fileId">The file's id.</param>
        /// <returns></returns>
        public bool DuplicateFile(int ownerId, int fileId)
        {
            // Catch any exceptions...
            try
            {
                // Attempt to find our file...
                File file = _context.Files.Where(b => b.Id == fileId && b.Owner == ownerId).FirstOrDefault();

                // Check if our file even exists...
                if (file == null) return false;

                // Check if we can "upload" this file, or in other words "do we have enough storage for this file"...
                if (!CanUpload(ownerId, file.Size)) return false;

                // Generate a brand new file name for our duplicate file...
                string filePath = _configuration["VaultStorageLocation"] + RandomString(30);

                // Check if our file already exists with that name!
                if (System.IO.File.Exists(filePath)) return false;

                // Now actually create a copy of the file on the file system...
                System.IO.File.Copy(file.Path, filePath);

                // Pass the response to the add new file api...
                return AddNewFile(ownerId, file.Size, file.Name, file.Ext, file.Folder, filePath).success;
            }
            catch
            {
                // Exception, false...
                return false;
            }
        }

        /// <summary>
        /// Move an array of files!
        /// </summary>
        /// <param name="ownerId"></param>
        /// <param name="files"></param>
        /// <param name="folderId"></param>
        /// <returns></returns>
        public bool MoveFiles(int ownerId, int[] files, int folderId)
        {
            // Catch any exceptions...
            try
            {
                Folder newFolder = _context.Folders.Where(b => b.Id == folderId && b.Owner == ownerId).FirstOrDefault();

                // Check if our folder isn't null...
                if (newFolder == null) return false;

                // Iterate throughout each file id...
                foreach (var fileId in files)
                {
                    // Get our folders as objects...
                    File file = _context.Files.Where(b => b.Id == fileId && b.Owner == ownerId).FirstOrDefault();

                    // Check if we even found a file...
                    if (file == null) continue;

                    // Modify our folder...
                    file.Folder = newFolder.Id;
                }

                // Save our changes...
                _context.SaveChanges();

                // Respond with a true...
                return true;
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
        /// Updates the listings for all our user sessions...
        /// </summary>
        /// <param name="userId"></param>
        public void UpdateListings(int userId, HttpRequest httpRequest)
        {
            // Update our listings to everyone in the group...
            _hubContext.Clients.Group(userId.ToString()).SendAsync("UpdateListing");
        }
    }
}
