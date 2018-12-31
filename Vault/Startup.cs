using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.EntityFrameworkCore;
using Vault.Objects;
using System;
using Microsoft.AspNetCore.ResponseCompression;
using System.IO.Compression;

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
            
            services.AddMvc();
            services.AddSingleton(Configuration);

            services.AddScoped<LoginService>();
            services.AddScoped<ProcessService>();

            services.AddSession(options =>
            {
                options.IdleTimeout = TimeSpan.FromMinutes(30);
                options.Cookie.Name = ".vault";
            });

            services.AddSignalR();

            services.AddDbContext<Vault.Objects.VaultContext>(options => 
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
                    //ctx.Context.Response.Headers[HeaderNames.CacheControl] = "public,max-age=86400";
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
