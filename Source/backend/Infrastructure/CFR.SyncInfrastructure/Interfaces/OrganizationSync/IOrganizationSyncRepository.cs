// Copyright (c) OptionC. All rights reserved.

namespace CFR.SyncInfrastructure.Interfaces.OrganizationSync
{
    /// <summary>
    /// Repository interface for organization onboarding database operations.
    /// Repository Responsibility:
    /// - Declares create/update/get operations against [dbo].[Sync_OrganizationUpsert] via Dapper.
    /// </summary>
    public interface IOrganizationSyncRepository
    {
        #region POST Methods

        /// <summary>
        /// Creates or updates an organization onboarding row.
        /// </summary>
        /// <remarks>
        /// Purpose: Onboard a new organization, or refresh an already-onboarded one.
        /// Request Flow: IOrganizationSyncService -> OrganizationSyncRepository.UpsertOrganizationAsync() -> SQL Database.
        /// Validation Details: Parameter names match stored procedure arguments.
        /// Business Logic: Executes the upsert action of the organization stored procedure.
        /// Repository Interaction: Executes StoredProc.UserSync.OrganizationUpsert with ActionId 1.
        /// Response Details: Returns an OrganizationUpsertResult with the resolved CFROrgId and Outcome.
        /// </remarks>
        /// <param name="productId">ProductId resolved from the authenticated ApiClient.</param>
        /// <param name="input">Input DTO containing the organization fields.</param>
        /// <param name="apiClientId">Internal identifier of the authenticated ApiClient.</param>
        /// <returns>The upsert result.</returns>
        Task<OrganizationUpsertResult> UpsertOrganizationAsync(int productId, OrganizationSyncInput input, int apiClientId);

        #endregion POST Methods

        #region GET Methods

        /// <summary>
        /// Reads back an onboarded organization.
        /// </summary>
        /// <remarks>
        /// Purpose: Confirm the current CFR organization for a product's own organization id.
        /// Request Flow: IOrganizationSyncService -> OrganizationSyncRepository.GetOrganizationAsync() -> SQL Database.
        /// Validation Details: Parameter names match stored procedure arguments.
        /// Business Logic: Executes the read-only get action of the organization stored procedure.
        /// Repository Interaction: Executes StoredProc.UserSync.OrganizationUpsert with ActionId 2.
        /// Response Details: Returns an OrganizationUpsertResult, or null when not onboarded.
        /// </remarks>
        /// <param name="productId">ProductId resolved from the authenticated ApiClient.</param>
        /// <param name="productOrgId">The product's own organization identifier.</param>
        /// <returns>The matching organization, or null when not found.</returns>
        Task<OrganizationUpsertResult?> GetOrganizationAsync(int productId, int productOrgId);

        #endregion GET Methods
    }
}
