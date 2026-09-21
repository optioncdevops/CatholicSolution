// Copyright (c) OptionC. All rights reserved.

using CFR.CommonService.Interfaces;
using CFR.CommonService.Service;
using CFR.PortalInfrastructure.Interfaces.Authentication;
using CFR.PortalInfrastructure.Interfaces.CFRLaunch;
using CFR.PortalInfrastructure.Repositorys.Authentication;
using CFR.PortalInfrastructure.Repositorys.CFRLaunch;
using CFR.PortalService.Service.Authentication;
using CFR.PortalService.Service.CFRLaunch;
using CFR.PortalInfrastructure.Interfaces.Administration;
using CFR.PortalInfrastructure.Repositorys.Administration;
using CFR.PortalService.Interfaces.Administration;
using CFR.PortalService.Service.Administration;

namespace CFR.Portal
{
    /// <summary>
    /// Registers Portal service and repository pairs.
    /// </summary>
    public static class ServiceExtension
    {
        /// <summary>
        /// Adds Portal dependency-injection registrations.
        /// </summary>
        /// <param name="services">Service collection.</param>
        /// <returns>The same service collection.</returns>
        public static IServiceCollection AddDIServicesSetup(this IServiceCollection services)
        {
            services.AddScoped<ICurrentUserService, CurrentUserService>();
            services.AddControllers();
            services.AddSingleton<IHttpContextAccessor, HttpContextAccessor>();
            services.AddTransient<IPortalJwtTokenGenerator, PortalJwtTokenGenerator>();
            services.AddScoped<IAuth0UserInfoClient, Auth0UserInfoClient>();
            services.AddScoped<IDapperHandler, DapperHandler>();
            services.AddHttpClient();

            services.AddScoped<IPortalAuthenticationService, PortalAuthenticationService>();
            services.AddScoped<IPortalAuthenticationRepository, PortalAuthenticationRepository>();
            services.AddScoped<ICFRLaunchService, CFRLaunchService>();
            services.AddScoped<ICFRLaunchRepository, CFRLaunchRepository>();

            services.AddScoped<IEmailTemplatesRepository, EmailTemplatesRepository>();
            services.AddScoped<ISMTPMailService, SMTPMailService>();
            services.AddScoped<IAccessRequestService, AccessRequestService>();
            services.AddScoped<IAccessRequestRepository, AccessRequestRepository>();

            return services;
        }
    }
}
