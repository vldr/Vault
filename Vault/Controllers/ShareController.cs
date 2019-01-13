using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Vault.Models;
using Microsoft.AspNetCore.StaticFiles;
using System.Threading;

namespace Vault.Controllers
{
    public class ShareController : Controller
    {
        // Instance of our process service...
        private readonly ProcessService _processService;

        // Instance of our configuration...
        private readonly IConfiguration _configuration;

        // Instance of our relative directory...
        private readonly string _relativeDirectory;
        
        // Instance of our sort by cookie...
        private readonly string _sortByCookie;

        /// <summary>
        /// A function which will return a missing parameters json response...
        /// </summary>
        /// <returns>Json response...</returns>
        private JsonResult MissingParameters()
        {
            // Return a simple missing parameters json response...
            return Json(new { Success = false, Reason = "You must supply all required parameters..." });
        }

        /// <summary>
        /// Constructor...
        /// </summary>
        /// <param name="processService"></param>
        /// <param name="configuration"></param>
        public ShareController(ProcessService processService, IConfiguration configuration)
        {
            _processService = processService;
            _configuration = configuration;

            _relativeDirectory = configuration["RelativeDirectory"];
            _sortByCookie = configuration["VaultSortByCookie"];
        }

        /// <summary>
        /// Initializes our sort by value...
        /// </summary>
        /// <returns></returns>
        private int InitializeSortBy()
        {
            // Setup our sort by prototype here...
            int sortBy = 0;

            // Check if our cookie exists, if so, continue...
            if (Request.Cookies.ContainsKey(_sortByCookie))
            {
                // Get the value of the cookie if it exists...
                string value = Request.Cookies[_sortByCookie];

                // Attempt to convert our cookie value to an int...
                int.TryParse(value, out sortBy);

                // Check if our sort by value is within limits... (HARD CODING)
                // Reset if it is...
                if (sortBy < -4 || sortBy > 4) sortBy = 0;
            }

            // Return our sort by in the end...
            return sortBy;
        }

        ////////////////////////////////////////////////////////////////////////////////////////////////

        /// <summary>
        /// Displays the share page for a shared folder...
        /// </summary>
        /// <param name="shareId"></param>
        /// <returns></returns>
        [HttpGet]
        [Route("share/folder/{shareId}")]
        public IActionResult ShareFolder(string shareId)
        {
            // Check if our share id given is null!
            if (shareId == null)
                return Redirect(_relativeDirectory);

            // Get the file...
            Folder folder = _processService.GetSharedFolder(shareId);

            // Check if the file exists or is valid!
            if (folder == null) return Redirect(_relativeDirectory);

            // Setup our shared file variable in our viewbag!
            ViewBag.Folder = folder;

            // Setup our share id...
            ViewBag.ShareId = shareId;

            // Return our view!
            return View();
        }

        /// <summary>
        /// Downloads the entire shared folder...
        /// </summary>
        /// <param name="cancellationToken"></param>
        /// <param name="shareId"></param>
        /// <returns></returns>
        [HttpPost]
        [Route("share/folder/dl/{folderId}/{shareId}")]
        public async Task<IActionResult> DownloadFolder(CancellationToken cancellationToken, int? folderId, string shareId)
        {
            // Check if our share id or folder id given is null!
            if (folderId == null || shareId == null)
                return StatusCode(500);

            // Get our relative folder...
            var folder = _processService.GetSharedFolderRelative(folderId.GetValueOrDefault(), shareId);

            // Check if our folder isn't null...
            if (folder == null) return StatusCode(500);

            // Make sure you don't download the home folder...
            if (folder.Id == 0) return StatusCode(500);

            // Register our encoding provider...
            System.Text.Encoding.RegisterProvider(System.Text.CodePagesEncodingProvider.Instance);

            // Setup our response...
            Response.StatusCode = 200;
            Response.ContentType = "application/octet-stream";
            Response.Headers.Add("Content-Disposition", $"attachment; filename={System.Net.WebUtility.UrlEncode(folder.Name)}.zip");

            // Setup our zip stream to point to our response body!
            using (var zip = new Ionic.Zip.ZipOutputStream(Response.Body))
            {
                // Await our zip files method...
                await _processService.ZipFiles(folder.Id, folder.Owner, zip, cancellationToken, folder.FolderId);
            }

            // Return an empty result.
            return new EmptyResult();
        }

        /// <summary>
        /// Displays a list of shared folders and files...
        /// </summary>
        /// <param name="offset"></param>
        /// <param name="folderId"></param>
        /// <param name="shareId"></param>
        /// <param name="sortBy"></param>
        /// <returns></returns>
        [HttpPost]
        [Route("share/list")]
        public IActionResult List(int? offset, int? folderId, string shareId)
        {
            // Check if our parameters given are null!
            if (offset == null 
                || folderId == null 
                || shareId == null)
                return MissingParameters();

            // Get our shared folder...
            var sharedFolder = _processService.GetSharedFolderRelative(folderId.GetValueOrDefault(), shareId);

            // Check if the file exists or is valid!
            if (sharedFolder == null)
                // Inform the user of what happened...
                return Json(new { Success = false, Reason = "The given folder is not being shared or doesn't exist..." });

            // Create a cookie if it doesn't exist already of our sort by...
            var sortBy = InitializeSortBy();

            // Get the file...
            Folder folder = _processService.GetSharedFolder(shareId);

            // Setup a listing for our folder...
            Listing listing = new Listing()
            {
                Success = true,
                ShareId = shareId,
                IsHome = (folder.Id == sharedFolder.Id),
                Previous = sharedFolder.FolderId,
                SharedFolder = sharedFolder.Id,
                Sort = sortBy,
                Folders = _processService.GetFolderListings(sharedFolder.Owner, sharedFolder.Id),
                Files = _processService.GetSharedFileListings(sharedFolder.Owner, 
                    sharedFolder.Id, 
                    shareId,
                    sortBy,
                    offset.GetValueOrDefault())
            };

            // Return our listing...
            return Json(listing);
        }

        /// <summary>
        /// Returns the view for our file viewer...
        /// </summary>
        /// <param name="fileId"></param>
        /// <param name="folderId"></param>
        /// <param name="shareId"></param>
        /// <returns></returns>
        [HttpPost]
        [Route("share/viewer")]
        public IActionResult SharedViewer(int? fileId, int? folderId, string shareId)
        {
            // Check if our parameters given are null!
            if (shareId == null || fileId == null || folderId == null) return StatusCode(500);

            // Get our shared folder...
            var sharedFolder = _processService.GetSharedFolderRelative(folderId.GetValueOrDefault(), shareId);

            // Check if the file exists or is valid!
            if (sharedFolder == null) return StatusCode(500);

            // Get the file...
            Models.File file = _processService.GetSharedFile(fileId.GetValueOrDefault(),
                sharedFolder.Id,
                sharedFolder.Owner);

            // Check if we were able to find the file...
            if (file == null) return StatusCode(500);

            // Check if the file even exists on the disk...
            if (!System.IO.File.Exists(file.Path)) return StatusCode(500);

            // Setup our shared file variable in our viewbag!
            ViewBag.File = file;

            // Setup our file icon with no preview...
            ViewBag.Icon = "../../" + _processService.GetFileAttribute(file.Id.ToString(), 
                file.Ext, 
                ProcessService.AttributeTypes.FileIconNoPreview);

            // Setup our view bag action as a preview variable...
            ViewBag.Preview = _processService.GetFileAttribute(file.Id.ToString(),
                file.Ext,
                ProcessService.AttributeTypes.FileAction);

            // Setup our view bag url...
            ViewBag.Url = $"../../share/dl/{shareId}/{fileId}/{folderId}";

            // Return the partial view...
            return View("/Views/Process/Viewer.cshtml");
        }

        /// <summary>
        /// Downloads a file from a shared folder...
        /// </summary>
        /// <param name="shareId"></param>
        /// <param name="fileId"></param>
        /// <param name="folderId"></param>
        /// <returns></returns>
        [HttpPost]
        [Route("share/dl/{shareId}/{fileId}/{folderId}")]
        public IActionResult FolderFileDownload(string shareId, int? fileId, int? folderId)
        {
            // Check if our parameters given are null!
            if (shareId == null || fileId == null || folderId == null) return StatusCode(500);

            // Get our shared folder...
            var sharedFolder = _processService.GetSharedFolderRelative(folderId.GetValueOrDefault(), shareId);

            // Check if the file exists or is valid!
            if (sharedFolder == null) return StatusCode(500);

            // Get the file...
            Models.File file = _processService.GetSharedFile(fileId.GetValueOrDefault(),
                sharedFolder.Id,
                sharedFolder.Owner);

            // Check if we were able to find the file...
            if (file == null) return StatusCode(500);

            // Check if the file even exists on the disk...
            if (!System.IO.File.Exists(file.Path)) return StatusCode(500);

            // Return an empty result.
            return PhysicalFile(file.Path, "application/octet-stream", file.Name, true);
        }

        /// <summary>
        /// Downloads a file from a shared folder...
        /// </summary>
        /// <param name="shareId"></param>
        /// <param name="fileId"></param>
        /// <param name="folderId"></param>
        /// <returns></returns>
        [HttpGet]
        [Route("share/dl/{shareId}/{fileId}/{folderId}")]
        public IActionResult FolderFilePreview(string shareId, int? fileId, int? folderId)
        {
            // Check if our parameters given are null!
            if (shareId == null || fileId == null || folderId == null) return StatusCode(500);

            // Get our shared folder...
            var sharedFolder = _processService.GetSharedFolderRelative(folderId.GetValueOrDefault(), shareId);

            // Check if the file exists or is valid!
            if (sharedFolder == null) return StatusCode(500);

            // Get the file...
            Models.File file = _processService.GetSharedFile(fileId.GetValueOrDefault(), 
                sharedFolder.Id, 
                sharedFolder.Owner);

            // Check if we were able to find the file...
            if (file == null) return StatusCode(500);

            // Check if the file even exists on the disk...
            if (!System.IO.File.Exists(file.Path)) return StatusCode(500);

            // Setup our mime type string...
            string mimeType = "application/octet-stream";

            // Attempt to get the content type...
            new FileExtensionContentTypeProvider().TryGetContentType(file.Name, out mimeType);

            // Check if our mime type is null or not...
            if (mimeType == null)
                // If it is reset it...
                mimeType = "application/octet-stream";

            // Return an empty result.
            return PhysicalFile(file.Path, mimeType, true);
        }

        /// <summary>
        /// Returns the thumbnail of a file...
        /// </summary>
        /// <param name="shareId"></param>
        /// <param name="fileId"></param>
        /// <param name="folderId"></param>
        /// <returns></returns>
        [HttpGet]
        [Route("share/thumbnail/{shareId}/{fileId}/{folderId}")]
        public IActionResult FolderFileThumbnail(string shareId, int? fileId, int? folderId)
        {
            // Check if our parameters given are null!
            if (shareId == null || fileId == null || folderId == null) return StatusCode(500);

            // Get our shared folder...
            var sharedFolder = _processService.GetSharedFolderRelative(folderId.GetValueOrDefault(), shareId);

            // Check if the file exists or is valid!
            if (sharedFolder == null) return StatusCode(500);

            // Get the file...
            Models.File file = _processService.GetSharedFile(fileId.GetValueOrDefault(),
                sharedFolder.Id,
                sharedFolder.Owner);

            // Check if we were able to find the file...
            if (file == null) return StatusCode(500);

            // Setup our thumbnails path!
            string thumbnailPath = file.Path + ".thumb";

            // Setup some simple client side caching for the thumbnails!
            HttpContext.Response.Headers.Add("Cache-Control", "public,max-age=86400");

            // Check if the file even exists on the disk...
            if (!System.IO.File.Exists(thumbnailPath)) return Redirect(_relativeDirectory + "images/image-icon.png");

            // Return the file...
            return PhysicalFile(thumbnailPath, "image/*", file.Name, true);
        }

        ////////////////////////////////////////////////////////////////////////////////////////////////
        
        /// <summary>
        /// Displays the share page for a shared file...
        /// </summary>
        /// <param name="shareId"></param>
        /// <returns></returns>
        [HttpGet]
        [Route("share/{shareId}")]
        public IActionResult Share(string shareId)
        {
            // Check if our share id given is null!
            if (shareId == null)
                return Redirect(_relativeDirectory);

            // Get the file...
            Models.File file = _processService.GetSharedFile(shareId);

            // Check if the file exists or is valid!
            if (file == null)
                return Redirect(_relativeDirectory);

            // Setup our shared file variable in our viewbag!
            ViewBag.File = file;

            // Setup our readable version of the file size...
            ViewBag.FileSize = _processService.GetBytesReadable(file.Size);

            // Setup our icon which should have no preview...
            ViewBag.Icon = _processService.GetFileAttribute(file.Id.ToString(), 
                file.Ext,
                ProcessService.AttributeTypes.FileIconNoPreview);

            // Setup our view bag action as a preview variable...
            ViewBag.Preview = _processService.GetFileAttribute(file.Id.ToString(),
                file.Ext,
                ProcessService.AttributeTypes.FileAction);

            // Return our view!
            return View();
        }

        /// <summary>
        /// Downloads the shared file...
        /// </summary>
        /// <param name="shareId"></param>
        /// <returns></returns>
        [HttpPost]
        [Route("share/dl/{shareId}")]
        public IActionResult SharedFileDownload(string shareId)
        {
            // Check if our share id given is null!
            if (shareId == null) return StatusCode(500);

            // Get the file...
            Models.File file = _processService.GetSharedFile(shareId);

            // Check if the file exists or is valid!
            if (file == null) return StatusCode(500);

            // Check if the file even exists on the disk...
            if (!System.IO.File.Exists(file.Path)) return StatusCode(500);

            // Return an empty result.
            return PhysicalFile(file.Path, "application/octet-stream", file.Name, true);
        }

        /// <summary>
        /// Gets the file...
        /// </summary>
        /// <param name="shareId"></param>
        /// <returns></returns>
        [HttpGet]
        [Route("i/{shareId}")]
        [Route("i/{shareId}.{suffix}")]
        public IActionResult SharedFileDirectDownload(string shareId, string prefix)
        {
            // Check if our share id given is null!
            if (shareId == null) return StatusCode(500);

            // Get the file...
            Models.File file = _processService.GetSharedFile(shareId);

            // Check if the file exists or is valid!
            if (file == null) return StatusCode(500);

            // Check if the file even exists on the disk...
            if (!System.IO.File.Exists(file.Path)) return StatusCode(500);

            // Setup our mime type string...
            string mimeType = "application/octet-stream";

            // Attempt to get the content type...
            new FileExtensionContentTypeProvider().TryGetContentType(file.Name, out mimeType);

            // Check if our mime type is null or not...
            if (mimeType == null)
                // If it is reset it...
                mimeType = "application/octet-stream";

            // Return an empty result.
            return PhysicalFile(file.Path, mimeType, true);
        }

        ////////////////////////////////////////////////////////////////////////////////////////////////

        /// <summary>
        /// Upload Files
        /// </summary>
        /// <param name="file"></param>
        /// <returns></returns>
        [HttpPost("UploadFiles")]
        [Route("share/upload")]
        public async Task<IActionResult> Upload(string apiKey, IFormFile file)
        {
            try
            {
                // Get our user by their api key...
                User user = _processService.GetUserAPI(apiKey);

                // If our user is null, then return an invalid message...
                if (user == null) return Json(new { Success = false, Reason = "Invalid api key..." });

                // Store our file size...
                long size = file.Length;

                // Check if the file is too big to upload...
                if (size > long.Parse(_configuration["MaxVaultFileSize"]))
                    return Json(new { Success = false, Reason = "The file size is too large..." });

                //////////////////////////////////////////////////////////////////

                // Check if the user has enough storage to upload the file...
                if (!_processService.CanUpload(user, size))
                    return Json(new { Success = false, Reason = "Not enough storage to upload file..." });

                //////////////////////////////////////////////////////////////////

                // Full path to file in temp location
                string filePath = _configuration["VaultStorageLocation"] + _processService.RandomString(30);

                // Check if our file already exists with that name!
                if (System.IO.File.Exists(filePath))
                    // Respond with zero since something bad happened...
                    return Json(new { Success = false, Reason = "Internal server error! (file path taken)" });

                // Setup our file name while also checking if our given file name isn't null...
                string fileName = file.FileName == null ? "Unknown.bin" : file.FileName;

                // Get the file's extension...
                string fileExtension = Path.GetExtension(fileName).ToLower();

                // Copy our file from buffer...
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                //////////////////////////////////////////////////////////////////

                // Add the new file...
                var result = _processService.AddNewFileAPI(user, size, fileName, fileExtension, filePath);

                // Check we were successful in adding a new file...
                if (result.success)
                {
                    // Tell our users to update their listings...
                    _processService.UpdateListings(user.Id, Request);

                    // Setup a path for our uploaders to know where this is located...
                    var path = $"{_configuration["ShareUploadLocation"]}{result.shareId}{fileExtension}";

                    // Respond with a successful message...
                    return Json(new { Success = true, Path = path });
                }
                else
                    // Respond that something bad happened...
                    return Json(new { Success = false, Reason = "Transaction error..." });
            }
            catch
            {
                // Respond with zero since something bad happened...
                return Json(new { Success = false, Reason = "Transaction error..." });
            }
        }
    }
}