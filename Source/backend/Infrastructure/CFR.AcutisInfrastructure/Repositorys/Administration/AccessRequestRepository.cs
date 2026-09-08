// Copyright (c) OptionC. All rights reserved.

using CFR.AcutisInfrastructure.Interfaces.Administration;
using CFR.AcutisInfrastructure.Models.Input;
using CFR.AcutisInfrastructure.Models.Output;

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
    }
}

