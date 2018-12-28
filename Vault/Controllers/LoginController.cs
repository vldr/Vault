using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Vault2.Objects;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.AspNetCore.Http.Features;
using Vault.Objects;

namespace Vault2.Controllers
{
    public class LoginController : Controller
    {
        // Save our little session tag...
        private string _sessionName;
        private string _relativeDirectory;

        // Instance of our login service...
        private LoginService _loginService;

        // Instance of our process service...
        private ProcessService _processService;

        // Instance of our configuration...
        private IConfiguration _configuration;

        /**
         * Contructor
         */
        public LoginController(LoginService loginService, ProcessService processService, IConfiguration configuration)
        {
            _loginService = loginService;
            _processService = processService;
            _configuration = configuration;

            _sessionName = configuration["SessionTagId"];
            _relativeDirectory = configuration["RelativeDirectory"];
        }

        // Called when someone logs in to the website...
        [HttpPost]
        [Route("login")]
        public IActionResult LoginPost(string Email, string Password)
        {
            if (Email == null || Password == null)
                return StatusCode(200);

            // Check if not logged in!
            if (IsLoggedIn()) return Redirect("/control");

            // Attempt to log our user into the database...
            LoginService.ErrorCodes response = _loginService.Login(Email, Password);

            // If our response was an OK, then proceed to generate a session...
            if (response == LoginService.ErrorCodes.OK)
            {
                int? id = _loginService.GetUserId(Email);

                if (id == null) return Json(LoginService.ErrorCodes.Error);

                User user = _loginService.GetUser(id.GetValueOrDefault());

                _loginService.AppendIPAddress(id.GetValueOrDefault(), HttpContext.Connection.RemoteIpAddress.ToString());

                // Setup our user's session!
                UserSession userSession = new UserSession
                {
                    Id = id.GetValueOrDefault(),
                    Folder = user.Folder,
                    SortBy = user.SortBy
                };

                // Set our user session!
                SessionExtension.Set(HttpContext.Session, _sessionName, userSession);

                return Json(response);
            }

            // Return our response to the outer world...
            return Json(response);
        }

        // Called when someone registers on the website...
        [HttpPost]
        [Route("register")]
        public IActionResult RegisterPost(string email, string password, string name, string invite)
        {
            // Sadly, a try catch must be used...
            try
            {
                // Check if our input is null...
                if (email == null || password == null || name == null || invite == null)
                    return Json(LoginService.ErrorCodes.MissingInformation);

                // Check that if our invite key matches...
                if (invite != _configuration["VaultInviteKey"])
                    return Json(LoginService.ErrorCodes.Error);

                // Check if the password is greater than 4 characters...
                if (password.Length < 6)
                    return Json(LoginService.ErrorCodes.PasswordTooShort);

                // Check if the name is a decent length...
                if (name.Length < 4)
                    return Json(LoginService.ErrorCodes.NameTooShort);

                // Setup our user...
                User user = new User()
                {
                    Email = email,
                    Password = password,
                    Name = name,
                    IPAddresses = HttpContext.Connection.RemoteIpAddress.ToString()
                };

                // Return the response from our login service...
                return Json(_loginService.Register(user));
            }
            catch
            {
                // Return zero for an exception...
                return Json(LoginService.ErrorCodes.Error);
            }
        }

        /*
         * Control
         * Our main page...
         */
        [Route("control")]
        public IActionResult Control()
        {
            // Check if not logged in!
            if (!IsLoggedIn()) return Redirect(_relativeDirectory);

            // Setup a user session!
            UserSession userSession = SessionExtension.Get(HttpContext.Session, _sessionName);

            // Save our user to the view bag...
            ViewBag.User = _loginService.GetUser(userSession.Id);

            // Return our control view...
            return View();
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