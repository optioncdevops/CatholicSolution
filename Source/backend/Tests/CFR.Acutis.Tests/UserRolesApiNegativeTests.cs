// Copyright (c) OptionC. All rights reserved.

using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;

using NUnit.Framework;

namespace CFR.Acutis.Tests
{
    /// <summary>
    /// Response envelope shape returned by BaseController.ApiResultArgs - only the fields these
    /// tests read. A 403 (Forbid()) never carries a body at all, so every field here is optional.
    /// </summary>
    public sealed class ApiResultArgsBody
    {
        [JsonPropertyName("statusCode")]
        public int? StatusCode { get; set; }

        [JsonPropertyName("statusMessage")]
        public string? StatusMessage { get; set; }
    }

    /// <summary>
    /// API-level negative tests for the three User Roles mutation endpoints
    /// (SaveUserRole/UpdateUserRoleStatus/DeleteUserRole), run over plain HTTP against a real,
    /// running CFR.Gateway/CFR.Acutis instance - not Selenium. These specifically cover cases the
    /// browser UI can no longer reach once it blocks the action itself (a disabled Delete button
    /// cannot be clicked, so there is no way to trigger a 409 for an in-use role through the
    /// browser any more), and the 403 role-authorization case, which needs two different signed-in
    /// roles at once (an "admin" token with Access rights and a "non-admin" token without).
    ///
    /// Every test is Ignored (not Failed) when the environment variable(s) it needs are not set -
    /// this suite cannot fabricate a base URL, a JWT, or a RoleId, and a missing prerequisite is a
    /// genuinely unverified scenario, not a passing one.
    /// </summary>
    [TestFixture]
    public class UserRolesApiNegativeTests
    {
        private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

        private HttpClient CreateClient(string? bearerToken)
        {
            string baseUrl = ApiTestEnvironment.RequireVariableOrSkip(ApiTestEnvironment.ApiBaseUrlVariable);
            var client = new HttpClient { BaseAddress = new Uri(baseUrl.TrimEnd('/') + "/") };
            if (!string.IsNullOrWhiteSpace(bearerToken))
            {
                client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", bearerToken);
            }

            return client;
        }

        private static async Task<ApiResultArgsBody?> ReadBodyOrNull(HttpResponseMessage response)
        {
            // 403 (Forbid()) and some other short-circuited responses carry no body at all - see
            // Phase 1's note on BaseController.GetResponseByStatusCode - so a missing/unparsable
            // body is expected, not an error in the test itself.
            try
            {
                string text = await response.Content.ReadAsStringAsync();
                return string.IsNullOrWhiteSpace(text) ? null : JsonSerializer.Deserialize<ApiResultArgsBody>(text, JsonOptions);
            }
            catch (JsonException)
            {
                return null;
            }
        }

        // --- 403: authenticated but not authorized (no Access right to User Roles) ---

        [Test]
        public async Task DeleteUserRole_AsNonAdmin_Returns403()
        {
            var env = ApiTestEnvironment.Resolve();
            env.RequireMutationsAllowedOrSkip("UserRoles: DeleteUserRole as a non-admin token (expect 403)");
            string nonAdminToken = ApiTestEnvironment.RequireVariableOrSkip(ApiTestEnvironment.NonAdminTokenVariable);
            int roleId = ApiTestEnvironment.RequireIntVariableOrSkip(ApiTestEnvironment.RoleIdVariable);

            using var client = CreateClient(nonAdminToken);
            using var response = await client.DeleteAsync($"api/v1/UserRoles/DeleteUserRole?roleId={roleId}");

            Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.Forbidden),
                $"Expected 403 for a non-admin token deleting RoleId {roleId}, got {(int)response.StatusCode}.");
        }

        [Test]
        public async Task UpdateUserRoleStatus_AsNonAdmin_Returns403()
        {
            var env = ApiTestEnvironment.Resolve();
            env.RequireMutationsAllowedOrSkip("UserRoles: UpdateUserRoleStatus as a non-admin token (expect 403)");
            string nonAdminToken = ApiTestEnvironment.RequireVariableOrSkip(ApiTestEnvironment.NonAdminTokenVariable);
            int roleId = ApiTestEnvironment.RequireIntVariableOrSkip(ApiTestEnvironment.RoleIdVariable);

            using var client = CreateClient(nonAdminToken);
            using var response = await client.PutAsJsonAsync("api/v1/UserRoles/UpdateUserRoleStatus", new { roleId, status = "inactive" });

            Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.Forbidden),
                $"Expected 403 for a non-admin token deactivating RoleId {roleId}, got {(int)response.StatusCode}.");
        }

        [Test]
        public async Task SaveUserRole_AsNonAdmin_Returns403()
        {
            var env = ApiTestEnvironment.Resolve();
            env.RequireMutationsAllowedOrSkip("UserRoles: SaveUserRole as a non-admin token (expect 403)");
            string nonAdminToken = ApiTestEnvironment.RequireVariableOrSkip(ApiTestEnvironment.NonAdminTokenVariable);

            using var client = CreateClient(nonAdminToken);
            using var response = await client.PostAsJsonAsync(
                "api/v1/UserRoles/SaveUserRole",
                new { roleId = 0, roleName = "Api-Negative-Test-" + Guid.NewGuid().ToString("N")[..8], description = "Should be rejected before any row is written.", status = "active" });

            Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.Forbidden),
                $"Expected 403 for a non-admin token creating a role, got {(int)response.StatusCode}.");
        }

        [Test]
        public async Task DeleteUserRole_WithNoToken_Returns401()
        {
            // Confirms [Authorize] itself (authentication, not authorization) still gates the
            // endpoint - a sanity check that the 403 tests above are exercising role-based
            // authorization specifically, not merely re-discovering missing authentication.
            string baseUrl = ApiTestEnvironment.RequireVariableOrSkip(ApiTestEnvironment.ApiBaseUrlVariable);
            int roleId = ApiTestEnvironment.RequireIntVariableOrSkip(ApiTestEnvironment.RoleIdVariable);

            using var client = CreateClient(bearerToken: null);
            using var response = await client.DeleteAsync($"api/v1/UserRoles/DeleteUserRole?roleId={roleId}");

            Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.Unauthorized),
                $"Expected 401 for an unauthenticated request, got {(int)response.StatusCode}.");
        }

        // --- 409: role-in-use protection ---

        [Test]
        public async Task DeleteUserRole_ForAssignedRole_Returns409()
        {
            var env = ApiTestEnvironment.Resolve();
            env.RequireMutationsAllowedOrSkip("UserRoles: DeleteUserRole for an in-use role (expect 409)");
            string adminToken = ApiTestEnvironment.RequireVariableOrSkip(ApiTestEnvironment.AdminTokenVariable);
            int assignedRoleId = ApiTestEnvironment.RequireIntVariableOrSkip(ApiTestEnvironment.AssignedRoleIdVariable);

            using var client = CreateClient(adminToken);
            using var response = await client.DeleteAsync($"api/v1/UserRoles/DeleteUserRole?roleId={assignedRoleId}");

            Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.Conflict),
                $"Expected 409 deleting RoleId {assignedRoleId}, which is expected to have assigned users, got {(int)response.StatusCode}.");
            var body = await ReadBodyOrNull(response);
            Assert.That(body?.StatusMessage, Does.Contain("assigned").IgnoreCase.Or.Contain("use").IgnoreCase);
        }

        [Test]
        public async Task UpdateUserRoleStatus_DeactivateAssignedRole_Returns409()
        {
            var env = ApiTestEnvironment.Resolve();
            env.RequireMutationsAllowedOrSkip("UserRoles: UpdateUserRoleStatus deactivating an in-use role (expect 409)");
            string adminToken = ApiTestEnvironment.RequireVariableOrSkip(ApiTestEnvironment.AdminTokenVariable);
            int assignedRoleId = ApiTestEnvironment.RequireIntVariableOrSkip(ApiTestEnvironment.AssignedRoleIdVariable);

            using var client = CreateClient(adminToken);
            using var response = await client.PutAsJsonAsync(
                "api/v1/UserRoles/UpdateUserRoleStatus",
                new { roleId = assignedRoleId, status = "inactive" });

            Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.Conflict),
                $"Expected 409 deactivating RoleId {assignedRoleId}, which is expected to have assigned users, got {(int)response.StatusCode}.");
        }

        // --- 404: deleted/nonexistent role ---

        [Test]
        public async Task DeleteUserRole_ForUnknownRoleId_Returns404()
        {
            var env = ApiTestEnvironment.Resolve();
            env.RequireMutationsAllowedOrSkip("UserRoles: DeleteUserRole for an unknown RoleId (expect 404)");
            string adminToken = ApiTestEnvironment.RequireVariableOrSkip(ApiTestEnvironment.AdminTokenVariable);
            int unknownRoleId = ApiTestEnvironment.RequireIntVariableOrSkip(ApiTestEnvironment.UnknownRoleIdVariable);

            using var client = CreateClient(adminToken);
            using var response = await client.DeleteAsync($"api/v1/UserRoles/DeleteUserRole?roleId={unknownRoleId}");

            Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.NotFound),
                $"Expected 404 deleting unknown RoleId {unknownRoleId}, got {(int)response.StatusCode}.");
        }

        [Test]
        public async Task UpdateUserRoleStatus_ForUnknownRoleId_Returns404()
        {
            var env = ApiTestEnvironment.Resolve();
            env.RequireMutationsAllowedOrSkip("UserRoles: UpdateUserRoleStatus for an unknown RoleId (expect 404)");
            string adminToken = ApiTestEnvironment.RequireVariableOrSkip(ApiTestEnvironment.AdminTokenVariable);
            int unknownRoleId = ApiTestEnvironment.RequireIntVariableOrSkip(ApiTestEnvironment.UnknownRoleIdVariable);

            using var client = CreateClient(adminToken);
            using var response = await client.PutAsJsonAsync(
                "api/v1/UserRoles/UpdateUserRoleStatus",
                new { roleId = unknownRoleId, status = "inactive" });

            Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.NotFound),
                $"Expected 404 updating status for unknown RoleId {unknownRoleId}, got {(int)response.StatusCode}.");
        }

        [Test]
        public async Task SaveUserRole_ForUnknownRoleId_Returns404()
        {
            var env = ApiTestEnvironment.Resolve();
            env.RequireMutationsAllowedOrSkip("UserRoles: SaveUserRole (edit) for an unknown RoleId (expect 404)");
            string adminToken = ApiTestEnvironment.RequireVariableOrSkip(ApiTestEnvironment.AdminTokenVariable);
            int unknownRoleId = ApiTestEnvironment.RequireIntVariableOrSkip(ApiTestEnvironment.UnknownRoleIdVariable);

            using var client = CreateClient(adminToken);
            using var response = await client.PostAsJsonAsync(
                "api/v1/UserRoles/SaveUserRole",
                new { roleId = unknownRoleId, roleName = "Edit-Of-Unknown-Role", description = "Should be rejected.", status = "active" });

            Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.NotFound),
                $"Expected 404 editing unknown RoleId {unknownRoleId}, got {(int)response.StatusCode}.");
        }
    }
}
