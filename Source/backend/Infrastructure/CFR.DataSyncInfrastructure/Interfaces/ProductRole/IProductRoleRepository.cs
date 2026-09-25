// Copyright (c) OptionC. All rights reserved.

namespace CFR.DataSyncInfrastructure.Interfaces.ProductRole
{
    /// <summary>
    /// Repository interface for the per-product role catalog database operations.
    /// Repository Responsibility:
    /// - Declares upsert/list operations against [core].[ProductRole] via Dapper.
    /// </summary>
    public interface IProductRoleRepository
    {
        #region POST Methods

        /// <summary>
        /// Creates a new role row for the product, or renames it if the RoleId already exists.
        /// </summary>
        /// <remarks>
        /// Purpose: Let a product register/rename one of its own role ids and display names.
        /// Request Flow: IProductRoleService -> ProductRoleRepository.UpsertRoleAsync() -> SQL Database.
        /// Validation Details: Parameter names match stored procedure arguments.
        /// Business Logic: Executes ActionId 1 of [dbo].[Sync_ProductRole].
        /// Repository Interaction: Executes StoredProc.ProductRole.ProductRoleCrud with ActionId 1.
        /// Response Details: Returns the upserted role.
        /// </remarks>
        /// <param name="productId">ProductId resolved from the authenticated ApiClient.</param>
        /// <param name="roleId">Opaque per-product role identifier.</param>
        /// <param name="roleName">Display name for the role.</param>
        /// <returns>The upserted role.</returns>
        Task<ProductRoleOutput> UpsertRoleAsync(int productId, int roleId, string roleName);

        #endregion POST Methods

        #region GET Methods

        /// <summary>
        /// Lists the active roles registered for the product.
        /// </summary>
        /// <remarks>
        /// Purpose: Let a product read back its own role catalog (e.g. to populate a dropdown, or
        /// validate a roleId before pushing a user).
        /// Request Flow: IProductRoleService -> ProductRoleRepository.GetRolesAsync() -> SQL Database.
        /// Validation Details: Parameter names match stored procedure arguments.
        /// Business Logic: Executes ActionId 2 of [dbo].[Sync_ProductRole].
        /// Repository Interaction: Executes StoredProc.ProductRole.ProductRoleCrud with ActionId 2.
        /// Response Details: Returns the product's active roles, ordered by RoleId.
        /// </remarks>
        /// <param name="productId">ProductId resolved from the authenticated ApiClient.</param>
        /// <returns>The product's active roles.</returns>
        Task<List<ProductRoleOutput>> GetRolesAsync(int productId);

        #endregion GET Methods
    }
}
