// Copyright (c) OptionC. All rights reserved.

namespace CFR.AcutisService.Interfaces.Administration
{
    /// <summary>
    /// Service contract for Product operations used by App Hub.
    /// Acts as the business-logic layer between ProductsController and IProductsRepository.
    /// Responsibility:
    /// - Declares the method to fetch hub products.
    /// - Relies on IProductsRepository for stored procedure execution.
    /// </summary>
    public interface IProductsService
    {
        #region GET Methods

        /// <summary>
        /// Retrieves hub products for a member email.
        /// </summary>
        /// <remarks>
        /// Purpose: Fetch the App Hub product list.
        /// Request Flow: ProductsController -> IProductsService.GetProductsListAsync() -> IProductsRepository.GetProductsListAsync().
        /// Validation Details: None.
        /// Business Logic: Wraps the typed list in MSResultArgs.
        /// Repository Interaction: Calls IProductsRepository.GetProductsListAsync().
        /// Response Details: MSResultArgs containing List of ProductOutput.
        /// </remarks>
        /// <param name="requesterEmail">Member email used to decide Your Apps vs Available Apps.</param>
        /// <returns>MSResultArgs containing the product list.</returns>
        Task<MSResultArgs> GetProductsListAsync(string? requesterEmail);

        #endregion GET Methods
    }
}
