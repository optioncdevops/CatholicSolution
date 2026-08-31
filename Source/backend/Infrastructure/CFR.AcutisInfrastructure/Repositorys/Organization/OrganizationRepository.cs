// Copyright (c) OptionC. All rights reserved.

namespace CFR.AcutisInfrastructure.Repositorys.Organization
{
    /// <summary>
    /// Dapper implementation of IOrganizationRepository.
    /// Infrastructure Responsibility:
    /// - Uses IDapperHandler to execute stored procedures and map results to OrganizationOutput.
    /// </summary>
    public class OrganizationRepository(IDapperHandler dapperHandler): IOrganizationRepository
    {
        #region GET Methods

        /// <summary>
        /// Fetches all organizations using StoredProc.Organization.OrganizationCrud.
        /// </summary>
        /// <remarks>
        /// Purpose: Retrieve all organizations from the database.
        /// Request Flow: IOrganizationService -> OrganizationRepository.GetOrganizationsListAsync() -> Database.
        /// Validation Details: None.
        /// Business Logic: Maps stored procedure rows to OrganizationOutput.
        /// Repository Interaction: Executes StoredProc.Organization.OrganizationCrud with ActionId 1.
        /// Response Details: Returns a list of organization output records.
        /// </remarks>
        /// <returns>A list of organization output records.</returns>
        public async Task<List<OrganizationOutput>> GetOrganizationsListAsync()
        {
            var parameters = new DynamicParameters();
            parameters.Add(DBParameterName.OrganizationParams.ActionId, 1, DbType.Int32);
            var result = await dapperHandler.QueryAsync<OrganizationOutput>(StoredProc.Organization.OrganizationCrud, parameters, CommandType.StoredProcedure);
            return result.ToList();
        }

        /// <summary>
        /// Fetches one organization using StoredProc.Organization.OrganizationCrud.
        /// </summary>
        /// <remarks>
        /// Purpose: Retrieve a single organization from the database.
        /// Request Flow: IOrganizationService -> OrganizationRepository.GetOrganizationByIdAsync() -> Database.
        /// Validation Details: OrgId parameter mapping.
        /// Business Logic: Maps the stored procedure row to OrganizationOutput.
        /// Repository Interaction: Executes StoredProc.Organization.OrganizationCrud with ActionId 2.
        /// Response Details: Returns an OrganizationOutput record, or null when not found.
        /// </remarks>
        /// <param name="orgId">Organization identifier.</param>
        /// <returns>The matching organization, or null when not found.</returns>
        public async Task<OrganizationOutput?> GetOrganizationByIdAsync(long orgId)
        {
            var parameters = new DynamicParameters();
            parameters.Add(DBParameterName.OrganizationParams.ActionId, 2, DbType.Int32);
            parameters.Add(DBParameterName.OrganizationParams.OrgId, orgId, DbType.Int64);
            var result = await dapperHandler.QueryAsync<OrganizationOutput>(StoredProc.Organization.OrganizationCrud, parameters, CommandType.StoredProcedure);
            return result.FirstOrDefault();
        }

        #endregion GET Methods

        #region PUT Methods

        /// <summary>
        /// Updates an organization using StoredProc.Organization.OrganizationCrud.
        /// </summary>
        /// <remarks>
        /// Purpose: Save changes to an organization's core identity fields.
        /// Request Flow: IOrganizationService -> OrganizationRepository.UpdateOrganizationAsync() -> Database.
        /// Validation Details: Maps UpdateOrganizationInput to stored procedure parameters.
        /// Business Logic: Executes StoredProc.Organization.OrganizationCrud with ActionId 3.
        /// Repository Interaction: Executes StoredProc.Organization.OrganizationCrud.
        /// Response Details: Returns the scalar integer result from the stored procedure.
        /// </remarks>
        /// <param name="input">Input DTO containing the organization fields.</param>
        /// <param name="updatedBy">Logged-in user identifier performing the update.</param>
        /// <returns>Scalar result of the update stored procedure.</returns>
        public async Task<int> UpdateOrganizationAsync(UpdateOrganizationInput input, long? updatedBy)
        {
            ArgumentNullException.ThrowIfNull(input);
            var parameters = new DynamicParameters();
            parameters.Add(DBParameterName.OrganizationParams.ActionId, 3, DbType.Int32);
            parameters.Add(DBParameterName.OrganizationParams.OrgId, input.OrgId, DbType.Int64);
            parameters.Add(DBParameterName.OrganizationParams.OrgName, input.OrgName, DbType.String);
            parameters.Add(DBParameterName.OrganizationParams.OrgStatus, input.OrgStatus, DbType.String);
            parameters.Add(DBParameterName.OrganizationParams.ContactEmail, input.ContactEmail, DbType.String);
            parameters.Add(DBParameterName.OrganizationParams.Website, input.Website, DbType.String);
            parameters.Add(DBParameterName.OrganizationParams.ContactPerson, input.ContactPerson, DbType.String);
            parameters.Add(DBParameterName.OrganizationParams.ContactPhone, input.ContactPhone, DbType.String);
            parameters.Add(DBParameterName.OrganizationParams.UpdatedBy, updatedBy, DbType.Int64);
            parameters.Add(DBParameterName.OrganizationParams.ReturnValue, dbType: DbType.Int32, direction: ParameterDirection.Output);
            _ = await dapperHandler.ExecuteAsync(StoredProc.Organization.OrganizationCrud, parameters, CommandType.StoredProcedure);
            return parameters.Get<int>(DBParameterName.OrganizationParams.ReturnValue);
        }

        #endregion PUT Methods
    }
}
