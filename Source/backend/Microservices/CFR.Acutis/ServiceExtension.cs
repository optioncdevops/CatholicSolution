using CFR.AcutisInfrastructure.Interfaces.AcutisAuthentication;
using CFR.AcutisInfrastructure.Interfaces.Administration;
using CFR.AcutisInfrastructure.Repositorys.AcutisAuthentication;
using CFR.AcutisInfrastructure.Repositorys.Administration;
using CFR.AcutisService.Interfaces.AcutisAuthentication;
using CFR.AcutisService.Interfaces.Administration;
using CFR.AcutisService.Service.AcutisAuthentication;
using CFR.AcutisService.Service.Administration;
using CFR.Base;
using CFR.CommonService.Interfaces;
using CFR.CommonService.Service;

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

            services.AddTransient<IJwtTokenGenerator, JwtTokenGenerator>();
            services.AddTransient<IAcutisJwtTokenGenerator, AcutisJwtTokenGenerator>();
            services.AddScoped<IDapperHandler, DapperHandler>();

            // Acutis authentication services and repository
            services.AddScoped<IAcutisAuthenticationService, AcutisAuthenticationService>();
            services.AddScoped<IAcutisAuthenticationRepository, AcutisAuthenticationRepository>();

            // Administration services and repository
            services.AddScoped<IUsersService, UsersService>();
            services.AddScoped<IUsersRepository, UsersRepository>();

            return services;
        }
    }
}
