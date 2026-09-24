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
        public async Task<AccessRequestOutput?> GetAccessRequestByIdAsync(int accessRequestId, int? accessRequestProductId = null)
        {
            var parameters = new DynamicParameters();
            parameters.Add(DBParameterName.AccessRequestParams.ActionId, 3, DbType.Int32);
            parameters.Add(DBParameterName.AccessRequestParams.AccessRequestId, accessRequestId, DbType.Int32);
            parameters.Add(DBParameterName.AccessRequestParams.AccessRequestProductId, accessRequestProductId, DbType.Int64);
            using var grid = await dapperHandler.QueryMultipleAsync(StoredProc.Requests.AccessRequestCrud, parameters, CommandType.StoredProcedure);
            var request = (await grid.ReadAsync<AccessRequestOutput>()).FirstOrDefault();
            if (request == null) return null;
            request.Timeline = (await grid.ReadAsync<AccessRequestTimelineOutput>()).AsList();
            request.Comments = (await grid.ReadAsync<AccessRequestCommentOutput>()).AsList();
            return request;
        }

        /// <summary>
        /// Fetches a product's contact / support user email(s) using SQLQueryText.Requests.GetProductContactEmails.
        /// </summary>
        /// <remarks>
        /// Purpose: Resolve who receives the Send to Vendor email for a product.
        /// Request Flow: IAccessRequestService -> AccessRequestRepository.GetProductContactEmailsAsync() -> Database.
        /// Validation Details: ProductId parameter mapping.
        /// Business Logic: Maps rows to AccessRequestRecipientOutput.
        /// Repository Interaction: Runs SQLQueryText.Requests.GetProductContactEmails (CommandType.Text).
        /// Response Details: Returns a list of recipient email records.
        /// </remarks>
        /// <param name="productId">Catalog product identifier.</param>
        /// <returns>A list of recipient email records.</returns>
        public async Task<List<AccessRequestRecipientOutput>> GetProductContactEmailsAsync(int productId)
        {
            var parameters = new DynamicParameters();
            parameters.Add(DBParameterName.AccessRequestParams.ProductId, productId, DbType.Int32);
            var result = await dapperHandler.QueryAsync<AccessRequestRecipientOutput>(SQLQueryText.Requests.GetProductContactEmails, parameters, CommandType.Text);
            return result.ToList();
        }

        #endregion GET Methods

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
        /// <returns>The updated access request identifier and the product line that was acted on.</returns>
        public async Task<AccessRequestStatusUpdateResult> UpdateAccessRequestStatusAsync(AccessRequestStatusInput input)
        {
            ArgumentNullException.ThrowIfNull(input);
            var parameters = new DynamicParameters();
            parameters.Add(DBParameterName.AccessRequestParams.ActionId, 2, DbType.Int32);
            parameters.Add(DBParameterName.AccessRequestParams.AccessRequestId, input.AccessRequestId, DbType.Int32);
            parameters.Add(DBParameterName.AccessRequestParams.AccessRequestProductId, input.AccessRequestProductId, DbType.Int64);
            parameters.Add(DBParameterName.AccessRequestParams.Status, input.Status, DbType.String);
            parameters.Add(DBParameterName.AccessRequestParams.Note, input.Note, DbType.String);
            parameters.Add(DBParameterName.AccessRequestParams.UpdatedBy, currentUserService.UserId, DbType.Int64);
            parameters.Add(DBParameterName.AccessRequestParams.ReturnValue, dbType: DbType.Int32, direction: ParameterDirection.Output);
            parameters.Add(DBParameterName.AccessRequestParams.ResolvedAccessRequestProductId, dbType: DbType.Int64, direction: ParameterDirection.Output);
            _ = await dapperHandler.ExecuteAsync(StoredProc.Requests.AccessRequestCrud, parameters, CommandType.StoredProcedure);
            long? resolvedProductId = parameters.Get<long?>(DBParameterName.AccessRequestParams.ResolvedAccessRequestProductId);
            return new AccessRequestStatusUpdateResult
            {
                AccessRequestId = parameters.Get<int>(DBParameterName.AccessRequestParams.ReturnValue),
                AccessRequestProductId = resolvedProductId.HasValue ? (int)resolvedProductId.Value : null,
            };
        }

        #endregion PUT Methods

        #region GET Methods (Org Setup)

        /// <summary>
        /// Fetches the contact/org fields needed to call SMS's SetupNewOrganizationByCFR, using SQLQueryText.Requests.GetOrgSetupContext.
        /// </summary>
        /// <remarks>
        /// Purpose: Supply firstName/lastName/organizationName/address/city/state/postalCode/contactNo/emailAddress/cfrOrgID/cfrUserID/productName for the external call.
        /// Request Flow: IAccessRequestService -> AccessRequestRepository.GetOrgSetupContextAsync() -> SQL Database.
        /// Validation Details: AccessRequestId parameter mapping.
        /// Business Logic: OrganizationName/Address/City/State/Zip are read directly from
        /// request.AccessRequest (staged there at submission - see ActionId 7), not from
        /// core.Organization, since that row doesn't exist until approval creates it (ActionId 2).
        /// Email falls back to auth.User.Email when ContactEmail is blank, same convention as ActionId 3/4.
        /// ProductName comes from the request's first (lowest AccessRequestProductId) line item -
        /// same "TOP (1) ... ORDER BY AccessRequestProductId" convention PersistOrgSetupResultAsync
        /// uses - so the caller can route to a product-specific SMS setup endpoint (e.g. Parish Hub).
        /// Repository Interaction: Runs SQLQueryText.Requests.GetOrgSetupContext (plain SELECT joining request.AccessRequest to auth.User, request.AccessRequestProduct, and core.Product, CommandType.Text) - deliberately not a stored procedure.
        /// Response Details: Returns OrgSetupContextOutput, or null when not found.
        /// </remarks>
        /// <param name="accessRequestId">Access request identifier.</param>
        /// <param name="accessRequestProductId">The specific product line just approved.</param>
        /// <returns>The org-setup context, or null when the request/line doesn't exist.</returns>
        public async Task<OrgSetupContextOutput?> GetOrgSetupContextAsync(int accessRequestId, int accessRequestProductId)
        {
            var parameters = new DynamicParameters();
            parameters.Add(DBParameterName.AccessRequestParams.AccessRequestId, accessRequestId, DbType.Int32);
            parameters.Add(DBParameterName.AccessRequestParams.AccessRequestProductId, accessRequestProductId, DbType.Int64);
            return await dapperHandler.QueryFirstOrDefaultAsync<OrgSetupContextOutput?>(SQLQueryText.Requests.GetOrgSetupContext, parameters, CommandType.Text);
        }

        #endregion GET Methods (Org Setup)

        #region PUT Methods (Org Setup)

        /// <summary>
        /// Writes the OrgId returned by SMS's SetupNewOrganizationByCFR back into CFR's own
        /// license rows, using the SQLQueryText.Requests.* query texts (no stored procedure). SMS's
        /// returned UserId is deliberately not used anywhere.
        /// </summary>
        /// <remarks>
        /// Purpose: Record the product-side org identifier so App Hub / launch (gated on
        /// [lic].[OrganizationProduct]) can use it.
        /// Request Flow: IAccessRequestService -> AccessRequestRepository.PersistOrgSetupResultAsync() -> Database.
        /// Validation Details: AccessRequestId/OrgId parameter mapping.
        /// Business Logic: Resolves CFROrgId/ProductId/org snapshot fields from the request's own
        /// header + first product line (same "first pending line" convention as
        /// [request].[AccessRequestManage] ActionId 2). No [core].[Organization] row exists yet at
        /// this point (approve no longer creates one, and SMS is called before any CFR-side org
        /// exists) - one is created HERE, from the org fields staged on [request].[AccessRequest]
        /// at submission, and [request].[AccessRequest].[OrgId] is pointed at it. Only then is
        /// [lic].[OrganizationProduct] created/reactivated with [ProductOrgId] set to the real SMS
        /// OrgId - this method only runs once SMS's SetupNewOrganizationByCFR has already
        /// succeeded, so a member is never granted access if SMS provisioning fails.
        /// Repository Interaction: Runs SQLQueryText.Requests.GetOrgSetupPersistContext / InsertOrganization / UpdateAccessRequestOrgId / GetExistingOrganizationProduct / UpdateOrganizationProduct / InsertOrganizationProduct (CommandType.Text) - deliberately not a stored procedure.
        /// Response Details: None.
        /// </remarks>
        /// <param name="accessRequestId">Access request identifier.</param>
        /// <param name="accessRequestProductId">The specific product line just approved.</param>
        /// <param name="orgId">The OrgId returned by SMS.</param>
        public async Task PersistOrgSetupResultAsync(int accessRequestId, int accessRequestProductId, int orgId)
        {
            var contextParameters = new DynamicParameters();
            contextParameters.Add(DBParameterName.AccessRequestParams.AccessRequestId, accessRequestId, DbType.Int32);
            contextParameters.Add(DBParameterName.AccessRequestParams.AccessRequestProductId, accessRequestProductId, DbType.Int64);
            var context = await dapperHandler.QueryFirstOrDefaultAsync<OrgSetupPersistContext?>(SQLQueryText.Requests.GetOrgSetupPersistContext, contextParameters, CommandType.Text);
            if (context is null || context.ProductId is null or <= 0)
            {
                return;
            }

            int cfrOrgId = context.CFROrgId ?? 0;
            if (cfrOrgId <= 0)
            {
                var insertOrgParameters = new DynamicParameters();
                insertOrgParameters.Add(DBParameterName.AccessRequestParams.OrgName, context.OrgName, DbType.String);
                insertOrgParameters.Add(DBParameterName.AccessRequestParams.OrgState, context.OrgState, DbType.String);
                insertOrgParameters.Add(DBParameterName.AccessRequestParams.ContactEmail, context.ContactEmail, DbType.String);
                insertOrgParameters.Add(
                    DBParameterName.AccessRequestParams.ContactPerson,
                    $"{context.FirstName} {context.LastName}".Trim(),
                    DbType.String);
                insertOrgParameters.Add(DBParameterName.AccessRequestParams.ContactPhone, context.ContactPhone, DbType.String);
                insertOrgParameters.Add(DBParameterName.AccessRequestParams.InsertedBy, currentUserService.UserId, DbType.Int64);
                cfrOrgId = await dapperHandler.ExecuteScalarAsync<int>(SQLQueryText.Requests.InsertOrganization, insertOrgParameters, CommandType.Text);

                var updateAccessRequestOrgIdParameters = new DynamicParameters();
                updateAccessRequestOrgIdParameters.Add(DBParameterName.AccessRequestParams.OrgId, cfrOrgId, DbType.Int32);
                updateAccessRequestOrgIdParameters.Add(DBParameterName.AccessRequestParams.AccessRequestId, accessRequestId, DbType.Int32);
                await dapperHandler.ExecuteAsync(SQLQueryText.Requests.UpdateAccessRequestOrgId, updateAccessRequestOrgIdParameters, CommandType.Text);
            }

            // Organization-level license/assignment. Only granted here, after SMS has already
            // confirmed the org was provisioned successfully - mirrors the active/reactivate/insert
            // shape [request].[AccessRequestManage] ActionId 2 used to apply unconditionally on approve.
            var existingOrgProductParameters = new DynamicParameters();
            existingOrgProductParameters.Add(DBParameterName.AccessRequestParams.CFROrgId, cfrOrgId, DbType.Int32);
            existingOrgProductParameters.Add(DBParameterName.AccessRequestParams.ProductId, context.ProductId, DbType.Int32);
            var existingOrgProduct = await dapperHandler.QueryFirstOrDefaultAsync<OrganizationProductLookupOutput?>(SQLQueryText.Requests.GetExistingOrganizationProduct, existingOrgProductParameters, CommandType.Text);

            if (existingOrgProduct is not null)
            {
                var updateOrgProductParameters = new DynamicParameters();
                updateOrgProductParameters.Add(DBParameterName.AccessRequestParams.ProductOrgId, orgId, DbType.Int32);
                updateOrgProductParameters.Add(DBParameterName.AccessRequestParams.OrganizationProductId, existingOrgProduct.OrganizationProductId, DbType.Int32);
                await dapperHandler.ExecuteAsync(SQLQueryText.Requests.UpdateOrganizationProduct, updateOrgProductParameters, CommandType.Text);
            }
            else
            {
                var insertOrgProductParameters = new DynamicParameters();
                insertOrgProductParameters.Add(DBParameterName.AccessRequestParams.CFROrgId, cfrOrgId, DbType.Int32);
                insertOrgProductParameters.Add(DBParameterName.AccessRequestParams.ProductOrgId, orgId, DbType.Int32);
                insertOrgProductParameters.Add(DBParameterName.AccessRequestParams.ProductId, context.ProductId, DbType.Int32);
                insertOrgProductParameters.Add(DBParameterName.AccessRequestParams.OrgName, context.OrgName, DbType.String);
                insertOrgProductParameters.Add(DBParameterName.AccessRequestParams.OrgState, context.OrgState, DbType.String);
                insertOrgProductParameters.Add(DBParameterName.AccessRequestParams.ContactEmail, context.ContactEmail, DbType.String);
                insertOrgProductParameters.Add(
                    DBParameterName.AccessRequestParams.ContactPerson,
                    $"{context.FirstName} {context.LastName}".Trim(),
                    DbType.String);
                insertOrgProductParameters.Add(DBParameterName.AccessRequestParams.ContactPhone, context.ContactPhone, DbType.String);
                await dapperHandler.ExecuteAsync(SQLQueryText.Requests.InsertOrganizationProduct, insertOrgProductParameters, CommandType.Text);
            }
        }

        #endregion PUT Methods (Org Setup)
    }
}

