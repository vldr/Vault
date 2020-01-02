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
using System.Security.Claims;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication;
using Newtonsoft.Json;

namespace Vault.Controllers
{
    public class LoginController : Controller
    {
        private readonly string _sessionName;
        private readonly string _relativeDirectory;

        private readonly LoginService _loginService;
        private readonly ProcessService _processService;
        private readonly IConfiguration _configuration;

        public LoginController(LoginService loginService, ProcessService processService, IConfiguration configuration)
        {
            _loginService = loginService;
            _processService = processService;
            _configuration = configuration;

            _sessionName = configuration["SessionTagId"];
            _relativeDirectory = configuration["RelativeDirectory"];
        }

        /// <summary>
        /// The controller for the login.
        /// </summary>
        /// <param name="Email"></param>
        /// <param name="Password"></param>
        /// <param name="RememberMe"></param>
        /// <returns></returns>
        [HttpPost]
        [Route("login")]
        public async Task<IActionResult> LoginPost(string Email, string Password, bool? RememberMe)
        {
            if (Email == null || Password == null || RememberMe == null)
                return Json(new { Success = false, Reason = "You must supply all required parameters..." });

            /////////////////////////////////

            if (IsLoggedIn()) return Json(new { Success = true });

            /////////////////////////////////

            Email = WebUtility.HtmlEncode(Email);

            /////////////////////////////////

            User user = _loginService.Login(Email, Password);

            /////////////////////////////////

            if (user != null)
            {
                _loginService.AppendIPAddress(user.Id, HttpContext.Connection.RemoteIpAddress.ToString());

                //////////////////////////
                // Setup our session... //
                //////////////////////////

                UserSession userSession = _loginService.SetupSession(user);
                SessionExtension.Set(HttpContext.Session, _sessionName, userSession);

                /////////////////////////////////

                //////////////////////////////
                // Setup our cookie auth... //
                //////////////////////////////

                var claims = new [] { new Claim("id", user.Id.ToString()) };
                var claimsIdentity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);

                /////////////////////////////////

                var authProperties = new AuthenticationProperties
                {
                    AllowRefresh = true,
                    IsPersistent = true,
                    ExpiresUtc = RememberMe.GetValueOrDefault() ? DateTimeOffset.UtcNow.AddDays(30) : DateTimeOffset.UtcNow.AddMinutes(30),
                };

                /////////////////////////////////

                await HttpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, new ClaimsPrincipal(claimsIdentity), authProperties);

                /////////////////////////////////

                return Json(new { Success = true });
            }
            else
                // Return an error response...
                return Json(new { Success = false, Reason = "The username or password is invalid..." });
        }

        /// <summary>
        /// Called when someone registers on the website.
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
            if (string.IsNullOrWhiteSpace(email)
                || string.IsNullOrWhiteSpace(password) 
                || string.IsNullOrWhiteSpace(name) 
                || string.IsNullOrWhiteSpace(invite))
                return Json(new { Success = false, Reason = "You must supply all required parameters..." });

            /////////////////////////////////

            if (password.Length < 6)
                return Json(new { Success = false, Reason = "The password must be at least 6 characters long..." });

            /////////////////////////////////

            if (name.Length > 24)
                return Json(new { Success = false, Reason = "The name is too long..." });

            /////////////////////////////////

            if (invite != _configuration["VaultInviteKey"])
                return Json(new { Success = false, Reason = "The given invitation key is invalid..." });

            /////////////////////////////////

            var result = _loginService.Register(email, name, password, HttpContext.Connection.RemoteIpAddress.ToString());

            /////////////////////////////////

            if (result.IsOK())
                return Json(new { Success = true });
            else
                return Json(result.FormatError());
        }

        /// <summary>
        /// Displays the dashboard view.
        /// </summary>
        /// <returns></returns>
        [Route("dashboard")]
        public IActionResult Dashboard()
        {
            if (!IsLoggedIn()) return Redirect(_relativeDirectory);

            /////////////////////////////////

            UserSession userSession = SessionExtension.Get(HttpContext.Session, _sessionName);

            /////////////////////////////////

            ViewBag.User = _loginService.GetUser(userSession.Id);
            ViewBag.NightMode = Request.Cookies.ContainsKey(".vault.nightmode");
            ViewBag.MaxUploadSize = _configuration["MaxVaultFileSize"];

            /////////////////////////////////

            return View();
        }

        /// <summary>
        /// Check if we're logged in...
        /// </summary>
        /// <returns></returns>
        public bool IsLoggedIn()
        {
            // Check if our user is authenticated...
            if (!HttpContext.User.Identity.IsAuthenticated) return false;

            // Attempt to find the session object...
            var idObject = HttpContext.User.Claims.FirstOrDefault(b => b.Type == "id")?.Value;

            // If we couldn't find our id object then logout and return false...
            if (idObject == null) goto logout_and_false;

            // Setup our id value...
            int id = -1;

            // If we weren't able to convert our string to an int then logout and return false...
            if (!int.TryParse(idObject, out id)) goto logout_and_false;

            // Get our user...
            var user = _loginService.GetUser(id);

            // If our user does not exist, then logout and return false.
            if (user == null) goto logout_and_false;

            // Check if the user session isn't set...
            // If it isn't set, then set one up...
            if (SessionExtension.Get(HttpContext.Session, _sessionName) == null)
            {
                //////////////////////////
                // Setup our session... //
                //////////////////////////

                // Setup our user's session!
                UserSession userSession = _loginService.SetupSession(user);

                // Set our user session!
                SessionExtension.Set(HttpContext.Session, _sessionName, userSession);
            }

            // Return true and the object itself...
            return true;

        logout_and_false:

            // Sign out of the account...
            HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);

            // Return false...
            return false;
        }
    }
}