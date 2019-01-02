﻿using System;
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
                     options.MaxRequestBodySize = 90000000;
#if DEBUG
                     options.UrlPrefixes.Add("http://127.0.0.1:6969");
                     options.UrlPrefixes.Add("http://127.0.0.1:6969/manager/");
#else
                     options.UrlPrefixes.Add("http://vldr.org:80/manager/");
                     options.UrlPrefixes.Add("https://vldr.org:443/manager/");
                     options.UrlPrefixes.Add("https://i.upx.me:443/");
                     options.UrlPrefixes.Add("http://i.upx.me:80/");
#endif
                 })
                .UseStartup<Startup>();
               
    }
}
