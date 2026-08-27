using System;
using System.Collections.Generic;
using Hangfire;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using CFR.Base.Hangfire.Options;
using CFR.Base.Hangfire.Jobs;
using CFR.Base.Hangfire.Extensions;
using CFR.Base.Hangfire.Diagnostics;
using Hangfire.SqlServer;

namespace CFR.Base.Hangfire.Configuration;

public static class HangfireServiceCollectionExtensions
{
    public static IServiceCollection AddHangfireInfrastructure(this IServiceCollection services, IConfiguration configuration, string defaultConnectionStringName = "ConnString")
    {
        var options = new HangfireOptions();
        configuration.GetSection(HangfireOptions.SectionName).Bind(options);

        if (!options.Enabled)
        {
            return services;
        }

        // Register Options
        services.Configure<HangfireOptions>(configuration.GetSection(HangfireOptions.SectionName));

        // Setup Connection String
        var connectionString = options.ConnectionString;
        if (string.IsNullOrWhiteSpace(connectionString))
        {
            connectionString = configuration.GetConnectionString(defaultConnectionStringName);
        }

        if (string.IsNullOrWhiteSpace(connectionString))
        {
            throw new InvalidOperationException("Hangfire connection string is not configured.");
        }

        // Add Hangfire Server
        services.AddHangfireServer(serverOptions =>
        {
            serverOptions.WorkerCount = options.WorkerCount;
            if (!string.IsNullOrWhiteSpace(options.ServerName))
            {
                serverOptions.ServerName = options.ServerName;
            }
            if (options.Queues != null && options.Queues.Length > 0)
            {
                serverOptions.Queues = options.Queues;
            }
        });

        // Register IBackgroundJobService interface implementation
        services.AddScoped<IBackgroundJobService, HangfireBackgroundJobService>();

        // Register custom Health Check
        services.AddHealthChecks().AddCheck<HangfireHealthCheck>("hangfire");

        return services;
    }

    private static int[] GetExponentialBackoffDelays(int maxAttempts, int initialIntervalSeconds)
    {
        var delays = new List<int>();
        for (int i = 1; i <= maxAttempts; i++)
        {
            delays.Add(initialIntervalSeconds * (int)Math.Pow(2, i - 1));
        }
        return delays.ToArray();
    }
}