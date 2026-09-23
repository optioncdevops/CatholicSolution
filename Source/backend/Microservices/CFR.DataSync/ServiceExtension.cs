// Copyright (c) OptionC. All rights reserved.

using CFR.DataSyncInfrastructure.Interfaces.OrganizationSync;
using CFR.DataSyncInfrastructure.Interfaces.ProductSync;
using CFR.DataSyncInfrastructure.Interfaces.Security;
using CFR.DataSyncInfrastructure.Interfaces.UserSync;
using CFR.DataSyncInfrastructure.Repositorys.OrganizationSync;
using CFR.DataSyncInfrastructure.Repositorys.ProductSync;
using CFR.DataSyncInfrastructure.Repositorys.Security;
using CFR.DataSyncInfrastructure.Repositorys.UserSync;
using CFR.DataSyncService.Interfaces.OrganizationSync;
using CFR.DataSyncService.Interfaces.ProductSync;
using CFR.DataSyncService.Service.OrganizationSync;
using CFR.DataSyncService.Service.ProductSync;
using CFR.DataSyncService.Service.Security;
using CFR.DataSyncService.Service.UserSync;

namespace CFR.DataSync
{
    /// <summary>
    /// Registers CFR.DataSync service and repository pairs.
    /// </summary>
    public static class ServiceExtension
    {
        /// <summary>
        /// Adds CFR.DataSync dependency-injection registrations.
        /// </summary>
        /// <param name="services">Service collection.</param>
        /// <returns>The same service collection.</returns>
        public static IServiceCollection AddDIServicesSetup(this IServiceCollection services)
        {
            services.AddSingleton<IHttpContextAccessor, HttpContextAccessor>();
            services.AddScoped<IDapperHandler, DapperHandler>();

            // JWT login pipeline — current-request client, decoupled from ICurrentUserService
            // (which is human-login shaped) since CFR.DataSync's caller is a product's backend.
            services.AddScoped<ICurrentApiClient, CurrentApiClientService>();
            services.AddScoped<IApiClientRepository, ApiClientRepository>();
            services.AddScoped<IJwtTokenGenerator, SyncJwtTokenGenerator>();
            services.AddScoped<IAuthService, AuthService>();

            // UserSync services and repository
            services.AddScoped<IUserSyncService, UserSyncService>();
            services.AddScoped<IUserSyncRepository, UserSyncRepository>();

            // OrganizationSync services and repository
            services.AddScoped<IOrganizationSyncService, OrganizationSyncService>();
            services.AddScoped<IOrganizationSyncRepository, OrganizationSyncRepository>();

            // ProductSync services and repository
            services.AddScoped<IProductSyncService, ProductSyncService>();
            services.AddScoped<IProductSyncRepository, ProductSyncRepository>();

            return services;
        }
    }
}
