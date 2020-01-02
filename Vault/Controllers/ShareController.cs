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
        private readonly ProcessService _processService;
        private readonly IConfiguration _configuration;
        private readonly string _relativeDirectory;
        private readonly string _sortByCookie;
        private readonly string _sessionName;

        public ShareController(ProcessService processService, IConfiguration configuration)
        {
            _processService = processService;
            _configuration = configuration;

            _sessionName = configuration["SessionTagId"];
            _relativeDirectory = configuration["RelativeDirectory"];
            _sortByCookie = configuration["VaultSortByCookie"];
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
        /// Renders the viewer (PDF viewer, image viewer, etc)
        /// part of the share page.
        /// </summary>
        /// <param name="shareId"></param>
        /// <returns></returns>
        [HttpPost]
        [Route("share/viewer")]
        public IActionResult Viewer(string shareId)
        {
            if (shareId == null) return MissingParameters();

            /////////////////////////////////

            Models.File file = _processService.GetSharedFile(shareId);

            /////////////////////////////////

            if (file == null)
                return Json(new { Success = false, Reason = "We could not find a the file specified..." });

            /////////////////////////////////

            if (!System.IO.File.Exists(file.Path))
                return Json(new { Success = false, Reason = "The file physically does not exist..." });

            /////////////////////////////////

            Viewer viewer = new Viewer() { Success = true };

            viewer.Name = file.Name;
            viewer.Ext = file.Ext;
            viewer.Size = file.Size;

            viewer.Icon = _processService.GetFileAttribute(
                file.Id.ToString(),
                file.Ext,
                ProcessService.AttributeTypes.FileIconNoPreview);

            viewer.Action = _processService.GetFileAttribute(
                file.Id.ToString(),
                file.Ext,
                ProcessService.AttributeTypes.FileAction);

            viewer.IsEncrypted = file.IsEncrypted;
            viewer.URL = $"i/{shareId}";
            viewer.RelativeURL = "../";

            /////////////////////////////////

            return Json(viewer);
        }

        /// <summary>
        /// Displays the share page for a shared file.
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
            if (shareId == null) return StatusCode(400);

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

            string mimeType = "application/octet-stream";

            new FileExtensionContentTypeProvider().TryGetContentType(file.Name, out mimeType);

            // We have to check the mimetype since TryGetContentType might set it back to null..
            if (mimeType == null) mimeType = "application/octet-stream";

            _processService.SetupPreview(ref mimeType, ref filePath);

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
            if (shareId == null) return StatusCode(400);

            // Get the file...
            Models.File file = _processService.GetSharedFile(shareId);

            // Check if the file exists or is valid!
            if (file == null) return StatusCode(400);

            // Setup our file path...
            string filePath = file.Path;

            // Check if the file even exists on the disk...
            if (!System.IO.File.Exists(filePath)) return StatusCode(400);

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
                Response.Headers.Add("Content-Disposition", $"attachment; filename={file.Name}");

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
                User user = _processService.GetUserAPI(apiKey);

                /////////////////////////////////

                if (user == null) return Json(new { Success = false, Reason = "Unable to find the API user..." });

                /////////////////////////////////

                long size = file.Length;

                /////////////////////////////////

                if (size > long.Parse(_configuration["MaxVaultFileSize"]))
                    return Json(new { Success = false, Reason = "The file size is too large..." });

                //////////////////////////////////////////////////////////////////

                if (!_processService.CanUpload(user, size))
                    return Json(new { Success = false, Reason = "Not enough storage to upload file..." });

                //////////////////////////////////////////////////////////////////

                string filePath = _configuration["VaultStorageLocation"] + _processService.RandomString(30);

                /////////////////////////////////

                if (System.IO.File.Exists(filePath))
                    return Json(new { Success = false, Reason = "Internal server error! (file path taken)" });

                /////////////////////////////////

                string fileName = file.FileName == null ? "Unknown.bin" : file.FileName;

                /////////////////////////////////

                string fileExtension = Path.GetExtension(fileName).ToLower();

                /////////////////////////////////

                using (var stream = new FileStream(filePath, FileMode.Create))
                    await file.CopyToAsync(stream);

                //////////////////////////////////////////////////////////////////

                var result = _processService.AddNewFileAPI(user, size, fileName, fileExtension, filePath);

                /////////////////////////////////

                if (result.IsOK())
                {
                    var path = $"{_configuration["ShareUploadLocation"]}{result.Get().Item1}{fileExtension}";

                    /////////////////////////////////

                    return Json(new { Success = true, Path = path });
                }

                /////////////////////////////////

                return Json(
                    result.FormatError()
                );
            }
            catch
            {
                return Json(new { Success = false, Reason = "Transaction error..." });
            }
        }
    }
}