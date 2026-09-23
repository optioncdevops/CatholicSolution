// Copyright (c) OptionC. All rights reserved.

namespace CFR.DataSyncInfrastructure.Interfaces.ProductSync
{
    /// <summary>
    /// Repository interface for the CFR-user product-lookup database operation.
    /// Repository Responsibility:
    /// - Declares the read-only lookup against [dbo].[Sync_ProductsForUser] via Dapper.
    /// </summary>
    public interface IProductSyncRepository
    {
        #region GET Methods

        /// <summary>
        /// Fetches the active products a CFR user (identified by email) has access to.
        /// </summary>
        /// <remarks>
        /// Purpose: Let a product's backend build an app-switcher list for a CFR-linked user.
        /// Request Flow: IProductSyncService -> ProductSyncRepository.GetUserProductsAsync() -> SQL Database.
        /// Validation Details: Email parameter mapping.
        /// Business Logic: Executes [dbo].[Sync_ProductsForUser] and reads back the output ReturnValue.
        /// Repository Interaction: Executes StoredProc.ProductSync.ProductsForUser.
        /// Response Details: Returns (found, products) — found is false when no CFR identity matched the email.
        /// </remarks>
        /// <param name="email">Email address of the CFR user.</param>
        /// <param name="environmentName">Environment name used to resolve each product's launch BaseUrl.</param>
        /// <returns>A tuple of whether the email matched a CFR identity, and that user's products.</returns>
        Task<(bool Found, IEnumerable<UserProductListItemOutput> Products)> GetUserProductsAsync(string email, string environmentName);

        #endregion GET Methods

        #region POST Methods

        /// <summary>
        /// Creates a one-time App Hub platform-launch code for the CFR member matched by email.
        /// </summary>
        /// <remarks>
        /// Purpose: Let the App Switcher widget's "All apps in App Hub" link land the visitor on
        /// CFR's own hub already signed in, via the same short-lived code + exchange pattern
        /// [dbo].[Portal_CFRLaunch] already uses for product launches.
        /// Request Flow: IProductSyncService -> ProductSyncRepository.CreatePlatformLaunchCodeAsync() -> SQL Database.
        /// Validation Details: Email must already be known to have matched (caller checks GetUserProductsAsync's Found first).
        /// Business Logic: Executes Portal's own [dbo].[Portal_PlatformLaunch] with ActionId 1, on the shared CFRPortal database.
        /// Repository Interaction: Executes StoredProc.PlatformLaunch.PlatformLaunchCrud.
        /// Response Details: True when a code row was created (email matched a CFR identity).
        /// </remarks>
        /// <param name="email">Email address of the CFR user the code is issued for.</param>
        /// <param name="codeHash">SHA-256 hex hash of the raw one-time code.</param>
        /// <param name="insertedBy">Audit identifier for the calling API client.</param>
        /// <returns>True when the code was created.</returns>
        Task<bool> CreatePlatformLaunchCodeAsync(string email, string codeHash, string insertedBy);

        /// <summary>
        /// Creates a one-time product-launch code for the CFR member matched by email.
        /// </summary>
        /// <remarks>
        /// Purpose: Let the App Switcher widget launch this user into another CFR product already
        /// signed in - the same code + ExchangeToken mechanism CFR's own App Hub "Launch" button
        /// uses, via [dbo].[Portal_CFRLaunch] ActionId 4 (a machine-client entry point resolving
        /// the member by email instead of a Portal session).
        /// Request Flow: IProductSyncService -> ProductSyncRepository.CreateProductLaunchAsync() -> SQL Database.
        /// Validation Details: Email, productId, and environmentName are passed through as-is.
        /// Business Logic: Executes Portal's own [dbo].[Portal_CFRLaunch] with ActionId 4, on the shared CFRPortal database.
        /// Repository Interaction: Executes StoredProc.CFRLaunch.CFRLaunchCrud.
        /// Response Details: Returns the create row and stored-procedure return value (same codes as
        /// CFR.Portal's own LaunchProductAsync: -1 user not found, -2 product not found, -3 product
        /// disabled, -4 no launch URL for this environment, -5 product not assigned to this user).
        /// </remarks>
        /// <param name="email">Email address of the CFR user the code is issued for.</param>
        /// <param name="productId">Product to launch.</param>
        /// <param name="codeHash">SHA-256 hex hash of the raw one-time code.</param>
        /// <param name="environmentName">[core].[ProductEnvironment].EnvironmentName for the login environment.</param>
        /// <returns>Create result and return value.</returns>
        Task<(int ReturnValue, ProductLaunchCreateRow? Row)> CreateProductLaunchAsync(string email, int productId, string codeHash, string environmentName);

        #endregion POST Methods
    }
}
