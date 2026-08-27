using System;
using System.Linq.Expressions;
using System.Threading.Tasks;
using Hangfire;

namespace CFR.Base.Hangfire.Jobs;

public class HangfireBackgroundJobService : IBackgroundJobService
{
    private readonly IBackgroundJobClient _backgroundJobClient;
    private readonly IRecurringJobManager _recurringJobManager;

    public HangfireBackgroundJobService(
        IBackgroundJobClient backgroundJobClient,
        IRecurringJobManager recurringJobManager)
    {
        _backgroundJobClient = backgroundJobClient ?? throw new ArgumentNullException(nameof(backgroundJobClient));
        _recurringJobManager = recurringJobManager ?? throw new ArgumentNullException(nameof(recurringJobManager));
    }

    public bool Delete(string jobId)
    {
        throw new NotImplementedException();
    }

    public string Enqueue<T>(Expression<Func<T, Task>> methodCall) =>
        _backgroundJobClient.Enqueue(methodCall);
}