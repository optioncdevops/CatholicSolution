// Copyright (c) OptionC. All rights reserved.

namespace CFR.DataSyncInfrastructure.Models.Input
{
    /// <summary>
    /// Update/patch payload for the single-user sync API — the same fields as
    /// <see cref="UserSyncInput"/> minus PasswordEncrypted, which is a create-only field (a
    /// password is set once at identity creation; CFR owns it exclusively from then on, so a
    /// later sync of the same identity never overwrites a password the user may have already
    /// changed inside CFR). ProductId is deliberately NOT a property here — it is resolved only
    /// from the authenticated ApiClient.
    /// </summary>
    public class UserSyncUpdateInput: IUserSyncFields
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

        /// <summary>Login-disabled flag; defaults to false when omitted.</summary>
        [JsonPropertyName("isLoginDisabled")]
        public bool? IsLoginDisabled { get; set; }

        /// <summary>Active/usable flag; defaults to true when omitted.</summary>
        [JsonPropertyName("isActive")]
        public bool? IsActive { get; set; }
    }
}
