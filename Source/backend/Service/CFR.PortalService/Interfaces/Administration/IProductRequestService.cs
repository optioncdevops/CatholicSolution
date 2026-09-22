// Copyright (c) OptionC. All rights reserved.

namespace CFR.PortalService.Interfaces.Administration
{
    /// <summary>
    /// Service contract for public "Suggest a product" request operations.
    /// Acts as the business-logic layer between ProductRequestController and IProductRequestRepository.
    /// Responsibility:
    /// - Declares the public submit method.
    /// - Relies on IProductRequestRepository for stored procedure execution.
    /// </summary>
    public interface IProductRequestService
    {
        #region POST Methods

        /// <summary>
        /// Creates a product request.
        /// </summary>
        /// <remarks>
        /// Purpose: Insert the request, its features, and initial status history, then email the platform's admins.
        /// Request Flow: ProductRequestController -> IProductRequestService.SaveProductRequestAsync() -> IProductRequestRepository.SaveProductRequestAsync().
        /// Validation Details: Product name, description, requester name, and requester email are required.
        /// Business Logic: Delegates insert to the repository, then emails notification recipients from the ProductRequested template. Mail failure does not fail the save.
        /// Repository Interaction: Calls IProductRequestRepository.SaveProductRequestAsync() and IProductRequestRepository.GetProductRequestNotificationRecipientsAsync().
        /// Response Details: MSResultArgs containing the new product request identifier.
        /// </remarks>
        /// <param name="input">Input DTO containing the proposed product and requester fields.</param>
        /// <returns>MSResultArgs containing the save status.</returns>
        Task<MSResultArgs> SaveProductRequestAsync(ProductRequestInput input);

        // Logo upload is NOT declared here - see IProductRequestService.UploadProductRequestLogoAsync
        // in CFR.AcutisService instead. A Portal-hosted upload would land in Portal's own wwwroot,
        // not the folder [core].[Product].[LogoName] is actually served from.

        #endregion POST Methods
    }
}
