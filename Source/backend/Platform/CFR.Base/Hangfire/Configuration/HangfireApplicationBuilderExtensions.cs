using CFR.Base.Hangfire.Dashboard;
using CFR.Base.Hangfire.Options;
using CFR.Base.Hangfire.Scheduling;
using Hangfire;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;

namespace CFR.Base.Hangfire.Configuration;

public static class HangfireApplicationBuilderExtensions
{
    public static IApplicationBuilder UseHangfireInfrastructure(this IApplicationBuilder app)
    {
        var options = app.ApplicationServices.GetRequiredService<IOptions<HangfireOptions>>().Value;
        if (!options.Enabled)
        {
            return app;
        }

        // Map Dashboard if enabled
        if (options.DashboardEnabled)
        {
            // Register Dashboard Authorization Filter
            var authFilters = new[] { new DashboardAuthorizationFilter() };

            app.UseHangfireDashboard(options.DashboardPath, new DashboardOptions
            {
                Authorization = authFilters
            });
        }

        // Map health check diagnostics
        app.UseHealthChecks("/healthz");

        // Resolve and execute all recurring job registrars
        using (var scope = app.ApplicationServices.CreateScope())
        {
            var registrars = scope.ServiceProvider.GetServices<IRecurringJobRegistrar>();
            foreach (var registrar in registrars)
            {
                registrar.RegisterJobs();
            }
        }

        return app;
    }
}