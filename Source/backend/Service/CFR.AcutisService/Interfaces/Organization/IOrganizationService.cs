// Copyright (c) OptionC. All rights reserved.

namespace CFR.AcutisService.Interfaces.Organization
{
    /// <summary>
    /// Service contract for Organization operations.
    /// Acts as the business-logic layer between OrganizationController and IOrganizationRepository.
    /// Responsibility:
    /// - Declares methods to fetch and update organizations.
    /// - Relies on IOrganizationRepository for stored procedure execution and ICurrentUserService for audit identity.
    /// </summary>
    public interface IOrganizationService
    {
        #region GET Methods

        /// <summary>
        /// Retrieves all organizations.
        /// </summary>
        /// <remarks>
        /// Purpose: Fetch the organization list for the admin directory.
        /// Request Flow: OrganizationController -> IOrganizationService.GetOrganizationsListAsync() -> IOrganizationRepository.GetOrganizationsListAsync().
        /// Validation Details: Service checks for an empty or null result set.
        /// Business Logic: Wraps the typed list in MSResultArgs.
        /// Repository Interaction: Calls IOrganizationRepository.GetOrganizationsListAsync().
        /// Response Details: MSResultArgs containing List of OrganizationOutput, or NoRecordFound.
        /// </remarks>
        /// <returns>MSResultArgs containing the organization list.</returns>
        Task<MSResultArgs> GetOrganizationsListAsync();

        /// <summary>
        /// Retrieves every non-deleted diocese.
        /// </summary>
        /// <remarks>
        /// Purpose: Populate the Diocese dropdown on the Organizations page.
        /// Request Flow: OrganizationController -> IOrganizationService.GetDiocesesListAsync() -> IOrganizationRepository.GetDiocesesListAsync().
        /// Validation Details: Service checks for an empty or null result set.
        /// Business Logic: Wraps the typed list in MSResultArgs.
        /// Repository Interaction: Calls IOrganizationRepository.GetDiocesesListAsync().
        /// Response Details: MSResultArgs containing List of DioceseOutput, or NoRecordFound.
        /// </remarks>
        /// <returns>MSResultArgs containing the diocese list.</returns>
        Task<MSResultArgs> GetDiocesesListAsync();

        /// <summary>
        /// Retrieves one organization by identifier.
        /// </summary>
        /// <remarks>
        /// Purpose: Fetch an organization for the edit form.
        /// Request Flow: OrganizationController -> IOrganizationService.GetOrganizationByIdAsync() -> IOrganizationRepository.GetOrganizationByIdAsync().
        /// Validation Details: Identifier must be a positive integer.
        /// Business Logic: Wraps the typed record in MSResultArgs.
        /// Repository Interaction: Calls IOrganizationRepository.GetOrganizationByIdAsync().
        /// Response Details: MSResultArgs containing OrganizationOutput, or NoRecordFound.
        /// </remarks>
        /// <param name="orgId">Organization identifier.</param>
        /// <returns>MSResultArgs containing the organization.</returns>
        Task<MSResultArgs> GetOrganizationByIdAsync(long orgId);

        /// <summary>
        /// Retrieves the real users linked to an organization.
        /// </summary>
        /// <remarks>
        /// Purpose: Populate the Users section of the organization detail page.
        /// Request Flow: OrganizationController -> IOrganizationService.GetOrganizationUsersAsync() -> IOrganizationRepository.GetOrganizationUsersAsync().
        /// Validation Details: Identifier must be a positive integer.
        /// Business Logic: Wraps the typed list in MSResultArgs.
        /// Repository Interaction: Calls IOrganizationRepository.GetOrganizationUsersAsync().
        /// Response Details: MSResultArgs containing List of OrganizationUserOutput, or NoRecordFound.
        /// </remarks>
        /// <param name="orgId">Organization identifier.</param>
        /// <returns>MSResultArgs containing the linked users.</returns>
        Task<MSResultArgs> GetOrganizationUsersAsync(long orgId);

        /// <summary>
        /// Retrieves one member's organization-membership detail plus their effective app access.
        /// </summary>
        /// <remarks>
        /// Purpose: Populate the Organization Users tab's user-detail view.
        /// Request Flow: OrganizationController -> IOrganizationService.GetOrganizationUserDetailAsync() -> IOrganizationRepository.GetOrganizationUserDetailAsync().
        /// Validation Details: OrgId and AuthUserId must be positive.
        /// Business Logic: Wraps the typed record in MSResultArgs.
        /// Repository Interaction: Calls IOrganizationRepository.GetOrganizationUserDetailAsync().
        /// Response Details: MSResultArgs containing OrganizationUserDetailOutput, or NoRecordFound.
        /// </remarks>
        /// <param name="orgId">Organization identifier.</param>
        /// <param name="authUserId">Member identifier.</param>
        /// <returns>MSResultArgs containing the membership detail.</returns>
        Task<MSResultArgs> GetOrganizationUserDetailAsync(long orgId, long authUserId);

        /// <summary>
        /// Retrieves the real products assigned to an organization.
        /// </summary>
        /// <remarks>
        /// Purpose: Populate the Products section of the organization detail page.
        /// Request Flow: OrganizationController -> IOrganizationService.GetOrganizationProductsAsync() -> IOrganizationRepository.GetOrganizationProductsAsync().
        /// Validation Details: Identifier must be a positive integer.
        /// Business Logic: Wraps the typed list in MSResultArgs.
        /// Repository Interaction: Calls IOrganizationRepository.GetOrganizationProductsAsync().
        /// Response Details: MSResultArgs containing List of OrganizationProductOutput, or NoRecordFound.
        /// </remarks>
        /// <param name="orgId">Organization identifier.</param>
        /// <returns>MSResultArgs containing the assigned products.</returns>
        Task<MSResultArgs> GetOrganizationProductsAsync(long orgId);

        /// <summary>
        /// Retrieves the products not yet assigned to an organization.
        /// </summary>
        /// <remarks>
        /// Purpose: Populate the assign-product dropdown on the Products tab.
        /// Request Flow: OrganizationController -> IOrganizationService.GetAssignableProductsAsync() -> IOrganizationRepository.GetAssignableProductsAsync().
        /// Validation Details: Identifier must be a positive integer.
        /// Business Logic: Wraps the typed list in MSResultArgs.
        /// Repository Interaction: Calls IOrganizationRepository.GetAssignableProductsAsync().
        /// Response Details: MSResultArgs containing List of ProductLookupOutput, or NoRecordFound.
        /// </remarks>
        /// <param name="orgId">Organization identifier.</param>
        /// <returns>MSResultArgs containing the assignable products.</returns>
        Task<MSResultArgs> GetAssignableProductsAsync(long orgId);

        /// <summary>
        /// Retrieves the real licenses issued against an organization's assigned products.
        /// </summary>
        /// <remarks>
        /// Purpose: Populate the Licenses section of the organization detail page.
        /// Request Flow: OrganizationController -> IOrganizationService.GetOrganizationLicensesAsync() -> IOrganizationRepository.GetOrganizationLicensesAsync().
        /// Validation Details: Identifier must be a positive integer.
        /// Business Logic: Wraps the typed list in MSResultArgs.
        /// Repository Interaction: Calls IOrganizationRepository.GetOrganizationLicensesAsync().
        /// Response Details: MSResultArgs containing List of OrganizationLicenseOutput, or NoRecordFound.
        /// </remarks>
        /// <param name="orgId">Organization identifier.</param>
        /// <returns>MSResultArgs containing the licenses issued against the organization's products.</returns>
        Task<MSResultArgs> GetOrganizationLicensesAsync(long orgId);

        /// <summary>
        /// Retrieves every license issued across all organizations.
        /// </summary>
        /// <remarks>
        /// Purpose: Populate the admin dashboard's platform-wide "Licenses" KPI.
        /// Request Flow: OrganizationController -> IOrganizationService.GetAllLicensesAsync() -> IOrganizationRepository.GetAllLicensesAsync().
        /// Validation Details: None.
        /// Business Logic: Wraps the typed list in MSResultArgs.
        /// Repository Interaction: Calls IOrganizationRepository.GetAllLicensesAsync().
        /// Response Details: MSResultArgs containing List of LicenseSummaryOutput, or NoRecordFound.
        /// </remarks>
        /// <returns>MSResultArgs containing the licenses issued across all organizations.</returns>
        Task<MSResultArgs> GetAllLicensesAsync();

        #endregion GET Methods

        #region POST Methods

        /// <summary>
        /// Creates a new organization.
        /// </summary>
        /// <remarks>
        /// Purpose: Add a new organization from the Add Organization page.
        /// Request Flow: OrganizationController -> IOrganizationService.CreateOrganizationAsync() -> IOrganizationRepository.CreateOrganizationAsync().
        /// Validation Details: Input DTO is required; OrgName and OrgStatus must not be empty.
        /// Business Logic: Passes the signed-in user id as InsertedBy and wraps the scalar result.
        /// Repository Interaction: Calls IOrganizationRepository.CreateOrganizationAsync().
        /// Response Details: MSResultArgs containing the new organization identifier.
        /// </remarks>
        /// <param name="input">Input DTO containing the new organization's fields.</param>
        /// <returns>MSResultArgs containing the create status.</returns>
        Task<MSResultArgs> CreateOrganizationAsync(CreateOrganizationInput input);

        /// <summary>
        /// Assigns a product to an organization.
        /// </summary>
        /// <remarks>
        /// Purpose: Give an organization access to a product from the Products tab.
        /// Request Flow: OrganizationController -> IOrganizationService.AssignOrganizationProductAsync() -> IOrganizationRepository.AssignOrganizationProductAsync().
        /// Validation Details: Input DTO is required; OrgId and ProductId must be positive.
        /// Business Logic: Passes the signed-in user id as UpdatedBy; -98 from the repository means already assigned.
        /// Repository Interaction: Calls IOrganizationRepository.AssignOrganizationProductAsync().
        /// Response Details: MSResultArgs containing the product identifier, or a conflict status when already assigned.
        /// </remarks>
        /// <param name="input">Input DTO containing the organization and product identifiers.</param>
        /// <returns>MSResultArgs containing the assign status.</returns>
        Task<MSResultArgs> AssignOrganizationProductAsync(AssignOrganizationProductInput input);

        #endregion POST Methods

        #region DELETE Methods

        /// <summary>
        /// Removes a product assignment from an organization.
        /// </summary>
        /// <remarks>
        /// Purpose: Revoke an organization's access to a product from the Products tab.
        /// Request Flow: OrganizationController -> IOrganizationService.RemoveOrganizationProductAsync() -> IOrganizationRepository.RemoveOrganizationProductAsync().
        /// Validation Details: OrgId and ProductId must be positive.
        /// Business Logic: Passes the signed-in user id as UpdatedBy; -99 from the repository means not assigned.
        /// Repository Interaction: Calls IOrganizationRepository.RemoveOrganizationProductAsync().
        /// Response Details: MSResultArgs containing the product identifier, or NoRecordFound when not assigned.
        /// </remarks>
        /// <param name="orgId">Organization identifier.</param>
        /// <param name="productId">Product identifier to remove.</param>
        /// <returns>MSResultArgs containing the remove status.</returns>
        Task<MSResultArgs> RemoveOrganizationProductAsync(long orgId, int productId);

        /// <summary>
        /// Unlinks a user from an organization.
        /// </summary>
        /// <remarks>
        /// Purpose: Remove a user from an organization from the Users tab.
        /// Request Flow: OrganizationController -> IOrganizationService.UnlinkOrganizationUserAsync() -> IOrganizationRepository.UnlinkOrganizationUserAsync().
        /// Validation Details: OrgId and AuthUserId must be positive.
        /// Business Logic: Passes the signed-in user id as UpdatedBy; -99 from the repository means not linked.
        /// Repository Interaction: Calls IOrganizationRepository.UnlinkOrganizationUserAsync().
        /// Response Details: MSResultArgs containing the user identifier, or NoRecordFound when not linked.
        /// </remarks>
        /// <param name="orgId">Organization identifier.</param>
        /// <param name="authUserId">User identifier to unlink.</param>
        /// <returns>MSResultArgs containing the unlink status.</returns>
        Task<MSResultArgs> UnlinkOrganizationUserAsync(long orgId, long authUserId);

        #endregion DELETE Methods

        #region PUT Methods

        /// <summary>
        /// Updates an organization's name, status, and contact email.
        /// </summary>
        /// <remarks>
        /// Purpose: Save changes to an organization's core identity fields.
        /// Request Flow: OrganizationController -> IOrganizationService.UpdateOrganizationAsync() -> IOrganizationRepository.UpdateOrganizationAsync().
        /// Validation Details: Input DTO is required; OrgName and OrgStatus must not be empty.
        /// Business Logic: Passes the signed-in user id as UpdatedBy and wraps the scalar result.
        /// Repository Interaction: Calls IOrganizationRepository.UpdateOrganizationAsync().
        /// Response Details: MSResultArgs containing the organization identifier, or NoRecordFound.
        /// </remarks>
        /// <param name="input">Input DTO containing the organization fields.</param>
        /// <returns>MSResultArgs containing the update status.</returns>
        Task<MSResultArgs> UpdateOrganizationAsync(UpdateOrganizationInput input);

        #endregion PUT Methods
    }
}
