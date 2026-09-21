// Copyright (c) OptionC. All rights reserved.

using System.Net.Http.Headers;
using System.Text.Json;

namespace CFR.Portal
{
    /// <summary>
    /// Verifies an Auth0 access token by calling Auth0's own /userinfo endpoint -
    /// the standard OAuth2 way to validate an opaque/JWT access token and read its
    /// claims without implementing JWKS signature verification locally.
    /// </summary>
    public class Auth0UserInfoClient(IHttpClientFactory httpClientFactory, IOptions<Auth0Setting> auth0Setting): IAuth0UserInfoClient
    {
        /// <summary>
        /// Calls Auth0's /userinfo endpoint with the given access token.
        /// </summary>
        /// <param name="accessToken">The Auth0 access token to verify.</param>
        /// <returns>The resolved identity, or null if the token is invalid/expired, Auth0 is unreachable, or no domain is configured.</returns>
        public async Task<Auth0UserInfo?> GetUserInfoAsync(string accessToken)
        {
            string? domain = auth0Setting.Value.Domain;
            if (string.IsNullOrWhiteSpace(domain) || string.IsNullOrWhiteSpace(accessToken))
            {
                return null;
            }

            using HttpClient client = httpClientFactory.CreateClient();
            var request = new HttpRequestMessage(HttpMethod.Get, $"https://{domain}/userinfo");
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

            HttpResponseMessage response = await client.SendAsync(request);
            if (!response.IsSuccessStatusCode)
            {
                return null;
            }

            using Stream stream = await response.Content.ReadAsStreamAsync();
            var payload = await JsonSerializer.DeserializeAsync<Dictionary<string, JsonElement>>(stream);
            if (payload == null || !payload.TryGetValue("email", out JsonElement emailElement))
            {
                return null;
            }

            string email = emailElement.GetString() ?? string.Empty;
            return string.IsNullOrWhiteSpace(email) ? null : new Auth0UserInfo { Email = email };
        }
    }
}
