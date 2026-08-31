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

        #endregion GET Methods

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
