// Copyright (c) OptionC. All rights reserved.

namespace CFR.AcutisService.Service.Administration
{
    /// <summary>
    /// Implements Product business logic for the App Hub list.
    /// Repository Responsibility:
    /// - Invokes IProductsRepository for stored procedure execution.
    /// </summary>
    public class ProductsService(IProductsRepository repository, ILogger<ProductsService> logger): IProductsService
    {
        #region GET Methods

        /// <summary>
        /// Retrieves hub products for a member email.
        /// </summary>
        /// <remarks>
        /// Purpose: Fetch the App Hub product list.
        /// Request Flow: ProductsController -> ProductsService.GetProductsListAsync() -> IProductsRepository.GetProductsListAsync().
        /// Validation Details: None.
        /// Business Logic: Wraps the typed list in MSResultArgs.
        /// Repository Interaction: Calls IProductsRepository.GetProductsListAsync().
        /// Response Details: MSResultArgs containing List of ProductOutput.
        /// </remarks>
        /// <param name="requesterEmail">Member email used to decide Your Apps vs Available Apps.</param>
        /// <returns>MSResultArgs containing the product list.</returns>
        public async Task<MSResultArgs> GetProductsListAsync(string? requesterEmail)
        {
            var result = new MSResultArgs();
            try
            {
                var data = await repository.GetProductsListAsync(requesterEmail);
                result.ResultData = data ?? [];
            }
            catch (Exception ex)
            {
                AppLogger.LogError(logger, ex, SerilogErrorMessages.AcutisLogMessages.FetchProductsFailed);
                result.StatusCode = ErrorCodes.InternalServerError;
                result.StatusMessage = ErrorMessages.InternalServerError;
            }

            return result;
        }

        #endregion GET Methods
    }
}
