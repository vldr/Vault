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
        }

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
            ViewBag.FileSize = _processService.GetBytesReadable(file.Size);
            ViewBag.Icon = _processService.GetFileAttribute(file.Id, file.Ext);

            // Return our view!
            return View();
        }

        /// <summary>
        /// Downloads the preview shared file...
        /// </summary>
        /// <param name="shareId"></param>
        /// <returns></returns>
        [HttpGet]   
        [Route("share/preview/{shareId}")]
        public IActionResult DownloadSharedPreview(string shareId)
        {
            // Check if our share id given is null!
            if (shareId == null) return StatusCode(500);

            // Get the file...
            Models.File file = _processService.GetSharedFile(shareId);

            // Check if the file exists or is valid!
            if (file == null) return StatusCode(500);

            // Setup our file's path as a variable...
            string filePath = file.Path;

            // Check if the file even exists on the disk...
            if (!System.IO.File.Exists(filePath)) return StatusCode(500);

            // Check if preview file exists...
            if (System.IO.File.Exists($"{filePath}.preview")) filePath = $"{filePath}.preview";

            // Return an empty result.
            return PhysicalFile(filePath, "application/octet-stream", true);
        }

        /// <summary>
        /// Gets the file...
        /// </summary>
        /// <param name="shareId"></param>
        /// <returns></returns>
        [HttpGet]
        [Route("i/{shareId}")]
        public IActionResult DownloadSharedNoPreview(string shareId)
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

            // Return an empty result.
            return PhysicalFile(file.Path, mimeType, true);
        }

        /// <summary>
        /// Downloads the shared file...
        /// </summary>
        /// <param name="shareId"></param>
        /// <returns></returns>
        [HttpPost]
        [Route("share/dl/{shareId}")]
        public IActionResult DownloadSharedFile(string shareId)
        {
            // Check if our share id given is null!
            if (shareId == null)
                return StatusCode(500);

            // Get the file...
            Models.File file = _processService.GetSharedFile(shareId);

            // Check if the file exists or is valid!
            if (file == null)
                return StatusCode(500);

            // Check if the file even exists on the disk...
            if (!System.IO.File.Exists(file.Path))
                return StatusCode(500);

            // Return an empty result.
            return PhysicalFile(file.Path, "application/octet-stream", file.Name, true);
        }

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
                    var path = $"{_configuration["ShareUploadLocation"]}{result.shareId}";

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