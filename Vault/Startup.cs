﻿using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.EntityFrameworkCore;
using Vault.Models;
using System;
using Microsoft.AspNetCore.ResponseCompression;
using System.IO.Compression;
using Microsoft.Net.Http.Headers;
using Microsoft.AspNetCore.Http.Features;

namespace Vault2
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        public void ConfigureServices(IServiceCollection services)
        {
            services.Configure<GzipCompressionProviderOptions>(options => options.Level = CompressionLevel.Fastest);
            services.AddResponseCompression(options =>
            {
                options.Providers.Add<GzipCompressionProvider>();
                options.EnableForHttps = true;
            });

            services.AddRouting(options => options.LowercaseUrls = true);
            services.AddMvc();
            services.Configure<FormOptions>(x =>
            {
                x.ValueLengthLimit = int.MaxValue;
                x.MultipartBodyLengthLimit = long.MaxValue;
            });
            services.AddSingleton(Configuration);

            services.AddScoped<LoginService>();
            services.AddScoped<ProcessService>();

            services.AddSession(options =>
            {
                options.IdleTimeout = TimeSpan.FromMinutes(double.Parse(Configuration["SessionExpiry"]));
                options.Cookie.Name = ".vault";
            });

            services.AddSignalR();
            services.AddDbContext<Vault.Models.VaultContext>(options => 
                options.UseSqlite(Configuration.GetConnectionString("DefaultConnection"))
            );
        } 

        public void Configure(IApplicationBuilder app, IHostingEnvironment env)
        { 
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }

            app.UseResponseCompression();

            app.UseSession();
            app.UseDefaultFiles();
            app.UseStaticFiles(new StaticFileOptions
            {
                OnPrepareResponse = ctx =>
                {
                   // ctx.Context.Response.Headers[HeaderNames.CacheControl] = "public,must-revalidate";
                }
            }); 

            app.UseSignalR(route =>
            {
                route.MapHub<VaultHub>("/notifications");
            });

            app.UseMvcWithDefaultRoute();
        }
    }
}
