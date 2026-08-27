using System;
using System.Threading;
using System.Threading.Tasks;
using Hangfire;
using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace CFR.Base.Hangfire.Diagnostics;

public class HangfireHealthCheck : IHealthCheck
{
    public Task<HealthCheckResult> CheckHealthAsync(HealthCheckContext context, CancellationToken cancellationToken = default)
    {
        try
        {
            var storage = JobStorage.Current;
            if (storage == null)
            {
                return Task.FromResult(HealthCheckResult.Unhealthy("Hangfire JobStorage.Current is not initialized."));
            }

            using (var connection = storage.GetConnection())
            {
                // Try reading servers to verify connection
                var monitoringApi = storage.GetMonitoringApi();
                var servers = monitoringApi.Servers();
                
                return Task.FromResult(HealthCheckResult.Healthy(
                    $"Hangfire storage connection is healthy. Active servers: {servers.Count}"));
            }
        }
        catch (Exception ex)
        {
            return Task.FromResult(HealthCheckResult.Unhealthy("Hangfire health check failed.", ex));
        }
    }
}
