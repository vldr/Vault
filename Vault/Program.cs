using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Server.HttpSys;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace Vault2
{
    public class Program
    {
        public static void Main(string[] args)
        {
            CreateWebHostBuilder(args).Build().Run();
        }

        public static IWebHostBuilder CreateWebHostBuilder(string[] args) =>
            WebHost.CreateDefaultBuilder(args)
                 .UseHttpSys(options =>
                 { 
                     options.Authentication.Schemes = AuthenticationSchemes.None; 
                     options.Authentication.AllowAnonymous = true;
                     options.EnableResponseCaching = true;
                     options.MaxConnections = -1;  
                     options.MaxRequestBodySize = null;
#if DEBUG
                     options.UrlPrefixes.Add("http://127.0.0.1:6969");
#else
                     options.UrlPrefixes.Add("http://vault.vldr.org:80/");
                     options.UrlPrefixes.Add("https://vault.vldr.org:443/");

                     options.UrlPrefixes.Add("http://upx.me:80/");
                     options.UrlPrefixes.Add("https://upx.me:443/");
#endif
                 })
                .UseStartup<Startup>();
               
    }
}
