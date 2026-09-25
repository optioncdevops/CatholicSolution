// Copyright (c) OptionC. All rights reserved.

namespace CFR.DataSyncInfrastructure.Models.Input
{
    /// <summary>
    /// Fields shared by <see cref="UserSyncInput"/> (create) and <see cref="UserSyncUpdateInput"/>
    /// (update) — lets the service/repository validation helpers work on either DTO without
    /// duplicating that logic. Password is deliberately NOT here: it is a create-only field (see
    /// <see cref="UserSyncInput.PasswordEncrypted"/>).
    /// </summary>
    public interface IUserSyncFields
    {
        /// <summary>The product's own user identifier.</summary>
        string ExternalUserId { get; }

        /// <summary>The product's own organization identifier.</summary>
        int ProductOrgId { get; }

        /// <summary>User email address.</summary>
        string Email { get; }

        /// <summary>User first name.</summary>
        string? FirstName { get; }

        /// <summary>User last name.</summary>
        string? LastName { get; }

        /// <summary>Opaque per-product role identifier.</summary>
        int? RoleId { get; }

        /// <summary>Login-disabled flag; defaults to false when omitted on create.</summary>
        bool? IsLoginDisabled { get; }

        /// <summary>Active/usable flag; defaults to true when omitted on create.</summary>
        bool? IsActive { get; }
    }
}
