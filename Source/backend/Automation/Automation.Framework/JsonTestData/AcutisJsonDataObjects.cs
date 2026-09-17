// Copyright (c) OptionC. All rights reserved.

namespace Automation.Framework.JsonTestData
{
    public class AcutisJsonDataObjects
    {
        public JsonLogin? Login { get; set; }

        public UserDetails? UserDetails { get; set; }

        public ProductData? Product { get; set; }

        public UserRolesData? UserRoles { get; set; }

        public UserRightsData? UserRights { get; set; }

        public EmailTemplatesData? EmailTemplates { get; set; }

        public EmailSettingsData? EmailSettings { get; set; }

        public OrganizationData? Organization { get; set; }

        public ForgotPasswordData? ForgotPassword { get; set; }

        public ResetPasswordData? ResetPassword { get; set; }

        public ChangePasswordData? ChangePassword { get; set; }
    }

    public class JsonLogin
    {
        public string? URL { get; set; }

        public string? UserName { get; set; }

        public string? Password { get; set; }
    }

    public class UserDetails
    {
        public string? FirstName { get; set; }

        public string? EditFirstName { get; set; }

        public string? LastName { get; set; }

        public string? EditLastName { get; set; }

        public string? UserName { get; set; }

        public string? EMail { get; set; }

        public string? Password { get; set; }

        /// <summary>The date of birth to enter, in the dd/MM/yyyy format the picker shows.</summary>
        public string? DateOfBirth { get; set; }

        public string? UserRole { get; set; }
    }

    public class ProductData
    {
        public string? SearchProductName { get; set; }

        public string? TargetProductName { get; set; }

        public string? FilterStatus { get; set; }

        public string? NewStatus { get; set; }

        public string? EditProductName { get; set; }

        public string? EditShortName { get; set; }

        public string? EditSubtitle { get; set; }

        public string? EditLicenseType { get; set; }

        public string? EditNavigationTarget { get; set; }

        public string? EditContactPerson { get; set; }

        public string? EditFeature { get; set; }

        public string? EditDescription { get; set; }

        public string? InvoiceTitle { get; set; }

        public string? InvoiceRemarks { get; set; }

        public List<string>? SubTabs { get; set; }
    }

    public class UserRolesData
    {
        public string? RoleName { get; set; }

        public string? EditRoleName { get; set; }

        public string? Description { get; set; }

        public string? EditDescription { get; set; }

        public string? ExistingRoleSearch { get; set; }

        // A role known to have at least one assigned user, for the Users-count deep-link check -
        // defaults to the signed-in automation account's own role (ExistingRoleSearch) when unset,
        // since that role always has at least itself assigned.
        public string? RoleWithAssignedUsers { get; set; }
    }

    public class UserRightsData
    {
        public string? RoleName { get; set; }

        public string? ModuleName { get; set; }
    }

    public class EmailTemplatesData
    {
        public string? SearchText { get; set; }

        public string? TemplateName { get; set; }

        public string? SubjectSuffix { get; set; }
    }

    public class EmailSettingsData
    {
        public string? DisplayNameSuffix { get; set; }
    }

    public class OrganizationData
    {
        public string? OrgType { get; set; }
        public string? Website { get; set; }
        public string? Status { get; set; }
        public string? ContactPerson { get; set; }
        public string? ContactPhone { get; set; }
        public string? ContactEmail { get; set; }
        public string? Address { get; set; }
        public string? City { get; set; }
        public string? State { get; set; }
        public string? Zip { get; set; }
    }

    public class ForgotPasswordData
    {
        /// <summary>Base URL of the CFR Admin frontend under test, e.g. http://localhost:4011 -
        /// kept separate from Login.URL since these pages are reached without signing in.</summary>
        public string? URL { get; set; }

        /// <summary>
        /// An existing, active, unlocked Acutis staff account's email - used for the successful
        /// submission and already-requested scenarios, and reused by ResetPassword below since
        /// completing a reset changes this same account's password. Must be set to a real
        /// account in whatever database URL's backend points at; never commit a real one here.
        /// </summary>
        public string? ExistingUserEmail { get; set; }

        /// <summary>The password ExistingUserEmail's account currently has - restored once the
        /// Reset Password tests are done changing it.</summary>
        public string? ExistingUserPassword { get; set; }

        /// <summary>A syntactically valid email address that does not match any account.</summary>
        public string? NonExistentEmail { get; set; }

        /// <summary>A value that fails the email format check before any request is sent.</summary>
        public string? InvalidEmailFormat { get; set; }
    }

    public class ResetPasswordData
    {
        /// <summary>A password that satisfies the length/complexity rule, distinct from
        /// ForgotPassword.ExistingUserPassword so the reset is a genuine change.</summary>
        public string? NewPassword { get; set; }

        /// <summary>A password too weak to pass the strength rule.</summary>
        public string? WeakPassword { get; set; }

        /// <summary>A confirm-password value that does not match NewPassword.</summary>
        public string? MismatchedConfirmPassword { get; set; }
    }

    public class ChangePasswordData
    {
        /// <summary>
        /// An incorrect current password, distinct from Login.Password - the signed in
        /// account's real current password (and the value the scenario restores at the end)
        /// comes from Login.Password rather than being repeated here.
        /// </summary>
        public string? WrongCurrentPassword { get; set; }

        /// <summary>A password too weak to pass the strength rule.</summary>
        public string? WeakPassword { get; set; }

        /// <summary>A confirm-password value that does not match NewPassword.</summary>
        public string? MismatchedConfirmPassword { get; set; }

        /// <summary>A strong password to change to, then change back from at the end of the scenario.</summary>
        public string? NewPassword { get; set; }
    }
}