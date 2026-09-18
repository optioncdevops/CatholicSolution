// Copyright (c) OptionC. All rights reserved.

namespace CFR.PortalService.Interfaces.Administration
{
    /// <summary>
    /// Service contract for Access Request operations.
    /// Acts as the business-logic layer between AccessRequestController and IAccessRequestRepository.
    /// Responsibility:
    /// - Declares methods to fetch, save, and update access request status.
    /// - Relies on IAccessRequestRepository for stored procedure execution.
    /// </summary>
    public interface IAccessRequestService
    {


        /// <summary>
        /// Retrieves App Hub products for a member email.
        /// </summary>
        /// <remarks>
        /// Purpose: Return every core.Product with hubSection your / available / future from [auth].[UserProduct].
        /// Request Flow: AccessRequestController -> IAccessRequestService.GetHubProductsAsync() -> IAccessRequestRepository.GetHubProductsAsync().
        /// Validation Details: Email is optional; a missing email returns products without a Your Apps assignment.
        /// Business Logic: Wraps the typed list in MSResultArgs.
        /// Repository Interaction: Calls IAccessRequestRepository.GetHubProductsAsync().
        /// Response Details: MSResultArgs containing List of HubProductOutput.
        /// </remarks>
        /// <param name="requesterEmail">Member email used to resolve [auth].[User].CFRUserId.</param>
        /// <returns>MSResultArgs containing the hub product list.</returns>
        Task<MSResultArgs> GetHubProductsAsync(string? requesterEmail);

        /// <summary>
        /// Retrieves every non-deleted diocese for the Request Access page's Diocese dropdown.
        /// </summary>
        /// <remarks>
        /// Purpose: Populate the Diocese dropdown on the public Request Access page.
        /// Request Flow: AccessRequestController -> IAccessRequestService.GetDiocesesListAsync() -> IAccessRequestRepository.GetDiocesesListAsync().
        /// Validation Details: None.
        /// Business Logic: Wraps the typed list in MSResultArgs.
        /// Repository Interaction: Calls IAccessRequestRepository.GetDiocesesListAsync().
        /// Response Details: MSResultArgs containing List of DioceseOutput.
        /// </remarks>
        /// <returns>MSResultArgs containing the diocese list.</returns>
        Task<MSResultArgs> GetDiocesesListAsync();

        #region POST Methods

        /// <summary>
        /// Creates an access request.
        /// </summary>
        /// <remarks>
        /// Purpose: Insert request, product, status history, and optional comment rows, then email admins from the AccessRequested template.
        /// Request Flow: AccessRequestController -> IAccessRequestService.SaveAccessRequestAsync() -> IAccessRequestRepository.SaveAccessRequestAsync().
        /// Validation Details: Input DTO is required; product name or id and requester email are required.
        /// Business Logic: Delegates insert to the repository, maps duplicate results to Conflict, then emails users matched to the requested product. Mail failure does not fail the save.
        /// Repository Interaction: Calls IAccessRequestRepository.SaveAccessRequestAsync(), IAccessRequestRepository.GetProductNotificationRecipientsAsync(), and IEmailTemplatesRepository.GetEmailTemplateByCodeAsync().
        /// Response Details: MSResultArgs containing the access request identifier, or Conflict.
        /// </remarks>
        /// <param name="input">Input DTO containing request fields.</param>
        /// <returns>MSResultArgs containing the save status.</returns>
        Task<MSResultArgs> SaveAccessRequestAsync(AccessRequestInput input);

        #endregion POST Methods


    }
}

