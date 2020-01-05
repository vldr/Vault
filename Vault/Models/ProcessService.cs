using ImageMagick;
using Ionic.Zip;
using Microsoft.AspNetCore.Hosting.Internal;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Org.BouncyCastle.Crypto;
using Org.BouncyCastle.Crypto.Engines;
using Org.BouncyCastle.Crypto.IO;
using Org.BouncyCastle.Crypto.Modes;
using Org.BouncyCastle.Crypto.Parameters;
using Org.BouncyCastle.Security;
using Syncfusion.DocIO.DLS;
using Syncfusion.DocIORenderer;
using Syncfusion.Pdf;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Security.Cryptography;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Vault.Models;

namespace Vault.Models
{
    public class ProcessService
    {
        // Our vault database context.
        private VaultContext _context { get; set; }

        // Instance of our hub.
        private readonly IHubContext<VaultHub> _hubContext;

        // Save our little session tag.
        private readonly string _sessionName;

        // Our key derived salt.
        private readonly int _iterations = 100_000;
        private readonly int _mac_size = 128;

        // Instance of our configuration.
        private IConfiguration _configuration;

        // Instance of our logger.
        private readonly ILogger _logger;
        private readonly IServiceScopeFactory _serviceScopeFactory;

        /// <summary>
        /// Sets up a simple enum to represent attribute types..
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
        /// Constructor.
        /// </summary>
        /// <param name="context"></param>
        /// <param name="configuration"></param>
        /// <param name="hubContext"></param>
        public ProcessService(VaultContext context, 
            IConfiguration configuration,
            ILoggerFactory loggerFactory,
            IServiceScopeFactory serviceScopeFactory,
            IHubContext<VaultHub> hubContext) {
            _context = context;
            _hubContext = hubContext;
            _configuration = configuration;
            _serviceScopeFactory = serviceScopeFactory;
            _logger = loggerFactory.CreateLogger("ProcessService");
            _sessionName = configuration["SessionTagId"];
        }

        /// <summary>
        /// Checks if a user exists with that given ID.
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        public bool UserExists(int id)
            => _context.Users.Any(b => b.Id == id);

        /// <summary>
        /// Returns the user's password hash. 
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        public string GetPasswordHash(int id)
            => _context.Users.Where(b => b.Id == id).FirstOrDefault().Password;

        /// <summary>
        /// Checks if the folder exists.
        /// </summary>
        /// <param name="ownerId"></param>
        /// <param name="id"></param>
        /// <returns></returns>
        public bool DoesFolderExist(int ownerId, int id)
            => _context.Folders.Any(b => b.Id == id && b.Owner == ownerId);

        /// <summary>
        /// Attempts to find a folder with a specific name in the user's home directory.
        /// If a folder exists it is returned, otherwise a brand new 
        /// folder with that name is created and returned.
        /// 
        /// This is utilised to auto-create the API folder.
        /// </summary>
        /// <param name="owner">The owner of the folder.</param>
        /// <param name="folderName">The folder's name.</param>
        /// <returns>Folder Instance</returns>
        public Folder FolderCreateOrExists(User owner, string folderName)
        {
            Folder folder = _context.Folders
            .Where(b => b.FolderId == owner.Folder
            && b.Owner == owner.Id
            && b.Name == folderName).FirstOrDefault();

            //////////////////////////////////

            if (folder == null)
            {
                return AddNewFolder(owner.Id, folderName, owner.Folder).Get();
            }

            //////////////////////////////////

            return folder;
        }

        /// <summary>
        /// Returns a list of folders.
        /// </summary>
        /// <param name="ownerId"></param>
        /// <param name="folderId"></param>
        /// <returns></returns>
        public IEnumerable<Folder> GetFolders(int ownerId, int folderId)
            => _context.Folders.Where(b => b.FolderId == folderId && b.Owner == ownerId);

        /// <summary>
        /// Returns the total number of files inside a directory.
        /// </summary>
        /// <param name="ownerId"></param>
        /// <param name="folderId"></param>
        /// <returns></returns>
        public int GetFileCount(int ownerId, int folderId)
            => _context.Files.Where(b => b.Folder == folderId && b.Owner == ownerId).Count();

        /// <summary>
        /// Returns a boolean representing whether a folder is empty or not.
        /// </summary>
        /// <param name="folder"></param>
        /// <returns></returns>
        public bool IsFolderEmpty(int ownerId, int folderId)
            => !(_context.Files.Where(b => b.Folder == folderId && b.Owner == ownerId).Any()
                || _context.Folders.Where(b => b.FolderId == folderId && b.Owner == ownerId).Any());
        
        /// <summary>
        /// Returns a list of folder listings.
        /// 
        /// Used for displaying folders in the dashboard.
        /// </summary>
        /// <param name="ownerId"></param>
        /// <param name="folderId"></param>
        /// <returns></returns>
        public IEnumerable<FolderListing> GetFolderListings(int ownerId, int folderId)
            => _context.Folders.Where(b => b.FolderId == folderId && b.Owner == ownerId)
            .Select(x => GetFolderListing(x));

        /// <summary>
        /// Searches for folders matching the search term criteria.
        /// </summary>
        /// <param name="ownerId"></param>
        /// <param name="term"></param>
        /// <returns></returns>
        public IEnumerable<FolderListing> SearchFolderListings(int ownerId, string term)
            => _context.Folders.Where(b => b.Name.ToLower().Contains(term) && b.Owner == ownerId).OrderByDescending(b => b.Id)
            .Select(x => GetFolderListing(x)).Take(10);

        /// <summary>
        /// Searches for files matching the search term criteria
        /// and returns a list of file listings.
        /// </summary>
        /// <param name="ownerId"></param>
        /// <param name="term"></param>
        /// <returns></returns>
        public IEnumerable<FileListing> SearchFileListings(int ownerId, string term)
           => _context.Files.Where(b => b.Name.ToLower().Contains(term) && b.Owner == ownerId).OrderByDescending(b => b.Id)
           .Select(x => GetFileListing(x)).Take(10);

        /// <summary>
        /// Gets a list of file listings with matching owners and folder id.
        /// </summary>
        /// <param name="ownerId"></param>
        /// <param name="folderId"></param>
        /// <param name="sortBy"></param>
        /// <param name="offset"></param>
        /// <returns></returns>
        public IEnumerable<FileListing> GetFileListings(int ownerId, int folderId, int sortBy, int offset = 0)
            => SortFiles(_context.Files.Where(b => b.Folder == folderId && b.Owner == ownerId), sortBy)
            .Select(x => GetFileListing(x)).Skip(offset).Take(50);

        /// <summary>
        /// Gets a list of file listings with matching owners and folder id.
        /// </summary>
        /// <param name="ownerId"></param>
        /// <param name="folderId"></param>
        /// <param name="sortBy"></param>
        /// <param name="offset"></param>
        /// <returns></returns>
        public IEnumerable<FileListing> GetFileListings(int ownerId, int folderId, int sortBy, int offset = 0, int specificFile = -1)
            => SortFiles(_context.Files.Where(b => b.Folder == folderId && b.Owner == ownerId), sortBy).OrderBy(x => x.Id != specificFile)
            .Select(x => GetFileListing(x)).Skip(offset).Take(50);

        /// <summary>
        /// Gets a list of file listings which have been shared.
        /// </summary>
        /// <param name="ownerId"></param>
        /// <param name="folderId"></param>
        /// <param name="sortBy"></param>
        /// <param name="offset"></param>
        /// <returns></returns>
        public IEnumerable<FileListing> GetSharedFileListings(int ownerId, int folderId, string shareId, int sortBy, int offset = 0)
           => SortFiles(_context.Files.Where(b => b.Folder == folderId && b.Owner == ownerId), sortBy)
           .Select(x => GetFileListing(x)).Skip(offset).Take(50);

        /// <summary>
        /// Gives all the files inside a folder.
        /// </summary>
        /// <param name="ownerId"></param>
        /// <param name="folderId"></param>
        /// <returns></returns>
        public IEnumerable<File> GetFiles(int ownerId, int folderId)
            => _context.Files.Where(b => b.Folder == folderId && b.Owner == ownerId);

        /// <summary>
        /// Gives all the files inside a folder using a List.
        /// </summary>
        /// <param name="ownerId"></param>
        /// <param name="folderId"></param>
        /// <returns></returns>
        public List<File> GetFilesList(int ownerId, int folderId)
            => _context.Files.Where(b => b.Folder == folderId && b.Owner == ownerId).ToList();

        /// <summary>
        /// Gets a folders unique attribute depending on its colour.
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
                case 5:
                    if (type == AttributeTypes.FolderIcon)
                        return "images/file/folder-icon5.svg";
                    else
                        return "orange-icon";
                default:
                    if (type == AttributeTypes.FolderIcon) return "images/file/folder-icon.svg";
                    else return "";
            }
        }

        /// <summary>
        /// Gets a folders unique attribute depending on its colour.
        /// </summary>
        /// <param name="id"></param>
        /// <param name="ext"></param>
        /// <param name="type"></param>
        /// <returns></returns>
        public string GetFileAttribute(string id = null, string ext = ".svg", AttributeTypes type = AttributeTypes.FileIcon)
        {
            // Setup our default action so we don't repeat ourselves.
            var defaultAction = "0";

            switch (ext)
            {
                case ".flash":
                    if (type == AttributeTypes.FileIcon
                       || type == AttributeTypes.FileIconNoPreview
                       || type == AttributeTypes.FileShareIcon)
                        return "images/file/flashcard-icon.svg";
                    else
                        return "5";
                case ".zip":
                case ".rar":
                case ".tar":
                case ".gz":
                case ".7z":
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
                case ".ppt":
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
                case ".txt":
                    if (type == AttributeTypes.FileIcon
                        || type == AttributeTypes.FileIconNoPreview
                        || type == AttributeTypes.FileShareIcon)
                        return "images/file/text-icon.svg";
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
        /// Gets the bytes as a readable string.
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
        /// Gets a folder given an id using a list.
        /// </summary>
        /// <param name="ownerId"></param>
        /// <param name="folderId"></param>
        /// <returns></returns>
        public List<Folder> GetFoldersList(int ownerId, int folderId)
        {
            return _context.Folders.Where(b => b.FolderId == folderId && b.Owner == ownerId).ToList();
        }

        /// <summary>
        /// Gives all the files inside a folder. (Sorted)
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
        public void GenerateThumbnails(string ext, string path, long size)
        {
            // Generate a PDF representation of our DOCX.
            if (ext == ".docx")
            {
                // Open a file handle to our uploaded file.
                FileStream inputStream = new FileStream(path, FileMode.Open, FileAccess.Read);

                // Initialize our word document class.
                WordDocument wordDocument = new WordDocument(inputStream, Syncfusion.DocIO.FormatType.Docx);

                // Create instance for DocIORenderer for Word to PDF conversion
                DocIORenderer render = new DocIORenderer();

                // Convert Word document to PDF.
                PdfDocument pdfDocument = render.ConvertToPDF(wordDocument);

                // Release the resources used by the Word document and DocIO Renderer objects.
                render.Dispose();
                wordDocument.Dispose();

                // Setup our output stream.
                FileStream outputStream = new FileStream($"{path}.preview.pdf", FileMode.OpenOrCreate, FileAccess.Write);

                // Save our file.
                pdfDocument.Save(outputStream);

                // Close the instance of the PDF document object.
                pdfDocument.Close();

                // Dispose the instance of the FileStreams.
                outputStream.Dispose();
                inputStream.Dispose();

                // Return here.
                return;
            }

            // Check if our file is a PNG, JPEG, or JPG or if the image is larger than 10 MB..
            if (!(ext == ".png" || ext == ".jpeg" || ext == ".jpg") || size > 10485760)
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

                // Get the index from the attribute EXIF:Orientation.
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

            // Full path to the file image thumbnail.
            string filePathThumbnail = $"{path}.thumb";

            // Use MagickImage to resize it!
            magickImage.Resize(32, 32);

            // Strip all the metadata.
            magickImage.Strip();

            // Set to the lowest quality possible.
            magickImage.Quality = 25;

            // Set our format to be a webp for that amazing compression.
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
            // Check if our task was cancelled before we even venture in.
            if (cancellationToken.IsCancellationRequested) return;

            // Get our folder!
            var folder = GetFolder(userId, folderId);

            // Get our files!
            var files = GetFilesList(userId, folderId);

            // For every file compress it! 
            foreach (var file in files)
            {
                // Check if our task was cancelled for every file.
                if (cancellationToken.IsCancellationRequested)
                    return;

                // If the file doesn't exist, continue.
                if (!System.IO.File.Exists(file.Path)) continue;

                // Skip all encrypted files due to the nature of having different passwords for each file.
                if (file.IsEncrypted) continue;

                // Setup our folder location.
                string folderLocation = GetFolderLocation(folder, limit);

                // Setup our file name variable which will contain a safer version of the file name.
                string fileName = file.Name.Replace('/', '_');

                // Setup our entry name.
                StringBuilder entryName = new StringBuilder($"{folderLocation}{fileName}");

                // Loop until we've found an entry that doesn't exist!
                for (int count = 1; zip.ContainsEntry(entryName.ToString());)
                {
                    // Clear out our entry name.
                    entryName.Clear();

                    // Append our new entry which includes our 
                    entryName.Append($"{folderLocation}({count++}){fileName}");
                }

                // Set the file name as the next entry.
                var entry = zip.PutNextEntry(entryName.ToString());

                // Setup our compression level to not compress at all.
                entry.CompressionLevel = Ionic.Zlib.CompressionLevel.None;

                // Setup a filestream and stream contents to the zip stream!
                using (var stream = new FileStream(file.Path, FileMode.Open, FileAccess.Read, FileShare.ReadWrite, 4096, true))
                {
                    // Place our copy to async inside a try catch.
                    try
                    {
                        // Copy all our data to the zip stream.
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
                // Check if our task was cancelled for every folder.
                if (cancellationToken.IsCancellationRequested)
                    return;

                // Zip those files up!
                await ZipFiles(folderItem.Id, userId, zip, cancellationToken, limit);
            }
        }

        /// <summary>
        /// Checks if a folder can move there.
        /// </summary>
        /// <param name="ownerId"></param>
        /// <param name="fileId"></param>
        /// <param name="shareId"></param>
        /// <returns></returns>
        public bool CheckShareId(string shareId)
            => _context.Files.Any(b => b.ShareId == shareId);

        /// <summary>
        /// Check whether a folder's share id is already taken.
        /// </summary>
        /// <param name="ownerId"></param>
        /// <param name="folderId"></param>
        /// <param name="shareId"></param>
        /// <returns></returns>
        public bool CheckFolderShareId(string shareId)
            => _context.Folders.Any(b => b.ShareId == shareId);

        /// <summary>
        /// Checks if a folder can move there.
        /// </summary>
        /// <param name="ownerId"></param>
        /// <param name="id"></param>
        /// <param name="folderId"></param>
        /// <returns></returns>
        public bool CanFolderMove(int ownerId, int id, int folderId)
            => _context.Folders.Any(b => b.Id == id && b.Owner == ownerId && b.FolderId == folderId);

        /// <summary>
        /// Checks if a file can move there.
        /// </summary>
        /// <param name="ownerId"></param>
        /// <param name="id"></param>
        /// <param name="folderId"></param>
        /// <returns></returns>        
        public bool CanFileMove(int ownerId, int id, int folderId)
            => _context.Files.Any(b => b.Id == id && b.Owner == ownerId && b.Folder == folderId);

        /// <summary>
        /// Gets a folder when asked for one.
        /// </summary>
        /// <param name="ownerId"></param>
        /// <param name="folderId"></param>
        /// <returns></returns>
        public Folder GetFolder(int ownerId, int folderId)
            => _context.Folders.Where(b => b.Id == folderId && b.Owner == ownerId).FirstOrDefault();

        /// <summary>
        /// Gets a file when asked for one.
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
        /// Gets a shared file given the owner, folder it resides, and its file id.
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
        /// Gets a folder that is being shared, given the shareId.
        /// </summary>
        /// <param name="shareId"></param>
        /// <returns></returns>
        public Folder GetSharedFolder(string shareId)
            => _context.Folders.Where(b => b.IsSharing == true && b.ShareId == shareId).FirstOrDefault();

        /// <summary>
        /// Gets a user by their api key only if the api is enabled.
        /// </summary>
        /// <param name="apiKey"></param>
        /// <returns></returns>
        public User GetUserAPI(string apiKey) => _context.Users.Where(b => b.APIEnabled == true && b.APIKey == apiKey).FirstOrDefault();

        /// <summary>
        /// For internal use. Gets the user from a user id.
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        private User GetUser(int userId) => _context.Users.Where(b => b.Id == userId).FirstOrDefault();

        /// <summary>
        /// Handles the addition of a file into the 
        /// database and generating thumbnails for it.
        /// </summary>
        /// <param name="userId"></param>
        /// <param name="size"></param>
        /// <param name="name"></param>
        /// <param name="ext"></param>
        /// <param name="fileId"></param>
        /// <param name="path"></param>
        /// <returns></returns>
        public Result<int> AddNewFile(int userId, long size, string name, string ext, int folderId, string path, 
            bool encrypted = false, byte[] nonce = null, byte[] salt = null)
        {
            try
            {
                // Get our user following with that user id.
                User user = _context.Users.Where(b => b.Id == userId).FirstOrDefault();

                // Check if the user exists.
                if (user == null) return Result<int>.New(ResultStatus.InvalidUserHandle, -1);

                // Call our generate thumbnail which will generate a thumbnails.
                if (!encrypted) GenerateThumbnails(ext, path, size);

                // Generate a file object.
                File fileObj = new File
                {
                    Owner = userId,
                    Size = size,
                    Name = WebUtility.HtmlEncode(name),
                    Ext = WebUtility.HtmlEncode(ext),
                    Created = DateTime.Now,
                    Folder = folderId,
                    Path = path,
                    IsEncrypted = encrypted,
                    Nonce = nonce,
                    Salt = salt,
                    EncryptionVersion = 1
                };

                // Add the file object to the files context.
                _context.Files.Add(fileObj);

                // Save all our changes.
                _context.SaveChanges();

                // Send out an update.
                UpdateFileListing(userId, fileObj);

                // Return true that the operation was successful.
                return Result<int>.New(fileObj.Id);
            }
            catch
            {
                return Result<int>.New(ResultStatus.Exception, -1);
            }
        }

        /// <summary>
        /// Attempts to decrypt a file to a stream.
        /// </summary>
        /// <param name="cancellationToken"></param>
        /// <param name="outputStream"></param>
        /// <param name="file"></param>
        /// <param name="password"></param>
        /// <returns></returns>
        public async Task DecryptFile(CancellationToken cancellationToken, Stream outputStream, File file, string password)
        {
            // Setup our derived bytes.
            Rfc2898DeriveBytes rfc = new Rfc2898DeriveBytes(password, file.Salt, _iterations);

            // Get our derived key.
            var key = rfc.GetBytes(32);

            //////////////////////////////////////////////////////

            // Setup our GCM block cipher using AES engine.
            var cipher = CipherUtilities.GetCipher("AES/GCM/NoPadding");

            // Generate our key and set it up as a parameter..
            var keyParameter = new KeyParameter(key);

            // Setup our parameters for the 
            var aeadParameters = new AeadParameters(keyParameter, _mac_size, file.Nonce);

            // Initialize our GCM blockcipher.
            cipher.Init(false, aeadParameters);

            //////////////////////////////////////////////////////

            // Setup a cipher stream to write into our output stream (Response.Body)..
            using (var cipherStream = new CipherStream(outputStream, null, cipher))
            // Setup our file stream to open the file and read it.
            using (var fileStream = new FileStream(file.Path, FileMode.Open, FileAccess.Read, FileShare.ReadWrite, 4096, true))
            {
                // Copy our file's contents into the cipher stream which 
                // in turn will copy it's own contents to the output stream.
                await fileStream.CopyToAsync(cipherStream, cancellationToken);
            }
        } 

        /// <summary>
        /// Encrypts a file.
        /// 
        /// I've settled with AES GCM since it offers privacy and authentication.
        /// 
        /// The MAC size is set to 128 bits.
        /// The NOnce size is set to 96 bits.
        /// The Salt for key deriving of the password is set to 256 bit.
        /// </summary>
        /// <param name="file"></param>
        /// <param name="filePath"></param>
        /// <param name="password"></param>
        /// <returns></returns>
        public async Task<(byte[] iv, byte[] salt)> EncryptFile(IFormFile file, string filePath, string password)
        { 
            // Copy our file from buffer.
            using (var random = new RNGCryptoServiceProvider())
            {
                // Setup our salt byte array.
                var salt = new byte[32];
                var nonce = new byte[12];

                // Generate a random salt.
                random.GetNonZeroBytes(salt);

                // Generate a random nonce.
                random.GetNonZeroBytes(nonce);

                //////////////////////////////////////////////////////

                // Setup our derived bytes.
                Rfc2898DeriveBytes rfc = new Rfc2898DeriveBytes(password, salt, _iterations);

                // Get our derived key.
                var key = rfc.GetBytes(32);

                //////////////////////////////////////////////////////

                // Setup our GCM block cipher using AES engine.
                var cipher = CipherUtilities.GetCipher("AES/GCM/NoPadding");

                // Generate our key and set it up as a parameter.
                var keyParameter = new KeyParameter(key);

                // Setup our parameters for the 
                var aeadParameters = new AeadParameters(keyParameter, _mac_size, nonce);

                // Initialize our GCM blockcipher.
                cipher.Init(true, aeadParameters);

                //////////////////////////////////////////////////////

                // Setup our file stream and cryptostream.
                using (var stream = new FileStream(filePath, FileMode.Create))
                // Setup a cipher stream.
                using (var cipherStream = new CipherStream(stream, null, cipher))
                {
                    // Copy our file to the cryptostream.
                    await file.CopyToAsync(cipherStream);
                }

                // Return our nonce (iv) and salt.
                return (nonce, salt);
            }

        }

        /// <summary>
        /// Setups a preview path.
        /// </summary>
        /// <param name="path"></param>
        /// <returns></returns>
        public void SetupPreview(ref string contentType, ref string path)
        {
            // Check we're dealing with a DOCX preview.
            if (System.IO.File.Exists($"{path}.preview.pdf"))
            {
                // Update our path.
                path = $"{path}.preview.pdf";

                // Update our content type.
                contentType = "application/pdf";
            }
        }

        /// <summary>
        /// Shares a file using the AddNewFile as a backbone and while 
        /// also placing files inside a folder "API" on the home screen.
        /// </summary>
        /// <param name="user"></param>
        /// <param name="size"></param>
        /// <param name="name"></param>
        /// <param name="ext"></param>
        /// <param name="path"></param>
        /// (string shareId, int fileId)
        /// <returns>Tuple, (success and the shareId filled if it was successful.)</returns>
        public Result<string, int> AddNewFileAPI(User user, long size, string name, string ext, string path)
        {
            // Add new folder or use folder if it already exists.
            Folder folder = FolderCreateOrExists(user, "API");

            // Check if the folder was able to be used or created.
            if (folder == null) return Result<string, int>.New(ResultStatus.InvalidFolderHandle, string.Empty, -1);

            // Call our original add new file.
            var fileIdResult = AddNewFile(user.Id, size, name, ext, folder.Id, path);

            // Make sure adding our file was successful, if not, return false.
            if (!fileIdResult.IsOK()) return Result<string, int>.New(ResultStatus.FailedToAddFile, string.Empty, -1);

            // Get our share result.
            var shareIdResult = ToggleShareFile(user.Id, fileIdResult.Get());

            // Respond with a tuple.
            return Result<string, int>.New(shareIdResult.Get(), fileIdResult.Get());
        }

        /// <summary>
        /// Adds a new folder to the dataset.
        /// </summary>
        /// <param name="ownerId"></param>
        /// <param name="folderName"></param>
        /// <param name="rootFolder"></param>
        /// <returns></returns>
        public Result<Folder> AddNewFolder(int ownerId, string folderName, int rootFolder, bool isRecycleBin = false)
        {
            // Catch any exceptions.
            try
            {
                if (string.IsNullOrWhiteSpace(folderName))
                    return Result<Folder>.New(ResultStatus.InvalidFolderName, null);

                Folder folder = new Folder
                {
                    Owner = ownerId,
                    Name = folderName,
                    FolderId = rootFolder,
                    IsRecycleBin = isRecycleBin
                };

                _context.Folders.Add(folder);
                _context.SaveChanges();

                UpdateFolderListing(ownerId, folder);

                return Result<Folder>.New(folder);
            }
            catch
            {
                return Result<Folder>.New(ResultStatus.Exception, null);
            }
        }

        /// <summary>
        /// Share our file!
        /// </summary>
        /// <param name="id"></param>
        /// <param name="fileId"></param>
        /// <returns></returns>
        public Result<string> ToggleShareFile(int ownerId, int fileId)
        {
            // Catch any exceptions.
            try
            {
                // Get our actual user.
                File file = GetFile(ownerId, fileId);

                // Check if our user is null!
                if (file == null) return Result<string>.New(ResultStatus.InvalidFileHandle, string.Empty);

                // If we want to toggle off our share, then it is simple!
                if (file.IsSharing)
                {
                    // Set our is sharing accordingly!
                    file.IsSharing = false;

                    // Empty our share id!
                    file.ShareId = string.Empty;
                }
                // Otherwise, turn everything on.
                else
                {
                    // Setup a variable to store our share id!
                    string shareId = $"{RandomString(7)}";

                    // Check if our share id is taken!
                    if (CheckShareId(shareId))
                    {
                        // Return false if it is taken!
                        return Result<string>.New(ResultStatus.ShareIDTaken, string.Empty);
                    }

                    // Set our is sharing accordingly!
                    file.IsSharing = true;

                    // Generate our random string for our share id!
                    file.ShareId = shareId;
                }

                // Save our changes!
                _context.SaveChanges();

                // Update our listing.
                UpdateFileListing(ownerId, file);

                // Return true as it was successful.
                return Result<string>.New(file.ShareId);
            }
            catch
            {
                return Result<string>.New(ResultStatus.Exception, string.Empty);
            }
        }

        /// <summary>
        /// Enables or disables the share functionality of a folder.
        /// </summary>
        /// <param name="id"></param>
        /// <param name="folderId"></param>
        /// <returns></returns>
        public Result<string> ToggleShareFolder(int ownerId, int folderId)
        {
            // Catch any exceptions.
            try
            {
                // Get our actual user.
                Folder folder = GetFolder(ownerId, folderId);

                // Check if our user is null!
                if (folder == null) return Result<string>.New(ResultStatus.InvalidFolderHandle, string.Empty);

                ///////////////////////////////////////

                // Get our user.
                User user = GetUser(ownerId);

                // Check if our user exists.
                if (user == null) return Result<string>.New(ResultStatus.InvalidUserHandle, string.Empty);

                ///////////////////////////////////////

                // Check if we aren't about to start sharing our home folder.
                if (user.Folder == folder.Id) return Result<string>.New(ResultStatus.ModifyingHomeFolder, string.Empty);

                // If we want to toggle off our share, then it is simple!
                if (folder.IsSharing)
                {
                    // Set our is sharing accordingly!
                    folder.IsSharing = false;

                    // Empty our share id!
                    folder.ShareId = string.Empty;
                }
                // Otherwise, turn everything on.
                else
                {
                    // Setup a variable to store our share id!
                    string shareId = $"{RandomString(25)}";

                    // Check if our share id is taken!
                    if (CheckFolderShareId(shareId))
                        // Return false if it is taken!
                        return Result<string>.New(ResultStatus.FolderShareIDTaken, string.Empty);

                    // Set our is sharing accordingly!
                    folder.IsSharing = true;

                    // Generate our random string for our share id!
                    folder.ShareId = shareId;
                }

                _context.SaveChanges();

                UpdateFolderListing(ownerId, folder);

                return Result<string>.New(folder.ShareId);
            }
            catch
            {
                return Result<string>.New(ResultStatus.Exception, string.Empty);
            }
        }

        /// <summary>
        /// Enables or disables the api system for the user.
        /// </summary>
        /// <param name="userId"></param>
        /// <returns></returns>
        public Result ToggleAPI(int userId, out string apiKey)
        {
            // Setup a dumby api key value.
            apiKey = string.Empty;

            // Catch any exceptions.
            try
            {
                // Get our actual user.
                User user = _context.Users.Where(b => b.Id == userId).FirstOrDefault();

                // Check if our user is null!
                if (user == null) return Result.New(ResultStatus.InvalidUserHandle);

                // If our api is already enabled, then disable it.
                if (user.APIEnabled)
                {
                    // Disable our api.
                    user.APIEnabled = false;

                    // Set their api key to be empty.
                    user.APIKey = string.Empty;
                }
                // If our api is disabled, then enable it.
                else
                {
                    // Enable our api.
                    user.APIEnabled = true;

                    // Setup a random key for them.
                    user.APIKey = $"token_{RandomString(32)}";
                }

                // Save our changes!
                _context.SaveChanges();

                // Pop out our api key.
                apiKey = user.APIKey;

                return Result.New();
            }
            catch
            {
                // Exception, false.
                return Result.New(ResultStatus.Exception);
            }
        }

        /// <summary>
        /// Update our file name!
        /// </summary>
        /// <param name="id"></param>
        /// <param name="fileId"></param>
        /// <param name="newName"></param>
        /// <returns></returns>
        public Result UpdateFileName(int ownerId, int fileId, string newName)
        {
            // Catch any exceptions.
            try
            {
                // Double check if we aren't getting null or whitespace.
                if (string.IsNullOrWhiteSpace(newName)) return Result.New(ResultStatus.InvalidFileName);

                // Get the correct file.
                File file = GetFile(ownerId, fileId);

                // Check if the file is valid.
                if (file == null) return Result.New(ResultStatus.InvalidFileHandle);

                // Update our users name!
                file.Name = newName;

                // Save our changes!
                _context.SaveChanges();

                // Send out an file update listing.
                UpdateFileListing(ownerId, file);

                // Return true as it was successful.
                return Result.New();
            }
            catch
            {
                return Result.New(ResultStatus.Exception);
            }
        }

        /// <summary>
        /// Update our folder name!
        /// </summary>
        /// <param name="id"></param>
        /// <param name="folderId"></param>
        /// <param name="newName"></param>
        /// <returns></returns>
        public Result UpdateFolderName(int ownerId, int folderId, string newName)
        {
            // Catch any exceptions.
            try
            {
                // Double check if we aren't getting null or whitespace.
                if (string.IsNullOrWhiteSpace(newName)) return Result.New(ResultStatus.InvalidFolderName);

                // Get the correct file.
                Folder folder = GetFolder(ownerId, folderId);

                // Check if our user is null!
                if (folder == null) return Result.New(ResultStatus.InvalidFolderHandle);

                // Get our home folder.
                int homeFolder = GetUser(ownerId).Folder;

                // Make sure you don't rename the home folder.
                if (folderId == homeFolder) return Result.New(ResultStatus.ModifyingHomeFolder);

                folder.Name = newName;
                _context.SaveChanges();

                UpdateFolderListing(ownerId, folder);

                return Result.New();
            }
            catch
            {
                return Result.New(ResultStatus.Exception);
            }
        }

        /// <summary>
        /// Update our folder colour!
        /// </summary>
        /// <param name="id"></param>
        /// <param name="folderId"></param>
        /// <param name="newColour"></param>
        /// <returns></returns>
        public Result UpdateFolderColour(int ownerId, int folderId, int newColour)
        {
            // Catch any exceptions.
            try
            {
                // Get our actual user.
                Folder folder = GetFolder(ownerId, folderId);

                // Check if our user is null!
                if (folder == null) return Result.New(ResultStatus.InvalidFolderHandle);
 
                folder.Colour = newColour;
                _context.SaveChanges();

                UpdateFolderListing(ownerId, folder);

                return Result.New();
            }
            catch
            {
                return Result.New(ResultStatus.Exception);
            }
        }

        /// <summary>
        /// Returns the string representation of the folder's location.
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
            // and also remove a special character from the folder name.
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

        public Result<List<RelativePath>> GetPath(int ownerId, int folderId, int limit = 0)
        {
            // Get the folder
            User user = GetUser(ownerId);

            // Return null if the user doesn't exist.
            if (user == null) return Result<List<RelativePath>>.New(ResultStatus.InvalidUserHandle, null);

            // Get the folder
            Folder folder = GetFolder(ownerId, folderId);

            // Return null if the folder doesn't exist.
            if (folder == null) return Result<List<RelativePath>>.New(ResultStatus.InvalidFolderHandle, null);

            // Call other function.
            return Result<List<RelativePath>>.New(GetPath(folder, user.Folder));
        }

        /// <summary>
        /// Returns the string representation of the folder's location in html format.
        /// </summary>
        /// <param name="folder"></param>
        /// <param name="limit"></param>
        /// <param name="location"></param>
        /// <returns></returns>
        public List<RelativePath> GetPath(Folder folder, int homeFolderId, int limit = 0)
        {
            // Initialize our paths.
            var paths = new List<RelativePath>();

            // Loop until we've hit our limit folder!
            // For now set a limit of 6 folders.
            while (folder.FolderId != limit && paths.Count < 6)
            {
                // Insert our folder's name at the start of the string builder.
                paths.Insert(0, new RelativePath { Id = folder.Id, Name = folder.Name });

                // Get the next folder in the chain!
                folder = GetFolder(folder.Owner, folder.FolderId);
            }

            // Insert our home folder.
            paths.Insert(0, new RelativePath { Id = homeFolderId, Name = "~" });

            // Return the final location string!
            return paths;
        }

        /// <summary>
        /// Gets the selected shared folder relative to the root folder.
        /// </summary>
        /// <param name="folder"></param>
        /// <param name="limitFolder"></param>
        /// <param name="location"></param>
        /// <returns></returns>
        public Folder GetSharedFolderRelative(int folderId, string shareId)
        {
            // Attempt to get our shared folder.
            Folder sharedFolder = GetSharedFolder(shareId);

            // Check if our shared folder is null.
            if (sharedFolder == null) return null;
            
            // Setup our target folder.
            Folder targetFolder = GetFolder(sharedFolder.Owner, folderId);

            // Check if the folder we are targetting even exists.
            if (targetFolder == null) return sharedFolder;

            // Setup our temp folder.
            Folder tempFolder = targetFolder;

            // Loop until we've found our shared folder or until we reach null!
            while (tempFolder != null && tempFolder != sharedFolder)
            {
                // Get the next folder in the chain!
                tempFolder = GetFolder(sharedFolder.Owner, tempFolder.FolderId);
            }

            // Check if our target folder does equal our shared folder.
            if (tempFolder == sharedFolder)
                // Then we've found our folder.
                return targetFolder;
            else
                // Otherwise, return the shared folder since something is off.
                return sharedFolder;
        }

        /// <summary>
        /// Check whether a folder is inside a certain folder.
        /// </summary>
        /// <param name="ownerId"></param>
        /// <param name="folderId"></param>
        /// <param name="insideOfFolderId"></param>
        /// <returns></returns>
        public bool IsFolderInsideFolder(int ownerId, int folderId, int insideOfFolderId)
        {
            // Attempt to get our inside of folder.
            Folder insideFolder = GetFolder(ownerId, insideOfFolderId);

            // Check if our inside folder is null.
            if (insideFolder == null) return false;

            // Setup our target folder.
            Folder targetFolder = GetFolder(ownerId, folderId);

            // Check if the folder we are targetting even exists.
            if (targetFolder == null) return false;

            // Setup our temp folder.
            Folder tempFolder = targetFolder;

            // Loop until we've found our inside of folder or until we reach null!
            while (tempFolder != null && tempFolder != insideFolder)
            {
                // Get the next folder in the chain!
                tempFolder = GetFolder(insideFolder.Owner, tempFolder.FolderId);
            }

            // Check if our target folder does equal our inside folder.
            // Then we're inside our selected folder.
            // Otherwise, we're not inside a folder.
            return (tempFolder == insideFolder);
        }

        /// <summary>
        /// Checks wether a certain file is inside a certain folder.
        /// </summary>
        /// <param name="ownerId"></param>
        /// <param name="fileId"></param>
        /// <param name="insideOfFolderId"></param>
        /// <returns></returns>
        public bool IsFileInsideFolder(int ownerId, int fileId, int insideOfFolderId)
        {
            // Attempt to get our inside of folder.
            Folder insideFolder = GetFolder(ownerId, insideOfFolderId);

            // Check if our inside folder is null.
            if (insideFolder == null) return false;

            // Setup our target file.
            File targetFile = GetFile(ownerId, fileId);

            // Check if the file we are targetting even exists.
            if (targetFile == null) return false;

            // Check if the folder our file is inside of is inside of the folder.
            return IsFolderInsideFolder(ownerId, targetFile.Folder, insideFolder.Id);
        }

        /// <summary>
        /// Update our sort by field!
        /// </summary>
        /// <param name="id"></param>
        /// <param name="newSortBy"></param>
        /// <returns></returns>
        public Result UpdateSortBy(int id, int newSortBy, HttpContext httpContext, UserSession userSession)
        {
            // Catch any exceptions.
            try
            {
                // Get our actual user.
                User user = GetUser(id);

                // Check if our user is null!
                if (user == null) return Result.New(ResultStatus.InvalidUserHandle);

                // Update our users name!
                user.SortBy = newSortBy;

                // Save our changes!
                _context.SaveChanges();

                ////////////////////////////////////////////

                // Setup our new sort by!
                userSession.SortBy = newSortBy;

                // Setup our new session value!
                SessionExtension.Set(httpContext.Session, _sessionName, userSession);

                ////////////////////////////////////////////

                UpdateAllListings(user.Id, userSession.Folder);

                return Result.New();
            }
            catch
            {
                return Result.New(ResultStatus.Exception);
            }
        }

        /// <summary>
        /// Update our password.
        /// </summary>
        /// <param name="id"></param>
        /// <param name="currentPassword"></param>
        /// <param name="newPassword"></param>
        /// <returns></returns>
        public Result UpdatePassword(int id, string currentPassword, string newPassword)
        {
            // Catch any exceptions.
            try
            {
                // Get our actual user.
                User user = GetUser(id);

                // Check if our user is null!
                if (user == null) return Result.New(ResultStatus.InvalidUserHandle);

                ////////////////////////////////////////////

                // If our user's password matches then proceed!
                if (BCrypt.BCryptHelper.CheckPassword(currentPassword, user.Password))
                {
                    // Update our user's password!
                    user.Password = BCrypt.BCryptHelper.HashPassword(newPassword, BCrypt.BCryptHelper.GenerateSalt());

                    // Save our changes!
                    _context.SaveChanges();

                    // Return true as it was successful.
                    return Result.New();
                }
                else
                {
                    var error = Result.New(ResultStatus.PasswordDoesNotMatch);
                    error.CustomErrorMessage = "Your password does match your current password.";

                    return error;
                }
            }
            catch
            {
                return Result.New(ResultStatus.Exception);
            }
        }

        /// <summary>
        /// Updates a user's name.
        /// </summary>
        /// <param name="id"></param>
        /// <param name="currentPassword"></param>
        /// <param name="newPassword"></param>
        /// <returns></returns>
        public Result UpdateName(int id, string name)
        {
            // Catch any exceptions.
            try
            {
                // Get our actual user.
                User user = _context.Users.Where(b => b.Id == id).FirstOrDefault();

                // Check if our user is null!
                if (user == null) return Result.New(ResultStatus.InvalidUserHandle); 

                // Make sure our name isn't just white space or null
                if (string.IsNullOrWhiteSpace(name)) return Result.New(ResultStatus.InvalidName);

                // Okay, set up the new name.
                user.Name = name;

                // Save our changes!
                _context.SaveChanges();

                return Result.New();
            }
            catch
            {
                return Result.New(ResultStatus.Exception);
            }
        }

        /// <summary>
        /// Attempts to generate a recycle bin.
        /// </summary>
        /// <param name="owner"></param>
        public Folder GetRecycleBin(User owner)
        {
            // Check if we were able to find the user.
            if (owner == null) return null;

            // Attempt to find the folder matching our criteria.
            Folder recycleBin = _context.Folders.Where(b => b.Owner == owner.Id && b.IsRecycleBin == true).FirstOrDefault();

            // If we haven't found a folder matching our criteria, then gohead and make a new one.
            if (recycleBin == null)
            {
                // Attempt to add our folder to the database.
                var result = AddNewFolder(owner.Id, "Recycle Bin", owner.Folder, true);

                // Check if we got a successful response.
                if (!result.IsOK()) return null;

                // If everything checks out, then goahead and setup the folder's reference.
                recycleBin = result.Get();
            }

            // Return the instance of the recycle bin.
            return recycleBin;
        }

        /// <summary>
        /// Recycles a folder.
        /// </summary>
        /// <param name="ownerId"></param>
        /// <param name="folder"></param>
        /// <returns></returns>
        public Result RecycleFolder(int ownerId, Folder folder)
        {
            // Attempt to find the user.
            User user = GetUser(ownerId);

            // Check if we were able to find the user.
            if (user == null) return Result.New(ResultStatus.InvalidUserHandle);

            ////////////////////////////////////////

            // Attempt to get the recycle bin instance.
            var recycleBin = GetRecycleBin(user);

            // Check if we actually we're given one.
            if (recycleBin == null) return Result.New(ResultStatus.NoRecycleBinGiven);

            ////////////////////////////////////////

            // Check if the recycling bin is inside of the folder we want to delete.
            if (!folder.IsRecycleBin && IsFolderInsideFolder(ownerId, recycleBin.Id, folder.Id))
                // If so, then move the recycle bin outside to the home folder.
                MoveFolder(user.Id, recycleBin.Id, user.Folder);

            // Check if our file is already inside our recycle bin.
            // If so, return true saying that we can proceed to destroy the file.
            if (IsFolderInsideFolder(ownerId, folder.Id, recycleBin.Id)) return Result.New(ResultStatus.DestroyFolder);

            // Now move our file to the recycle bin.
            MoveFolder(user.Id, folder.Id, recycleBin.Id);

            // Then finally return false indicating 
            // that we do not want to destroy our file.
            return Result.New(ResultStatus.DoNotDestroyFolder);
        }

        /// <summary>
        /// Deletes a file from the dataset.
        /// </summary>
        /// <param name="ownerId"></param>
        /// <param name="folderId"></param>
        /// <returns></returns>
        public Result DeleteFolder(int ownerId, int folderId, bool doNotRecycle = false)
        {
            // Catch any exceptions.
            try
            {
                // Get our selected folder that we are going to delete.
                Folder selectedFolder = GetFolder(ownerId, folderId);

                // Check if our selected folder even exists.
                if (selectedFolder == null) return Result.New(ResultStatus.InvalidFolderHandle);

                ///////////////////////////////////////////////////

                // Get our parent folder.
                var parentFolder = GetFolder(ownerId, selectedFolder.FolderId);

                // Check if our folder even exists.
                if (parentFolder == null) return Result.New(ResultStatus.NoParentFolder);

                ///////////////////////////////////////////////////

                // Attempt to recycle our folder.
                if (!doNotRecycle)
                {
                    // Attempt to recycle our folder.
                    var result = RecycleFolder(ownerId, selectedFolder);

                    // If we were given a command to not recycle then return a successful result.
                    if (result.Status == ResultStatus.DoNotDestroyFolder) return Result.New();

                    // If we we'rent told to destroy file then something is wrong!
                    else if (result.Status != ResultStatus.DestroyFolder) return result;
                }

                /////////////////////////////////////////////

                // Get our file.
                var files = GetFiles(ownerId, selectedFolder.Id);

                // Iterate through all our files in the folder.
                foreach (var file in files)
                {
                    // Dispose all our related files off of the disk!
                    DisposeFileOnDisk(file.Path);

                    // Remove each file from the dataset.
                    _context.Files.Remove(file);
                } 

                // Get all folders inside our folder.
                var folders = GetFolders(ownerId, selectedFolder.Id);

                // Go to every folder and delete them.
                foreach (var folder in folders)
                {
                    // Delete each folder instance by calling this method.
                    DeleteFolder(ownerId, folder.Id, true);
                }

                // Don't delete our folder if it is a recycling bin.
                if (!selectedFolder.IsRecycleBin)
                    // Remove our folder from the database.
                    _context.Folders.Remove(selectedFolder);

                // Remove our file.
                _context.SaveChanges();

                /////////////////////////////////////////////

                // Indicate that this folder is being deleted.
                if (!selectedFolder.IsRecycleBin) selectedFolder.FolderId = -1;

                UpdateAllListings(ownerId, folderId);
                UpdateFolderListing(ownerId, selectedFolder);

                /////////////////////////////////////////////

                return Result.New();
            }
            catch
            {
                return Result.New(ResultStatus.Exception);
            }
        }

        /// <summary>
        /// Disposes all the files related to the file path!
        /// </summary>
        /// <param name="filePath"></param>
        public Result DisposeFileOnDisk(string filePath)
        {
            try
            {
                // Get our files inside our vault storage location and starting with  the file path.
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

                return Result.New();
            }
            catch { return Result.New(ResultStatus.Exception); }
        }

        /// <summary>
        /// Moves a file to the recycle bin.
        /// </summary>
        /// <param name="ownerId"></param>
        /// <param name="file"></param>
        public Result RecycleFile(int ownerId, File file)
        {
            // Attempt to find the user.
            User user = GetUser(ownerId);

            // Check if we were able to find the user.
            if (user == null) return Result.New(ResultStatus.InvalidUserHandle);

            /////////////////////////////////////////////////

            // Check if the file even exists and the owner of it is the correct one.
            if (file == null || file.Owner != user.Id) return Result.New(ResultStatus.InvalidFileHandle);

            // Attempt to get the recycle bin instance.
            var recycleBin = GetRecycleBin(user);

            // Check if we actually we're given one.
            if (recycleBin == null) return Result.New(ResultStatus.NoRecycleBinGiven);

            /////////////////////////////////////////////////

            // Check if our file is already inside our recycle bin.
            // If so, return true saying that we can proceed to destroy the file.
            if (IsFileInsideFolder(ownerId, file.Id, recycleBin.Id)) return Result.New(ResultStatus.DestroyFile);

            // Now move our file to the recycle bin.
            MoveFile(user.Id, file.Id, recycleBin.Id);

            // Then finally return false indicating 
            // that we do not want to destroy our file.
            return Result.New(ResultStatus.DoNotDestroyFile); 
        }

        /// <summary>
        /// Deletes a file from the dataset.
        /// </summary>
        /// <param name="ownerId"></param>
        /// <param name="fileId"></param>
        /// <returns></returns>
        public Result DeleteFile(int ownerId, int fileId)
        {
            // Catch any exceptions.
            try
            {
                // Get our file.
                File file = GetFile(ownerId, fileId);

                // Check if the file even exists.
                if (file == null) return Result.New(ResultStatus.InvalidFileHandle);

                ///////////////////////////////////////////

                // Attempt to recycle our folder.
                var result = RecycleFile(ownerId, file);

                // If we were given a command to not recycle then return a successful result.
                if (result.Status == ResultStatus.DoNotDestroyFile) return Result.New();

                // If we we'rent told to destroy file then something is wrong!
                else if (result.Status != ResultStatus.DestroyFile) return result;

                ///////////////////////////////////////////

                // Dispose all our related files off of the disk!
                if (!DisposeFileOnDisk(file.Path).IsOK()) return Result.New(ResultStatus.FailedToDeleteFileOnDisk);

                ///////////////////////////////////////////

                // Set our parent folder to be negative one, indicating a deletion.
                file.Folder = -1;

                // Send out an update.
                UpdateFileListing(ownerId, file);

                ///////////////////////////////////////////

                // Find all our comments.
                var comments = _context.Comments.Where(b => b.FileId == file.Id);

                // Remove all our comments.
                _context.Comments.RemoveRange(comments);

                ///////////////////////////////////////////

                // Remove our file.
                _context.Files.Remove(file);

                ///////////////////////////////////////////

                // Save our changes.
                _context.SaveChanges();

                return Result.New();
            }
            catch
            {
                return Result.New(ResultStatus.Exception);
            }
        }

        /// <summary>
        /// Moves a folder to a different folder location.
        /// folder.Id -> newFolderId
        /// </summary>
        /// <param name="ownerId"></param>
        /// <param name="folderId"></param>
        /// <param name="newFolderId"></param>
        /// <returns></returns>
        public Result MoveFolder(int ownerId, int folderId, int newFolderId)
        {
            // Catch any exceptions.
            try
            {
                // Get our user.
                User user = GetUser(ownerId);

                // Check if we found a user.
                if (user == null) return Result.New(ResultStatus.InvalidUserHandle);

                // Get our home folder id.
                int homeFolder = user.Folder;

                // Don't move the same folder inside of itself.
                if (folderId == newFolderId)
                    return Result.New(ResultStatus.FolderInsideItself);

                // Make sure you can't move the home folder anywhere.
                if (folderId == homeFolder) return Result.New(ResultStatus.ModifyingHomeFolder);

                ///////////////////////////////////////////////////

                // Get our folders as objects.
                Folder folder = GetFolder(ownerId, folderId);
                Folder newFolder = GetFolder(ownerId, newFolderId);

                // Check if our folders exist.
                if (folder == null || newFolder == null) return Result.New(ResultStatus.InvalidFolderHandle);

                // Check if our new folder is already inside the moving folder.
                if (IsFolderInsideFolder(ownerId, newFolderId, folderId)) return Result.New(ResultStatus.FolderInsideFolder);

                // Get our parent folder object.
                Folder parentFolder = GetFolder(ownerId, folder.FolderId);

                // Check if our parent folder exists.
                if (parentFolder == null) return Result.New(ResultStatus.NoParentFolder);

                ///////////////////////////////////////////////////

                // Modify our parent.
                folder.FolderId = newFolder.Id;

                // Save our changes.
                _context.SaveChanges();

                ///////////////////////////////////////////////////

                // Update our listing inside our moved folder.
                UpdatePathBar(ownerId);

                // Update our moved folder.
                UpdateFolderListing(ownerId, folder);

                ///////////////////////////////////////////////////

                return Result.New();
            }
            catch
            {
                return Result.New(ResultStatus.Exception);
            }
        }

        /// <summary>
        /// Moves a file to a different folder location.
        /// </summary>
        /// <param name="ownerId"></param>
        /// <param name="fileId"></param>
        /// <param name="folderId"></param>
        /// <returns></returns>
        public Result MoveFile(int ownerId, int fileId, int folderId)
        {
            // Catch any exceptions.
            try
            {
                // Get our file and folder objects.
                File file = GetFile(ownerId, fileId);
                Folder newFolder = GetFolder(ownerId, folderId);

                // Check if our objects exist.
                if (file == null || newFolder == null) return Result.New(ResultStatus.InvalidFolderHandle);

                // Attempt to get our parent folder.
                Folder parentFolder = GetFolder(ownerId, file.Folder);

                // Check if our parent folder exists.
                if (parentFolder == null) return Result.New(ResultStatus.NoParentFolder);

                // Modify our parent folder of our file.
                file.Folder = newFolder.Id;

                // Save our changes.
                _context.SaveChanges();

                ////////////////////////////////////////////////
                
                // Update the file listing.
                UpdateFileListing(ownerId, file);

                // Update the new folder's listing.
                UpdateFolderListing(ownerId, newFolder);

                // Update the parent folder listing.
                UpdateFolderListing(ownerId, parentFolder);

                ////////////////////////////////////////////////

                return Result.New();
            }
            catch
            {
                return Result.New(ResultStatus.Exception);
            }
        }

        /// <summary>
        /// Writes the contents to a text file.
        /// </summary>
        /// <param name="ownerId"></param>
        /// <param name="fileId"></param>
        /// <param name="content"></param>
        /// <returns></returns>
        public Result EditTextFile(int ownerId, int fileId, string contents)
        {
            // Catch any exceptions.
            try
            {
                // Attempt to find our file.
                File file = GetFile(ownerId, fileId);

                // Check if our file even exists.
                if (file == null)
                    return Result.New(ResultStatus.InvalidFileHandle);

                /////////////////////////////////////

                if (file.IsEncrypted)
                    return Result.New(ResultStatus.FileIsEncrypted);

                /////////////////////////////////////

                if (file.Size > 5000000)
                    return Result.New(ResultStatus.FileTooLargeToEdit);

                /////////////////////////////////////

                if (!System.IO.File.Exists(file.Path))
                    return Result.New(ResultStatus.FileDoesNotExistOnDisk);

                /////////////////////////////////////

                var delta = Encoding.UTF8.GetBytes(contents);
                var origin = System.IO.File.ReadAllBytes(file.Path);

                /////////////////////////////////////

                var target = Fossil.Delta.Apply(origin, delta);

                /////////////////////////////////////

                if (!CanUpload(ownerId, target.Length))
                    return Result.New(ResultStatus.NotEnoughStorage);

                /////////////////////////////////////

                System.IO.File.WriteAllBytes(file.Path, target);

                /////////////////////////////////////

                return Result.New();
            }
            catch (Exception ex)
            {
                var result = Result.New(ResultStatus.Exception);
                result.CustomErrorMessage = ex.Message;

                return result;
            }
        }

        /// <summary>
        /// Duplicates a file.
        /// </summary>
        /// <param name="ownerId">The owning user of the file.</param>
        /// <param name="fileId">The file's id.</param>
        /// <returns></returns>
        public Result<int> DuplicateFile(int ownerId, int fileId)
        {
            // Catch any exceptions.
            try
            {
                // Attempt to find our file.
                File file = GetFile(ownerId, fileId);

                // Check if our file even exists.
                if (file == null) return Result<int>.New(ResultStatus.InvalidFileHandle, -1);

                /////////////////////////////////////

                // Check if our file is encrypted.
                if (file.IsEncrypted) return Result<int>.New(ResultStatus.FileIsEncrypted, -1);

                // Check if we can "upload" this file, or in other words "do we have enough storage for this file".
                if (!CanUpload(ownerId, file.Size)) return Result<int>.New(ResultStatus.NotEnoughStorage, -1);

                // Generate a brand new file name for our duplicate file.
                string filePath = _configuration["VaultStorageLocation"] + RandomString(30);

                // Check if our file already exists with that name!
                if (System.IO.File.Exists(filePath)) return Result<int>.New(ResultStatus.InternalFileNameTaken, -1);

                // Now actually create a copy of the file on the file system.
                System.IO.File.Copy(file.Path, filePath);


                var result = AddNewFile(ownerId, file.Size, file.Name, file.Ext, file.Folder, filePath);

                if (!result.IsOK()) return Result<int>.New(ResultStatus.UnableToDuplicate, -1);

                return Result<int>.New(result.Get());
            }
            catch
            {
                return Result<int>.New(ResultStatus.Exception, -1);
            }
        }

        /// <summary>
        /// Responds with whether a user can upload with the given file size.
        /// </summary>
        /// <param name="userId"></param>
        /// <param name="size"></param>
        /// <returns></returns>
        public bool CanUpload(int userId, long size)
        {
            // Setup our user.
            User user = GetUser(userId);

            // Check if our user exists.
            if (user == null) return false;

            // Call our other function..
            return CanUpload(user, size);
        }

        /// <summary>
        /// Responds with whether a user can upload with the given file size.
        /// </summary>
        /// <param name="user"></param>
        /// <param name="size"></param>
        /// <returns></returns>
        public bool CanUpload(User user, long size)
        {
            try
            {
                // Setup our max bytes variable.
                var max = user.MaxBytes;

                // Setup our total bytes variable.
                var total = _context.Files.Where(b => b.Owner == user.Id).Sum(b => b.Size);

                // Setup a boolean condition to check if we're beyond our limit.
                return !(total + size > max);
            }
            catch
            {
                return false;
            }
        }

        /// <summary>
        /// Returns a formatted string of the remaining storage space.
        /// </summary>
        /// <param name="user"></param>
        /// <returns></returns>
        public string StorageFormatted(User user)
        {
            try
            {
                // Setup our total bytes variable.
                var total = GetBytesReadable(_context.Files.Where(b => b.Owner == user.Id).Sum(b => b.Size));

                // Setup our max bytes.
                var max = GetBytesReadable(user.MaxBytes);

                // Setup a boolean condition to check if we're beyond our limit.
                return $"{total} / {max} used";
            }
            catch
            {
                return string.Empty;
            }
        }

      
        /// <summary>
        /// Generates a random string given the count.
        /// </summary>
        /// <param name="count">Number of random characters.</param>
        /// <returns></returns>
        public string RandomString(int count)
        {
            // Our characters that will be inside our random string.
            string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

            // Generate our string chars.
            var stringChars = new char[count];

            // Setup our random variable.
            var random = new Random();

            // Iterate and generate a random character.
            for (int i = 0; i < stringChars.Length; i++) stringChars[i] = chars[random.Next(chars.Length)];

            // Setup our new string.
            return new string(stringChars);
        }

        public FolderListing GetFolderListing(Folder folder)
        {
            // Setup our folder listing.
            return new FolderListing
            {
                Id = folder.Id,
                Name = folder.Name,
                Folder = folder.FolderId,
                Icon = GetFolderAttribute(folder.Colour, AttributeTypes.FolderIcon),
                Style = GetFolderAttribute(folder.Colour, AttributeTypes.FolderStyle),
                IsRecycleBin = folder.IsRecycleBin,
                IsSharing = folder.IsSharing,
                ShareId = folder.ShareId
            };
        }

        public FileListing GetFileListing(File file)
        {
            // Setup our file listing.
            return new FileListing
            {
                Id = file.Id,
                Name = file.Name,
                Folder = file.Folder,
                Icon = GetFileAttribute(file.Id.ToString(), file.Ext, file.IsEncrypted ? AttributeTypes.FileIconNoPreview : AttributeTypes.FileIcon),
                Date = ((DateTimeOffset)file.Created).ToUnixTimeSeconds(),
                Size = GetBytesReadable(file.Size),
                IsEncrypted = file.IsEncrypted,
                IsSharing = file.IsSharing,
                ShareId = file.ShareId
            };
        }

        ////////////////////////////////////////////////////////
        /// SignalR methods.
        ////////////////////////////////////////////////////////

        /// <summary>
        /// Updates the listings for all our user sessions.
        /// </summary>
        /// <param name="userId"></param>
        private void UpdateAllListings(int userId, int folderId) =>
            _hubContext.Clients.Group(userId.ToString()).SendAsync("UpdateListing", folderId);

        private void UpdatePathBar(int userId)
            => _hubContext.Clients.Group(userId.ToString()).SendAsync("UpdatePathBar");

        private void UpdateFileListing(int userId, File file) 
            => _hubContext.Clients.Group(userId.ToString()).SendAsync("UpdateFile", GetFileListing(file));

        private void UpdateFolderListing(int userId, Folder folder)
            => _hubContext.Clients.Group(userId.ToString()).SendAsync("UpdateFolder", GetFolderListing(folder));
    }
}
