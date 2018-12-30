using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Vault2.Objects;

namespace Vault.Objects
{
    public class VaultHub : Hub
    {
        // Instance of our login service...
        private LoginService _loginService;

        // Instance of our dictionary...
        public static ConcurrentDictionary<string, UserInformation> Connections = new ConcurrentDictionary<string, UserInformation>();

        /// <summary>
        /// Constructor...
        /// </summary>
        /// <param name="loginService"></param>
        public VaultHub(LoginService loginService)
        {
            _loginService = loginService;
        }

        /// <summary>
        /// Login
        /// </summary>
        /// <param name="username"></param>
        /// <param name="password"></param>
        /// <returns></returns>
        public Task Login(string id, string username, string password)
        {
            // Check if all the parameters were given...
            if (username == null || password == null || id == null)
                return Clients.Caller.SendAsync("LoginResponse", new { Success = false, Reason = "You must supply all required parameters..." });

            // Attempt to find the user and login...
            User user = _loginService.Login(username, password);

            // Check if we logged in sucessfully...
            if (user != null)
            {
                // Add our user to the session...
                Connections.TryAdd(id, new UserInformation() { Id = user.Id, ConnectionId = Context.ConnectionId });

                // Return a successful response...
                return Clients.Caller.SendAsync("LoginResponse", new { Success = true });
            }
            else
                // Return an error response...
                return Clients.Caller.SendAsync("LoginResponse", new { Success = false, Reason = "The username or password is invalid..." });
        }

        /// <summary>
        /// On connection
        /// </summary>
        /// <returns></returns>
        public override Task OnConnectedAsync()
        {
            // Check if our cookie exists...
            if (Context.GetHttpContext().Request.Cookies.ContainsKey(".vault.socketid"))
            {
                // Get our value of the cookie...
                string key = Context.GetHttpContext().Request.Cookies[".vault.socketid"];

                // Check if our cookie exists in the connections...
                if (Connections.ContainsKey(key))
                {
                    // If so, then setup a brand new connection id...
                    Connections[key].ConnectionId = Context.ConnectionId;
                }
            }

            // Call our original function...
            return base.OnConnectedAsync();
        }
    }

    public class UserInformation
    {
        public int Id { get; set; }
        public string ConnectionId { get; set; }
    }

}
