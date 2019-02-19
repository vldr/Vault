using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Vault.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.Builder;
using System.Net;
using Google.Apis.Auth;

namespace Vault.Controllers
{
    public class LoginController : Controller
    {
        // Save our little session tag...
        private readonly string _sessionName;
        private readonly string _relativeDirectory;

        // Instance of our login service...
        private readonly LoginService _loginService;

        // Instance of our process service...
        private readonly ProcessService _processService;

        // Instance of our configuration...
        private readonly IConfiguration _configuration;

        /// <summary>
        /// Contructor
        /// </summary>
        /// <param name="loginService"></param>
        /// <param name="processService"></param>
        /// <param name="configuration"></param>
        public LoginController(LoginService loginService, ProcessService processService, IConfiguration configuration)
        {
            _loginService = loginService;
            _processService = processService;
            _configuration = configuration;

            _sessionName = configuration["SessionTagId"];
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
        /// Authenticates a user...
        /// </summary>
        /// <param name="user"></param>
        public void AuthenticateUser(User user)
        {
            // Append our logged in user's ip address...
            _loginService.AppendIPAddress(user.Id, HttpContext.Connection.RemoteIpAddress.ToString());

            // Setup our user's session!
            UserSession userSession = new UserSession
            {
                Id = user.Id,
                Folder = user.Folder,
                SortBy = user.SortBy
            };

            // Set our user session!
            SessionExtension.Set(HttpContext.Session, _sessionName, userSession);

            // Setup our sync cookie value...
            var syncValue = _processService.RandomString(55);

            // Setup a brand new cookie...
            Response.Cookies.Append(
                _configuration["SyncCookieName"],
                syncValue,
                new Microsoft.AspNetCore.Http.CookieOptions()
                {
                    Path = "/"
                }
            );

            // Set our cookie as an entry in connections...
            VaultHub.Connections.TryAdd(syncValue, new UserInformation()
            {
                Id = user.Id,
                ConnectionId = string.Empty,
                Name = user.Name,
                Expiry = DateTime.Now + TimeSpan.FromMinutes(double.Parse(_configuration["SessionExpiry"]))
            });
        }

        /// <summary>
        /// Called when someone logs in to the website...
        /// </summary>
        /// <param name="Email"></param>
        /// <param name="Password"></param>
        /// <returns></returns>
        [HttpPost]
        [Route("login")]
        public IActionResult LoginPost(string Email, string Password)
        {
            // Check if all the parameters were given...
            if (Email == null || Password == null)
                return Json(new { Success = false, Reason = "You must supply all required parameters..." });

            // Check if already logged in...
            if (IsLoggedIn())
                return Json(new { Success = true });

            // Encode our email as a html encoded string...
            Email = WebUtility.HtmlEncode(Email);

            // Attempt to find the user and login...
            User user = _loginService.Login(Email, Password);

            // Check if we logged in sucessfully...
            if (user != null)
            {
                // Authenticate our user...
                AuthenticateUser(user);

                // Return a successful response...
                return Json(new { Success = true });
            }
            else
                // Return an error response...
                return Json(new { Success = false, Reason = "The username or password is invalid..." });
        }

        /// <summary>
        /// Called when someone registers on the website...
        /// </summary>
        /// <param name="email"></param>
        /// <param name="password"></param>
        /// <param name="name"></param>
        /// <param name="invite"></param>
        /// <returns></returns>
        [HttpPost]
        [Route("register")]
        public IActionResult RegisterPost(string email, string password, string name, string invite)
        {
            // Check if our input is null...
            if (string.IsNullOrWhiteSpace(email)
                || string.IsNullOrWhiteSpace(password) 
                || string.IsNullOrWhiteSpace(name) 
                || string.IsNullOrWhiteSpace(invite))
                return Json(new { Success = false, Reason = "You must supply all required parameters..." });

            // Check if the password is greater than 4 characters...
            if (password.Length < 6)
                return Json(new { Success = false, Reason = "The password must be at least 6 characters long..." });

            // Check if our name is too long...
            if (name.Length > 24)
                return Json(new { Success = false, Reason = "The name is too long..." });

            // Check that if our invite key matches...
            if (invite != _configuration["VaultInviteKey"])
                return Json(new { Success = false, Reason = "The given invitation key is invalid..." });

            // Return the response from our login service...
            if (_loginService.Register(email, name, password, HttpContext.Connection.RemoteIpAddress.ToString()))
                return Json(new { Success = true });
            else
                return Json(new { Success = false, Reason = "Transaction error..." });
        }

        /// <summary>
        /// Our main page...
        /// </summary>
        /// <returns></returns>
        [Route("control")]
        public IActionResult Control()
        {
            // Check if not logged in!
            if (!IsLoggedIn()) return Redirect(_relativeDirectory);

            // Setup a user session!
            UserSession userSession = SessionExtension.Get(HttpContext.Session, _sessionName);

            // Save our user to the view bag...
            ViewBag.User = _loginService.GetUser(userSession.Id);

            // Setup our boolean for if nightmode is enabled or not...
            ViewBag.NightMode = Request.Cookies.ContainsKey(".vault.nightmode");

            // Setup our upload size view bag variable...
            ViewBag.MaxUploadSize = _configuration["MaxVaultFileSize"];

            // Return our control view...
            return View();
        }

        /// <summary>
        /// Our settings page...
        /// </summary>
        /// <returns></returns>
        [HttpPost]
        [Route("settings")]
        public IActionResult Settings()
        {
            // Check if not logged in!
            if (!IsLoggedIn()) return NotLoggedIn();

            // Setup a user session!
            UserSession userSession = SessionExtension.Get(HttpContext.Session, _sessionName);

            // Save our user to the view bag...
            ViewBag.User = _loginService.GetUser(userSession.Id);

            // Setup our storage space variable...
            ViewBag.Storage = _processService.StorageFormatted(ViewBag.User);

            // Return our control view...
            return View();
        }

        /// <summary>
        /// Processes a Google login...
        /// </summary>
        /// <returns></returns>
        [HttpPost]
        [Route("googlelogin")]
        public async Task<IActionResult> GoogleLogin(string id)
        {
            // Check if not logged in!
            if (IsLoggedIn()) return Json(new { Success = true, Action = 2 });

            // Validate our user's google login...
            var googlePayload = await GoogleJsonWebSignature.ValidateAsync(id);

            // Check if our payload is valid...
            if (googlePayload == null) return Json(new { Success = false, Reason = "Failed to validate the Google account..." });

            // Check if the user's email is verified...
            if (!googlePayload.EmailVerified) return Json(new { Success = false, Reason = "Please verify your email..." });

            // Attempt to find the user and login...
            User user = _loginService.LoginGoogle(googlePayload.Email);

            // Check if we logged in sucessfully...
            if (user != null)
            {
                // Authenticate our user...
                AuthenticateUser(user);

                // Return a successful response...
                return Json(new { Success = true, Action = 0 });
            }
            // Otherwise, redirect the user to register...
            else
            {
                // Setup our temp data...
                TempData.Put("GoogleId", id);

                // Return a successful response...
                return Json(new { Success = true, Action = 1 });
            }
        }

        /// <summary>
        /// The processing of registering through Google...
        /// </summary>
        /// <returns></returns>
        [HttpPost]
        [Route("googleregister")]
        public async Task<IActionResult> GoogleRegister(string invite)
        {
            // Check if our input is null...
            if (string.IsNullOrWhiteSpace(invite))
                return Json(new { Success = false, Reason = "You must supply all required parameters..." });

            // Check that if our invite key matches...
            if (invite != _configuration["VaultInviteKey"])
                return Json(new { Success = false, Reason = "The given invitation key is invalid..." });

            // Check if our google payload temp data exists...
            if (!TempData.ContainsKey("GoogleId"))
                return Json(new { Success = false, Reason = "Invalid token given..." });

            // Setup our payload...
            var googleId = TempData.Get<string>("GoogleId");

            // Check if the google id is null...
            if (googleId == null) return Json(new { Success = false, Reason = "Token given did not come out correctly..." });

            // Validate our user's google login...
            var googlePayload = await GoogleJsonWebSignature.ValidateAsync(googleId);

            // Check if our payload is valid...
            if (googlePayload == null) return Json(new { Success = false, Reason = "Failed to validate the Google account..." });

            // Remove our tempdata just incase...
            TempData.Remove("GoogleId");

            // Return the response from our login service...
            if (_loginService.Register(googlePayload.Email, googlePayload.GivenName, null, 
                HttpContext.Connection.RemoteIpAddress.ToString()))
                // Return sucessful if it is...
                return await GoogleLogin(googleId);
            else
                // Return an error if it is an error...
                return Json(new { Success = false, Reason = "Transaction error..." });
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