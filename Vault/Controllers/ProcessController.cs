using System.Threading.Tasks;
using Vault.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.AspNetCore.Http;
using System.IO;
using Ionic.Zip;
using System.Text;
using Microsoft.AspNetCore.StaticFiles;
using System.Threading;
using Microsoft.Extensions.Logging;

namespace Vault.Controllers
{
    public class ProcessController : Controller
    {
        // Save our little session tag...
        private readonly string _sessionName;
        private readonly string _storageLocation;
        private readonly string _relativeDirectory;

        // Instance of our process service...
        private readonly ProcessService _processService;

        // Instance of our login service...
        private readonly LoginService _loginService;

        // Instance of our configuration...
        private readonly IConfiguration _configuration;

        // Instance of our logger...
        private readonly ILogger _logger;

        /// <summary>
        /// Contructor
        /// </summary>
        /// <param name="processService"></param>
        /// <param name="loginService"></param>
        /// <param name="configuration"></param>
        /// <param name="hubContext"></param>
        public ProcessController(ProcessService processService, 
            LoginService loginService,
            ILoggerFactory loggerFactory,
            IConfiguration configuration)
        {
            _processService = processService;
            _loginService = loginService;
            _configuration = configuration;
            _logger = loggerFactory.CreateLogger("ProcessController");

            _sessionName = configuration["SessionTagId"];
            _storageLocation = configuration["VaultStorageLocation"];
            _relativeDirectory = configuration["RelativeDirectory"];
        }

        /// <summary>
        /// A function which will return a not logged in json response...
        /// </summary>
        /// <returns>Json response...</returns>
        private JsonResult NotLoggedIn()
        {
            // Return a simple not logged in json response...
            return Json(new { Success = false, Reason = "You must be logged in to perform this operation..." });
        }

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
        /// Handles when a user wants to log out...
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        [Route("process/logout")]
        public IActionResult Logout()
        {
            if (!IsLoggedIn())
                return Redirect(_relativeDirectory);

            // Clear out all our sessions...
            HttpContext.Session.Clear();

            // Get our value of the cookie...
            string key = Request.Cookies[_configuration["SyncCookieName"]];

            // Check if the key doesn't equal null...
            if (key != null && VaultHub.Connections.ContainsKey(key))
            {
                // Setup our empty user information... (let this get out of scope so GC cleans it up...)
                UserInformation userInformation = null;

                // Attempt to remove it...
                VaultHub.Connections.TryRemove(key, out userInformation);
            }

            // Redirect out of there...
            return Redirect(_relativeDirectory);
        }

        /// <summary>
        /// Gets the homepage list of items...
        /// </summary>
        /// <param name="offset"></param>
        /// <returns>Json formatted response...</returns>
        [HttpPost]
        [Route("process/list")]
        public IActionResult List(int? offset)
        {
            // If we're not logged in, redirect...
            if (!IsLoggedIn())
                return NotLoggedIn();

            // Check if our folder name is null...
            if (offset == null || (offset != null && offset.GetValueOrDefault() < 0))
                return MissingParameters();

            // Get our user's session, it is safe to do so because we've checked if we're logged in!
            UserSession userSession = SessionExtension.Get(HttpContext.Session, _sessionName);

            // Get the id from the user's session...
            int id = userSession.Id;

            // Get our folder!
            User user = _loginService.GetUser(id);

            // Get the folder id from the user's session!
            int folderId = userSession.Folder;

            // Get our folder!
            Folder folder = _processService.GetFolder(id, folderId);

            // Check if the folder even exists...
            if (folder == null)
            {
                // Reset the folder id...
                folderId = user.Folder;

                // Reset our users position back to the homepage...
                userSession.Folder = folderId;

                // Setup our new session!
                SessionExtension.Set(HttpContext.Session, _sessionName, userSession);

                // Begin to render the correct folder...
                folder = _processService.GetFolder(id, folderId);
            }

            // Keep our connection alive...
            _processService.KeepAlive(Request);

            // Setup a new listing...
            Listing listing = new Listing()
            {
                Success = true,
                Sort = userSession.SortBy,
                Previous = folder.FolderId,
                IsHome = user.Folder == folder.Id,
                Path = $"<a href='#' data-folder-id='{user.Folder}' onclick='processMove(event)'>~</a> / {_processService.GetFolderLocationFormatted(folder)}",
                Folders = _processService.GetFolderListings(id, folderId),
                Files = _processService.GetFileListings(id, folderId, userSession.SortBy, offset.GetValueOrDefault())
            };

            return Json(listing);
        }

        /// <summary>
        /// Creates a new folder...
        /// </summary>
        /// <param name="folderName"></param>
        /// <returns></returns>
        [HttpPost]
        [Route("process/newfolder")]
        public IActionResult NewFolder(string folderName)
        {
            // If we're not logged in, redirect...
            if (!IsLoggedIn())
                return NotLoggedIn();

            // Check if our folder name is null...
            if (folderName == null)
                return MissingParameters();

            // Get our user's session, it is safe to do so because we've checked if we're logged in!
            UserSession userSession = SessionExtension.Get(HttpContext.Session, _sessionName);

            // Call our add new folder to add a brand new folder...
            if (_processService.AddNewFolder(userSession.Id, folderName, userSession.Folder).success)
            {
                // Let all our sessions know that our listings have been updated...
                _processService.UpdateListings(userSession.Id, Request);

                // Return a sucessful response...
                return Json(new { Success = true });
            }
            else
                // Return an error stating there was a problem with this transaction...
                return Json(new { Success = false, Reason = "Transaction error..." });
        }

        /// <summary>
        /// Set the name of our file!
        /// </summary>
        /// <param name="fileId"></param>
        /// <param name="newName"></param>
        /// <returns></returns>
        [HttpPost]
        [Route("process/renamefile")]
        public IActionResult RenameFile(int? fileId, string newName)
        {
            // Check if we're logged in!
            if (!IsLoggedIn())
                return NotLoggedIn();

            // Check for nulls and limits!
            if (fileId == null || newName == null || newName.Length == 0)
                return MissingParameters();

            // Get our user's session, it is safe to do so because we've checked if we're logged in!
            UserSession userSession = SessionExtension.Get(HttpContext.Session, _sessionName);

            // If our update colour by was sucessful, then we're all good!
            if (_processService.UpdateFileName(userSession.Id, fileId.GetValueOrDefault(), System.Net.WebUtility.HtmlEncode(newName)))
            {
                // Tell our users to update their listings...
                _processService.UpdateListings(userSession.Id, Request);

                // Return that our operation was sucessful!
                return Json(new { Success = true });
            }
            else
                // Otherwise, return stating the operation failed!
                return Json(new { Success = false, Reason = "Transaction error..." });
        }

        /// <summary>
        /// Set the name of our folder!
        /// </summary>
        /// <param name="folderId"></param>
        /// <param name="newName"></param>
        /// <returns></returns>
        [HttpPost]
        [Route("process/renamefolder")]
        public IActionResult RenameFolder(int? folderId, string newName)
        {
            // Check if we're logged in!
            if (!IsLoggedIn())
                return NotLoggedIn();

            // Check for nulls and limits!
            if (folderId == null || newName == null || newName.Length == 0)
                return MissingParameters();

            // Get our user's session, it is safe to do so because we've checked if we're logged in!
            UserSession userSession = SessionExtension.Get(HttpContext.Session, _sessionName);

            // Get our home folder...
            int homeFolder = _loginService.GetUser(userSession.Id).Folder;

            // Make sure you don't rename the home folder...
            if (folderId == homeFolder)
                return Json(new { Success = false, Reason = "You cannot rename the home folder..." });

            // If our update colour by was sucessful, then we're all good!
            if (_processService.UpdateFolderName(userSession.Id, folderId.GetValueOrDefault(), newName))
            {
                // Tell our users to update their listings...
                _processService.UpdateListings(userSession.Id, Request);

                // Return that our operation was sucessful!
                return Json(new { Success = true });
            }
            else
                // Otherwise, return stating the operation failed!
                return Json(new { Success = false, Reason = "Transaction error..." });
        }

        /// <summary>
        /// Set the colour of our folder!
        /// </summary>
        /// <param name="folderId"></param>
        /// <param name="colour"></param>
        /// <returns></returns>
        [HttpPost]
        [Route("process/setcolour")]
        public IActionResult SetFolderColour(int? folderId, int? colour)
        {
            // Check if we're logged in!
            if (!IsLoggedIn())
                return NotLoggedIn();

            // Check for nulls and limits!
            if (folderId == null || colour == null || colour < 0 || colour > 10)
                return MissingParameters();

            // Get our user's session, it is safe to do so because we've checked if we're logged in!
            UserSession userSession = SessionExtension.Get(HttpContext.Session, _sessionName);

            // If our update colour by was sucessful, then we're all good!
            if (_processService.UpdateFolderColour(userSession.Id, folderId.GetValueOrDefault(), colour.GetValueOrDefault()))
            {
                // Tell our users to update their listings...
                _processService.UpdateListings(userSession.Id, Request);

                // Return that our operation was sucessful!
                return Json(new { Success = true });
            }
            else
                // Otherwise, return stating the operation failed!
                return Json(new { Success = false, Reason = "Transaction error..." });
        }

        /// <summary>
        /// Sort our file listings!
        /// </summary>
        /// <param name="sortBy"></param>
        /// <returns></returns>
        [HttpPost]
        [Route("process/sortby")]
        public IActionResult SortBy(int? sortBy)
        {
            // Check if we're logged in!
            if (!IsLoggedIn())
                return NotLoggedIn();

            // Check for nulls and limits!
            if (sortBy == null || sortBy < -4 || sortBy > 4)
                return MissingParameters();

            // Get our user's session, it is safe to do so because we've checked if we're logged in!
            UserSession userSession = SessionExtension.Get(HttpContext.Session, _sessionName);

            // If our update sort by was sucessful, then go ahead update our session!
            if (_processService.UpdateSortBy(userSession.Id, sortBy.GetValueOrDefault()))
            {
                // Setup our new sort by!
                userSession.SortBy = sortBy.GetValueOrDefault();

                // Setup our new session value!
                SessionExtension.Set(HttpContext.Session, _sessionName, userSession);

                // Tell our users to update their listings...
                _processService.UpdateListings(userSession.Id, Request);

                // Return that our operation was sucessful!
                return Json(new { Success = true });
            }
            else
                // Return that we failed to perform the operation!
                return Json(new { Success = false, Reason = "Transaction error..." });
        }

        /// <summary>
        /// Move a folder...
        /// </summary>
        /// <param name="from"></param>
        /// <param name="to"></param>
        /// <returns></returns>
        [HttpPost]
        [Route("process/movefolder")]
        public IActionResult MoveFolder(int? from, int? to)
        {
            // If we're not logged in, redirect...
            if (!IsLoggedIn())
                return NotLoggedIn();

            // Check for nulls...
            if (from == null || to == null)
                return MissingParameters();

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
                return Json(new { Success = false, Reason = "You cannot move the same folder inside of itself..." });

            // Make sure you can't move the home folder anywhere...
            if (from == homeFolder)
                return Json(new { Success = false, Reason = "You can't move the home folder anywhere..." });

            // If our from doesn't exist in our list folders then do not allow to move it...
            if (!_processService.CanFolderMove(id, from.GetValueOrDefault(), currentFolder))
                return Json(new { Success = false, Reason = "The folder isn't inside the scope..." });

            // Move the actual folder...
            if (_processService.MoveFolder(id, from.GetValueOrDefault(), to.GetValueOrDefault()))
            {
                // Tell our users to update their listings...
                _processService.UpdateListings(userSession.Id, Request);

                return Json(new { Success = true });
            }
            else
                return Json(new { Success = false, Reason = "Transaction error..." });
        }

        /// <summary>
        /// Delete a folder...
        /// </summary>
        /// <param name="folder"></param>
        /// <returns></returns>
        [HttpPost]
        [Route("process/deletefolder")]
        public IActionResult DeleteFolder(int? folder)
        {
            // If we're not logged in, redirect...
            if (!IsLoggedIn())
                return NotLoggedIn();

            // Check for nulls...
            if (folder == null)
                return MissingParameters();

            // Get our user's session, it is safe to do so because we've checked if we're logged in!
            UserSession userSession = SessionExtension.Get(HttpContext.Session, _sessionName);

            // Get our user id...
            int id = userSession.Id;

            // Get our home folder...
            int homeFolder = _loginService.GetUser(id).Folder;

            // Make sure you don't delete the home folder...
            if (folder == homeFolder)
                return Json(new { Success = false, Reason = "You cannot delete the home folder..." });

            // Move the actual folder...
            if (_processService.DeleteFolder(id, folder.GetValueOrDefault()))
            {
                // Tell our users to update their listings...
                _processService.UpdateListings(userSession.Id, Request);

                return Json(new { Success = true });
            }
            else
                return Json(new { Success = false, Reason = "Transaction error..." });
        }

        /// <summary>
        /// Delete a file...
        /// </summary>
        /// <param name="file"></param>
        /// <returns></returns>
        [HttpPost]
        [Route("process/deletefile")]
        public IActionResult DeleteFile(int? file)
        {
            // If we're not logged in, redirect...
            if (!IsLoggedIn())
                return NotLoggedIn();

            // Check for nulls...
            if (file == null)
                return MissingParameters();

            // Get our user's session, it is safe to do so because we've checked if we're logged in!
            UserSession userSession = SessionExtension.Get(HttpContext.Session, _sessionName);

            // Get our user id...
            int id = userSession.Id;

            // Move the actual folder...
            if (_processService.DeleteFile(id, file.GetValueOrDefault()))
            {
                // Tell our users to update their listings...
                _processService.UpdateListings(userSession.Id, Request);

                return Json(new { Success = true });
            }
            else
                return Json(new { Success = false, Reason = "Transaction error..." });
        }

        /// <summary>
        /// Change password!
        /// </summary>
        /// <param name="currentPassword"></param>
        /// <param name="newPassword"></param>
        /// <returns></returns>
        [HttpPost]
        [Route("process/changepassword")]
        public IActionResult ChangePassword(string currentPassword, string newPassword)
        {
            // If we're not logged in, redirect...
            if (!IsLoggedIn())
                return NotLoggedIn();

            // Check for nulls...
            if (currentPassword == null || newPassword == null)
                return MissingParameters();

            // Get our user's session, it is safe to do so because we've checked if we're logged in!
            UserSession userSession = SessionExtension.Get(HttpContext.Session, _sessionName);

            // Update our user's password!
            if (_processService.UpdatePassword(userSession.Id, currentPassword, newPassword))
            {
                // Keep our connection alive...
                _processService.KeepAlive(Request);

                return Json(new { Success = true });
            }
            else
                return Json(new { Success = false, Reason = "Transaction error..." });
        }

        /// <summary>
        /// Toggle the api system of a user!
        /// </summary>
        /// <param name="fileId"></param>
        /// <param name="option"></param>
        /// <returns></returns>
        [HttpPost]
        [Route("process/toggleapi")]
        public IActionResult ToggleAPI()
        {
            // If we're not logged in, redirect...
            if (!IsLoggedIn())
                return NotLoggedIn();

            // Get our user's session, it is safe to do so because we've checked if we're logged in!
            UserSession userSession = SessionExtension.Get(HttpContext.Session, _sessionName);

            // Setup an empty api key to be filled in later...
            string apiKey = string.Empty;

            // Update our user's api ability!   
            if (_processService.ToggleAPI(userSession.Id, out apiKey))
            {
                return Json(new { Success = true, Response = apiKey});
            }
            else
                return Json(new { Success = false, Reason = "Transaction error..." });
        }

        /// <summary>
        /// Toggle the sharing of a file!
        /// </summary>
        /// <param name="fileId"></param>
        /// <param name="option"></param>
        /// <returns></returns>
        [HttpPost]
        [Route("process/toggleshare")]
        public IActionResult ToggleShare(int? fileId)
        {
            // If we're not logged in, redirect...
            if (!IsLoggedIn())
                return NotLoggedIn();

            // Check for nulls...
            if (fileId == null)
                return MissingParameters();

            // Get our user's session, it is safe to do so because we've checked if we're logged in!
            UserSession userSession = SessionExtension.Get(HttpContext.Session, _sessionName);

            // Get our user id...
            int id = userSession.Id;

            // Update our file's shareablity!
            if (_processService.ToggleShareFile(userSession.Id, fileId.GetValueOrDefault()).success)
                return Json(new { Success = true });
            else
                return Json(new { Success = false, Reason = "Transaction error..." });
        }

        /// <summary>
        /// Enables or disable the share functionality of a folder in the controller...
        /// </summary>
        /// <param name="folderId"></param>
        /// <returns></returns>
        [HttpPost]
        [Route("process/togglefoldershare")]
        public IActionResult ToggleFolderShare(int? folderId)
        {
            // If we're not logged in, redirect...
            if (!IsLoggedIn())
                return NotLoggedIn();

            // Check for nulls...
            if (folderId == null)
                return MissingParameters();

            // Get our user's session, it is safe to do so because we've checked if we're logged in!
            UserSession userSession = SessionExtension.Get(HttpContext.Session, _sessionName);

            // Get our user id...
            int id = userSession.Id;

            // Update our file's shareablity!
            if (_processService.ToggleShareFolder(userSession.Id, folderId.GetValueOrDefault()).success)
                return Json(new { Success = true });
            else
                return Json(new { Success = false, Reason = "Transaction error..." });
        }


        /// <summary>
        /// Move a file...
        /// </summary>
        /// <param name="file"></param>
        /// <param name="folder"></param>
        /// <returns></returns>
        [HttpPost]
        [Route("process/movefile")]
        public IActionResult MoveFile(int? file, int? folder)
        {
            // If we're not logged in, redirect...
            if (!IsLoggedIn())
                return NotLoggedIn();

            // Check for nulls...
            if (file == null || folder == null)
                return MissingParameters();

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
                return Json(new { Success = false, Reason = "Invalid operation, folder not in scope..." });

            // If our from doesn't exist in our list folders then do not allow to move it...
            if (!_processService.CanFileMove(id, file.GetValueOrDefault(), currentFolder))
                return Json(new { Success = false, Reason = "Invalid operation, file not in scope..." });

            // Move the actual folder...
            if (_processService.MoveFile(id, file.GetValueOrDefault(), folder.GetValueOrDefault()))
            {
                // Tell our users to update their listings...
                _processService.UpdateListings(userSession.Id, Request);

                return Json(new { Success = true });
            }
            else
                return Json(new { Success = false, Reason = "Transaction error..." });
        }

        /// Goes to a folder, doesn't matter if it's visible or not...
        /// </summary>
        /// <param name="folderId"></param>
        /// <returns></returns>
        [HttpPost] 
        [Route("process/goto")]
        public IActionResult GotoFolder(int? folderId)
        {
            // If we're not logged in, redirect...
            if (!IsLoggedIn())
                return NotLoggedIn();

            // Check if our input is null...
            if (folderId == null)
                return MissingParameters();

            // Get our user's session, it is safe to do so because we've checked if we're logged in!
            UserSession userSession = SessionExtension.Get(HttpContext.Session, _sessionName);

            // Get our user id...
            int id = userSession.Id;

            // Check if the folder is even valid...
            if (!_processService.IsFolderValid(id, folderId.GetValueOrDefault()))
                return Json(new { Success = false, Reason = "Invalid folder..." });

            // Set our new folder up!
            userSession.Folder = folderId.GetValueOrDefault();

            // Setup our new session!
            SessionExtension.Set(HttpContext.Session, _sessionName, userSession);

            // Return a successful response...
            return List(0);
        }

        /// <summary>
        /// Upload Files
        /// </summary>
        /// <param name="file"></param>
        /// <returns></returns>
        [HttpPost("UploadFiles")]
        [Route("process/upload")]
        public async Task<IActionResult> Upload(IFormFile file)
        {
            try
            {
                // Check if we're logged in...
                if (!IsLoggedIn())
                    return StatusCode(500);

                // Store our file size...
                long size = file.Length;

                // File too big!
                if (size > long.Parse(_configuration["MaxVaultFileSize"])) return StatusCode(500);

                // Get our user's session, it is safe to do so because we've checked if we're logged in!
                UserSession userSession = SessionExtension.Get(HttpContext.Session, _sessionName);

                //////////////////////////////////////////////////////////////////

                // Check if the user has enough storage to upload the file...
                if (!_processService.CanUpload(userSession.Id, size))
                    return StatusCode(500);

                //////////////////////////////////////////////////////////////////

                // Full path to file in temp location
                string filePath = _storageLocation + _processService.RandomString(30);

                // Check if our file already exists with that name!
                if (System.IO.File.Exists(filePath))
                    // Respond with zero since something bad happened...
                    return StatusCode(500);

                // Setup our file name...
                string fileName = (file.FileName == null ? "Unknown.bin" : file.FileName);

                // Copy our file from buffer...
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                //////////////////////////////////////////////////////////////////

                // Get the file's extension...
                string fileExtension = Path.GetExtension(fileName).ToLower();

                // Add the new file...
                if (_processService.AddNewFile(
                    userSession.Id,
                    size,
                    fileName,
                    fileExtension,
                    userSession.Folder,
                    filePath).success)
                {
                    // Inform all clients that there was change...
                    _processService.UpdateListings(userSession.Id, Request);

                    // Respond with a successful message...
                    return Ok();
                }
                else
                    // Otherwise return a 500 error...
                    return StatusCode(500);
            }
            catch
            {
                // Respond with zero since something bad happened...
                return StatusCode(500);
            }
        }

        /// <summary>
        /// Downloads a folder given an id...
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        [HttpGet]
        [Route("process/download/folder/{id}")]
        public async Task<IActionResult> DownloadFolder(CancellationToken cancellationToken, int? id)
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

            // Get the folder id!
            int folderId = id.GetValueOrDefault();

            // Make sure you don't download the home folder (maybe soon I'll add this feature in properly)...
            if (folder.FolderId == 0)
                return Content("0");

            // Register our encoding provider...
            Encoding.RegisterProvider(CodePagesEncodingProvider.Instance);

            // Setup our response...
            Response.StatusCode = 200;
            Response.ContentType = "application/octet-stream";
            Response.Headers.Add("Content-Disposition", $"attachment; filename={System.Net.WebUtility.UrlEncode(folder.Name)}.zip");

            // Setup our zip stream to point to our response body!
            using (var zip = new ZipOutputStream(Response.Body))
            {
                // Await our zip files method...
                await _processService.ZipFiles(folderId, userId, zip, cancellationToken, folder.FolderId);
            }

            // Return an empty result.
            return new EmptyResult();
        }

        /// <summary>
        /// Downloads the thumbnail for the file!
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
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
            Models.File file = _processService.GetFile(userId, id.GetValueOrDefault());

            // Check if the file exists....
            if (file == null)
                return StatusCode(500);

            // Setup our thumbnails path!
            string thumbnailPath = file.Path + ".thumb";

            // Setup some simple client side caching for the thumbnails!
            HttpContext.Response.Headers.Add("Cache-Control", "public,max-age=86400");

            // Check if the file even exists on the disk...
            if (!System.IO.File.Exists(thumbnailPath)) return Redirect(_relativeDirectory + "images/image-icon.png");

            // Return the file...
            return PhysicalFile(thumbnailPath, "image/*", file.Name, true);
        }

        /// <summary>
        /// Returns the view for our file viewer...
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        [HttpPost]
        [Route("process/viewer")]
        public IActionResult Viewer(int? fileId)
        {
            // Check if we're logged in...
            if (!IsLoggedIn()) return StatusCode(500);

            // Check if the file id is not null...
            if (fileId == null) return StatusCode(500);

            // Get our user's session, it is safe to do so because we've checked if we're logged in!
            UserSession userSession = SessionExtension.Get(HttpContext.Session, _sessionName);

            // Get the file...
            Models.File file = _processService.GetFile(userSession.Id, fileId.GetValueOrDefault());

            // Check if the file exists....
            if (file == null) return StatusCode(500);

            // Check if the file even exists on the disk...
            if (!System.IO.File.Exists(file.Path)) return StatusCode(500);

            // Setup our shared file variable in our viewbag!
            ViewBag.File = file;
            ViewBag.Icon = _processService.GetFileAttribute(file.Id.ToString(), file.Ext);
            ViewBag.Url = $"/process/download/{file.Id}";

            // Return the partial view...
            return View();
        }

        /// <summary>
        /// Downloads a file given an id...
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        [HttpGet]
        [Route("process/download/{id}")]
        public IActionResult Preview(int? id)
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
            Models.File file = _processService.GetFile(userId, id.GetValueOrDefault());

            // Check if the file exists....
            if (file == null)
                return StatusCode(500);

            // Check if the file even exists on the disk...
            if (!System.IO.File.Exists(file.Path))
                return StatusCode(500);

            // Setup our mime type string...
            string mimeType = "application/octet-stream";

            // Attempt to get the content type...
            new FileExtensionContentTypeProvider().TryGetContentType(file.Name, out mimeType);

            // Check if our mime type is null or not...
            if (mimeType == null)
                // If it is reset it...
                mimeType = "application/octet-stream";

            // Return an empty result.
            return PhysicalFile(file.Path, mimeType,  true);
        }

        /// <summary>
        /// Downloads a file given an id...
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        [HttpPost]
        [Route("process/download/{id}")]
        public IActionResult Download(int? id)
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
            Models.File file = _processService.GetFile(userId, id.GetValueOrDefault());

            // Check if the file exists....
            if (file == null)
                return StatusCode(500);

            // Check if the file even exists on the disk...
            if (!System.IO.File.Exists(file.Path))
                return StatusCode(500);

            // Return an empty result.
            return PhysicalFile(file.Path, "application/octet-stream", file.Name, true);
        }

        /// <summary>
        /// Check if we're logged in...
        /// </summary>
        /// <returns></returns>
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