using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Vault.Objects;

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
            Objects.File file = _processService.GetSharedFile(shareId);

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
            Objects.File file = _processService.GetSharedFile(shareId);

            // Check if the file exists or is valid!
            if (file == null) return StatusCode(500);

            // Setup our file's path as a variable...
            string filePath = file.Path;

            // Check if the file even exists on the disk...
            if (!System.IO.File.Exists(filePath)) return StatusCode(500);

            // Check if preview file exists...
            if (System.IO.File.Exists($"{filePath}.preview")) filePath = $"{filePath}.preview";

            // Return an empty result.
            return File(new FileStream(filePath, FileMode.Open, FileAccess.Read, FileShare.ReadWrite), "application/octet-stream", file.Name, true);
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
            Objects.File file = _processService.GetSharedFile(shareId);

            // Check if the file exists or is valid!
            if (file == null)
                return StatusCode(500);

            // Check if the file even exists on the disk...
            if (!System.IO.File.Exists(file.Path))
                return StatusCode(500);

            // Increment our file hits so we can know how many times the file was downloaded!
            _processService.IncrementFileHit(file);

            // Return an empty result.
            return File(new FileStream(file.Path, FileMode.Open, FileAccess.Read, FileShare.ReadWrite), "application/octet-stream", file.Name, true);
        }

    }
}