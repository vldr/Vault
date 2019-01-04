using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Configuration;
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
        
        // Instance of our configuration...
        private readonly string _syncCookieName;

        // Instance of our dictionary...
        public static ConcurrentDictionary<string, UserInformation> Connections = new ConcurrentDictionary<string, UserInformation>();

        /// <summary>
        /// Constructor...
        /// </summary>
        /// <param name="loginService"></param>
        public VaultHub(LoginService loginService, IConfiguration configuration)
        {
            _loginService = loginService;
            _configuration = configuration;

            _syncCookieName = _configuration["SyncCookieName"];
        }

        /// <summary>
        /// On connection
        /// </summary>
        /// <returns></returns>
        public override Task OnConnectedAsync()
        {
            // Call our original function...
            var originalTask = base.OnConnectedAsync();

            // Check if our cookie exists...
            if (Context.GetHttpContext().Request.Cookies.ContainsKey(_syncCookieName))
            {
                // Get our value of the cookie...
                string key = Context.GetHttpContext().Request.Cookies[_syncCookieName];

                // Check if our cookie exists in the connections...
                if (Connections.ContainsKey(key))
                {
                    // Check if our session has expired...
                    if (Connections[key].Expiry < DateTime.Now)
                    {
                        // Setup our empty user information... (let this get out of scope so GC cleans it up...)
                        UserInformation userInformation = null;

                        // Attempt to remove it...
                        Connections.TryRemove(key, out userInformation);
                    }
                    else
                    // If it is expired, then go ahead and remove it...
                    {
                        // If so, then setup a brand new connection id...
                        Connections[key].ConnectionId = Context.ConnectionId;

                        // Return a successful response...
                        return Clients.Caller.SendAsync("LoginResponse", new { Success = true });
                    }
                }
            }

            // Return our original task...
            return originalTask;
        }
    }

    /// <summary>
    /// A class which holds basic user information in our signalr...
    /// </summary>
    public class UserInformation
    {
        public int Id { get; set; }
        public string ConnectionId { get; set; }
        public DateTimeOffset Expiry { get; set; }
    }
}
