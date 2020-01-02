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
using System.Linq;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Http.Extensions;
using Microsoft.AspNetCore.WebUtilities;
using System.Collections.Generic;

namespace Vault.Controllers
{
    public class ProcessController : Controller
    {
        // Save our little session tag.
        private readonly string _sessionName;
        private readonly string _storageLocation;
        private readonly string _relativeDirectory;

        // Instance of our process service.
        private readonly ProcessService _processService;

        // Instance of our login service.
        private readonly LoginService _loginService;

        // Instance of our configuration.
        private readonly IConfiguration _configuration;

        // Instance of our logger.
        private readonly ILogger _logger;


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
        /// A function which will return a not logged in json response.
        /// </summary>
        /// <returns>Json response.</returns>
        private JsonResult NotLoggedIn()
        {
            // Return a not logged in json response.
            return Json(new { Success = false, Reason = "You must be logged in to perform this operation." });
        }

        /// <summary>
        /// A function which will return a missing parameters json response.
        /// </summary>
        /// <returns>Json response.</returns>
        private JsonResult MissingParameters()
        {
            // Return a missing parameters json response.
            return Json(new { Success = false, Reason = "You must supply all required parameters." });
        }

        /// <summary>
        /// Handles when a user wants to log out.
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        [Route("process/logout")]
        public IActionResult Logout()
        {
            if (!IsLoggedIn()) return Redirect(_relativeDirectory);

            /////////////////////////////////
            
            HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);

            /////////////////////////////////
            
            return Redirect(_relativeDirectory);
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="offset"></param>
        /// <returns>Json formatted response.</returns>
        [HttpPost]
        [Route("process/list")]
        public IActionResult List(int? offset, int specificFile = -1)
        {
            if (!IsLoggedIn()) return NotLoggedIn();

            /////////////////////////////////

            if (offset == null || (offset != null && offset.GetValueOrDefault() < 0))
                return MissingParameters();

            /////////////////////////////////

            UserSession userSession = SessionExtension.Get(HttpContext.Session, _sessionName);

            int id = userSession.Id;
            int folderId = userSession.Folder;

            User user = _loginService.GetUser(id);
            Folder folder = _processService.GetFolder(id, folderId);

            /////////////////////////////////

            // Check if the folder even exists.
            if (folder == null)
            {
                // Reset the folder id.
                folderId = user.Folder;

                // Reset our users position back to the homepage.
                userSession.Folder = folderId;

                // Setup our new session!
                SessionExtension.Set(HttpContext.Session, _sessionName, userSession);

                // Begin to render the correct folder.
                folder = _processService.GetFolder(id, folderId);
            }

            /////////////////////////////////

            Listing listing = new Listing()
            {
                Success = true,
                Sort = userSession.SortBy,
                Current = folderId,
                Previous = folder.FolderId,
                IsRecycleBin = folder.IsRecycleBin,
                IsHome = user.Folder == folder.Id,
                Path = _processService.GetPath(folder, user.Folder),
                TotalFiles = _processService.GetFileCount(user.Id, folder.Id),
                Folders = _processService.GetFolderListings(id, folderId),
                Files = specificFile == -1 ? 
                _processService.GetFileListings(id, folderId, userSession.SortBy, offset.GetValueOrDefault()) :
                _processService.GetFileListings(id, folderId, userSession.SortBy, offset.GetValueOrDefault(), specificFile)
            };

            return Json(listing);
        }

        /// <summary>
        /// Provides all the information to 
        /// display the settings page.
        /// </summary>
        /// <returns></returns>
        [HttpPost]
        [Route("process/settings")]
        public IActionResult Settings()
        {
            if (!IsLoggedIn()) return NotLoggedIn();

            /////////////////////////////////
            
            UserSession userSession = SessionExtension.Get(HttpContext.Session, _sessionName);

            /////////////////////////////////

            var user = _loginService.GetUser(userSession.Id);

            /////////////////////////////////

            return Json(new Settings()
            {
                Success = true,
                Name = user.Name,
                APIKey = user.APIKey,
                APIEnabled = user.APIEnabled,
                Storage = _processService.StorageFormatted(user)
            });
        }


        /// <summary>
        /// Processes a term as a search query and 
        /// provides a listing of all relevant folders and files.
        /// </summary>
        /// <param name="term"></param>
        /// <returns></returns>
        [HttpPost]
        [Route("process/search")]
        public IActionResult Search(string term)
        {
            if (!IsLoggedIn()) return NotLoggedIn();

            /////////////////////////////////

            if (string.IsNullOrWhiteSpace(term)) return MissingParameters();

            /////////////////////////////////

            term = term.ToLower();

            /////////////////////////////////

            UserSession userSession = SessionExtension.Get(HttpContext.Session, _sessionName);

            /////////////////////////////////

            Listing listing = new Listing()
            {
                Success = true,
                Folders = _processService.SearchFolderListings(userSession.Id, term),
                Files = _processService.SearchFileListings(userSession.Id, term)
            };

            return Json(listing);
        }

        /// <summary>
        /// Creates a new folder in the current directory.
        /// </summary>
        /// <param name="folderName"></param>
        /// <returns></returns>
        [HttpPost]
        [Route("process/newfolder")]
        public IActionResult NewFolder(string folderName)
        {
            if (!IsLoggedIn()) return NotLoggedIn();

            /////////////////////////////////

            if (string.IsNullOrWhiteSpace(folderName)) return MissingParameters();

            /////////////////////////////////

            UserSession userSession = SessionExtension.Get(HttpContext.Session, _sessionName);

            /////////////////////////////////

            var result = _processService.AddNewFolder(userSession.Id, folderName, userSession.Folder);

            /////////////////////////////////

            if (result.IsOK())
                return Json(new { Success = true });
            else
                return Json(result.FormatError());
        }

        /// <summary>
        /// Renames a file to a given name.
        /// </summary>
        /// <param name="fileId"></param>
        /// <param name="newName"></param>
        /// <returns></returns>
        [HttpPost]
        [Route("process/renamefile")]
        public IActionResult RenameFile(int? fileId, string newName)
        {
            if (!IsLoggedIn()) return NotLoggedIn();

            /////////////////////////////////

            if (fileId == null || newName == null || newName.Length == 0)
                return MissingParameters();

            /////////////////////////////////
            
            UserSession userSession = SessionExtension.Get(HttpContext.Session, _sessionName);

            /////////////////////////////////

            var result = _processService.UpdateFileName(userSession.Id, fileId.GetValueOrDefault(), newName);

            /////////////////////////////////

            if (result.IsOK())
                return Json(new { Success = true });
            else
                return Json(result.FormatError());
        }

        /// <summary>
        /// Renames a folder to a given name.
        /// </summary>
        /// <param name="folderId"></param>
        /// <param name="newName"></param>
        /// <returns></returns>
        [HttpPost]
        [Route("process/renamefolder")]
        public IActionResult RenameFolder(int? folderId, string newName)
        {
            if (!IsLoggedIn()) return NotLoggedIn();

            /////////////////////////////////

            if (folderId == null || string.IsNullOrWhiteSpace(newName))
                return MissingParameters();

            /////////////////////////////////

            UserSession userSession = SessionExtension.Get(HttpContext.Session, _sessionName);

            /////////////////////////////////

            var result = _processService.UpdateFolderName(userSession.Id, folderId.GetValueOrDefault(), newName);

            /////////////////////////////////

            if (result.IsOK())
                return Json(new { Success = true });
            else
                return Json(result.FormatError());
        }

        /// <summary>
        /// Sets the colour of a folder.
        /// 
        /// Used to organise folders.
        /// </summary>
        /// <param name="folderId"></param>
        /// <param name="colour"></param>
        /// <returns></returns>
        [HttpPost]
        [Route("process/setcolour")]
        public IActionResult SetFolderColour(int? folderId, int? colour)
        {
            if (!IsLoggedIn()) return NotLoggedIn();

            /////////////////////////////////

            if (folderId == null || colour == null || colour < 0 || colour > 10)
                return MissingParameters();

            /////////////////////////////////

            UserSession userSession = SessionExtension.Get(HttpContext.Session, _sessionName);

            /////////////////////////////////

            var result = _processService.UpdateFolderColour(userSession.Id, folderId.GetValueOrDefault(), colour.GetValueOrDefault());

            /////////////////////////////////

            if (result.IsOK())
                return Json(new { Success = true });
            else
                return Json(result.FormatError());
        }

        /// <summary>
        /// Sets the arrangement of files displayed.
        /// </summary>
        /// <param name="sortBy"></param>
        /// <returns></returns>
        [HttpPost]
        [Route("process/sortby")]
        public IActionResult SortBy(int? sortBy)
        {
            if (!IsLoggedIn()) return NotLoggedIn();

            /////////////////////////////////

            if (sortBy == null || sortBy < -4 || sortBy > 4) return MissingParameters();

            /////////////////////////////////

            UserSession userSession = SessionExtension.Get(HttpContext.Session, _sessionName);

            /////////////////////////////////

            var result = _processService.UpdateSortBy(userSession.Id, sortBy.GetValueOrDefault(), HttpContext, userSession);

            /////////////////////////////////

            if (result.IsOK())
                return Json(new { Success = true });
            else
                return Json(result.FormatError());
        }

        /// <summary>
        /// Moves a folder to a given folder.
        /// 
        /// Folders cannot be placed inside themselves.
        /// </summary>
        /// <param name="from"></param>
        /// <param name="to"></param>
        /// <returns></returns>
        [HttpPost]
        [Route("process/movefolder")]
        public IActionResult MoveFolder(int? from, int? to)
        {
            if (!IsLoggedIn()) return NotLoggedIn();

            /////////////////////////////////

            if (from == null || to == null) return MissingParameters();

            /////////////////////////////////

            UserSession userSession = SessionExtension.Get(HttpContext.Session, _sessionName);

            /////////////////////////////////

            int id = userSession.Id;

            /////////////////////////////////

            var result = _processService.MoveFolder(id, from.GetValueOrDefault(), to.GetValueOrDefault());

            /////////////////////////////////

            if (result.IsOK())
                return Json(new { Success = true });
            else
                return Json(result.FormatError());
        }

        /// <summary>
        /// Deletes or places a folder into the user's designated recycle bin.
        /// 
        /// If the folder is already located in the user's recycle
        /// then this action will delete the folder permanently
        /// 
        /// If the folder is NOT in the recycle bin then this folder 
        /// will move it to the recycle bin.
        /// </summary>
        /// <param name="folder"></param>
        /// <returns></returns>
        [HttpPost]
        [Route("process/deletefolder")]
        public IActionResult DeleteFolder(int? folder)
        {
            if (!IsLoggedIn()) return NotLoggedIn();

            /////////////////////////////////

            if (folder == null) return MissingParameters();

            /////////////////////////////////

            UserSession userSession = SessionExtension.Get(HttpContext.Session, _sessionName);

            /////////////////////////////////

            int id = userSession.Id;

            /////////////////////////////////

            var result = _processService.DeleteFolder(id, folder.GetValueOrDefault());

            /////////////////////////////////

            if (result.IsOK())
                return Json(new { Success = true });
            else
                return Json(result.FormatError());
        }

        /// <summary>
        /// Deletes or places a file into the user's designated recycle bin.
        /// 
        /// If the file is already located in the user's recycle
        /// then this action will delete the file permanently
        /// 
        /// If the file is NOT in the recycle bin then this file 
        /// will move it to the recycle bin.
        /// </summary>
        /// <param name="file"></param>
        /// <returns></returns>
        [HttpPost]
        [Route("process/deletefile")]
        public IActionResult DeleteFile(int? file)
        {
            if (!IsLoggedIn()) return NotLoggedIn();

            /////////////////////////////////

            if (file == null) return MissingParameters();

            /////////////////////////////////

            UserSession userSession = SessionExtension.Get(HttpContext.Session, _sessionName);

            /////////////////////////////////

            var result = _processService.DeleteFile(userSession.Id, file.GetValueOrDefault());

            /////////////////////////////////

            if (result.IsOK())
                return Json(new { Success = true });
            else
                return Json(result.FormatError());
        }

        /// <summary>
        /// Changes the user's real name.
        /// 
        /// The name is limited to 24 characters and 
        /// is used to display the user's name in the intro-box 
        /// (already logged in screen)
        /// </summary>
        /// <param name="name"></param>
        /// <returns></returns>
        [HttpPost]
        [Route("process/changename")]
        public IActionResult ChangeName(string name)
        {
            if (!IsLoggedIn()) return NotLoggedIn();

            /////////////////////////////////
            
            if (string.IsNullOrWhiteSpace(name)) return MissingParameters();

            /////////////////////////////////

            if (name.Length > 24) return Json(new { Success = false, Reason = "The name is too long, sorry." });

            /////////////////////////////////

            UserSession userSession = SessionExtension.Get(HttpContext.Session, _sessionName);

            /////////////////////////////////

            var result = _processService.UpdateName(userSession.Id, name);

            /////////////////////////////////

            if (result.IsOK())
                return Json(new { Success = true });
            else
                return Json(result.FormatError());
        }

        /// <summary>
        /// Changes the user's password.
        /// 
        /// Requires atleast 6 characters, 
        /// not limit on what type of characters.
        /// </summary>
        /// <param name="currentPassword"></param>
        /// <param name="newPassword"></param>
        /// <returns></returns>
        [HttpPost]
        [Route("process/changepassword")]
        public IActionResult ChangePassword(string currentPassword, string newPassword)
        {
            if (!IsLoggedIn()) return NotLoggedIn();

            /////////////////////////////////

            if (string.IsNullOrWhiteSpace(currentPassword) || string.IsNullOrWhiteSpace(newPassword))
                return MissingParameters();

            /////////////////////////////////

            if (newPassword.Length < 6)
                return Json(new { Success = false, Reason = "The password must be at least 6 characters long." });

            /////////////////////////////////

            UserSession userSession = SessionExtension.Get(HttpContext.Session, _sessionName);

            /////////////////////////////////

            var result = _processService.UpdatePassword(userSession.Id, currentPassword, newPassword);

            /////////////////////////////////

            if (result.IsOK())
                return Json(new { Success = true });
            else
                return Json(result.FormatError());
        }

        /// <summary>
        /// Toggles the availability of the users API system.
        /// 
        /// On: The user has an API key attached to his account 
        /// and can use it to upload files through a third-party application (ex, ShareX).
        /// 
        /// Off: The user has no API key.
        /// </summary>
        /// <param name="fileId"></param>
        /// <param name="option"></param>
        /// <returns></returns>
        [HttpPost]
        [Route("process/toggleapi")]
        public IActionResult ToggleAPI()
        {
            if (!IsLoggedIn()) return NotLoggedIn();

            /////////////////////////////////

            UserSession userSession = SessionExtension.Get(HttpContext.Session, _sessionName);

            /////////////////////////////////
            
            string apiKey = string.Empty;

            /////////////////////////////////

            var result = _processService.ToggleAPI(userSession.Id, out apiKey);

            /////////////////////////////////

            if (result.IsOK())
                return Json(new { Success = true });
            else
                return Json(result.FormatError());
        }

        /// <summary>
        /// Enables or disables the share functionality of a file.
        /// 
        /// If a file is being shared then the file has an associated URL 
        /// to it where non-registered user's may download the file.
        /// </summary>
        /// <param name="fileId"></param>
        /// <param name="option"></param>
        /// <returns></returns>
        [HttpPost]
        [Route("process/toggleshare")]
        public IActionResult ToggleShare(int? fileId)
        {
            if (!IsLoggedIn()) return NotLoggedIn();

            /////////////////////////////////

            if (fileId == null) return MissingParameters();

            /////////////////////////////////

            UserSession userSession = SessionExtension.Get(HttpContext.Session, _sessionName);

            /////////////////////////////////

            var result = _processService.ToggleShareFile(userSession.Id, fileId.GetValueOrDefault());

            /////////////////////////////////

            if (result.IsOK())
                return Json(new { Success = true, ShareId = result.Get() });
            else
                return Json(result.FormatError());
        }

        /// <summary>
        /// Enables or disable the share functionality of a folder.
        /// 
        /// If a folder is being shared then the folder has an associated URL 
        /// to it where non-registered user's may download the folder.
        /// </summary>
        /// <param name="folderId"></param>
        /// <returns></returns>
        [HttpPost]
        [Route("process/togglefoldershare")]
        public IActionResult ToggleFolderShare(int? folderId)
        {
            if (!IsLoggedIn()) return NotLoggedIn();

            /////////////////////////////////

            if (folderId == null) return MissingParameters();

            /////////////////////////////////

            UserSession userSession = SessionExtension.Get(HttpContext.Session, _sessionName);

            /////////////////////////////////
            
            int id = userSession.Id;

            /////////////////////////////////

            var result = _processService.ToggleShareFolder(userSession.Id, folderId.GetValueOrDefault());

            /////////////////////////////////

            if (result.IsOK())
                return Json(new { Success = true, ShareId = result.Get() });
            else
                return Json(result.FormatError());
        }


        /// <summary>
        /// Provides the path of a file in an ordered scheme.
        /// 
        /// Example: ~ / Documents / Other /
        ///          ^       ^         ^
        ///     Home Dir.    |         |
        ///               Sub Dir.     |
        ///                     Current Directory
        /// </summary>
        /// <returns></returns>
        [HttpPost]
        [Route("process/getpathbar")]
        public IActionResult GetPathBar()
        {
            if (!IsLoggedIn()) return NotLoggedIn();

            /////////////////////////////////

            UserSession userSession = SessionExtension.Get(HttpContext.Session, _sessionName);

            /////////////////////////////////

            var result = _processService.GetPath(userSession.Id, userSession.Folder);

            /////////////////////////////////

            if (result.IsOK())
                return Json(new { Success = true, Path = result.Get() });
            else
                return Json(result.FormatError());
        }

        /// <summary>
        /// Moves a file to a disclosed folder.
        /// </summary>
        /// <param name="file"></param>
        /// <param name="folder"></param>
        /// <returns></returns>
        [HttpPost]
        [Route("process/movefile")]
        public IActionResult MoveFile(int? file, int? folder)
        {
            if (!IsLoggedIn()) return NotLoggedIn();

            /////////////////////////////////

            if (file == null || folder == null) return MissingParameters();

            /////////////////////////////////

            UserSession userSession = SessionExtension.Get(HttpContext.Session, _sessionName);

            /////////////////////////////////

            var result = _processService.MoveFile(userSession.Id, file.GetValueOrDefault(), folder.GetValueOrDefault());

            if (result.IsOK())
                return Json(new { Success = true });
            else
                return Json(result.FormatError());
        }

        /// <summary>
        /// Enters a directory (folder).
        /// 
        /// This is the function that is called when the 
        /// user navigates throughout their folders.
        /// </summary>
        /// <param name="folderId"></param>
        /// <returns></returns>
        [HttpPost] 
        [Route("process/goto")]
        public IActionResult GotoFolder(int? folderId)
        {
            if (!IsLoggedIn()) return NotLoggedIn();

            /////////////////////////////////

            if (folderId == null) return MissingParameters();

            /////////////////////////////////

            UserSession userSession = SessionExtension.Get(HttpContext.Session, _sessionName);

            /////////////////////////////////

            int id = userSession.Id;

            /////////////////////////////////

            if (!_processService.DoesFolderExist(id, folderId.GetValueOrDefault()))
                return Json(new { Success = false, Reason = "Invalid folder." });

            /////////////////////////////////

            // Update the sessions current directory. 
            // We store the current folder 
            // in the user's session object rather 
            // than the database.
            userSession.Folder = folderId.GetValueOrDefault();

            /////////////////////////////////

            SessionExtension.Set(HttpContext.Session, _sessionName, userSession);

            /////////////////////////////////

            // We call our listing method rather 
            // since we don't want reduce the number of 
            // requests needed to navigate.
            return List(0);
        }

        /// <summary>
        /// Redirects user to the location of a file.
        /// 
        /// This is used in the search interface where a user 
        /// would rather to go directly to a files location.
        /// 
        /// TODO: This method performs everything in the controller, 
        /// should be moved to the process class.
        /// </summary>
        /// <param name="fileId"></param>
        /// <returns></returns>
        [HttpPost]
        [Route("process/openfilelocation")]
        public IActionResult OpenFileLocation(int? fileId)
        {
            if (!IsLoggedIn()) return NotLoggedIn();

            /////////////////////////////////

            if (fileId == null) return MissingParameters();

            /////////////////////////////////

            UserSession userSession = SessionExtension.Get(HttpContext.Session, _sessionName);

            /////////////////////////////////

            var file = _processService.GetFile(userSession.Id, fileId.GetValueOrDefault());

            /////////////////////////////////

            if (file != null)
            {
                userSession.Folder = file.Folder;

                /////////////////////////////////
                
                SessionExtension.Set(HttpContext.Session, _sessionName, userSession);

                /////////////////////////////////

                return List(0, file.Id);
            }
            else
                return Json(new { Success = false, Reason = "Unable to open file location on the file specified." });
        }

        /// <summary>
        /// Duplicates a file. 
        /// </summary>
        /// <param name="fileId"></param>
        /// <returns></returns>
        [HttpPost]
        [Route("process/duplicatefile")]
        public IActionResult DuplicateFile(int? fileId)
        {
            if (!IsLoggedIn()) return NotLoggedIn();

            /////////////////////////////////

            if (fileId == null) return MissingParameters();

            /////////////////////////////////

            UserSession userSession = SessionExtension.Get(HttpContext.Session, _sessionName);

            /////////////////////////////////

            var result = _processService.DuplicateFile(userSession.Id, fileId.GetValueOrDefault());

            /////////////////////////////////

            if (result.IsOK())
                return Json(new { Success = true });
            else
                return Json(result.FormatError());
        }

        /// <summary>
        /// Upload Files
        /// </summary>
        /// <param name="file"></param>
        /// <returns></returns>
        [HttpPost("UploadFiles")]
        [Route("process/upload")]
        public async Task<IActionResult> Upload(IFormFile file, string password = null)
        {
            // Check if we're logged in.
            if (!IsLoggedIn()) return StatusCode(500);

            // Store our file size.
            long size = file.Length;

            // Check the file size to the configuration.
            if (size > long.Parse(_configuration["MaxVaultFileSize"])) return StatusCode(500);

            // Get our user's session, it is safe to do so because we've checked if we're logged in!
            UserSession userSession = SessionExtension.Get(HttpContext.Session, _sessionName);

            //////////////////////////////////////////////////////////////////

            // Check if the user has enough storage to upload the file.
            if (!_processService.CanUpload(userSession.Id, size)) return StatusCode(500);

            //////////////////////////////////////////////////////////////////

            // Full path to file in temp location
            string filePath = _storageLocation + _processService.RandomString(30);

            // Check if our file already exists with that name!
            if (System.IO.File.Exists(filePath)) return StatusCode(500);

            // Setup our file name.
            string fileName = file.FileName == null ? "<unnamed>" : file.FileName;

            // Get the file's extension.
            string fileExtension = Path.GetExtension(fileName).ToLower();

            //////////////////////////////////////////////////////////////////

            // Setup a blank IV variable.
            bool isEncrypting = password != null;

            // Setup our encryption parameters.
            byte[] iv = null;
            byte[] salt = null;

            // Check if we are trying to encrypt a file, if so, encrypt it!
            if (isEncrypting)
            {
                // Encrypt our file.
                var encryptedObject = await _processService.EncryptFile(file, filePath, password);

                // Setup our IV.
                iv = encryptedObject.iv;

                // Setup our salt.
                salt = encryptedObject.salt;
            }
            else
            {
                // Copy our file from buffer.
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    // Copy our file to the file stream.
                    await file.CopyToAsync(stream);
                }
            }

            //////////////////////////////////////////////////////////////////

            // Get our result.
            var result = _processService.AddNewFile(
                userSession.Id,
                size,
                fileName,
                fileExtension,
                userSession.Folder,
                filePath,

                // Encryption parameters.
                isEncrypting,
                iv,
                salt);

            // Check if the result was successful.
            return result.IsOK() ? Ok() : StatusCode(500);
        }

        /// <summary>
        /// Downloads a folder given an id.
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        [HttpGet]
        [Route("process/download/folder/{id}")]
        public async Task<IActionResult> DownloadFolder(CancellationToken cancellationToken, int? id)
        {
            // Check if we're logged in.
            if (!IsLoggedIn())
                return StatusCode(500);

            // Check if the file id is not null.
            if (id == null) return StatusCode(500);

            // Get our user's session, it is safe to do so because we've checked if we're logged in!
            UserSession userSession = SessionExtension.Get(HttpContext.Session, _sessionName);

            // Get our current user id.
            int userId = userSession.Id;

            // Get the folder.
            Folder folder = _processService.GetFolder(userId, id.GetValueOrDefault());

            // Check if the folder exists..
            if (folder == null) return StatusCode(500);

            // Check if the folder is a recycling bin.
            if (folder.IsRecycleBin) return StatusCode(500);

            // Get the folder id!
            int folderId = id.GetValueOrDefault();

            // Make sure you don't download the home folder (maybe soon I'll add this feature in properly).
            if (folder.FolderId == 0)
                return Content("0");

            // Register our encoding provider.
            Encoding.RegisterProvider(CodePagesEncodingProvider.Instance);

            // Setup our response.
            Response.StatusCode = 200;
            Response.ContentType = "application/octet-stream";
            Response.Headers.Add("Content-Disposition", $"attachment; filename={folder.Name}.zip");

            // Setup our zip stream to point to our response body!
            using (var zip = new ZipOutputStream(Response.Body))
            {
                // Await our zip files method.
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
            // Check if we're logged in.
            if (!IsLoggedIn())
                return StatusCode(500);

            // Check if the file id is not null.
            if (id == null)
                return StatusCode(500);

            // Get our user's session, it is safe to do so because we've checked if we're logged in!
            UserSession userSession = SessionExtension.Get(HttpContext.Session, _sessionName);

            // Get our current user id.
            int userId = userSession.Id;

            // Get the file.
            Models.File file = _processService.GetFile(userId, id.GetValueOrDefault());

            // Check if the file exists..
            if (file == null) return StatusCode(500);

            // We can't deliver a thumbnail for encrypted files.
            if (file.IsEncrypted) return StatusCode(500);

            // Setup our thumbnails path!
            string thumbnailPath = file.Path + ".thumb";

            // Setup some simple client side caching for the thumbnails!
            HttpContext.Response.Headers.Add("Cache-Control", "public,max-age=86400");

            // Check if the file even exists on the disk.
            if (!System.IO.File.Exists(thumbnailPath))
                return Redirect(_relativeDirectory + _processService.GetFileAttribute());

            // Return the file.
            return PhysicalFile(thumbnailPath, "image/*", file.Name, true);
        }

        /// <summary>
        /// Returns the view for our file viewer.
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        [HttpPost]
        [Route("process/viewer")]
        public IActionResult Viewer(int? fileId)
        {
            // If we're not logged in, redirect.
            if (!IsLoggedIn())
                return NotLoggedIn();

            // Check for nulls.
            if (fileId == null)
                return MissingParameters();

            // Get our user's session, it is safe to do so because we've checked if we're logged in!
            UserSession userSession = SessionExtension.Get(HttpContext.Session, _sessionName);

            // Get the file.
            Models.File file = _processService.GetFile(userSession.Id, fileId.GetValueOrDefault());

            // Check if the file exists..
            if (file == null) return Json(new { Success = false, Reason = "Cannot view the file specified." });

            // Check if the file even exists on the disk.
            if (!System.IO.File.Exists(file.Path)) return Json(new { Success = false, Reason = "The file physically does not exist." });

            // Setup a new viewer.
            Viewer viewer = new Viewer() { Success = true };

            // Setup our file attributes.
            viewer.Name = file.Name;
            viewer.Ext = file.Ext;
            viewer.Size = file.Size;
            viewer.IsSharing = file.IsSharing;

            // Setup our icon to not display a preview icon.
            viewer.Icon = _processService.GetFileAttribute(
                file.Id.ToString(), 
                file.Ext, 
                ProcessService.AttributeTypes.FileIconNoPreview);

            // Setup our view bag action as a preview variable.
            viewer.Action = _processService.GetFileAttribute(
                file.Id.ToString(),
                file.Ext,
                ProcessService.AttributeTypes.FileAction);

            // Setup our url.
            viewer.URL = $"process/download/{file.Id}";

            // Set our encrypted field.
            viewer.IsEncrypted = file.IsEncrypted;

            // Setup our id.
            viewer.Id = file.Id;

            // Setup our relative part.
            viewer.RelativeURL = string.Empty;

            // Return the partial view.
            return Json(viewer);
        }

        /// <summary>
        /// Downloads a file given an id.
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        [HttpGet]
        [Route("process/download/{id}")]
        public IActionResult Preview(int? id)
        {
            // Check if we're logged in.
            if (!IsLoggedIn())
                return StatusCode(500);

            // Check if the file id is not null.
            if (id == null)
                return StatusCode(500);

            // Get our user's session, it is safe to do so because we've checked if we're logged in!
            UserSession userSession = SessionExtension.Get(HttpContext.Session, _sessionName);

            // Get our current user id.
            int userId = userSession.Id;

            // Get the file.
            Models.File file = _processService.GetFile(userId, id.GetValueOrDefault());

            // Check if the file exists..
            if (file == null) return StatusCode(500);

            // We can't deliver a previews for encrypted files.
            if (file.IsEncrypted) return StatusCode(500);

            // Setup our file path string.
            string filePath = file.Path;

            // Check if the file even exists on the disk.
            if (!System.IO.File.Exists(filePath))
                return StatusCode(500);

            // Setup our mime type string.
            string mimeType = "application/octet-stream";

            // Attempt to get the content type.
            new FileExtensionContentTypeProvider().TryGetContentType(file.Name, out mimeType);

            // Check if our mime type is null or not.
            if (mimeType == null) mimeType = "application/octet-stream";

            // Setup our preview info.
            _processService.SetupPreview(ref mimeType, ref filePath);

            // Return an empty result.
            return PhysicalFile(filePath, mimeType, true);
        }

        /// <summary>
        /// Downloads a file given an id.
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        [HttpPost]
        [Route("process/download/{id}")]
        public async Task<IActionResult> Download(CancellationToken cancellationToken, int? id, string password = null)
        {
            // Check if we're logged in.
            if (!IsLoggedIn())
                return StatusCode(500);

            // Check if the file id is not null.
            if (id == null)
                return StatusCode(500);

            // Get our user's session, it is safe to do so because we've checked if we're logged in!
            UserSession userSession = SessionExtension.Get(HttpContext.Session, _sessionName);

            // Get our current user id.
            int userId = userSession.Id;

            // Get the file.
            Models.File file = _processService.GetFile(userId, id.GetValueOrDefault());

            // Check if the file exists..
            if (file == null) return StatusCode(500);

            // Check if the file even exists on the disk.
            if (!System.IO.File.Exists(file.Path)) return StatusCode(500);

            // Perform decryption if our file is encrypted.
            if (file.IsEncrypted)
            {
                // Check if our password is given.
                if (password == null) return StatusCode(500);

                // Setup our response.
                Response.StatusCode = 200;
                Response.ContentType = "application/octet-stream";
                Response.Headers.Add("Content-Disposition", $"attachment; filename={file.Name}");

                try
                {
                    // Await our decryption.
                    await _processService.DecryptFile(cancellationToken, Response.Body, file, password);
                }
                catch {
                    HttpContext.Abort();
                }

                // Return an empty result.
                return new EmptyResult();
            }
            else
            {
                // Return our physical file.
                return PhysicalFile(file.Path, "application/octet-stream", file.Name, true);
            }
        }

        /// <summary>
        /// Check if we're logged in.
        /// </summary>
        /// <returns></returns>
        public bool IsLoggedIn()
        {
            // Check if our user is authenticated.
            if (!HttpContext.User.Identity.IsAuthenticated) return false;

            // Attempt to find the session object.
            var idObject = HttpContext.User.Claims.FirstOrDefault(b => b.Type == "id")?.Value;

            // If we couldn't find our id object then logout and return false.
            if (idObject == null) goto logout_and_false;

            // Setup our id value.
            int id = -1;

            // If we weren't able to convert our string to an int then logout and return false.
            if (!int.TryParse(idObject, out id)) goto logout_and_false;

            // Get our user.
            var user = _loginService.GetUser(id);

            // If our user does not exist, then logout and return false.
            if (user == null) goto logout_and_false;

            // Check if the user session isn't set.
            // If it isn't set, then set one up.
            if (SessionExtension.Get(HttpContext.Session, _sessionName) == null)
            {
                //////////////////////////
                // Setup our session.   //
                //////////////////////////

                // Setup our user's session!
                UserSession userSession = _loginService.SetupSession(user);

                // Set our user session!
                SessionExtension.Set(HttpContext.Session, _sessionName, userSession);
            }

            // Return true and the object itself.
            return true;

        logout_and_false:

            // Sign out of the account.
            HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);

            // Return false.
            return false;
        }
    }
}