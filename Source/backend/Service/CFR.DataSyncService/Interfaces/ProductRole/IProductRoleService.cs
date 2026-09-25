// Copyright (c) OptionC. All rights reserved.

namespace CFR.DataSyncService.Interfaces.ProductRole
{
    /// <summary>
    /// Service contract for the per-product role catalog operations.
    /// Acts as the business-logic layer between ProductRolesController and IProductRoleRepository.
    /// </summary>
    public interface IProductRoleService
    {
        #region POST Methods

        /// <summary>
        /// Creates a new role row for the calling product, or renames it if the RoleId already exists.
        /// </summary>
        /// <remarks>
        /// Purpose: Let a product register/rename one of its own role ids and display names.
        /// Request Flow: ProductRolesController -> IProductRoleService.UpsertRoleAsync() -> IProductRoleRepository.UpsertRoleAsync().
        /// Validation Details: RoleId must be positive; RoleName is required.
        /// Business Logic: None beyond validation; delegates to the repository.
        /// Repository Interaction: Calls IProductRoleRepository.UpsertRoleAsync().
        /// Response Details: MSResultArgs containing ProductRoleOutput, or a validation error.
        /// </remarks>
        /// <param name="input">Input DTO containing the role id and display name.</param>
        /// <param name="traceId">W3C trace id.</param>
        /// <returns>MSResultArgs containing the upserted role.</returns>
        Task<MSResultArgs> UpsertRoleAsync(ProductRoleInput input, string traceId);

        #endregion POST Methods

        #region GET Methods

        /// <summary>
        /// Lists the active roles registered for the calling product.
        /// </summary>
        /// <remarks>
        /// Purpose: Let a product read back its own role catalog.
        /// Request Flow: ProductRolesController -> IProductRoleService.GetRolesAsync() -> IProductRoleRepository.GetRolesAsync().
        /// Validation Details: None — ProductId always comes from the authenticated ApiClient.
        /// Business Logic: None beyond delegation.
        /// Repository Interaction: Calls IProductRoleRepository.GetRolesAsync().
        /// Response Details: MSResultArgs containing a List of ProductRoleOutput.
        /// </remarks>
        /// <param name="traceId">W3C trace id.</param>
        /// <returns>MSResultArgs containing the product's active roles.</returns>
        Task<MSResultArgs> GetRolesAsync(string traceId);

        #endregion GET Methods
    }
}
