// Copyright (c) OptionC. All rights reserved.

// <copyright file="CacheUpdaterService.cs" company="BBH">
// Copyright (c) BBH. All rights reserved.
// </copyright>

using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Hosting;

namespace CFR.Base.Services
{
    public class CacheUpdaterService(IMemoryCache memoryCache) : IHostedService, IDisposable
    {
        private readonly IMemoryCache _memoryCache = memoryCache ?? throw new ArgumentNullException(nameof(memoryCache));
        private Timer? _timer;

        public Task StartAsync(CancellationToken cancellationToken)
        {
            _timer = new Timer(
                callback: UpdateCache,
                state: null,
                dueTime: TimeSpan.Zero,
                period: TimeSpan.FromHours(1));
            return Task.CompletedTask;
        }

        private void UpdateCache(object? state)
        {
            var data = FetchData(); // Replace this with the actual method to get the data

            // Set the data in the cache with desired expiration options
            _memoryCache.Set("myDataKey", data, new MemoryCacheEntryOptions()
                .SetAbsoluteExpiration(TimeSpan.FromHours(1)));
        }

        private List<string> FetchData()
        {
            // Fetch or generate the data
            return new List<string> { "Value1", "Value2", "Value3" };
        }

        public Task StopAsync(CancellationToken cancellationToken)
        {
            _ = _timer?.Change(Timeout.Infinite, 0);
            return Task.CompletedTask;
        }

        public void Dispose()
        {
            _timer?.Dispose();
        }
    }
}