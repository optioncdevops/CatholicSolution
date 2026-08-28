using Hangfire.Annotations;
using Hangfire.Dashboard;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

namespace CFR.Base.Hangfire.Dashboard;

public class DashboardAuthorizationFilter : IDashboardAuthorizationFilter
{
    private readonly bool _allowAllInDevelopment;

    public DashboardAuthorizationFilter(bool allowAllInDevelopment = true)
    {
        _allowAllInDevelopment = allowAllInDevelopment;
    }

    public bool Authorize([NotNull] DashboardContext context)
    {
        var httpContext = context.GetHttpContext();

        // 1. If we allow all in development mode
        var env = httpContext.RequestServices.GetService<IWebHostEnvironment>();
        if (_allowAllInDevelopment && env != null && env.IsDevelopment())
        {
            return true;
        }

        // 2. Otherwise, check authentication & specific claim or policy
        var user = httpContext.User;
        if (user?.Identity == null || !user.Identity.IsAuthenticated)
        {
            return false;
        }

        // Allow users with "Admin" role or "Hangfire.Dashboard" permission claim
        return user.IsInRole("Admin") || user.HasClaim("Permission", "Hangfire.Dashboard");
    }
}
