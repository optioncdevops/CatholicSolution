using System;
using System.Linq.Expressions;
using System.Threading.Tasks;

namespace CFR.Base.Hangfire.Jobs;

public interface IBackgroundJobService
{
    string Enqueue<T>(Expression<Func<T, Task>> methodCall);

    bool Delete(string jobId);
}