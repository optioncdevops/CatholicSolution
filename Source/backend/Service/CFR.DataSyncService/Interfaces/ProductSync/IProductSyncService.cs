// Copyright (c) OptionC. All rights reserved.

namespace CFR.DataSyncService.Interfaces.ProductSync
{
    /// <summary>
    /// Service contract for the CFR-user product-lookup operation.
    /// Acts as the business-logic layer between ProductsController and IProductSyncRepository.
    /// Responsibility:
    /// - Validates the email, delegates to the repository, and maps the result to MSResultArgs.
    /// </summary>
    public interface IProductSyncService
    {
        #region GET Methods

        /// <summary>
        /// Fetches the active products a CFR user (identified by email) has access to.
        /// </summary>
        /// <remarks>
        /// Purpose: Let a product's backend build an app-switcher list for a CFR-linked user.
        /// Request Flow: ProductsController -> ProductSyncService.GetUserProductsAsync() -> IProductSyncRepository.GetUserProductsAsync().
        /// Validation Details: Email is required and must be a valid address format.
        /// Business Logic: Maps a no-match email to NotFound; otherwise wraps the product list.
        /// Repository Interaction: Calls IProductSyncRepository.GetUserProductsAsync().
        /// Response Details: MSResultArgs containing List of UserProductListItemOutput, or an error.
        /// </remarks>
        /// <param name="email">Email address of the CFR user.</param>
        /// <param name="traceId">W3C trace id.</param>
        /// <returns>MSResultArgs containing the product list, or an error.</returns>
        Task<MSResultArgs> GetUserProductsAsync(string email, string traceId);

        #endregion GET Methods

        #region POST Methods

        /// <summary>
        /// Launches a CFR-linked user into another product, already signed in.
        /// </summary>
        /// <remarks>
        /// Purpose: Give the App Switcher widget's tile clicks the same real, authenticated
        /// launch CFR's own App Hub "Launch" button uses, instead of a bare link.
        /// Request Flow: ProductsController -> ProductSyncService.LaunchProductAsync() -> IProductSyncRepository.CreateProductLaunchAsync().
        /// Validation Details: Email must be a valid address format; productId must be positive.
        /// Business Logic: Generates a random code, stores only its SHA-256 hash via [dbo].[Portal_CFRLaunch]
        /// ActionId 4, and appends the raw code to the resolved ProductEnvironment BaseUrl.
        /// Repository Interaction: Calls IProductSyncRepository.CreateProductLaunchAsync().
        /// Response Details: MSResultArgs containing ProductLaunchOutput, or an error.
        /// </remarks>
        /// <param name="input">Launch request containing Email and ProductId.</param>
        /// <param name="traceId">W3C trace id.</param>
        /// <returns>MSResultArgs containing the launch URL, or an error.</returns>
        Task<MSResultArgs> LaunchProductAsync(ProductLaunchInput input, string traceId);

        #endregion POST Methods
    }
}
