// Copyright (c) OptionC. All rights reserved.

namespace CFR.Common
{
    public class ApiHttpClientHelper(System.Net.Http.IHttpClientFactory httpClientFactory)
    {
        private readonly System.Net.Http.IHttpClientFactory _httpClientFactory = httpClientFactory;

        public async Task<string> SendRequestAsync(string clientName, string endpoint, HttpMethod method, object? body = null, string? bearerToken = null)
        {
            var client = _httpClientFactory.CreateClient(clientName);

            var request = new HttpRequestMessage(method, endpoint);

            // Add headers
            request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
            if (!string.IsNullOrWhiteSpace(bearerToken))
            {
                request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", bearerToken);
            }

            // Serialize and add body for POST/PUT
            if (body != null && (method == HttpMethod.Post || method == HttpMethod.Put || method == HttpMethod.Patch))
            {
                string json = System.Text.Json.JsonSerializer.Serialize(body);
                request.Content = new StringContent(json, Encoding.UTF8, "application/json");
            }

            try
            {
                var response = await client.SendAsync(request);
                _ = response.EnsureSuccessStatusCode(); // throws exception if not 2xx

                return await response.Content.ReadAsStringAsync();
            }
            catch (HttpRequestException ex)
            {
                // You can add logging here
                return $"Request failed: {ex.Message}";
            }
        }
    }
}
