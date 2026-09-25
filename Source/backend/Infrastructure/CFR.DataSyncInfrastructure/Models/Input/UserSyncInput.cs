// Copyright (c) OptionC. All rights reserved.

namespace CFR.DataSyncInfrastructure.Models.Input
{
    /// <summary>
    /// Create payload for the single-user sync API. ProductId is deliberately NOT a property
    /// here — it is resolved only from the authenticated ApiClient. Update/patch use
    /// <see cref="UserSyncUpdateInput"/> instead — it has no PasswordEncrypted, since a password is
    /// set only at identity creation and every later sync of that identity leaves it untouched.
    /// </summary>
    public class UserSyncInput: IUserSyncFields
    {
        /// <summary>The product's own user identifier.</summary>
        [JsonPropertyName("externalUserId")]
        public string ExternalUserId { get; set; } = string.Empty;

        /// <summary>The product's own organization identifier.</summary>
        [JsonPropertyName("productOrgId")]
        public int ProductOrgId { get; set; }

        /// <summary>User email address.</summary>
        [JsonPropertyName("email")]
        public string Email { get; set; } = string.Empty;

        /// <summary>User first name.</summary>
        [JsonPropertyName("firstName")]
        public string? FirstName { get; set; }

        /// <summary>User last name.</summary>
        [JsonPropertyName("lastName")]
        public string? LastName { get; set; }

        /// <summary>Opaque per-product role identifier.</summary>
        [JsonPropertyName("roleId")]
        public int? RoleId { get; set; }

        /// <summary>Login-disabled flag; defaults to false when omitted on create.</summary>
        [JsonPropertyName("isLoginDisabled")]
        public bool? IsLoginDisabled { get; set; }

        /// <summary>Active/usable flag; defaults to true when omitted on create.</summary>
        [JsonPropertyName("isActive")]
        public bool? IsActive { get; set; }

        /// <summary>
        /// Legacy password blob, already re-encrypted by the product with its own passphrase-based
        /// scheme — stored as-is on auth.User at identity creation only; CFR never sees plaintext.
        /// </summary>
        [JsonPropertyName("passwordEncrypted")]
        public byte[]? PasswordEncrypted { get; set; }
    }
}
