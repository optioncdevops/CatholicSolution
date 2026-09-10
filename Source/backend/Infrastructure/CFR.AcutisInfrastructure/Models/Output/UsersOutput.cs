// Copyright (c) OptionC. All rights reserved.

using System.Text.Json.Serialization;

namespace CFR.AcutisInfrastructure.Models.Output
{
    /// <summary>
    /// Output DTO mapped from stored procedure StoredProc.Administration.UsersCrud.
    /// Holds one Acutis user row returned to the service and controller.
    /// </summary>
    public class UsersOutput
    {
        /// <summary>
        /// Gets or sets the user identifier.
        /// </summary>
        [JsonPropertyName("userId")]
        public int UserId { get; set; }

        /// <summary>
        /// Gets or sets the first name.
        /// </summary>
        [JsonPropertyName("firstName")]
        public string FirstName { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the last name.
        /// </summary>
        [JsonPropertyName("lastName")]
        public string LastName { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the full name.
        /// </summary>
        [JsonPropertyName("fullName")]
        public string FullName { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the email address.
        /// </summary>
        [JsonPropertyName("eMail")]
        public string EMail { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the organization identifier.
        /// </summary>
        [JsonPropertyName("organizationId")]
        public int OrganizationId { get; set; }

        /// <summary>
        /// Gets or sets the organization name.
        /// </summary>
        [JsonPropertyName("organizationName")]
        public string OrganizationName { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the role identifier.
        /// </summary>
        [JsonPropertyName("roleId")]
        public int RoleId { get; set; }

        /// <summary>
        /// Gets or sets the role name.
        /// </summary>
        [JsonPropertyName("roleName")]
        public string RoleName { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the active flag. 1 = active, 0 = inactive.
        /// </summary>
        [JsonPropertyName("isActive")]
        public int IsActive { get; set; }

        /// <summary>
        /// Gets or sets the locked flag. 1 = locked, 0 = unlocked.
        /// </summary>
        [JsonPropertyName("isLocked")]
        public int IsLocked { get; set; }

        /// <summary>
        /// Gets or sets the user status.
        /// </summary>
        [JsonPropertyName("status")]
        public string Status { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the date of birth.
        /// </summary>
        [JsonPropertyName("dateOfBirth")]
        public string? DateOfBirth { get; set; }

        /// <summary>
        /// Gets or sets the contact/phone number.
        /// </summary>
        [JsonPropertyName("contactNumber")]
        public string? ContactNumber { get; set; }

        /// <summary>
        /// Gets or sets the last active timestamp.
        /// </summary>
        [JsonPropertyName("lastActiveAt")]
        public DateTime? LastActiveAt { get; set; }
    }

    /// <summary>
    /// Output DTO for organization and role lookup lists used by the Users form.
    /// </summary>
    public class UserLookupOutput
    {
        /// <summary>
        /// Gets or sets the active organizations.
        /// </summary>
        [JsonPropertyName("organizations")]
        public List<OrganizationLookupOutput> Organizations { get; set; } = [];

        /// <summary>
        /// Gets or sets the active roles.
        /// </summary>
        [JsonPropertyName("roles")]
        public List<RoleLookupOutput> Roles { get; set; } = [];
    }

    /// <summary>
    /// Output DTO for one organization lookup row.
    /// </summary>
    public class OrganizationLookupOutput
    {
        /// <summary>
        /// Gets or sets the organization identifier.
        /// </summary>
        [JsonPropertyName("organizationId")]
        public int OrganizationId { get; set; }

        /// <summary>
        /// Gets or sets the organization name.
        /// </summary>
        [JsonPropertyName("name")]
        public string Name { get; set; } = string.Empty;
    }

    /// <summary>
    /// Output DTO for one role lookup row.
    /// </summary>
    public class RoleLookupOutput
    {
        /// <summary>
        /// Gets or sets the role identifier.
        /// </summary>
        [JsonPropertyName("roleId")]
        public int RoleId { get; set; }

        /// <summary>
        /// Gets or sets the role name.
        /// </summary>
        [JsonPropertyName("roleName")]
        public string RoleName { get; set; } = string.Empty;
    }
}
