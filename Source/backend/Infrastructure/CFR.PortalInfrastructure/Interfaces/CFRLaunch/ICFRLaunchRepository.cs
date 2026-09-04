// Copyright (c) OptionC. All rights reserved.

namespace CFR.PortalInfrastructure.Interfaces.CFRLaunch
{
    /// <summary>
    /// Repository interface for product SSO launch and code exchange.
    /// Repository Responsibility:
    /// - Declares assigned-product, launch-create, and code-consume operations against SQL Server.
    /// </summary>
    public interface ICFRLaunchRepository
    {
        #region GET Methods

        /// <summary>
        /// Retrieves products assigned to the authenticated CFR member.
        /// </summary>
        /// <remarks>
        /// Purpose: Return hub products for the current user, joined to [core].[ProductEnvironment] for the login EnvironmentName.
        /// Request Flow: ICFRLaunchService -> ICFRLaunchRepository.GetAssignedProductsAsync() -> SQL Database.
        /// Validation Details: CFRUserId parameter mapping.
        /// Business Logic: Directly retrieves assigned product rows.
        /// Repository Interaction: Executes StoredProc.CFRLaunch.CFRLaunchCrud with ActionId 1.
        /// Response Details: Returns a list of AssignedProductOutput records.
        /// </remarks>
        /// <param name="environmentName">[core].[ProductEnvironment].EnvironmentName matching appsettings Environment (Development, Pilot, Staging, Live).</param>
        /// <returns>Hub product rows.</returns>
        Task<List<AssignedProductOutput>> GetAssignedProductsAsync(string environmentName);

        #endregion GET Methods

        #region POST Methods

        /// <summary>
        /// Creates a one-time launch authorization row.
        /// </summary>
        /// <remarks>
        /// Purpose: Persist the hash of a random authorization code bound to user and product.
        /// Request Flow: ICFRLaunchService -> ICFRLaunchRepository.CreateLaunchAsync() -> SQL Database.
        /// Validation Details: Parameter names match stored procedure arguments.
        /// Business Logic: Inserts CodeHash after access checks in SQL. Prior rows for the same user and product are deleted first. ExpiresAt is computed in SQL.
        /// Repository Interaction: Executes StoredProc.CFRLaunch.CFRLaunchCrud with ActionId 2.
        /// Response Details: Returns the create row and stored-procedure return value.
        /// </remarks>
        /// <param name="productId">Product to launch.</param>
        /// <param name="codeHash">SHA-256 hex hash of the raw authorization code.</param>
        /// <param name="environmentName">[core].[ProductEnvironment].EnvironmentName for the login environment.</param>
        /// <returns>Create result and return value.</returns>
        Task<(int ReturnValue, CFRLaunchCreateRow? Row)> CreateLaunchAsync(int productId, string codeHash, string environmentName);

        /// <summary>
        /// Consumes a one-time authorization code for a product.
        /// </summary>
        /// <remarks>
        /// Purpose: Atomically validate and mark the code as used.
        /// Request Flow: ICFRLaunchService -> ICFRLaunchRepository.ExchangeCodeAsync() -> SQL Database.
        /// Validation Details: CodeHash and ProductId parameter mapping.
        /// Business Logic: SQL performs existence, expiry, replay, product, and access checks then updates IsUsed.
        /// Repository Interaction: Executes StoredProc.CFRLaunch.CFRLaunchCrud with ActionId 3.
        /// Response Details: Returns the consumed identity row and stored-procedure return value.
        /// </remarks>
        /// <param name="productId">Product that is exchanging the code.</param>
        /// <param name="codeHash">SHA-256 hex hash of the raw authorization code.</param>
        /// <returns>Exchange result and return value.</returns>
        Task<(int ReturnValue, CFRExchangeRow? Row)> ExchangeCodeAsync(int productId, string codeHash);

        #endregion POST Methods
    }
}
