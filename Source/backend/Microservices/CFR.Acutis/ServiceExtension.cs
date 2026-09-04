using CFR.AcutisInfrastructure.Interfaces.AcutisAuthentication;
using CFR.AcutisInfrastructure.Interfaces.Administration;
using CFR.AcutisInfrastructure.Interfaces.Products;
using CFR.AcutisInfrastructure.Interfaces.Profile;
using CFR.AcutisInfrastructure.Interfaces.Organization;
using CFR.AcutisInfrastructure.Repositorys.AcutisAuthentication;
using CFR.AcutisInfrastructure.Repositorys.Administration;
using CFR.AcutisInfrastructure.Repositorys.Organization;
using CFR.AcutisInfrastructure.Repositorys.Products;
using CFR.AcutisInfrastructure.Repositorys.Profile;
using CFR.AcutisService.Interfaces.Products;
using CFR.AcutisService.Service.AcutisAuthentication;
using CFR.AcutisService.Service.Administration;
using CFR.AcutisService.Service.Organization;
using CFR.AcutisService.Service.Products;
using CFR.AcutisService.Service.Profile;
using CFR.CommonService.Interfaces;
using CFR.CommonService.Service;
using CFR.CommonService.Services;

namespace CFR.Acutis
{
    public static class ServiceExtension
    {
        public static IServiceCollection AddDIServicesSetup(this IServiceCollection services)
        {
            // Take the Token Values
            services.AddScoped<ICurrentUserService, CurrentUserService>();
            services.AddControllers();

            // To access the files in web Browsers
            services.AddSingleton<IHttpContextAccessor, HttpContextAccessor>();

            services.AddTransient<IAcutisJwtTokenGenerator, AcutisJwtTokenGenerator>();
            services.AddScoped<IDapperHandler, DapperHandler>();

            // Acutis authentication services and repository
            services.AddScoped<IAcutisAuthenticationService, AcutisAuthenticationService>();
            services.AddScoped<IAcutisAuthenticationRepository, AcutisAuthenticationRepository>();
            services.AddScoped<IAcutisPasswordService, AcutisPasswordService>();
            services.AddScoped<IAcutisPasswordRepository, AcutisPasswordRepository>();
            services.AddScoped<ISMTPMailService, SMTPMailService>();

            // Administration services and repository
            services.AddScoped<IUsersService, UsersService>();
            services.AddScoped<IUsersRepository, UsersRepository>();
            services.AddScoped<IUserRolesService, UserRolesService>();
            services.AddScoped<IUserRolesRepository, UserRolesRepository>();
            services.AddScoped<IEmailTemplatesService, EmailTemplatesService>();
            services.AddScoped<IEmailTemplatesRepository, EmailTemplatesRepository>();
            services.AddScoped<IAccessRequestService, AccessRequestService>();
            services.AddScoped<IAccessRequestRepository, AccessRequestRepository>();

            // Products service and repository
            services.AddScoped<IProductsService, ProductsService>();
            services.AddScoped<IProductsRepository, ProductsRepository>();

            // Self-service profile / change-password
            services.AddScoped<IProfileService, ProfileService>();
            services.AddScoped<IProfileRepository, ProfileRepository>();

            // Organization
            services.AddScoped<IOrganizationService, OrganizationService>();
            services.AddScoped<IOrganizationRepository, OrganizationRepository>();

            return services;
        }
    }
}
