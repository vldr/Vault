using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.EntityFrameworkCore;
using Vault2.Objects;
using Microsoft.Net.Http.Headers;
using System;

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
            services.AddMvc();
            services.AddSingleton(Configuration);

            services.AddScoped<LoginService>();
            services.AddScoped<ProcessService>();

            services.AddSession(options =>
            {
                options.IdleTimeout = TimeSpan.FromMinutes(30);
                options.Cookie.Name = ".vault";
            });

            services.AddDbContext<Objects.VaultContext>(options => 
                options.UseSqlite(Configuration.GetConnectionString("DefaultConnection"))
            );
        }

        public void Configure(IApplicationBuilder app, IHostingEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }

            app.UseSession();
            app.UseDefaultFiles();
            app.UseStaticFiles(new StaticFileOptions
            {
                OnPrepareResponse = ctx =>
                {
                    //ctx.Context.Response.Headers[HeaderNames.CacheControl] = "public,max-age=86400";
                }
            });

            app.UseMvcWithDefaultRoute();
        }
    }
}
