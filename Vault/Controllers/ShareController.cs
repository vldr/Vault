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
using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using System.Security.Cryptography;
using System.Text;

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

        // Save our little session tag...
        private readonly string _sessionName;

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

            _sessionName = configuration["SessionTagId"];
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

        [HttpPost]
        [Route("share/viewer")]
        public IActionResult Viewer(string shareId)
        {
            // Check if our share id given is null!
            if (shareId == null) return MissingParameters();

            // Get the file...
            Models.File file = _processService.GetSharedFile(shareId);

            // Check if the file exists or is valid!
            if (file == null) return Json(new { Success = false, Reason = "We could not find a the file specified..." });

            // Check if the file even exists on the disk...
            if (!System.IO.File.Exists(file.Path)) return Json(new { Success = false, Reason = "The file physically does not exist..." });

            // Setup a new viewer...
            Viewer viewer = new Viewer() { Success = true };

            // Setup our file attributes...
            viewer.Name = file.Name;
            viewer.Ext = file.Ext;
            viewer.Size = file.Size;

            // Setup our icon to not display a preview icon...
            viewer.Icon = _processService.GetFileAttribute(
                file.Id.ToString(),
                file.Ext,
                ProcessService.AttributeTypes.FileIconNoPreview);

            // Setup our view bag action as a preview variable...
            viewer.Action = _processService.GetFileAttribute(
                file.Id.ToString(),
                file.Ext,
                ProcessService.AttributeTypes.FileAction);

            // Setup our encrypted field...
            viewer.IsEncrypted = file.IsEncrypted;

            // Setup our url...
            viewer.URL = $"i/{shareId}";

            // Setup our relative part...
            viewer.RelativeURL = "../";

            // Return the partial view...
            return Json(viewer);
        }

        /// <summary>
        /// Displays the share page for a shared file...
        /// </summary>
        /// <param name="shareId"></param>
        /// <returns></returns>
        [HttpGet]
        [Route("share/{shareId:length(7)}")]
        public IActionResult Share(string shareId)
        {
            // Check if our share id given is null!
            if (shareId == null) return Redirect(_relativeDirectory);

            // Get the file...
            Models.File file = _processService.GetSharedFile(shareId);

            // Check if the file exists or is valid!
            if (file == null) return Redirect(_relativeDirectory);

            // Setup our viewbag...
            ViewBag.Name = file.Name;
            ViewBag.Id = file.ShareId;
            ViewBag.Type = "FILE";

            // Return our view!
            return View("Share");
        }

        /// <summary>
        /// Returns the comments of a shared file...
        /// </summary>
        /// <param name="shareId"></param>
        /// <returns></returns>
        [HttpPost]
        [Route("share/comments")]
        public IActionResult Comments(string id, int? offset)
        {
            // Check if our share id given is null!
            if (id == null || offset == null) return MissingParameters();

            // Get our comment....
            var comments = _processService.GetComments(id, offset.GetValueOrDefault());

            // Check we were successful in adding a new file...
            if (comments.Item1 != null)
            {
                // Respond with a successful message...
                return Json(new { Success = true, comments.comments, comments.total });
            }
            else
                // Respond that something bad happened...
                return Json(new { Success = false, Reason = "Failed to retrieve the comments for the given shared file..." });
        }

        /// <summary>
        /// Posts a comment...
        /// </summary>
        /// <param name="shareId"></param>
        /// <param name="name"></param>
        /// <param name="content"></param>
        /// <returns></returns>
        [HttpPost]
        [Route("share/postcomment")]
        public IActionResult PostComment(string id, string name, string content)
        {
            // Check if our share id given is null!
            if (id == null || string.IsNullOrWhiteSpace(name) || string.IsNullOrWhiteSpace(content))
                return MissingParameters();

            // Check if name is too long...
            if (name.Length > 30) return Json(new { Success = false, Reason = "Your name must be within 30 characters..." });

            // Check if name is too long...
            if (content.Length > 120) return Json(new { Success = false, Reason = "Your comment must be within 120 characters..." });

            // Attempt to add a comment...
            var comment = _processService.AddComment(id, name, content, HttpContext.Connection.RemoteIpAddress.ToString());

            // Check we were successful in adding a new file...
            if (comment != null)
            {
                // Respond with a successful message...
                return Json(new { Success = true, comment });
            }
            else
                // Respond that something bad happened...
                return Json(new { Success = false, Reason = "Failed to add a comment to the given shared file..." });
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

            // Setup our file path...
            string filePath = file.Path;

            // Check if the file even exists on the disk...
            if (!System.IO.File.Exists(filePath)) return StatusCode(500);

            // Check if the file even exists on the disk...
            if (file.IsEncrypted) return StatusCode(500);

            // Setup our mime type string...
            string mimeType = "application/octet-stream";

            // Attempt to get the content type...
            new FileExtensionContentTypeProvider().TryGetContentType(file.Name, out mimeType);

            // Check if our mime type is null or not...
            if (mimeType == null) mimeType = "application/octet-stream";

            // Setup our preview info...
            _processService.SetupPreview(ref mimeType, ref filePath);

            // Return an empty result.
            return PhysicalFile(filePath, mimeType, true);
        }

        /// <summary>
        /// Gets the file using POST...
        /// </summary>
        /// <param name="shareId"></param>
        /// <param name="prefix"></param>
        /// <returns></returns>
        [HttpPost]
        [Route("i/{shareId}")]
        public async Task<IActionResult> SharedFileDownload(CancellationToken cancellationToken, string shareId, string prefix, string password = null)
        {
            // Check if our share id given is null!
            if (shareId == null) return StatusCode(500);

            // Get the file...
            Models.File file = _processService.GetSharedFile(shareId);

            // Check if the file exists or is valid!
            if (file == null) return StatusCode(500);

            // Setup our file path...
            string filePath = file.Path;

            // Check if the file even exists on the disk...
            if (!System.IO.File.Exists(filePath)) return StatusCode(500);

            // Setup our mime type string...
            string mimeType = "application/octet-stream";

            // Attempt to get the content type...
            new FileExtensionContentTypeProvider().TryGetContentType(file.Name, out mimeType);

            // Check if our mime type is null or not...
            if (mimeType == null) mimeType = "application/octet-stream";

            // Perform decryption if our file is encrypted...
            if (file.IsEncrypted)
            {
                // Check if our password is given...
                if (password == null) return StatusCode(500);

                // Setup our response...
                Response.StatusCode = 200;
                Response.ContentType = mimeType;
                Response.Headers.Add("Content-Disposition", $"attachment; filename={System.Net.WebUtility.UrlEncode(file.Name)}");

                try
                {
                    // Await our decryption...
                    await _processService.DecryptFile(cancellationToken, Response.Body, file, password);
                }
                catch
                {
                    HttpContext.Abort();
                }

                // Return an empty result.
                return new EmptyResult();
            }
            else
            {
                // Return an empty result.
                return PhysicalFile(filePath, mimeType, file.Name, true);
            }
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