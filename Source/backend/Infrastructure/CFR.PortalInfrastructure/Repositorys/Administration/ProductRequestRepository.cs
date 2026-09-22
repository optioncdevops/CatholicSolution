// Copyright (c) OptionC. All rights reserved.

namespace CFR.PortalInfrastructure.Repositorys.Administration
{
    /// <summary>
    /// Dapper implementation of IProductRequestRepository for the Administration module.
    /// Infrastructure Responsibility:
    /// - Uses IDapperHandler to execute StoredProc.Requests.ProductRequestCrud.
    /// - The public submit form is anonymous, so no InsertedBy is stamped from ICurrentUserService.
    /// </summary>
    public class ProductRequestRepository(IDapperHandler dapperHandler): IProductRequestRepository
    {
        #region GET Methods

        /// <summary>
        /// Fetches notification recipients using StoredProc.Requests.ProductRequestCrud (ActionId 6).
        /// </summary>
        /// <remarks>
        /// Purpose: Resolve who should receive the "new product suggestion" email.
        /// Request Flow: IProductRequestService -> ProductRequestRepository.GetProductRequestNotificationRecipientsAsync() -> Database.
        /// Validation Details: None.
        /// Business Logic: Executes StoredProc.Requests.ProductRequestCrud with ActionId 6, passing notifyUserId through.
        /// Repository Interaction: Executes StoredProc.Requests.ProductRequestCrud.
        /// Response Details: Returns a list of recipient email records.
        /// </remarks>
        /// <param name="notifyUserId">The configured [auth].[AcutisUser].[UserId] to notify, or null to use the Platform Admin fallback.</param>
        /// <returns>A list of recipient email records.</returns>
        public async Task<List<AccessRequestRecipientOutput>> GetProductRequestNotificationRecipientsAsync(long? notifyUserId)
        {
            var parameters = new DynamicParameters();
            parameters.Add(DBParameterName.ProductRequestParams.ActionId, 6, DbType.Int32);
            parameters.Add(DBParameterName.ProductRequestParams.NotifyUserId, notifyUserId, DbType.Int64);
            var result = await dapperHandler.QueryAsync<AccessRequestRecipientOutput>(StoredProc.Requests.ProductRequestCrud, parameters, CommandType.StoredProcedure);
            return result.ToList();
        }

        #endregion GET Methods

        #region POST Methods

        /// <summary>
        /// Adds a product request using StoredProc.Requests.ProductRequestCrud (ActionId 1).
        /// </summary>
        /// <remarks>
        /// Purpose: Insert ProductRequest, ProductRequestFeature, and ProductRequestStatusHistory rows.
        /// Request Flow: IProductRequestService -> ProductRequestRepository.SaveProductRequestAsync() -> Database.
        /// Validation Details: Parameter names match stored procedure arguments.
        /// Business Logic: Joins Features with '|' (same wire format as Acutis_Products) and executes the insert stored procedure.
        /// Repository Interaction: Executes StoredProc.Requests.ProductRequestCrud with ActionId 1.
        /// Response Details: Returns the scalar integer result from the stored procedure.
        /// </remarks>
        /// <param name="input">Input DTO containing the proposed product and requester fields.</param>
        /// <returns>Scalar result of the save stored procedure.</returns>
        public async Task<int> SaveProductRequestAsync(ProductRequestInput input)
        {
            ArgumentNullException.ThrowIfNull(input);
            string? features = input.Features is { Count: > 0 }
                ? string.Join("|", input.Features.Where(f => !string.IsNullOrWhiteSpace(f)).Select(f => f.Trim()))
                : null;

            var parameters = new DynamicParameters();
            parameters.Add(DBParameterName.ProductRequestParams.ActionId, 1, DbType.Int32);
            parameters.Add(DBParameterName.ProductRequestParams.ProductName, input.ProductName.Trim(), DbType.String);
            parameters.Add(DBParameterName.ProductRequestParams.ShortName, input.ShortName?.Trim(), DbType.String);
            parameters.Add(DBParameterName.ProductRequestParams.SubCategoryName, input.Category?.Trim(), DbType.String);
            parameters.Add(DBParameterName.ProductRequestParams.ProdDescription, input.ProdDescription?.Trim(), DbType.String);
            parameters.Add(DBParameterName.ProductRequestParams.ExternalPageUrl, input.ExternalPageUrl?.Trim(), DbType.String);
            parameters.Add(DBParameterName.ProductRequestParams.NavigationTarget, input.NavigationTarget?.Trim(), DbType.String);
            parameters.Add(DBParameterName.ProductRequestParams.Features, features, DbType.String);
            parameters.Add(DBParameterName.ProductRequestParams.LogoName, input.LogoName?.Trim(), DbType.String);
            parameters.Add(DBParameterName.ProductRequestParams.RequesterName, input.RequesterName.Trim(), DbType.String);
            parameters.Add(DBParameterName.ProductRequestParams.RequesterEmail, input.RequesterEmail.Trim(), DbType.String);
            parameters.Add(DBParameterName.ProductRequestParams.OrganizationName, input.OrganizationName?.Trim(), DbType.String);
            parameters.Add(DBParameterName.ProductRequestParams.ReturnValue, dbType: DbType.Int32, direction: ParameterDirection.Output);
            _ = await dapperHandler.ExecuteAsync(StoredProc.Requests.ProductRequestCrud, parameters, CommandType.StoredProcedure);
            return parameters.Get<int>(DBParameterName.ProductRequestParams.ReturnValue);
        }

        #endregion POST Methods
    }
}
