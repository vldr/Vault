using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Vault.Models;

namespace Vault.Models
{
    public class VaultHub : Hub
    {
        // Instance of our login service...
        private readonly LoginService _loginService;

        // Instance of our configuration...
        private readonly IConfiguration _configuration;  

        /// <summary>
        /// Constructor...
        /// </summary>
        /// <param name="loginService"></param>
        public VaultHub(LoginService loginService, IConfiguration configuration)
        {
            _loginService = loginService;
            _configuration = configuration;
        }

        /// <summary>
        /// On connection
        /// </summary>
        /// <returns></returns>
        public override Task OnConnectedAsync()
        {
            // Setup our is logged in variable...
            var loggedInUser = GetLoggedIn();

            // Check if the result is sucessful...
            if (loggedInUser.result)
            {
                // Add our client to the group id...
                Groups.AddToGroupAsync(Context.ConnectionId, loggedInUser.id.ToString());

                // Send out a custom async response custom login response...
                Clients.Caller.SendAsync("LoginResponse", new { Success = true, Name = _loginService.GetName(loggedInUser.id) });
            }
            else
                // Send our response indicating that it is false...
                Clients.Caller.SendAsync("LoginResponse", new { Success = false });

            // Return our original task...
            return base.OnConnectedAsync();
        }

        /// <summary>
        /// Check if we're logged in...
        /// </summary>
        /// <returns></returns>
        public (bool result, int id) GetLoggedIn()
        {
            // Check if our user is authenticated...
            if (!Context.User.Identity.IsAuthenticated) return (false, -1);

            // Attempt to find the session object...
            var idObject = Context.User.Claims.FirstOrDefault(b => b.Type == "id")?.Value;

            // Check if our id object is null...
            if (idObject == null) return (false, -1);

            // Setup our id value...
            int id = -1;

            // Attempt to parse our id object...
            if (!int.TryParse(idObject, out id)) return (false, -1);

            // Check if the user exists and our id matches...
            return (_loginService.UserExists(id), id);
        }
    }

    /// <summary>
    /// A class which holds basic user information in our signalr...
    /// </summary>
    public class UserInformation
    {
        public int Id { get; set; }
        public string ConnectionId { get; set; }
        public string Name { get; set; }
        public DateTimeOffset Expiry { get; set; }
    }
}
