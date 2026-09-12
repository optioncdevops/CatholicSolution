// Copyright (c) OptionC. All rights reserved.

using CFR.CommonService.Interfaces;
using CFR.CommonService.MailService;
using CFR.CommonService.Service;
using CFR.CommonService.Services;
using Microsoft.AspNetCore.Authentication.Certificate;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.AspNetCore.Server.Kestrel.Core;
using Microsoft.AspNetCore.Server.Kestrel.Https;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Hosting;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using System.Globalization;
using System.Security.Cryptography.X509Certificates;
using System.Threading.RateLimiting;
using static CFR.Common.Constant;

namespace CFR.Base;

public static class ServiceExtension
{
    public static IServiceCollection DisableAuthenticationPolicy(this IServiceCollection services, IWebHostEnvironment env)
    {
        // // To Configure setting only for the development mode
        if (env.IsDevelopment())
        {
            //Disable authentication and authorization this only fro development mode
            _ = services.RemoveAll<IPolicyEvaluator>();
            _ = services.AddSingleton<IPolicyEvaluator, DisableAuthenticationPolicyEvaluator>();
        }
        else
        {
            _ = services.RemoveAll<IPolicyEvaluator>();
            _ = services.AddSingleton<IPolicyEvaluator, DisableAuthenticationPolicyEvaluator>();
        }
        return services;
    }

    public static IServiceCollection AddRateLimiterSetup(this IServiceCollection services, int iPermitLimit = 100)
    {
        // RATE LIMITING - Protects API from abuse (too many requests)
        services.AddRateLimiter(options =>
        {
            options.AddPolicy("per-user", context =>
            RateLimitPartition.GetFixedWindowLimiter(
                partitionKey: context.User.Identity?.Name
                              ?? context.Connection.RemoteIpAddress?.ToString()
                              ?? context.TraceIdentifier,
                factory: _ => new FixedWindowRateLimiterOptions
                {
                    PermitLimit = iPermitLimit,
                    Window = TimeSpan.FromMinutes(1)
                }));
            options.AddFixedWindowLimiter("fixed", opt =>
            {
                opt.PermitLimit = iPermitLimit;            // Max 5 requests
                opt.Window = TimeSpan.FromMinutes(1);      // Per 1 minute
            });
        });

        return services;
    }

    public static IServiceCollection AddCommonServicesSetup(this IServiceCollection services)
    {
        // Set Global Culture to Invariant (or any specific culture)
        CultureInfo.DefaultThreadCurrentCulture = CultureInfo.InvariantCulture;
        CultureInfo.DefaultThreadCurrentUICulture = CultureInfo.InvariantCulture;

        _ = services.AddControllers();
        _ = services.AddMvc();
        _ = services.AddEndpointsApiExplorer();
        _ = services.AddSwaggerGen();

        // Add in-memory caching services
        _ = services.AddMemoryCache();

        // Take the Token Values
        _ = services.AddSingleton<IHttpContextAccessor, HttpContextAccessor>();

        // Common DI Register for all API
        _ = services.AddScoped<ISMTPMailService, SMTPMailService>();
        _ = services.AddScoped<IConfSettingsService, ConfSettingsService>();
        _ = services.AddScoped<IFileHandlerService, FileHandlerService>();
        _ = services.AddScoped<IInMemoryCacheHelper, InMemoryCacheHelper>();

        _ = services.AddHttpContextAccessor();

        _ = services.AddScoped<ICurrentUserService, CurrentUserService>();

        return services;
    }

    public static IServiceCollection AddSwaggerGenSetup(this IServiceCollection services, string sName)
    {
        services.AddSwaggerGen(c =>
        {
            foreach (string item in sName.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries))
            {
                c.SwaggerDoc(item, new OpenApiInfo
                {
                    Title = item,
                    Version = SwaggerDocs.Contact_Us,
                    Description = SwaggerDocs.Description.Replace("{0}", item),
                    Contact = new OpenApiContact
                    {
                        Name = SwaggerDocs.Contact_Us,
                        Email = SwaggerDocs.Contact_Email
                    }
                });
            }

            c.EnableAnnotations();

            c.AddSecurityDefinition(JWTDocs.Bearer, new OpenApiSecurityScheme
            {
                Type = SecuritySchemeType.Http,
                Scheme = "bearer",
                BearerFormat = "JWT",
                Name = JWTDocs.Authorization,
                In = ParameterLocation.Header,
                Description = JWTDocs.Description
            });

            c.AddSecurityRequirement(_ => new OpenApiSecurityRequirement
            {
            });
        });

        return services;
    }

    public static IServiceCollection AddAuthenticationSetup(this IServiceCollection services, IConfiguration configuration)
    {
        ArgumentNullException.ThrowIfNull(configuration);

        // Ensure the configuration section is not null
        var appSettingsSection = configuration.GetSection("JWTSetting");

        // Configure the JWT settings
        _ = services.Configure<JWTSetting>(appSettingsSection);

        // Retrieve the JWT settings
        var appSettings = appSettingsSection.Get<JWTSetting>()
            ?? throw new InvalidOperationException("JWTSetting configuration section is missing or invalid.");

        // Create the security key
        var securityKey = new SymmetricSecurityKey(
            Encoding.ASCII.GetBytes(appSettings.SecurityKey
                ?? throw new InvalidOperationException("JWT SecurityKey is not configured.")));

        // Get allowed origins
        string[] allowedOrigins = appSettings.AllowOrigin?.Split(',') ?? ["*"];

        // Configure authentication
        services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
        }).AddJwtBearer(jwt =>
        {
            jwt.RequireHttpsMetadata = false;
            jwt.SaveToken = true;
            jwt.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = securityKey,
                ValidateIssuer = false,
                ValidateAudience = false,
                ClockSkew = TimeSpan.Zero,
            };
        });

        // Configure CORS - Allow all origins for development (with credentials support)
        services.AddCors(options =>
        {
            options.AddDefaultPolicy(builder =>
            {
                builder.SetIsOriginAllowed(_ => true)  // Allow any origin but not wildcard *
                       .AllowAnyMethod()
                       .AllowAnyHeader()
                       .AllowCredentials();  // Required for withCredentials: true
            });
        });
        // Add controllers
        _ = services.AddControllers();

        return services;
    }

    public static void ConfigureLocationCounterBasedServices(this IServiceCollection services, IConfiguration configuration)
    {
        ArgumentNullException.ThrowIfNull(configuration);

        // CONDITIONAL CERTIFICATE AUTH SECTION
        IConfigurationSection certSettings = configuration.GetSection("DeviceCertificate");
        bool certEnabled = certSettings.GetValue<bool>("Enabled");

        if (certEnabled)
        {
            string rootCAName = certSettings.GetValue<string>("RootCAName") ?? "";

            services
                .AddAuthentication()
                .AddCertificate(options =>
                {
                    options.Events = new CertificateAuthenticationEvents
                    {
                        OnCertificateValidated = context =>
                        {
                            X509Certificate2 cert = context.ClientCertificate;

                            if (!cert.Issuer.Contains(rootCAName, StringComparison.OrdinalIgnoreCase))
                            {
                                context.Fail("Untrusted Certificate Issuer");
                                return Task.CompletedTask;
                            }

                            context.Success();
                            return Task.CompletedTask;
                        }
                    };
                });

            // ALSO ENSURE KESTREL REQUIRES CERTIFICATE
            services.Configure<KestrelServerOptions>(options =>
            {
                options.ConfigureHttpsDefaults(https =>
                {
                    https.ClientCertificateMode = ClientCertificateMode.AllowCertificate;
                });
            });
        }
    }

    // in the below method, replace "auth.bbh.local" with your actual domain name and port as needed.
    public static void ConfigureKestrelForCertificates(this IWebHostBuilder webBuilder)
    {
        webBuilder.ConfigureKestrel((context, options) =>
        {
            // Load server certificate from certificate store
            var store = new X509Store(StoreName.My, StoreLocation.LocalMachine);
            store.Open(OpenFlags.ReadOnly);

            // IMPORTANT: Certificate must match domain (CN=auth.bbh.local etc.)
            var serverCert = store.Certificates
                .Find(X509FindType.FindBySubjectName, "auth.bbh.local", false)
                .OfType<X509Certificate2>()
                .FirstOrDefault()
                ?? throw new InvalidOperationException(
                    "Server certificate 'auth.bbh.local' not found in LocalMachine/My store.");

            // Configure HTTPS endpoint
            options.ListenAnyIP(8001, listenOptions =>
            {
                listenOptions.UseHttps(serverCert, httpsOptions =>
                {
                    httpsOptions.ClientCertificateMode = ClientCertificateMode.RequireCertificate;
                });
            });

            store.Close();
        });
    }
}