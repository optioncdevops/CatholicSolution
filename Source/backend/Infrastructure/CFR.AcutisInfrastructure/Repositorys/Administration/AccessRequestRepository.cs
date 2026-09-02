// Copyright (c) OptionC. All rights reserved.

namespace CFR.AcutisInfrastructure.Repositorys.Administration
{
    /// <summary>
    /// Dapper implementation of IAccessRequestRepository for the Administration module.
    /// Infrastructure Responsibility:
    /// - Uses IDapperHandler to execute stored procedures and map results to AccessRequestOutput.
    /// - Stamps InsertedBy / UpdatedBy from ICurrentUserService.UserId.
    /// </summary>
    public class AccessRequestRepository(IDapperHandler dapperHandler, ICurrentUserService currentUserService): IAccessRequestRepository
    {
        #region GET Methods

        /// <summary>
        /// Fetches access request rows using StoredProc.Requests.AccessRequestCrud.
        /// </summary>
        /// <remarks>
        /// Purpose: Retrieve all access requests from the database.
        /// Request Flow: IAccessRequestService -> AccessRequestRepository.GetAccessRequestsListAsync() -> Database.
        /// Validation Details: None.
        /// Business Logic: Maps stored procedure rows to AccessRequestOutput.
        /// Repository Interaction: Executes StoredProc.Requests.AccessRequestCrud with ActionId 4.
        /// Response Details: Returns a list of AccessRequestOutput records.
        /// </remarks>
        /// <returns>A list of access request output records.</returns>
        public async Task<List<AccessRequestOutput>> GetAccessRequestsListAsync()
        {
            var parameters = new DynamicParameters();
            parameters.Add(DBParameterName.AccessRequestParams.ActionId, 4, DbType.Int32);
            var result = await dapperHandler.QueryAsync<AccessRequestOutput>(StoredProc.Requests.AccessRequestCrud, parameters, CommandType.StoredProcedure);
            return result.ToList();
        }

        /// <summary>
        /// Fetches one access request using StoredProc.Requests.AccessRequestCrud.
        /// </summary>
        /// <remarks>
        /// Purpose: Retrieve a single access request with timeline and comments.
        /// Request Flow: IAccessRequestService -> AccessRequestRepository.GetAccessRequestByIdAsync() -> Database.
        /// Validation Details: AccessRequestId parameter mapping.
        /// Business Logic: Maps three result sets into AccessRequestOutput.
        /// Repository Interaction: Executes StoredProc.Requests.AccessRequestCrud with ActionId 3.
        /// Response Details: Returns an AccessRequestOutput record or null.
        /// </remarks>
        /// <param name="accessRequestId">Access request identifier.</param>
        /// <returns>The matching request, or null when not found.</returns>
        public async Task<AccessRequestOutput?> GetAccessRequestByIdAsync(int accessRequestId)
        {
            var parameters = new DynamicParameters();
            parameters.Add(DBParameterName.AccessRequestParams.ActionId, 3, DbType.Int32);
            parameters.Add(DBParameterName.AccessRequestParams.AccessRequestId, accessRequestId, DbType.Int32);
            using var grid = await dapperHandler.QueryMultipleAsync(StoredProc.Requests.AccessRequestCrud, parameters, CommandType.StoredProcedure);
            var request = (await grid.ReadAsync<AccessRequestOutput>()).FirstOrDefault();
            if (request == null) return null;
            request.Timeline = (await grid.ReadAsync<AccessRequestTimelineOutput>()).AsList();
            request.Comments = (await grid.ReadAsync<AccessRequestCommentOutput>()).AsList();
            return request;
        }

        /// <summary>
        /// Fetches product-matched AccessRequested recipients using StoredProc.Requests.AccessRequestCrud.
        /// </summary>
        /// <remarks>
        /// Purpose: Resolve who should receive the new-request email for this product.
        /// Request Flow: IAccessRequestService -> AccessRequestRepository.GetProductNotificationRecipientsAsync() -> Database.
        /// Validation Details: ProductId and ProductName parameter mapping.
        /// Business Logic: Maps stored procedure rows to AccessRequestRecipientOutput from [auth].[UserProduct] joined to [auth].[User] on CFRUserId.
        /// Repository Interaction: Executes StoredProc.Requests.AccessRequestCrud with ActionId 5.
        /// Response Details: Returns a list of recipient email records.
        /// </remarks>
        /// <param name="productId">Numeric product identifier when known.</param>
        /// <param name="productName">Product display name used to resolve core.Product when ProductId is not numeric.</param>
        /// <returns>A list of recipient email records.</returns>
        public async Task<List<AccessRequestRecipientOutput>> GetProductNotificationRecipientsAsync(string productId, string productName)
        {
            int? parsedProductId = int.TryParse(productId, out int parsedId) && parsedId > 0 ? parsedId : null;
            var parameters = new DynamicParameters();
            parameters.Add(DBParameterName.AccessRequestParams.ActionId, 5, DbType.Int32);
            parameters.Add(DBParameterName.AccessRequestParams.ProductId, parsedProductId, DbType.Int32);
            parameters.Add(DBParameterName.AccessRequestParams.ProductName, string.IsNullOrWhiteSpace(productName) ? null : productName, DbType.String);
            var result = await dapperHandler.QueryAsync<AccessRequestRecipientOutput>(StoredProc.Requests.AccessRequestCrud, parameters, CommandType.StoredProcedure);
            return result.ToList();
        }

        /// <summary>
        /// Fetches App Hub products using StoredProc.Requests.AccessRequestCrud.
        /// </summary>
        /// <remarks>
        /// Purpose: Classify products for the App Hub from the member's [auth].[UserProduct] rows.
        /// Request Flow: IAccessRequestService -> AccessRequestRepository.GetHubProductsAsync() -> Database.
        /// Validation Details: RequesterEmail parameter mapping.
        /// Business Logic: Maps stored procedure rows to HubProductOutput. Products on UserProduct are hubSection your; remaining products are available or future from IsAvailable.
        /// Repository Interaction: Executes StoredProc.Requests.AccessRequestCrud with ActionId 6.
        /// Response Details: Returns a list of HubProductOutput records.
        /// </remarks>
        /// <param name="requesterEmail">Member email used to resolve [auth].[User].CFRUserId.</param>
        /// <returns>A list of hub product output records.</returns>
        public async Task<List<HubProductOutput>> GetHubProductsAsync(string? requesterEmail)
        {
            var parameters = new DynamicParameters();
            parameters.Add(DBParameterName.AccessRequestParams.ActionId, 6, DbType.Int32);
            parameters.Add(DBParameterName.AccessRequestParams.RequesterEmail, string.IsNullOrWhiteSpace(requesterEmail) ? null : requesterEmail.Trim(), DbType.String);
            var result = await dapperHandler.QueryAsync<HubProductOutput>(StoredProc.Requests.AccessRequestCrud, parameters, CommandType.StoredProcedure);
            return result.ToList();
        }

        #endregion GET Methods

        #region POST Methods

        /// <summary>
        /// Adds an access request using StoredProc.Requests.AccessRequestCrud.
        /// </summary>
        /// <remarks>
        /// Purpose: Insert AccessRequest, AccessRequestProduct, AccessRequestStatusHistory, and optional AccessRequestComment.
        /// Request Flow: IAccessRequestService -> AccessRequestRepository.SaveAccessRequestAsync() -> Database.
        /// Validation Details: Parameter names match stored procedure arguments.
        /// Business Logic: Binds AccessRequestInput, resolves ProductId as INT when numeric, and stamps InsertedBy.
        /// Repository Interaction: Executes StoredProc.Requests.AccessRequestCrud with ActionId 1.
        /// Response Details: Returns the scalar integer result from the stored procedure.
        /// </remarks>
        /// <param name="input">Input DTO containing request fields.</param>
        /// <returns>Scalar result of the save stored procedure.</returns>
        public async Task<int> SaveAccessRequestAsync(AccessRequestInput input)
        {
            ArgumentNullException.ThrowIfNull(input);
            int? productId = int.TryParse(input.ProductId, out int parsedId) && parsedId > 0 ? parsedId : null;
            var parameters = new DynamicParameters();
            parameters.Add(DBParameterName.AccessRequestParams.ActionId, 1, DbType.Int32);
            parameters.Add(DBParameterName.AccessRequestParams.ProductId, productId, DbType.Int32);
            parameters.Add(DBParameterName.AccessRequestParams.ProductName, input.ProductName, DbType.String);
            parameters.Add(DBParameterName.AccessRequestParams.RequesterEmail, string.IsNullOrWhiteSpace(input.RequesterEmail) ? null : input.RequesterEmail, DbType.String);
            parameters.Add(DBParameterName.AccessRequestParams.Comment, input.Comment, DbType.String);
            parameters.Add(DBParameterName.AccessRequestParams.InsertedBy, currentUserService.UserId, DbType.Int64);
            parameters.Add(DBParameterName.AccessRequestParams.ReturnValue, dbType: DbType.Int32, direction: ParameterDirection.Output);
            _ = await dapperHandler.ExecuteAsync(StoredProc.Requests.AccessRequestCrud, parameters, CommandType.StoredProcedure);
            return parameters.Get<int>(DBParameterName.AccessRequestParams.ReturnValue);
        }

        #endregion POST Methods

        #region PUT Methods

        /// <summary>
        /// Updates access request status using StoredProc.Requests.AccessRequestCrud.
        /// </summary>
        /// <remarks>
        /// Purpose: Approve, reject, or request more information.
        /// Request Flow: IAccessRequestService -> AccessRequestRepository.UpdateAccessRequestStatusAsync() -> Database.
        /// Validation Details: AccessRequestId and Status parameter mapping.
        /// Business Logic: Binds the status payload and stamps UpdatedBy.
        /// Repository Interaction: Executes StoredProc.Requests.AccessRequestCrud with ActionId 2.
        /// Response Details: Returns the updated access request identifier.
        /// </remarks>
        /// <param name="input">Status change payload.</param>
        /// <returns>The updated access request identifier.</returns>
        public async Task<int> UpdateAccessRequestStatusAsync(AccessRequestStatusInput input)
        {
            ArgumentNullException.ThrowIfNull(input);
            var parameters = new DynamicParameters();
            parameters.Add(DBParameterName.AccessRequestParams.ActionId, 2, DbType.Int32);
            parameters.Add(DBParameterName.AccessRequestParams.AccessRequestId, input.AccessRequestId, DbType.Int32);
            parameters.Add(DBParameterName.AccessRequestParams.Status, input.Status, DbType.String);
            parameters.Add(DBParameterName.AccessRequestParams.Note, input.Note, DbType.String);
            parameters.Add(DBParameterName.AccessRequestParams.UpdatedBy, currentUserService.UserId, DbType.Int64);
            parameters.Add(DBParameterName.AccessRequestParams.ReturnValue, dbType: DbType.Int32, direction: ParameterDirection.Output);
            _ = await dapperHandler.ExecuteAsync(StoredProc.Requests.AccessRequestCrud, parameters, CommandType.StoredProcedure);
            return parameters.Get<int>(DBParameterName.AccessRequestParams.ReturnValue);
        }

        #endregion PUT Methods
    }
}
