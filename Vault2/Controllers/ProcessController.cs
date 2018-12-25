using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Vault2.Objects;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.AspNetCore.Http;
using System.IO;
using Vault.Objects;
using ImageMagick;
using System.Threading;
using System.Net.Http.Headers;
using System.IO.Compression;
using System.Net.Http;
using Ionic.Zip;
using System.Net;
using System.Text;

namespace Vault2.Controllers
{
    public class ProcessController : Controller
    {
        // Save our little session tag...
        private string _sessionName;
        private string _storageLocation;
        private string _relativeDirectory;

        // Instance of our process service...
        private ProcessService _processService;

        // Instance of our login service...
        private LoginService _loginService;

        // Instance of our configuration...
        private IConfiguration _configuration;

        /**
         * Contructor
         */
        public ProcessController(ProcessService processService, LoginService loginService, IConfiguration configuration)
        {
            _processService = processService;
            _loginService = loginService;
            _configuration = configuration;

            _sessionName = configuration["SessionTagId"];
            _storageLocation = configuration["VaultStorageLocation"];
            _relativeDirectory = configuration["RelativeDirectory"];
        }

        [HttpGet]
        [Route("process/logout")]
        public IActionResult Logout()
        {
            if (!IsLoggedIn())
                return Redirect(_relativeDirectory);

            // Clear out all our sessions...
            HttpContext.Session.Clear();

            // Redirect out of there...
            return Redirect(_relativeDirectory);
        }

        /**
         * List
         * Gets the homepage list of items...
         */
        [HttpPost]
        [Route("process/list")]
        public IActionResult List()
        {
            // If we're not logged in, redirect...
            if (!IsLoggedIn())
                return Json("Please login to use the service...");

            // Get our user's session, it is safe to do so because we've checked if we're logged in!
            UserSession userSession = SessionExtension.Get(HttpContext.Session, _sessionName);

            // Get the id from the user's session...
            int id = userSession.Id;

            // Get the folder id from the user's session!
            int folderId = userSession.Folder;
            
            // Get the user's sortby requirement...
            int sortBy = userSession.SortBy;

            ViewBag.HomeFolder = _loginService.GetUser(id).Folder;
            ViewBag.CurrentFolder = _processService.GetFolder(id, folderId);
            ViewBag.Folders = _processService.GetFolders(id, folderId);
            ViewBag.Files = _processService.GetFiles(id, folderId, sortBy);
            ViewBag.IsEmpty = !_processService.GetFolders(id, folderId).Any() && !_processService.GetFiles(id, folderId).Any();

            return PartialView();
        }

        /**
         * Creates a new folder...
         */ 
        [HttpPost]
        [Route("process/newfolder")]
        public IActionResult NewFolder(string folderName)
        {
            // If we're not logged in, redirect...
            if (!IsLoggedIn())
                return Json(0);

            // Check if our folder name is null...
            if (folderName == null)
                return Json(0);

            // Get our user's session, it is safe to do so because we've checked if we're logged in!
            UserSession userSession = SessionExtension.Get(HttpContext.Session, _sessionName);

            // Get our user's id...
            int id = userSession.Id;

            // Get our current folder that we are inside of...
            int folderId = userSession.Folder;

            // Create a new folder object...
            Folder folderObj = new Folder
            {
                Owner = id,
                Name = folderName == null ? "" : folderName,
                FolderId = folderId
            };

            // Call our add new folder to add a brand new folder...
            _processService.AddNewFolder(folderObj);

            // Return a sucessful response...
            return Json(1);
        }

        /**
         * Set the name of our file!
         */
        [HttpPost]
        [Route("process/renamefile")]
        public IActionResult RenameFile(int? fileId, string newName)
        {
            // Check if we're logged in!
            if (!IsLoggedIn())
                return Json(0);

            // Check for nulls and limits!
            if (fileId == null || newName == null || newName.Length == 0)
                return Json(0);

            // Get our user's session, it is safe to do so because we've checked if we're logged in!
            UserSession userSession = SessionExtension.Get(HttpContext.Session, _sessionName);

            // If our update colour by was sucessful, then we're all good!
            if (_processService.UpdateFileName(userSession.Id, fileId.GetValueOrDefault(), System.Net.WebUtility.HtmlEncode(newName)))
                // Return that our operation was sucessful!
                return Json(1);
            else
                // Otherwise, return stating the operation failed!
                return Json(0);
        }

        /**
         * Set the name of our folder!
         */
        [HttpPost]
        [Route("process/renamefolder")]
        public IActionResult RenameFolder(int? folderId, string newName)
        {
            // Check if we're logged in!
            if (!IsLoggedIn())
                return Json(0);

            // Check for nulls and limits!
            if (folderId == null || newName == null || newName.Length == 0)
                return Json(0);

            // Get our user's session, it is safe to do so because we've checked if we're logged in!
            UserSession userSession = SessionExtension.Get(HttpContext.Session, _sessionName);

            // If our update colour by was sucessful, then we're all good!
            if (_processService.UpdateFolderName(userSession.Id, folderId.GetValueOrDefault(), System.Net.WebUtility.HtmlEncode(newName)))
                // Return that our operation was sucessful!
                return Json(1);
            else
                // Otherwise, return stating the operation failed!
                return Json(0);
        }

        /**
         * Set the colour of our folder!
         */
        [HttpPost]
        [Route("process/setcolour")]
        public IActionResult SetFolderColour(int? folderId, int? colour)
        {
            // Check if we're logged in!
            if (!IsLoggedIn())
                return Json(0);

            // Check for nulls and limits!
            if (folderId == null || colour == null || colour < 0 || colour > 10)
                return Json(0);

            // Get our user's session, it is safe to do so because we've checked if we're logged in!
            UserSession userSession = SessionExtension.Get(HttpContext.Session, _sessionName);

            // If our update colour by was sucessful, then we're all good!
            if (_processService.UpdateFolderColour(userSession.Id, folderId.GetValueOrDefault(), colour.GetValueOrDefault()))
                // Return that our operation was sucessful!
                return Json(1);
            else
                // Otherwise, return stating the operation failed!
                return Json(0);
        }

        /**
         * Sort our stuff!
         */
        [HttpPost]
        [Route("process/sortby")]
        public IActionResult SortBy(int? sortBy)
        {
            // Check if we're logged in!
            if (!IsLoggedIn())
                return Json(0);

            // Check for nulls and limits!
            if (sortBy == null || sortBy < 0 || sortBy > 10)
                return Json(0);

            // Get our user's session, it is safe to do so because we've checked if we're logged in!
            UserSession userSession = SessionExtension.Get(HttpContext.Session, _sessionName);

            // If our update sort by was sucessful, then go ahead update our session!
            if (_processService.UpdateSortBy(userSession.Id, sortBy.GetValueOrDefault()))
            {
                // Setup our new sort by!
                userSession.SortBy = sortBy.GetValueOrDefault();

                // Setup our new session value!
                SessionExtension.Set(HttpContext.Session, _sessionName, userSession);

                // Return that our operation was sucessful!
                return Json(1);
            }
            
            // Return that we failed to perform the operation!
            return Json(0);
        }

        /**
         * Move a folder...
         */
        [HttpPost]
        [Route("process/movefolder")]
        public IActionResult MoveFolder(int? from, int? to)
        {
            // If we're not logged in, redirect...
            if (!IsLoggedIn())
                return Json(0);

            // Check for nulls...
            if (from == null || to == null)
                return Json(0);

            // Get our user's session, it is safe to do so because we've checked if we're logged in!
            UserSession userSession = SessionExtension.Get(HttpContext.Session, _sessionName);

            // Get our user id...
            int id = userSession.Id;

            // Get our user's current folder id!
            int currentFolder = userSession.Folder;

            // Save our home folder id...
            int homeFolder = _loginService.GetUser(id).Folder;

            // Don't move the same folder inside of itself...
            if (from == to)
                return Json(0);

            // Make sure you can't move the home folder anywhere...
            if (from == homeFolder)
                return Json(0);

            // If our from doesn't exist in our list folders then do not allow to move it...
            if (!_processService.CanFolderMove(id, from.GetValueOrDefault(), currentFolder))
                return Json(0);

            // Move the actual folder...
            if (_processService.MoveFolder(id, from.GetValueOrDefault(), to.GetValueOrDefault()))
                return Json(1);
            else
                return Json(0);
        }

        /**
         * Delete a folder...
         */
        [HttpPost]
        [Route("process/deletefolder")]
        public IActionResult DeleteFolder(int? folder)
        {
            // If we're not logged in, redirect...
            if (!IsLoggedIn())
                return Json(0);

            // Check for nulls...
            if (folder == null)
                return Json(0);

            // Get our user's session, it is safe to do so because we've checked if we're logged in!
            UserSession userSession = SessionExtension.Get(HttpContext.Session, _sessionName);

            // Get our user id...
            int id = userSession.Id;

            // Get our home folder...
            int homeFolder = _loginService.GetUser(id).Folder;

            // Make sure you don't delete the home folder...
            if (folder == homeFolder)
                return Json(0);

            // Move the actual folder...
            if (_processService.DeleteFolder(id, folder.GetValueOrDefault()))
                return Json(1);
            else
                return Json(0);
        }
        
        /**
         * Delete a file...
         */
        [HttpPost]
        [Route("process/deletefile")]
        public IActionResult DeleteFile(int? file)
        {
            // If we're not logged in, redirect...
            if (!IsLoggedIn())
                return Json(0);

            // Check for nulls...
            if (file == null)
                return Json(0);

            // Get our user's session, it is safe to do so because we've checked if we're logged in!
            UserSession userSession = SessionExtension.Get(HttpContext.Session, _sessionName);

            // Get our user id...
            int id = userSession.Id;

            // Move the actual folder...
            if (_processService.DeleteFile(id, file.GetValueOrDefault()))
                return Json(1);
            else
                return Json(0);
        }

        /**
         * Change password!
         */
        [HttpPost]
        [Route("process/changepassword")]
        public IActionResult ChangePassword(string currentPassword, string newPassword)
        {
            // If we're not logged in, redirect...
            if (!IsLoggedIn())
                return Json(0);

            // Check for nulls...
            if (currentPassword == null || newPassword == null)
                return Json(0);

            // Get our user's session, it is safe to do so because we've checked if we're logged in!
            UserSession userSession = SessionExtension.Get(HttpContext.Session, _sessionName);

            // Update our user's password!
            if (_processService.UpdatePassword(userSession.Id, currentPassword, newPassword))
                return Json(1);
            else
                return Json(0);
        }

        /**
         * Toggle the share of a file!
         */
        [HttpPost]
        [Route("process/toggleshare")]
        public IActionResult ToggleShare(int? fileId, int? option)
        {
            // If we're not logged in, redirect...
            if (!IsLoggedIn())
                return Json(0);

            // Check for nulls...
            if (fileId == null || option == null || option < 0 || option > 1)
                return Json(0);

            // Get our user's session, it is safe to do so because we've checked if we're logged in!
            UserSession userSession = SessionExtension.Get(HttpContext.Session, _sessionName);

            // Get our user id...
            int id = userSession.Id;

            // Update our file's shareablity!
            if (_processService.ShareFile(userSession.Id, fileId.GetValueOrDefault(), option == 1 ? true : false))
                return Json(1);
            else
                return Json(0);
        }


        /**
         * Move a file...
         */
        [HttpPost]
        [Route("process/movefile")]
        public IActionResult MoveFile(int? file, int? folder)
        {
            // If we're not logged in, redirect...
            if (!IsLoggedIn())
                return Json(0);

            // Check for nulls...
            if (file == null || folder == null)
                return Json(0);

            // Get our user's session, it is safe to do so because we've checked if we're logged in!
            UserSession userSession = SessionExtension.Get(HttpContext.Session, _sessionName);

            // Get our user id...
            int id = userSession.Id;

            // Get our user's current folder id!
            int currentFolder = userSession.Folder;

            // Get the user as an object...
            int parentFolder = _processService.GetFolder(id, currentFolder).FolderId;

            // If our from doesn't exist in our list folders then do not allow to move it...
            if (parentFolder != folder && !_processService.CanFolderMove(id, folder.GetValueOrDefault(), currentFolder))
                return Json(0);

            // If our from doesn't exist in our list folders then do not allow to move it...
            if (!_processService.CanFileMove(id, file.GetValueOrDefault(), currentFolder))
                return Json(0);

            // Move the actual folder...
            if (_processService.MoveFile(id, file.GetValueOrDefault(), folder.GetValueOrDefault()))
                return Json(1);
            else
                return Json(0);
        }

        /**
         * Goes to a folder, doesn't matter if it's visible or not...
         */
        [HttpPost]
        [Route("process/goto")]
        public IActionResult GotoFolder(int? folderId)
        {
            // If we're not logged in, redirect...
            if (!IsLoggedIn())
                return Json(0);

            // Check if our input is null...
            if (folderId == null)
                return Json(0);

            // Get our user's session, it is safe to do so because we've checked if we're logged in!
            UserSession userSession = SessionExtension.Get(HttpContext.Session, _sessionName);

            // Get our user id...
            int id = userSession.Id;

            // Check if the folder is even valid...
            if (!_processService.IsFolderValid(id, folderId.GetValueOrDefault()))
                return Json(0);

            // Set our new folder up!
            userSession.Folder = folderId.GetValueOrDefault();

            // Setup our new session!
            SessionExtension.Set(HttpContext.Session, _sessionName, userSession);

            // Return a successful response...
            return Json(1);
        }

        /**
         * Generates thumbnails to be used to display images
         */
        private void GenerateThumbnails(string path)
        {
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

        /**
         * Upload Files
         */
        [HttpPost("UploadFiles")]
        [Route("process/upload")]
        public async Task<IActionResult> Upload(IFormFile file)
        {
            try
            {
                // Check if we're logged in...
                if (!IsLoggedIn())
                    return Json(0);

                // Store our file size...
                long size = file.Length;

                // File too big!
                if (size > int.Parse(_configuration["MaxVaultFileSize"]))
                    return Json(0);

                // Setup function to generate random string...
                Func<int, string> randomString = count =>
                {
                    string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
                    var stringChars = new char[count];
                    var random = new Random();

                    for (int i = 0; i < stringChars.Length; i++)
                    {
                        stringChars[i] = chars[random.Next(chars.Length)];
                    }

                    return new string(stringChars); 
                };

                // Full path to file in temp location
                string filePath = _storageLocation + randomString(30);

                // Check if our file already exists with that name!
                if (System.IO.File.Exists(filePath))
                    // Respond with zero since something bad happened...
                    return Json(0);

                // Setup our file name...
                string fileName = (file.FileName == null ? "Unknown.bin" : file.FileName);

                // Copy our file from buffer...
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                //////////////////////////////////////////////////////////////////

                // Get the file's extension...
                string fileExtension = Path.GetExtension(fileName);

                // Check if our file is a PNG, JPEG, or JPG....
                if (fileExtension == ".png" 
                    || fileExtension == ".jpeg"
                    || fileExtension == ".jpg")
                    // Call our generate thumbnail which will generate a thumbnails...
                    GenerateThumbnails(filePath);

                // Get our user's session, it is safe to do so because we've checked if we're logged in!
                UserSession userSession = SessionExtension.Get(HttpContext.Session, _sessionName);

                // Get our current user id...
                int id = userSession.Id;

                // Get our current folder id that we are inside of...
                int folderId = userSession.Folder;

                // Setup a new File object...
                Objects.File fileObj = new Objects.File
                {
                    Owner = id,
                    Size = size,
                    Name = System.Net.WebUtility.HtmlEncode(fileName),
                    Ext = fileExtension,
                    Folder = folderId,
                    Path = filePath
                };

                // Add the new file...
                _processService.AddNewFile(fileObj);

                // Respond with a successful message...
                return Json(1);
            }
            catch (Exception)
            {
                // Respond with zero since something bad happened...
                return Json(0);
            }
        }

        /**
         * Downloads the thumbnail for the file!
         */
        [HttpGet]
        [Route("process/thumbnail/{id}")]
        public IActionResult Thumbnail(int? id)
        {
            // Check if we're logged in...
            if (!IsLoggedIn())
                return StatusCode(500);

            // Check if the file id is not null...
            if (id == null)
                return StatusCode(500);

            // Get our user's session, it is safe to do so because we've checked if we're logged in!
            UserSession userSession = SessionExtension.Get(HttpContext.Session, _sessionName);

            // Get our current user id...
            int userId = userSession.Id;

            // Get the file...
            Objects.File file = _processService.GetFile(userId, id.GetValueOrDefault());

            // Check if the file exists....
            if (file == null)
                return StatusCode(500);

            // Setup our thumbnails path!
            string thumbnailPath = file.Path + ".thumb";

            // Check if the file even exists on the disk...
            if (!System.IO.File.Exists(thumbnailPath)) return Redirect(_relativeDirectory + "images/image-icon.png");

            // Setup some simple client side caching for the thumbnails!
            HttpContext.Response.Headers.Add("Cache-Control", "public,max-age=86400");
             
            // Return the file...
            return File(new FileStream(thumbnailPath, FileMode.Open), "image/*", file.Name);
        }

        /**
         * Displays the share page for a shared file...
         */
        [HttpGet]
        [Route("share/{shareId}")]
        public IActionResult Share(string shareId)
        {
            // Check if our share id given is null!
            if (shareId == null)
                return Redirect(_relativeDirectory);

            // Get the file...
            Objects.File file = _processService.GetSharedFile(shareId);

            // Check if the file exists or is valid!
            if (file == null)
                return Redirect(_relativeDirectory);

            // Setup our shared file variable in our viewbag!
            ViewBag.File = file;

            // Return our view!
            return View();
        }

        /**
         * Downloads the shared file...
         */
        [HttpPost]
        [Route("share/{shareId}")]
        public IActionResult DownloadSharedFile(string shareId)
        {
            // Check if our share id given is null!
            if (shareId == null)
                return StatusCode(500);

            // Get the file...
            Objects.File file = _processService.GetSharedFile(shareId);

            // Check if the file exists or is valid!
            if (file == null)
                return StatusCode(500);

            // Setup our file's path as a variable...
            string filePath = file.Path;

            // Check if the file even exists on the disk...
            if (!System.IO.File.Exists(filePath))
                return StatusCode(500);

            // Check if we were given a x-preview header and that the preview file exists!
            if (Request.Headers.ContainsKey("x-preview") && System.IO.File.Exists($"{filePath}.preview"))
                // If so, then append .preview to the file path...
                filePath += ".preview";

            // Increment our file hits so we can know how many times the file was downloaded!
            _processService.IncrementFileHit(file);

            // Return the file...
            return new FileStreamResult(new FileStream(filePath, FileMode.Open), "application/octet-stream") { FileDownloadName = file.Name };
        }

        /**
         * Uses recursion to zip files!
         */ 
        private async Task ZipFiles(int folderId, int userId, ZipOutputStream zipStream, int limit = 0)
        {
            // Get our folder!
            var folder = _processService.GetFolder(userId, folderId);

            // Get our files!
            var files = _processService.GetFiles(userId, folderId);

            // For every file compress it!
            foreach (var file in files)
            {
                // If the file doesn't exist, continue...
                if (!System.IO.File.Exists(file.Path))
                    continue;

                // Set the file name as the next entry...
                zipStream.PutNextEntry($"{_processService.GetFolderLocation(folder, limit)}{file.Name}");

                // Setup a filestream and stream contents to the zip stream!
                using (var stream = new FileStream(file.Path, FileMode.Open))
                    await stream.CopyToAsync(zipStream);
            }

            // Get all the folders inside our folder!
            var folders = _processService.GetFolders(userId, folderId);

            // Iterate throughout all our folders!
            foreach (var folderItem in folders)
            {
                // Zip those files up!
                await ZipFiles(folderItem.Id, userId, zipStream, limit);
            }
        }

        /**
         * Downloads a folder given an id...
         */
        [HttpGet]
        [Route("process/download/folder/{id}")]
        public async Task<IActionResult> DownloadFolder(int? id)
        {
            // Check if we're logged in...
            if (!IsLoggedIn())
                return StatusCode(500);

            // Check if the file id is not null...
            if (id == null)
                return StatusCode(500);

            // Get our user's session, it is safe to do so because we've checked if we're logged in!
            UserSession userSession = SessionExtension.Get(HttpContext.Session, _sessionName);

            // Get our current user id...
            int userId = userSession.Id;

            // Get the file...
            Folder folder = _processService.GetFolder(userId, id.GetValueOrDefault());

            // Check if the folder exists....
            if (folder == null)
                return StatusCode(500);

            int folderId = id.GetValueOrDefault();

            // Register our encoding provider...
            Encoding.RegisterProvider(CodePagesEncodingProvider.Instance);

            // Setup our response!
            Response.StatusCode = 200;
            Response.ContentType = "application/octet-stream";
            Response.Headers.Add("Content-Disposition", $"attachment; filename={System.Net.WebUtility.UrlEncode(folder.Name)}.zip");

            // Setup our zip stream to point to our response body!
            using (var zipStream = new ZipOutputStream(Response.Body, leaveOpen: true))
            {
                await ZipFiles(folderId, userId, zipStream, folder.FolderId);
            }

            // Return an empty result.
            return new EmptyResult();
        }

        /**
         * Downloads a file given an id...
         */
        [HttpGet]
        [Route("process/download/{id}")]
        public async Task<IActionResult> Download(int? id)
        {
            // Check if we're logged in...
            if (!IsLoggedIn())
                return StatusCode(500);

            // Check if the file id is not null...
            if (id == null)
                return StatusCode(500);

            // Get our user's session, it is safe to do so because we've checked if we're logged in!
            UserSession userSession = SessionExtension.Get(HttpContext.Session, _sessionName);

            // Get our current user id...
            int userId = userSession.Id;

            // Get the file...
            Objects.File file = _processService.GetFile(userId, id.GetValueOrDefault());

            // Check if the file exists....
            if (file == null)
                return StatusCode(500);

            // Setup our file's path as a variable...
            string filePath = file.Path;

            // Check if the file even exists on the disk...
            if (!System.IO.File.Exists(filePath))
                return StatusCode(500);

            // Check if we were given a x-preview header and that the preview file exists!
            if (Request.Headers.ContainsKey("x-preview") && System.IO.File.Exists($"{filePath}.preview"))
                // If so, then append .preview to the file path...
                filePath += ".preview";

            // Add a custom header to find the filename easier...
            HttpContext.Response.Headers.Add("x-filename", System.Net.WebUtility.UrlEncode(file.Name));

            // Return the file...
            return new FileStreamResult(new FileStream(filePath, FileMode.Open), "application/octet-stream") { FileDownloadName = file.Name };
        }


        /**
         * Check if we're logged in...
         */
        public bool IsLoggedIn()
        {
            // Get our user's session!
            UserSession userSession = SessionExtension.Get(HttpContext.Session, _sessionName);

            // Check if our user session is null...
            if (userSession == null)
                return false;

            // Check if our user even exists...
            if (_processService.UserExists(userSession.Id)) return true;
            else
                // Otherwise remove our session...
                HttpContext.Session.Clear();

            return false;
        }
    }
}