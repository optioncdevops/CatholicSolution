using System;
using System.Diagnostics;
using Hangfire.Common;
using Hangfire.Server;
using Microsoft.Extensions.Logging;

namespace CFR.Base.Hangfire.Extensions;

public class HangfireJobLoggerFilter : IServerFilter
{
    private readonly ILogger<HangfireJobLoggerFilter> _logger;

    public HangfireJobLoggerFilter(ILogger<HangfireJobLoggerFilter> logger)
    {
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    public void OnPerforming(PerformingContext context)
    {
        var correlationId = context.Connection.GetJobParameter(context.BackgroundJob.Id, "CorrelationId") 
                            ?? Guid.NewGuid().ToString();

        context.Items["CorrelationId"] = correlationId;
        context.Items["Stopwatch"] = Stopwatch.StartNew();

        _logger.LogInformation(
            "Background Job Started | JobId: {JobId} | JobType: {JobType} | Method: {MethodName} | Queue: {Queue} | CorrelationId: {CorrelationId}",
            context.BackgroundJob.Id,
            context.BackgroundJob.Job.Type.Name,
            context.BackgroundJob.Job.Method.Name,
            context.BackgroundJob.Job.Queue,
            correlationId);
    }

    public void OnPerformed(PerformedContext context)
    {
        var stopwatch = context.Items["Stopwatch"] as Stopwatch;
        stopwatch?.Stop();
        var elapsedMs = stopwatch?.ElapsedMilliseconds ?? 0;
        var correlationId = context.Items["CorrelationId"] as string ?? "N/A";

        if (context.Exception != null)
        {
            _logger.LogError(
                context.Exception,
                "Background Job Failed | JobId: {JobId} | JobType: {JobType} | Method: {MethodName} | Queue: {Queue} | CorrelationId: {CorrelationId} | ElapsedTime: {ElapsedMs}ms",
                context.BackgroundJob.Id,
                context.BackgroundJob.Job.Type.Name,
                context.BackgroundJob.Job.Method.Name,
                context.BackgroundJob.Job.Queue,
                correlationId,
                elapsedMs);
        }
        else
        {
            _logger.LogInformation(
                "Background Job Completed | JobId: {JobId} | JobType: {JobType} | Method: {MethodName} | Queue: {Queue} | CorrelationId: {CorrelationId} | ElapsedTime: {ElapsedMs}ms",
                context.BackgroundJob.Id,
                context.BackgroundJob.Job.Type.Name,
                context.BackgroundJob.Job.Method.Name,
                context.BackgroundJob.Job.Queue,
                correlationId,
                elapsedMs);
        }
    }
}
