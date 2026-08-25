// Copyright (c) OptionC. All rights reserved.

using System.Text.Json;

using Microsoft.Extensions.Caching.Distributed;

namespace CFR.Base
{
    public interface IRedisCacheHelper
    {
        Task<T?> GetOrSetAsync<T>(string key, Func<Task<T>> fetchData, TimeSpan? expiration = null);

        Task SetAsync<T>(string key, T data, TimeSpan? expiration = null);

        Task<T?> GetAsync<T>(string key);

        Task RemoveAsync(string key);
    }

    public class RedisCacheHelper(IDistributedCache cache): IRedisCacheHelper
    {
        private readonly IDistributedCache _cache = cache;

        public async Task<T?> GetOrSetAsync<T>(string key, Func<Task<T>> fetchData, TimeSpan? expiration = null)
        {
            ArgumentNullException.ThrowIfNull(fetchData);

            var cached = await GetAsync<T>(key);
            if (cached is not null)
            {
                return cached;
            }

            var data = await fetchData();
            await SetAsync(key, data, expiration);
            return data;
        }

        public async Task SetAsync<T>(string key, T data, TimeSpan? expiration = null)
        {
            var options = new DistributedCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = expiration ?? TimeSpan.FromMinutes(60)
            };

            string jsonData = JsonSerializer.Serialize(data);
            await _cache.SetStringAsync(key, jsonData, options);
        }

        public async Task<T?> GetAsync<T>(string key)
        {
            string? jsonData = await _cache.GetStringAsync(key);
            return jsonData is null ? default : JsonSerializer.Deserialize<T>(jsonData);
        }

        public async Task RemoveAsync(string key)
        {
            await _cache.RemoveAsync(key);
        }
    }
}
