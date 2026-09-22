// Copyright (c) OptionC. All rights reserved.

namespace CFR.PortalInfrastructure.Interfaces.Administration
{
    /// <summary>
    /// Repository interface for public "Suggest a product" request database operations.
    /// Repository Responsibility:
    /// - Declares the public save operation and the notification-recipient lookup against
    ///   StoredProc.Requests.ProductRequestCrud (physically defined in CFR.AcutisInfrastructure's
    ///   Scripts folder, same cross-service reuse convention as AccessRequestCrud).
    /// </summary>
    public interface IProductRequestRepository
    {
        #region GET Methods

        /// <summary>
        /// Retrieves notification recipient email addresses for a new product request.
        /// </summary>
        /// <remarks>
        /// Purpose: Resolve who should receive the "new product suggestion" email.
        /// Request Flow: IProductRequestService -> IProductRequestRepository.GetProductRequestNotificationRecipientsAsync() -> SQL Database.
        /// Validation Details: None.
        /// Business Logic: The stored procedure resolves the configured recipient from [request].[ProductRequestSettings] (a shared database table, not either service's own _configurationSettings.json) when it's an active user; otherwise falls back to the 'Platform Admin' role - see ActionId 6 in 022_Acutis_ProductRequest_StoredProcedure.sql.
        /// Repository Interaction: Executes StoredProc.Requests.ProductRequestCrud with ActionId 6.
        /// Response Details: Returns a list of recipient email records.
        /// </remarks>
        /// <returns>A list of recipient email records.</returns>
        Task<List<AccessRequestRecipientOutput>> GetProductRequestNotificationRecipientsAsync();

        #endregion GET Methods

        #region POST Methods

        /// <summary>
        /// Inserts a new product request plus its feature rows and initial status history.
        /// </summary>
        /// <remarks>
        /// Purpose: Persist a public "Suggest a product" submission.
        /// Request Flow: IProductRequestService -> IProductRequestRepository.SaveProductRequestAsync() -> SQL Database.
        /// Validation Details: Parameter names match stored procedure arguments.
        /// Business Logic: Binds ProductRequestInput and executes the save stored procedure. No InsertedBy is stamped from a logged-in user - the form is anonymous.
        /// Repository Interaction: Executes StoredProc.Requests.ProductRequestCrud with ActionId 1.
        /// Response Details: Returns the new ProductRequestId.
        /// </remarks>
        /// <param name="input">Input DTO containing the proposed product and requester fields.</param>
        /// <returns>Scalar result of the save stored procedure.</returns>
        Task<int> SaveProductRequestAsync(ProductRequestInput input);

        #endregion POST Methods
    }
}
