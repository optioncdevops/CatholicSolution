namespace CFR.Acutis
{
    public static class ServiceExtension
    {
        public static IServiceCollection AddDIServicesSetup(this IServiceCollection services)
        {

            services.AddScoped<IDapperHandler, DapperHandler>();
            return services;
        }
    }
}
