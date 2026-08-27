using System;
using Hangfire.Client;

namespace CFR.Base.Hangfire.Extensions;

public class HangfireCorrelationIdFilter : IClientFilter
{
    public void OnCreating(CreatingContext context)
    {
        // Set Correlation ID to track background jobs
        var correlationId = Guid.NewGuid().ToString();
        context.SetJobParameter("CorrelationId", correlationId);
    }

    public void OnCreated(CreatedContext context)
    {
    }
}
