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
            services.AddScoped<IDapperHandler, DapperHandler>();

            return services;
        }
    }
}