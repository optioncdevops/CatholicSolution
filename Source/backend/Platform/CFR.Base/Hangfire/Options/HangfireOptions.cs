using System;

namespace CFR.Base.Hangfire.Options;

public class HangfireOptions
{
    public const string SectionName = "Hangfire";

    public bool Enabled { get; set; } = true;
    public bool DashboardEnabled { get; set; } = true;
    public string DashboardPath { get; set; } = "/hangfire";
    public int WorkerCount { get; set; } = Environment.ProcessorCount * 5;
    public string? ServerName { get; set; }
    public string[] Queues { get; set; } = ["default"];
    public string? ConnectionString { get; set; }
    public int RetryCount { get; set; } = 3;
    public int BackoffIntervalInSeconds { get; set; } = 5;
}
