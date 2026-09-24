// Copyright (c) OptionC. All rights reserved.

namespace CFR.DataSyncService.Interfaces.OrganizationSync
{
    /// <summary>
    /// Service contract for organization onboarding.
    /// Acts as the business-logic layer between OrganizationsController and IOrganizationSyncRepository.
    /// Responsibility:
    /// - Validates input and translates stored-procedure results into MSResultArgs. ProductId is
    ///   never bound from the request body; it is always resolved from the authenticated ApiClient.
    /// </summary>
    public interface IOrganizationSyncService
    {
        #region POST Methods

        /// <summary>
        /// Creates or updates an organization onboarding row.
        /// </summary>
        /// <remarks>
        /// Purpose: The one deliberate, explicit way a product may create a CFR organization.
        /// Request Flow: OrganizationsController -> IOrganizationSyncService.UpsertOrganizationAsync() -> IOrganizationSyncRepository.UpsertOrganizationAsync().
        /// Validation Details: Required fields (ProductOrgId, OrgName).
        /// Business Logic: Delegates to the repository and maps the result to MSResultArgs.
        /// Repository Interaction: Calls IOrganizationSyncRepository.UpsertOrganizationAsync().
        /// Response Details: MSResultArgs containing OrganizationSyncOutput, or a validation error.
        /// </remarks>
        /// <param name="input">Input DTO containing the organization fields.</param>
        /// <param name="traceId">W3C trace id.</param>
        /// <returns>MSResultArgs containing the onboarded organization, or an error.</returns>
        Task<MSResultArgs> UpsertOrganizationAsync(OrganizationSyncInput input, string traceId);

        #endregion POST Methods

        #region GET Methods

        /// <summary>
        /// Reads back an onboarded organization.
        /// </summary>
        /// <remarks>
        /// Purpose: Let a product confirm the current CFR organization for its own org id.
        /// Request Flow: OrganizationsController -> IOrganizationSyncService.GetOrganizationAsync() -> IOrganizationSyncRepository.GetOrganizationAsync().
        /// Validation Details: productOrgId is required.
        /// Business Logic: Maps the repository result to MSResultArgs.
        /// Repository Interaction: Calls IOrganizationSyncRepository.GetOrganizationAsync().
        /// Response Details: MSResultArgs containing the organization, or NotFound.
        /// </remarks>
        /// <param name="productOrgId">The product's own organization identifier.</param>
        /// <param name="traceId">W3C trace id.</param>
        /// <returns>MSResultArgs containing the organization, or an error.</returns>
        Task<MSResultArgs> GetOrganizationAsync(int productOrgId, string traceId);

        #endregion GET Methods
    }
}
