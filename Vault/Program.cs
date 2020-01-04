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
#if DEBUG
                .UseKestrel()
                .UseIISIntegration()
                .UseStartup<Startup>()
                .ConfigureKestrel((context, options) =>
                {
                    options.ListenAnyIP(5555);
                });

#else
                 .UseHttpSys(options =>
                 { 
                     options.Authentication.Schemes = AuthenticationSchemes.None; 
                     options.Authentication.AllowAnonymous = true;
                     options.EnableResponseCaching = true;
                     options.MaxConnections = -1;  
                     options.MaxRequestBodySize = null;

                     options.UrlPrefixes.Add("http://vldr.org:80/manager/");
                     options.UrlPrefixes.Add("https://vldr.org:443/manager/");
                     options.UrlPrefixes.Add("https://www.vldr.org:443/manager/");
                     options.UrlPrefixes.Add("http://www.vldr.org:80/manager/");

                     options.UrlPrefixes.Add("http://i.vldr.org:80/");

                 })
                .UseStartup<Startup>();
#endif
    }
}
