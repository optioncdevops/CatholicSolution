// Copyright (c) OptionC. All rights reserved.

namespace CFR.AcutisInfrastructure.Repositorys.Administration
{
    /// <summary>
    /// Dapper implementation of IProductRequestRepository for the Administration module.
    /// Infrastructure Responsibility:
    /// - Uses IDapperHandler to execute StoredProc.Requests.ProductRequestCrud.
    /// - Stamps UpdatedBy from ICurrentUserService.UserId on approve/reject.
    /// </summary>
    public class ProductRequestRepository(IDapperHandler dapperHandler, ICurrentUserService currentUserService): IProductRequestRepository
    {
        #region GET Methods

        /// <summary>
        /// Fetches product requests using StoredProc.Requests.ProductRequestCrud (ActionId 2).
        /// </summary>
        /// <remarks>
        /// Purpose: Retrieve the admin review list.
        /// Request Flow: IProductRequestService -> ProductRequestRepository.GetProductRequestsListAsync() -> Database.
        /// Validation Details: RequestStatus parameter mapping.
        /// Business Logic: Executes StoredProc.Requests.ProductRequestCrud with ActionId 2.
        /// Repository Interaction: Executes StoredProc.Requests.ProductRequestCrud.
        /// Response Details: Returns a list of ProductRequestOutput records.
        /// </remarks>
        /// <param name="requestStatus">Optional status filter: 1 = pending, 2 = approved, 3 = rejected.</param>
        /// <returns>A list of product request output records.</returns>
        public async Task<List<ProductRequestOutput>> GetProductRequestsListAsync(int? requestStatus)
        {
            var parameters = new DynamicParameters();
            parameters.Add(DBParameterName.ProductRequestParams.ActionId, 2, DbType.Int32);
            parameters.Add(DBParameterName.ProductRequestParams.RequestStatus, requestStatus, DbType.Int32);
            var result = await dapperHandler.QueryAsync<ProductRequestOutput>(StoredProc.Requests.ProductRequestCrud, parameters, CommandType.StoredProcedure);
            return result.ToList();
        }

        /// <summary>
        /// Fetches one product request with its features using StoredProc.Requests.ProductRequestCrud (ActionId 3).
        /// </summary>
        /// <remarks>
        /// Purpose: Retrieve a request for the review detail view.
        /// Request Flow: IProductRequestService -> ProductRequestRepository.GetProductRequestByIdAsync() -> Database.
        /// Validation Details: ProductRequestId parameter mapping.
        /// Business Logic: Reads two result sets (header and features) using ActionId 3.
        /// Repository Interaction: Executes StoredProc.Requests.ProductRequestCrud.
        /// Response Details: Returns ProductRequestOutput with Features, or null when not found.
        /// </remarks>
        /// <param name="productRequestId">Product request identifier.</param>
        /// <returns>The matching request, or null when not found.</returns>
        public async Task<ProductRequestOutput?> GetProductRequestByIdAsync(int productRequestId)
        {
            var parameters = new DynamicParameters();
            parameters.Add(DBParameterName.ProductRequestParams.ActionId, 3, DbType.Int32);
            parameters.Add(DBParameterName.ProductRequestParams.ProductRequestId, productRequestId, DbType.Int32);
            using var multi = await dapperHandler.QueryMultipleAsync(StoredProc.Requests.ProductRequestCrud, parameters, CommandType.StoredProcedure);
            var request = (await multi.ReadAsync<ProductRequestOutput>()).FirstOrDefault();
            if (request != null)
            {
                request.Features = (await multi.ReadAsync<string>()).ToList();
            }
            return request;
        }

        #endregion GET Methods

        #region PUT Methods

        /// <summary>
        /// Approves a product request using StoredProc.Requests.ProductRequestCrud (ActionId 4).
        /// </summary>
        /// <remarks>
        /// Purpose: Copy the request into [core].[Product] / [core].[ProductFeature] and mark it approved.
        /// Request Flow: IProductRequestService -> ProductRequestRepository.ApproveProductRequestAsync() -> Database.
        /// Validation Details: ProductRequestId parameter mapping.
        /// Business Logic: Executes StoredProc.Requests.ProductRequestCrud with ActionId 4.
        /// Repository Interaction: Executes StoredProc.Requests.ProductRequestCrud.
        /// Response Details: Returns the new ProductId, -95 when not found or already decided, or -99 on duplicate product name.
        /// </remarks>
        /// <param name="productRequestId">Product request identifier.</param>
        /// <param name="decisionRemarks">Optional reviewer remarks.</param>
        /// <returns>New ProductId or negative error code.</returns>
        public async Task<int> ApproveProductRequestAsync(int productRequestId, string? decisionRemarks)
        {
            var parameters = new DynamicParameters();
            parameters.Add(DBParameterName.ProductRequestParams.ActionId, 4, DbType.Int32);
            parameters.Add(DBParameterName.ProductRequestParams.ProductRequestId, productRequestId, DbType.Int32);
            parameters.Add(DBParameterName.ProductRequestParams.DecisionRemarks, decisionRemarks?.Trim(), DbType.String);
            parameters.Add(DBParameterName.ProductRequestParams.UpdatedBy, currentUserService.UserId, DbType.Int64);
            parameters.Add(DBParameterName.ProductRequestParams.ReturnValue, dbType: DbType.Int32, direction: ParameterDirection.Output);
            _ = await dapperHandler.ExecuteAsync(StoredProc.Requests.ProductRequestCrud, parameters, CommandType.StoredProcedure);
            return parameters.Get<int>(DBParameterName.ProductRequestParams.ReturnValue);
        }

        /// <summary>
        /// Rejects a product request using StoredProc.Requests.ProductRequestCrud (ActionId 5).
        /// </summary>
        /// <remarks>
        /// Purpose: Record a rejection decision on a proposed product.
        /// Request Flow: IProductRequestService -> ProductRequestRepository.RejectProductRequestAsync() -> Database.
        /// Validation Details: ProductRequestId parameter mapping.
        /// Business Logic: Executes StoredProc.Requests.ProductRequestCrud with ActionId 5.
        /// Repository Interaction: Executes StoredProc.Requests.ProductRequestCrud.
        /// Response Details: Returns the ProductRequestId, or -95 when not found or already decided.
        /// </remarks>
        /// <param name="productRequestId">Product request identifier.</param>
        /// <param name="decisionRemarks">Optional reviewer remarks.</param>
        /// <returns>ProductRequestId or negative error code.</returns>
        public async Task<int> RejectProductRequestAsync(int productRequestId, string? decisionRemarks)
        {
            var parameters = new DynamicParameters();
            parameters.Add(DBParameterName.ProductRequestParams.ActionId, 5, DbType.Int32);
            parameters.Add(DBParameterName.ProductRequestParams.ProductRequestId, productRequestId, DbType.Int32);
            parameters.Add(DBParameterName.ProductRequestParams.DecisionRemarks, decisionRemarks?.Trim(), DbType.String);
            parameters.Add(DBParameterName.ProductRequestParams.UpdatedBy, currentUserService.UserId, DbType.Int64);
            parameters.Add(DBParameterName.ProductRequestParams.ReturnValue, dbType: DbType.Int32, direction: ParameterDirection.Output);
            _ = await dapperHandler.ExecuteAsync(StoredProc.Requests.ProductRequestCrud, parameters, CommandType.StoredProcedure);
            return parameters.Get<int>(DBParameterName.ProductRequestParams.ReturnValue);
        }

        #endregion PUT Methods
    }
}
