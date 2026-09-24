// Copyright (c) OptionC. All rights reserved.

namespace CFR.DataSyncInfrastructure
{
    /// <summary>
    /// Stored procedure parameter name constants for the CFR.DataSync microservice.
    /// </summary>
    public static class DBParameterName
    {
        /// <summary>
        /// Parameters for <see cref="StoredProc.Security"/>.
        /// </summary>
        public static class SecurityParams
        {
            /// <summary>CRUD action identifier.</summary>
            public const string ActionId = nameof(ActionId);

            /// <summary>The product's API client identifier (used to log in and get a JWT).</summary>
            public const string ClientId = nameof(ClientId);

            /// <summary>Per-request nonce (replay-protection insert).</summary>
            public const string Nonce = nameof(Nonce);

            /// <summary>Internal identifier of the authenticated ApiClient row.</summary>
            public const string ApiClientId = nameof(ApiClientId);

            /// <summary>Client-supplied Idempotency-Key header value.</summary>
            public const string IdempotencyKey = nameof(IdempotencyKey);

            /// <summary>SHA-256 hash of the raw request body.</summary>
            public const string RequestHash = nameof(RequestHash);

            /// <summary>HTTP status code of the stored response.</summary>
            public const string ResponseStatusCode = nameof(ResponseStatusCode);

            /// <summary>Serialized response body to replay for a repeated idempotency key.</summary>
            public const string ResponseBody = nameof(ResponseBody);

            /// <summary>UTC expiry of the idempotency record (24h TTL from creation).</summary>
            public const string ExpiresDate = nameof(ExpiresDate);

            /// <summary>Plaintext client secret — compared directly at login, no encryption at rest.</summary>
            public const string ClientSecret = nameof(ClientSecret);

            /// <summary>ProductId this ApiClient is scoped to.</summary>
            public const string ProductId = nameof(ProductId);

            /// <summary>Human-readable label for the ApiClient row.</summary>
            public const string DisplayName = nameof(DisplayName);

            /// <summary>Per-client requests-per-minute limit.</summary>
            public const string RateLimitPerMinute = nameof(RateLimitPerMinute);

            /// <summary>Per-client override for the bulk-user-sync row cap (NULL = use the platform default).</summary>
            public const string MaxBulkUserCount = nameof(MaxBulkUserCount);

            /// <summary>Who/what created the ApiClient row.</summary>
            public const string InsertedBy = nameof(InsertedBy);

            /// <summary>Stored procedure output — the new ApiClientId.</summary>
            public const string ReturnValue = nameof(ReturnValue);
        }

        /// <summary>
        /// Parameters for <see cref="StoredProc.UserSync"/>.
        /// </summary>
        public static class UserSyncParams
        {
            /// <summary>CRUD action identifier.</summary>
            public const string ActionId = nameof(ActionId);

            /// <summary>ProductId resolved from the authenticated ApiClient — never client-supplied.</summary>
            public const string ProductId = nameof(ProductId);

            /// <summary>The product's own organization identifier.</summary>
            public const string ProductOrgId = nameof(ProductOrgId);

            /// <summary>Internal identifier of the authenticated ApiClient row.</summary>
            public const string ApiClientId = nameof(ApiClientId);

            /// <summary>W3C trace id, carried into the audit row.</summary>
            public const string TraceId = nameof(TraceId);

            /// <summary>The product's own user identifier — maps to auth.UserProduct.UserId.</summary>
            public const string ExternalUserId = nameof(ExternalUserId);

            /// <summary>User email address.</summary>
            public const string Email = nameof(Email);

            /// <summary>User first name.</summary>
            public const string FirstName = nameof(FirstName);

            /// <summary>User last name.</summary>
            public const string LastName = nameof(LastName);

            /// <summary>Opaque per-product role identifier.</summary>
            public const string RoleId = nameof(RoleId);

            /// <summary>Login-disabled flag.</summary>
            public const string IsLoginDisabled = nameof(IsLoginDisabled);

            /// <summary>Active/usable flag (auth.UserProduct.IsActive — inverted from the old IsLockedOut).</summary>
            public const string IsActive = nameof(IsActive);

            /// <summary>Client-supplied If-Match RowVersion for optimistic concurrency.</summary>
            public const string ExpectedRowVersion = nameof(ExpectedRowVersion);

            /// <summary>Caller IP, carried into the audit row.</summary>
            public const string SourceIp = nameof(SourceIp);

            /// <summary>Organization name.</summary>
            public const string OrgName = nameof(OrgName);

            /// <summary>Organization state/province.</summary>
            public const string OrgState = nameof(OrgState);

            /// <summary>Organization country.</summary>
            public const string OrgCountry = nameof(OrgCountry);

            /// <summary>Organization contact email.</summary>
            public const string ContactEmail = nameof(ContactEmail);

            /// <summary>Organization website.</summary>
            public const string Website = nameof(Website);

            /// <summary>Organization contact person.</summary>
            public const string ContactPerson = nameof(ContactPerson);

            /// <summary>Organization contact phone.</summary>
            public const string ContactPhone = nameof(ContactPhone);

            /// <summary>Organization street address.</summary>
            public const string Address = nameof(Address);

            /// <summary>Organization city.</summary>
            public const string City = nameof(City);

            /// <summary>Organization state/province (address line).</summary>
            public const string State = nameof(State);

            /// <summary>Organization postal/zip code.</summary>
            public const string Zip = nameof(Zip);

            /// <summary>The product's own diocese identifier.</summary>
            public const string DioceseId = nameof(DioceseId);

            /// <summary>
            /// Legacy password blob, re-encrypted with CFRPortal's own Encrypt/DecryptUserPassword
            /// pair by the source query — stored as-is on auth.User at identity creation only.
            /// </summary>
            public const string PasswordEncrypted = nameof(PasswordEncrypted);
        }

        /// <summary>
        /// Parameters for <see cref="StoredProc.ProductSync"/>.
        /// </summary>
        public static class ProductSyncParams
        {
            /// <summary>Email address of the CFR user whose accessible products are being looked up.</summary>
            public const string Email = nameof(Email);

            /// <summary>Environment name used to resolve each product's [core].[ProductEnvironment].BaseUrl.</summary>
            public const string EnvironmentName = nameof(EnvironmentName);

            /// <summary>Stored procedure output — 1 when the email matched a CFR identity, -1 otherwise.</summary>
            public const string ReturnValue = nameof(ReturnValue);
        }

        /// <summary>
        /// Parameters for <see cref="StoredProc.ProductRole"/>.
        /// </summary>
        public static class ProductRoleParams
        {
            /// <summary>CRUD action identifier.</summary>
            public const string ActionId = nameof(ActionId);

            /// <summary>ProductId resolved from the authenticated ApiClient — never client-supplied.</summary>
            public const string ProductId = nameof(ProductId);

            /// <summary>Opaque per-product role identifier (same value stored on auth.UserProduct.RoleId).</summary>
            public const string RoleId = nameof(RoleId);

            /// <summary>Display name for the role.</summary>
            public const string RoleName = nameof(RoleName);

            /// <summary>Stored procedure output — the new/existing ProductRoleId (ActionId 1 only).</summary>
            public const string ReturnValue = nameof(ReturnValue);
        }

        /// <summary>
        /// Parameters for <see cref="StoredProc.PlatformLaunch"/> (Portal's own [dbo].[Portal_PlatformLaunch] -
        /// CFR.DataSync only creates codes with it, using ActionId 1; it never exchanges them).
        /// </summary>
        public static class PlatformLaunchParams
        {
            /// <summary>CRUD action identifier.</summary>
            public const string ActionId = nameof(ActionId);

            /// <summary>Email address used to resolve the target CFR member.</summary>
            public const string Email = nameof(Email);

            /// <summary>SHA-256 hex hash of the one-time platform-launch code.</summary>
            public const string CodeHash = nameof(CodeHash);

            /// <summary>Audit identifier for the calling API client.</summary>
            public const string InsertedBy = nameof(InsertedBy);

            /// <summary>Stored procedure output / return value.</summary>
            public const string ReturnValue = nameof(ReturnValue);
        }

        /// <summary>
        /// Parameters for <see cref="StoredProc.CFRLaunch"/> (Portal's own [dbo].[Portal_CFRLaunch] -
        /// CFR.DataSync only creates launch codes with it, using ActionId 4 (email-resolved
        /// member, for a trusted machine client); it never exchanges them or lists hub products.
        /// </summary>
        public static class CFRLaunchParams
        {
            /// <summary>CRUD action identifier.</summary>
            public const string ActionId = nameof(ActionId);

            /// <summary>Email address used to resolve the target CFR member (ActionId 4 only).</summary>
            public const string Email = nameof(Email);

            /// <summary>Product identifier from [core].[Product].</summary>
            public const string ProductId = nameof(ProductId);

            /// <summary>SHA-256 hex hash of the one-time authorization code.</summary>
            public const string CodeHash = nameof(CodeHash);

            /// <summary>Audit identifier for the calling API client.</summary>
            public const string InsertedBy = nameof(InsertedBy);

            /// <summary>[core].[ProductEnvironment].EnvironmentName for the login environment.</summary>
            public const string EnvironmentName = nameof(EnvironmentName);

            /// <summary>Stored procedure output / return value.</summary>
            public const string ReturnValue = nameof(ReturnValue);
        }
    }
}
