// Copyright (c) OptionC. All rights reserved.

using CFR.SyncInfrastructure.Interfaces.Security;
using CFR.SyncInfrastructure.Interfaces.UserSync;
using CFR.SyncInfrastructure.Repositorys.Security;
using CFR.SyncInfrastructure.Repositorys.UserSync;
using CFR.SyncService.Service.Security;
using CFR.SyncService.Service.UserSync;

namespace CFR.Sync
{
    /// <summary>
    /// Registers CFR.Sync service and repository pairs.
    /// </summary>
    public static class ServiceExtension
    {
        /// <summary>
        /// Adds CFR.Sync dependency-injection registrations.
        /// </summary>
        /// <param name="services">Service collection.</param>
        /// <returns>The same service collection.</returns>
        public static IServiceCollection AddDIServicesSetup(this IServiceCollection services)
        {
            services.AddSingleton<IHttpContextAccessor, HttpContextAccessor>();
            services.AddScoped<IDapperHandler, DapperHandler>();

            // HMAC authentication pipeline — current-request client, decoupled from ICurrentUserService
            // (which is JWT/human-login shaped) since CFR.Sync's caller is a product's backend.
            services.AddScoped<ICurrentApiClient, CurrentApiClientService>();
            services.AddScoped<IApiClientRepository, ApiClientRepository>();
            services.AddScoped<IHmacSigningService, HmacSigningService>();
            services.AddScoped<IApiClientAuthenticator, ApiClientAuthenticator>();

            // UserSync services and repository
            services.AddScoped<IUserSyncService, UserSyncService>();
            services.AddScoped<IUserSyncRepository, UserSyncRepository>();

            return services;
        }
    }
}
