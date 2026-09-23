// Copyright (c) OptionC. All rights reserved.

namespace CFR.AcutisInfrastructure
{
    /// <summary>
    /// SQL parameter name constants used with Dapper DynamicParameters.
    /// </summary>
    public static class DBParameterName
    {
        /// <summary>
        /// Parameters for Acutis authentication stored procedures.
        /// </summary>
        public static class AcutisAuthParams
        {
            /// <summary>
            /// CRUD action identifier (password reset stored procedure only).
            /// </summary>
            public const string ActionId = nameof(ActionId);

            /// <summary>
            /// Login email address.
            /// </summary>
            public const string Email = nameof(Email);

            /// <summary>
            /// Plain-text password verified with dbo.DecryptUserPassword.
            /// </summary>
            public const string Password = nameof(Password);

            /// <summary>
            /// SHA-256 hash of a password reset token; the raw token is never persisted.
            /// </summary>
            public const string TokenHash = nameof(TokenHash);

            /// <summary>
            /// UTC expiry timestamp for a password reset token.
            /// </summary>
            public const string ExpiresAtUtc = nameof(ExpiresAtUtc);

            /// <summary>
            /// Plain-text new password; SQL encrypts it with dbo.EncryptUserPassword.
            /// </summary>
            public const string NewPassword = nameof(NewPassword);

            /// <summary>
            /// Stored procedure output / return value.
            /// </summary>
            public const string ReturnValue = nameof(ReturnValue);
        }

        /// <summary>
        /// Parameters for Administration user stored procedures.
        /// </summary>
        public static class AdministrationParams
        {
            /// <summary>
            /// CRUD action identifier.
            /// </summary>
            public const string ActionId = nameof(ActionId);

            /// <summary>
            /// User identifier.
            /// </summary>
            public const string UserId = nameof(UserId);

            /// <summary>
            /// User first name.
            /// </summary>
            public const string FirstName = nameof(FirstName);

            /// <summary>
            /// User last name.
            /// </summary>
            public const string LastName = nameof(LastName);

            /// <summary>
            /// User email address.
            /// </summary>
            public const string Email = nameof(Email);

            /// <summary>
            /// Plain-text password encrypted in SQL with dbo.EncryptUserPassword.
            /// </summary>
            public const string Password = nameof(Password);

            /// <summary>
            /// Organization identifier.
            /// </summary>
            public const string OrganizationId = nameof(OrganizationId);

            /// <summary>
            /// Role identifier.
            /// </summary>
            public const string RoleId = nameof(RoleId);

            /// <summary>
            /// Active flag: 1 = active, 0 = inactive.
            /// </summary>
            public const string IsActive = nameof(IsActive);

            /// <summary>
            /// Locked flag: 1 = locked, 0 = unlocked.
            /// </summary>
            public const string IsLocked = nameof(IsLocked);

            /// <summary>
            /// Date of birth.
            /// </summary>
            public const string DateOfBirth = nameof(DateOfBirth);

            /// <summary>
            /// User contact/phone number.
            /// </summary>
            public const string ContactNumber = nameof(ContactNumber);

            /// <summary>
            /// User status value.
            /// </summary>
            public const string Status = nameof(Status);

            /// <summary>
            /// Stored procedure output / return value.
            /// </summary>
            public const string ReturnValue = nameof(ReturnValue);

            /// <summary>
            /// Role display name.
            /// </summary>
            public const string RoleName = nameof(RoleName);

            /// <summary>
            /// Role description.
            /// </summary>
            public const string Description = nameof(Description);

            /// <summary>
            /// Logged-in user who created the row (ICurrentUserService.UserId).
            /// </summary>
            public const string InsertedBy = nameof(InsertedBy);

            /// <summary>
            /// Logged-in user who last updated the row (ICurrentUserService.UserId).
            /// </summary>
            public const string UpdatedBy = nameof(UpdatedBy);

            /// <summary>
            /// Organization identifier used to scope the CFR Users list; null or 0 returns every organization.
            /// </summary>
            public const string OrgId = nameof(OrgId);

            /// <summary>
            /// auth.ModuleFeatures.RoutingUrl of the admin page a feature-access check is for.
            /// </summary>
            public const string RoutingUrl = nameof(RoutingUrl);

            /// <summary>
            /// auth.ModuleRights.AccessRight for the checked (RoleId, feature) pair: 0 = Denied, 1 = Access, 2 = Read Only.
            /// </summary>
            public const string AccessRight = nameof(AccessRight);
        }

        /// <summary>
        /// Parameters for Email Templates stored procedures.
        /// </summary>
        public static class EmailTemplateParams
        {
            /// <summary>
            /// CRUD action identifier.
            /// </summary>
            public const string ActionId = nameof(ActionId);

            /// <summary>
            /// Email template identifier.
            /// </summary>
            public const string TemplateId = nameof(TemplateId);

            /// <summary>
            /// Stable code used to look up a template at send time (e.g. "PasswordReset").
            /// </summary>
            public const string TemplateCode = nameof(TemplateCode);

            /// <summary>
            /// Email subject line, may contain [placeholder] merge tags.
            /// </summary>
            public const string Subject = nameof(Subject);

            /// <summary>
            /// Email body, may contain [placeholder] merge tags.
            /// </summary>
            public const string Body = nameof(Body);

            /// <summary>
            /// Template status value ("active" / "inactive").
            /// </summary>
            public const string Status = nameof(Status);

            /// <summary>
            /// Minutes the template's own link (e.g. a password reset link) stays valid before
            /// expiring — admin-configurable per template; NULL for templates with no such link.
            /// </summary>
            public const string LinkExpiryMinutes = nameof(LinkExpiryMinutes);

            /// <summary>
            /// Logged-in user who last updated the row (ICurrentUserService.UserId).
            /// </summary>
            public const string UpdatedBy = nameof(UpdatedBy);

            /// <summary>
            /// Stored procedure output / return value.
            /// </summary>
            public const string ReturnValue = nameof(ReturnValue);
        }

        /// <summary>
        /// Parameters for self-service profile / change-password stored procedures.
        /// </summary>
        public static class ProfileParams
        {
            /// <summary>
            /// CRUD action identifier.
            /// </summary>
            public const string ActionId = nameof(ActionId);

            /// <summary>
            /// Signed-in user identifier, from ICurrentUserService.UserId.
            /// </summary>
            public const string UserId = nameof(UserId);

            /// <summary>
            /// User first name.
            /// </summary>
            public const string FirstName = nameof(FirstName);

            /// <summary>
            /// User last name.
            /// </summary>
            public const string LastName = nameof(LastName);

            /// <summary>
            /// User email address.
            /// </summary>
            public const string Email = nameof(Email);

            /// <summary>
            /// Relative URL of the user's uploaded profile image (e.g. /uploads/profile/{fileName}).
            /// </summary>
            public const string ProfileImageUrl = nameof(ProfileImageUrl);

            /// <summary>
            /// User contact/phone number.
            /// </summary>
            public const string ContactNumber = nameof(ContactNumber);

            /// <summary>
            /// Current plain-text password, verified with dbo.DecryptUserPassword.
            /// </summary>
            public const string CurrentPassword = nameof(CurrentPassword);

            /// <summary>
            /// New plain-text password; SQL encrypts it with dbo.EncryptUserPassword.
            /// </summary>
            public const string NewPassword = nameof(NewPassword);

            /// <summary>
            /// Stored procedure output / return value.
            /// </summary>
            public const string ReturnValue = nameof(ReturnValue);
        }

        /// <summary>
        /// Parameters for Organization stored procedures.
        /// </summary>
        public static class OrganizationParams
        {
            /// <summary>
            /// CRUD action identifier.
            /// </summary>
            public const string ActionId = nameof(ActionId);

            /// <summary>
            /// Organization identifier.
            /// </summary>
            public const string OrgId = nameof(OrgId);

            /// <summary>
            /// Organization display name.
            /// </summary>
            public const string OrgName = nameof(OrgName);

            /// <summary>
            /// Organization status value.
            /// </summary>
            public const string OrgStatus = nameof(OrgStatus);

            /// <summary>
            /// Organization type (e.g. Parish, Diocese, School, Nonprofit, Business, Other).
            /// </summary>
            public const string OrgType = nameof(OrgType);

            /// <summary>
            /// Organization contact email address.
            /// </summary>
            public const string ContactEmail = nameof(ContactEmail);

            /// <summary>
            /// Organization website URL.
            /// </summary>
            public const string Website = nameof(Website);

            /// <summary>
            /// Primary contact person's name.
            /// </summary>
            public const string ContactPerson = nameof(ContactPerson);

            /// <summary>
            /// Primary contact phone number.
            /// </summary>
            public const string ContactPhone = nameof(ContactPhone);

            /// <summary>
            /// Street address.
            /// </summary>
            public const string Address = nameof(Address);

            /// <summary>
            /// City.
            /// </summary>
            public const string City = nameof(City);

            /// <summary>
            /// State or province.
            /// </summary>
            public const string State = nameof(State);

            /// <summary>
            /// ZIP or postal code.
            /// </summary>
            public const string Zip = nameof(Zip);

            /// <summary>
            /// Diocese identifier (core.Diocese.DioceseId), the organization's parent diocese.
            /// </summary>
            public const string DioceseId = nameof(DioceseId);

            /// <summary>
            /// Logged-in user who last updated the row (ICurrentUserService.UserId).
            /// </summary>
            public const string UpdatedBy = nameof(UpdatedBy);

            /// <summary>
            /// Product identifier, used when assigning/removing a product for an organization.
            /// </summary>
            public const string ProductId = nameof(ProductId);

            /// <summary>
            /// User identifier (auth.User.CFRUserId), used when linking/unlinking a user for an organization.
            /// </summary>
            public const string AuthUserId = nameof(AuthUserId);

            /// <summary>
            /// Stored procedure output / return value.
            /// </summary>
            public const string ReturnValue = nameof(ReturnValue);
        }

        /// <summary>
        /// Parameters for Access Request stored procedures.
        /// </summary>
        public static class AccessRequestParams
        {
            /// <summary>
            /// CRUD action identifier.
            /// </summary>
            public const string ActionId = nameof(ActionId);

            /// <summary>
            /// Access request identifier.
            /// </summary>
            public const string AccessRequestId = nameof(AccessRequestId);

            /// <summary>
            /// Identifies one product line on a (possibly multi-product) access request -
            /// [request].[AccessRequestProduct].[AccessRequestProductId]. Optional on ActionId 2/3:
            /// when omitted, ActionId 2 falls back to the request's first still-pending line and
            /// ActionId 3 returns every line.
            /// </summary>
            public const string AccessRequestProductId = nameof(AccessRequestProductId);

            /// <summary>
            /// Stored procedure output: the AccessRequestProductId ActionId 2 actually acted on
            /// (echoes the input when given, or reports which line the fallback resolved to).
            /// </summary>
            public const string ResolvedAccessRequestProductId = nameof(ResolvedAccessRequestProductId);

            /// <summary>
            /// core.Product.ProductId when the client sends a numeric identifier.
            /// </summary>
            public const string ProductId = nameof(ProductId);

            /// <summary>
            /// Product display name used to resolve core.Product when ProductId is not numeric.
            /// </summary>
            public const string ProductName = nameof(ProductName);

            /// <summary>
            /// Requester email used to resolve [auth].[User].CFRUserId.
            /// </summary>
            public const string RequesterEmail = nameof(RequesterEmail);

            /// <summary>
            /// Optional comment on submit.
            /// </summary>
            public const string Comment = nameof(Comment);

            /// <summary>
            /// Requester first name from the public Request Access form.
            /// </summary>
            public const string FirstName = nameof(FirstName);

            /// <summary>
            /// Requester last name from the public Request Access form.
            /// </summary>
            public const string LastName = nameof(LastName);

            /// <summary>
            /// Organization type from the public Request Access form.
            /// </summary>
            public const string OrganizationType = nameof(OrganizationType);

            /// <summary>
            /// Organization name from the public Request Access form.
            /// </summary>
            public const string OrganizationName = nameof(OrganizationName);

            /// <summary>
            /// Organization street address.
            /// </summary>
            public const string Address = nameof(Address);

            /// <summary>
            /// Organization city.
            /// </summary>
            public const string City = nameof(City);

            /// <summary>
            /// Organization state.
            /// </summary>
            public const string State = nameof(State);

            /// <summary>
            /// Organization ZIP / postal code.
            /// </summary>
            public const string Zip = nameof(Zip);

            /// <summary>
            /// Requester phone number.
            /// </summary>
            public const string Phone = nameof(Phone);

            /// <summary>
            /// JSON array of selected products for a public Request Access submit.
            /// </summary>
            public const string ProductsJson = nameof(ProductsJson);

            /// <summary>
            /// Request status value.
            /// </summary>
            public const string Status = nameof(Status);

            /// <summary>
            /// Optional reviewer note.
            /// </summary>
            public const string Note = nameof(Note);

            /// <summary>
            /// [core].[Organization].[OrgId] created for the request, or the SMS-issued org id (context-dependent).
            /// </summary>
            public const string OrgId = nameof(OrgId);

            /// <summary>
            /// [request].[AccessRequest].[OrgId] / [core].[Organization].[OrgId] resolved for the SMS org-setup call.
            /// </summary>
            public const string CFROrgId = nameof(CFROrgId);

            /// <summary>
            /// Organization name staged on the request, used to create/update [core].[Organization] and [lic].[OrganizationProduct].
            /// </summary>
            public const string OrgName = nameof(OrgName);

            /// <summary>
            /// Organization state staged on the request, used to create/update [core].[Organization] and [lic].[OrganizationProduct].
            /// </summary>
            public const string OrgState = nameof(OrgState);

            /// <summary>
            /// Contact email staged on the request, used to create/update [core].[Organization] and [lic].[OrganizationProduct].
            /// </summary>
            public const string ContactEmail = nameof(ContactEmail);

            /// <summary>
            /// Contact person name (first + last), used to create/update [core].[Organization] and [lic].[OrganizationProduct].
            /// </summary>
            public const string ContactPerson = nameof(ContactPerson);

            /// <summary>
            /// Contact phone staged on the request, used to create/update [core].[Organization] and [lic].[OrganizationProduct].
            /// </summary>
            public const string ContactPhone = nameof(ContactPhone);

            /// <summary>
            /// SMS-issued organization identifier written to [lic].[OrganizationProduct].[ProductOrgId].
            /// </summary>
            public const string ProductOrgId = nameof(ProductOrgId);

            /// <summary>
            /// [lic].[OrganizationProduct].[OrganizationProductId] of an existing org/product assignment row.
            /// </summary>
            public const string OrganizationProductId = nameof(OrganizationProductId);

            /// <summary>
            /// Logged-in user who created the row (ICurrentUserService.UserId).
            /// </summary>
            public const string InsertedBy = nameof(InsertedBy);

            /// <summary>
            /// Logged-in user who last updated the row (ICurrentUserService.UserId).
            /// </summary>
            public const string UpdatedBy = nameof(UpdatedBy);

            /// <summary>
            /// Stored procedure output / return value.
            /// </summary>
            public const string ReturnValue = nameof(ReturnValue);
        }

        /// <summary>
        /// Parameters for Products stored procedures and queries.
        /// </summary>
        public static class ProductParams
        {
            /// <summary>
            /// CRUD action identifier for stored procedure operations.
            /// </summary>
            public const string ActionId = nameof(ActionId);

            /// <summary>
            /// Product identifier.
            /// </summary>
            public const string ProductId = nameof(ProductId);

            /// <summary>
            /// Full product name.
            /// </summary>
            public const string ProductName = nameof(ProductName);

            /// <summary>
            /// Short product name.
            /// </summary>
            public const string ShortName = nameof(ShortName);

            /// <summary>
            /// Sub-category or subtitle name.
            /// </summary>
            public const string SubCategoryName = nameof(SubCategoryName);

            /// <summary>
            /// Product description.
            /// </summary>
            public const string ProdDescription = nameof(ProdDescription);

            /// <summary>
            /// External application or website URL.
            /// </summary>
            public const string ExternalPageUrl = nameof(ExternalPageUrl);

            /// <summary>
            /// File name or relative path to the product logo image.
            /// </summary>
            public const string LogoName = nameof(LogoName);

            /// <summary>
            /// Contact [auth].[AcutisUser] identifier. Null leaves the stored value unchanged; 0 clears it.
            /// </summary>
            public const string ContactUserId = nameof(ContactUserId);

            /// <summary>
            /// Pipe-delimited list of product features.
            /// </summary>
            public const string Features = nameof(Features);

            /// <summary>
            /// Active status flag: 1 = active, 0 = inactive.
            /// </summary>
            public const string IsActive = nameof(IsActive);

            /// <summary>
            /// Product status flag: 1 = Active, 2 = Coming Soon, 3 = Inactive.
            /// </summary>
            public const string ProductStatus = nameof(ProductStatus);

            /// <summary>
            /// Navigation target for launching the product: same-tab or new-tab.
            /// </summary>
            public const string NavigationTarget = nameof(NavigationTarget);

            /// <summary>
            /// License identifier.
            /// </summary>
            public const string LicenseId = nameof(LicenseId);

            /// <summary>
            /// Organization product link identifier.
            /// </summary>
            public const string OrganizationProductId = nameof(OrganizationProductId);

            /// <summary>
            /// Organization identifier.
            /// </summary>
            public const string OrgId = nameof(OrgId);

            /// <summary>
            /// License type (e.g. licensed, trial, subscription).
            /// </summary>
            public const string LicenseType = nameof(LicenseType);

            /// <summary>
            /// License activation date.
            /// </summary>
            public const string ActivationDate = nameof(ActivationDate);

            /// <summary>
            /// License expiration date.
            /// </summary>
            public const string ExpiryDate = nameof(ExpiryDate);

            /// <summary>
            /// License status.
            /// </summary>
            public const string LicenseStatus = nameof(LicenseStatus);

            /// <summary>
            /// Assignment status on OrganizationProduct.
            /// </summary>
            public const string AssignStatus = nameof(AssignStatus);

            /// <summary>
            /// License remarks or notes.
            /// </summary>
            public const string Remarks = nameof(Remarks);

            /// <summary>
            /// Logged-in user who inserted the row (ICurrentUserService.UserId).
            /// </summary>
            public const string InsertedBy = nameof(InsertedBy);

            /// <summary>
            /// Logged-in user who updated the row (ICurrentUserService.UserId).
            /// </summary>
            public const string UpdatedBy = nameof(UpdatedBy);

            /// <summary>
            /// Output return value from the stored procedure.
            /// </summary>
            public const string ReturnValue = nameof(ReturnValue);

            /// <summary>
            /// [core].[ProductEnvironment].EnvironmentName matching appsettings Environment (Development, Pilot, Staging, Live).
            /// </summary>
            public const string EnvironmentName = nameof(EnvironmentName);
        }

        /// <summary>
        /// Parameters for the Dashboard summary stored procedure.
        /// </summary>
        public static class DashboardParams
        {
            /// <summary>
            /// CRUD action identifier.
            /// </summary>
            public const string ActionId = nameof(ActionId);

            /// <summary>
            /// Inclusive start of the trend-events date range (UTC).
            /// </summary>
            public const string StartDate = nameof(StartDate);

            /// <summary>
            /// Inclusive end of the trend-events date range (UTC).
            /// </summary>
            public const string EndDate = nameof(EndDate);

            /// <summary>
            /// Identifies which entitlement-integrity check to drill into for ActionId 2 — one of
            /// DashboardIntegrityApiItem's field names (e.g. "activeOrganizationProductsWithoutMembers").
            /// </summary>
            public const string IssueKey = nameof(IssueKey);
        }

        /// <summary>
        /// Parameters for the public "Suggest a product" request/approval stored procedure.
        /// </summary>
        public static class ProductRequestParams
        {
            /// <summary>
            /// CRUD action identifier.
            /// </summary>
            public const string ActionId = nameof(ActionId);

            /// <summary>
            /// Product request identifier.
            /// </summary>
            public const string ProductRequestId = nameof(ProductRequestId);

            /// <summary>
            /// Proposed product name.
            /// </summary>
            public const string ProductName = nameof(ProductName);

            /// <summary>
            /// Proposed product short name.
            /// </summary>
            public const string ShortName = nameof(ShortName);

            /// <summary>
            /// Proposed product category / subtitle.
            /// </summary>
            public const string SubCategoryName = nameof(SubCategoryName);

            /// <summary>
            /// Proposed product description.
            /// </summary>
            public const string ProdDescription = nameof(ProdDescription);

            /// <summary>
            /// Proposed product production / external URL.
            /// </summary>
            public const string ExternalPageUrl = nameof(ExternalPageUrl);

            /// <summary>
            /// Proposed navigation target: same-tab or new-tab.
            /// </summary>
            public const string NavigationTarget = nameof(NavigationTarget);

            /// <summary>
            /// Pipe-delimited list of proposed product features.
            /// </summary>
            public const string Features = nameof(Features);

            /// <summary>
            /// Name of the person submitting the request.
            /// </summary>
            public const string RequesterName = nameof(RequesterName);

            /// <summary>
            /// Email of the person submitting the request.
            /// </summary>
            public const string RequesterEmail = nameof(RequesterEmail);

            /// <summary>
            /// Optional organization name supplied by the requester.
            /// </summary>
            public const string OrganizationName = nameof(OrganizationName);

            /// <summary>
            /// Request status filter for the list query: 1=pending, 2=approved, 3=rejected, NULL=all.
            /// </summary>
            public const string RequestStatus = nameof(RequestStatus);

            /// <summary>
            /// Reviewer's decision remarks on approve or reject.
            /// </summary>
            public const string DecisionRemarks = nameof(DecisionRemarks);

            /// <summary>
            /// ActionId 6 only: [auth].[AcutisUser].[UserId] to notify (input, unused - the stored
            /// procedure resolves this from [request].[ProductRequestSettings] instead). ActionId 7:
            /// the value to save into that table.
            /// </summary>
            public const string NotifyUserId = nameof(NotifyUserId);

            /// <summary>
            /// ActionId 4 only: generated by the caller and saved onto the new [core].[Product] row.
            /// </summary>
            public const string SecurityKey = nameof(SecurityKey);

            /// <summary>
            /// Logged-in user who created the row (ICurrentUserService.UserId). NULL for anonymous public submissions.
            /// </summary>
            public const string InsertedBy = nameof(InsertedBy);

            /// <summary>
            /// Logged-in user who reviewed (approved/rejected) the row (ICurrentUserService.UserId).
            /// </summary>
            public const string UpdatedBy = nameof(UpdatedBy);

            /// <summary>
            /// Stored procedure output / return value.
            /// </summary>
            public const string ReturnValue = nameof(ReturnValue);
        }

        public static class UserRightParams
        {
            public const string RoleId = nameof(RoleId);
            /// <summary>
            /// Binds to both auth.GetRightByRoleId's `@ParentID` (-1 = full tree, 0 = top-level
            /// modules only, a FeatureID = that module's subtree) and auth.SaveUserRights'
            /// `@ParentId` (0 = also cascade a parent's new AccessRight to its direct children).
            /// SQL Server matches parameter names case-insensitively, so one constant covers both
            /// procedures' differently-cased parameter.
            /// </summary>
            public const string ParentId = nameof(ParentId);
            public const string AccessRights = nameof(AccessRights);
            public const string FeatureIds = nameof(FeatureIds);
        }
    }
}