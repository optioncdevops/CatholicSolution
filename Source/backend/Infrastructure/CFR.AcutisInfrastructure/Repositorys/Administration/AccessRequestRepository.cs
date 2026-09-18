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

        #region GET Methods (Org Setup)

        /// <summary>
        /// Fetches the contact/org fields needed to call SMS's SetupNewOrganizationByCFR, via inline SQL text.
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
        /// Repository Interaction: Runs a plain SELECT joining request.AccessRequest to auth.User, request.AccessRequestProduct, and core.Product (CommandType.Text) - deliberately not a stored procedure.
        /// Response Details: Returns OrgSetupContextOutput, or null when not found.
        /// </remarks>
        /// <param name="accessRequestId">Access request identifier.</param>
        /// <returns>The org-setup context, or null when the request doesn't exist.</returns>
        public async Task<OrgSetupContextOutput?> GetOrgSetupContextAsync(int accessRequestId)
        {
            const string sql = @"
                SELECT
                    CAST(ar.[OrgId] AS INT) AS [OrgId],
                    CAST(ar.[RequestedBy] AS INT) AS [CFRUserId],
                    ar.[RequesterFirstName] AS [FirstName],
                    ar.[RequesterLastName] AS [LastName],
                    ar.[ContactPhone] AS [Phone],
                    COALESCE(NULLIF(LTRIM(RTRIM(ar.[ContactEmail])), N''), u.[Email]) AS [Email],
                    ar.[OrganizationName] AS [OrganizationName],
                    ar.[Address] AS [Address],
                    ar.[City] AS [City],
                    ar.[State] AS [State],
                    ar.[Zip] AS [Zip],
                    ar.[DioceseId] AS [DioceseId],
                    p.[ProductName] AS [ProductName]
                FROM [request].[AccessRequest] ar
                LEFT JOIN [auth].[User] u ON u.[CFRUserId] = ar.[RequestedBy]
                LEFT JOIN (
                    SELECT TOP (1) arp.[AccessRequestId], arp.[ProductId]
                    FROM [request].[AccessRequestProduct] arp
                    WHERE arp.[AccessRequestId] = @AccessRequestId
                      AND arp.[IsDeleted] = 0
                    ORDER BY arp.[AccessRequestProductId]
                ) firstProduct ON firstProduct.[AccessRequestId] = ar.[AccessRequestId]
                LEFT JOIN [core].[Product] p ON p.[ProductId] = firstProduct.[ProductId]
                WHERE ar.[AccessRequestId] = @AccessRequestId
                  AND ar.[IsDeleted] = 0;";

            var parameters = new DynamicParameters();
            parameters.Add("AccessRequestId", accessRequestId, DbType.Int32);
            return await dapperHandler.QueryFirstOrDefaultAsync<OrgSetupContextOutput?>(sql, parameters, CommandType.Text);
        }

        #endregion GET Methods (Org Setup)

        #region PUT Methods (Org Setup)

        /// <summary>
        /// Writes the OrgId returned by SMS's SetupNewOrganizationByCFR back into CFR's own
        /// license rows, via inline SQL text (no stored procedure). SMS's returned UserId is
        /// deliberately not used anywhere.
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
        /// Repository Interaction: Runs plain SELECT/UPDATE/INSERT statements (CommandType.Text) - deliberately not a stored procedure.
        /// Response Details: None.
        /// </remarks>
        /// <param name="accessRequestId">Access request identifier.</param>
        /// <param name="orgId">The OrgId returned by SMS.</param>
        public async Task PersistOrgSetupResultAsync(int accessRequestId, int orgId)
        {
            const string contextSql = @"
                SELECT TOP (1)
                    CAST(ar.[OrgId] AS INT) AS [CFROrgId],
                    arp.[ProductId] AS [ProductId],
                    ar.[OrganizationName] AS [OrgName],
                    ar.[State] AS [OrgState],
                    ar.[ContactEmail] AS [ContactEmail],
                    ar.[ContactPhone] AS [ContactPhone],
                    ar.[RequesterFirstName] AS [FirstName],
                    ar.[RequesterLastName] AS [LastName]
                FROM [request].[AccessRequest] ar
                INNER JOIN [request].[AccessRequestProduct] arp
                    ON arp.[AccessRequestId] = ar.[AccessRequestId]
                   AND arp.[IsDeleted] = 0
                WHERE ar.[AccessRequestId] = @AccessRequestId
                  AND ar.[IsDeleted] = 0
                ORDER BY arp.[AccessRequestProductId];";

            var contextParameters = new DynamicParameters();
            contextParameters.Add("AccessRequestId", accessRequestId, DbType.Int32);
            var context = await dapperHandler.QueryFirstOrDefaultAsync<OrgSetupPersistContext?>(contextSql, contextParameters, CommandType.Text);
            if (context is null || context.ProductId is null or <= 0)
            {
                return;
            }

            int cfrOrgId = context.CFROrgId ?? 0;
            if (cfrOrgId <= 0)
            {
                var insertOrgParameters = new DynamicParameters();
                insertOrgParameters.Add("OrgName", context.OrgName, DbType.String);
                insertOrgParameters.Add("OrgState", context.OrgState, DbType.String);
                insertOrgParameters.Add("ContactEmail", context.ContactEmail, DbType.String);
                insertOrgParameters.Add(
                    "ContactPerson",
                    $"{context.FirstName} {context.LastName}".Trim(),
                    DbType.String);
                insertOrgParameters.Add("ContactPhone", context.ContactPhone, DbType.String);
                insertOrgParameters.Add("InsertedBy", currentUserService.UserId, DbType.Int64);
                cfrOrgId = await dapperHandler.ExecuteScalarAsync<int>(
                    @"INSERT INTO [core].[Organization]
                      ([OrgName], [OrgState], [ContactEmail], [ContactPerson], [ContactPhone], [InsertedDate], [InsertedBy], [IsDeleted])
                      VALUES
                      (@OrgName, @OrgState, @ContactEmail, @ContactPerson, @ContactPhone, SYSUTCDATETIME(), @InsertedBy, 0);
                      SELECT CAST(SCOPE_IDENTITY() AS INT);",
                    insertOrgParameters,
                    CommandType.Text);

                var updateAccessRequestOrgIdParameters = new DynamicParameters();
                updateAccessRequestOrgIdParameters.Add("OrgId", cfrOrgId, DbType.Int32);
                updateAccessRequestOrgIdParameters.Add("AccessRequestId", accessRequestId, DbType.Int32);
                await dapperHandler.ExecuteAsync(
                    @"UPDATE [request].[AccessRequest]
                      SET [OrgId] = @OrgId
                      WHERE [AccessRequestId] = @AccessRequestId;",
                    updateAccessRequestOrgIdParameters,
                    CommandType.Text);
            }

            // Organization-level license/assignment. Only granted here, after SMS has already
            // confirmed the org was provisioned successfully - mirrors the active/reactivate/insert
            // shape [request].[AccessRequestManage] ActionId 2 used to apply unconditionally on approve.
            var existingOrgProductParameters = new DynamicParameters();
            existingOrgProductParameters.Add("CFROrgId", cfrOrgId, DbType.Int32);
            existingOrgProductParameters.Add("ProductId", context.ProductId, DbType.Int32);
            var existingOrgProduct = await dapperHandler.QueryFirstOrDefaultAsync<OrganizationProductLookupOutput?>(
                @"SELECT TOP (1) [OrganizationProductId], [IsDeleted]
                  FROM [lic].[OrganizationProduct]
                  WHERE [CFROrgId] = @CFROrgId AND [ProductId] = @ProductId;",
                existingOrgProductParameters,
                CommandType.Text);

            if (existingOrgProduct is not null)
            {
                var updateOrgProductParameters = new DynamicParameters();
                updateOrgProductParameters.Add("ProductOrgId", orgId, DbType.Int32);
                updateOrgProductParameters.Add("OrganizationProductId", existingOrgProduct.OrganizationProductId, DbType.Int32);
                await dapperHandler.ExecuteAsync(
                    @"UPDATE [lic].[OrganizationProduct]
                      SET [ProductOrgId] = @ProductOrgId,
                          [AssignStatus] = 1,
                          [CreatedDate] = SYSUTCDATETIME(),
                          [ActiveStartDate] = SYSUTCDATETIME(),
                          [ActiveEndDate] = '9999-12-31',
                          [IsDeleted] = 0
                      WHERE [OrganizationProductId] = @OrganizationProductId;",
                    updateOrgProductParameters,
                    CommandType.Text);
            }
            else
            {
                var insertOrgProductParameters = new DynamicParameters();
                insertOrgProductParameters.Add("CFROrgId", cfrOrgId, DbType.Int32);
                insertOrgProductParameters.Add("ProductOrgId", orgId, DbType.Int32);
                insertOrgProductParameters.Add("ProductId", context.ProductId, DbType.Int32);
                insertOrgProductParameters.Add("OrgName", context.OrgName, DbType.String);
                insertOrgProductParameters.Add("OrgState", context.OrgState, DbType.String);
                insertOrgProductParameters.Add("ContactEmail", context.ContactEmail, DbType.String);
                insertOrgProductParameters.Add(
                    "ContactPerson",
                    $"{context.FirstName} {context.LastName}".Trim(),
                    DbType.String);
                insertOrgProductParameters.Add("ContactPhone", context.ContactPhone, DbType.String);
                await dapperHandler.ExecuteAsync(
                    @"INSERT INTO [lic].[OrganizationProduct]
                      (
                          [CFROrgId], [ProductOrgId], [ProductId],
                          [OrgName], [OrgState], [ContactEmail], [ContactPerson], [ContactPhone],
                          [OrgStatus], [AssignStatus], [ActiveStartDate], [ActiveEndDate], [CreatedDate], [IsDeleted]
                      )
                      VALUES
                      (
                          @CFROrgId, @ProductOrgId, @ProductId,
                          @OrgName, @OrgState, @ContactEmail, @ContactPerson, @ContactPhone,
                          1, 1, SYSUTCDATETIME(), '9999-12-31', SYSUTCDATETIME(), 0
                      );",
                    insertOrgProductParameters,
                    CommandType.Text);
            }
        }

        #endregion PUT Methods (Org Setup)
    }
}

