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

        /// <summary>
        /// Fetches the real users linked to an organization using StoredProc.Organization.OrganizationCrud.
        /// </summary>
        /// <remarks>
        /// Purpose: Populate the Users section of the organization detail page.
        /// Request Flow: IOrganizationService -> OrganizationRepository.GetOrganizationUsersAsync() -> Database.
        /// Validation Details: OrgId parameter mapping.
        /// Business Logic: Maps the joined auth.OrganizationUser + auth.AuthUser rows to OrganizationUserOutput.
        /// Repository Interaction: Executes StoredProc.Organization.OrganizationCrud with ActionId 5.
        /// Response Details: Returns a list of organization user output records.
        /// </remarks>
        /// <param name="orgId">Organization identifier.</param>
        /// <returns>A list of users linked to the organization.</returns>
        public async Task<List<OrganizationUserOutput>> GetOrganizationUsersAsync(long orgId)
        {
            var parameters = new DynamicParameters();
            parameters.Add(DBParameterName.OrganizationParams.ActionId, 5, DbType.Int32);
            parameters.Add(DBParameterName.OrganizationParams.OrgId, orgId, DbType.Int64);
            var result = await dapperHandler.QueryAsync<OrganizationUserOutput>(StoredProc.Organization.OrganizationCrud, parameters, CommandType.StoredProcedure);
            return result.ToList();
        }

        /// <summary>
        /// Fetches one member's organization-membership detail plus effective app access using StoredProc.Organization.OrganizationCrud.
        /// </summary>
        /// <remarks>
        /// Purpose: Populate the Organization Users tab's user-detail view.
        /// Request Flow: IOrganizationService -> OrganizationRepository.GetOrganizationUserDetailAsync() -> Database.
        /// Validation Details: OrgId/AuthUserId parameter mapping.
        /// Business Logic: Reads the membership header row, then the effective-app-access rows, and assigns the list onto the header.
        /// Repository Interaction: Executes StoredProc.Organization.OrganizationCrud with ActionId 14.
        /// Response Details: Returns an OrganizationUserDetailOutput record, or null when not found.
        /// </remarks>
        /// <param name="orgId">Organization identifier.</param>
        /// <param name="authUserId">Member identifier.</param>
        /// <returns>The matching membership detail, or null when not found.</returns>
        public async Task<OrganizationUserDetailOutput?> GetOrganizationUserDetailAsync(long orgId, long authUserId)
        {
            var parameters = new DynamicParameters();
            parameters.Add(DBParameterName.OrganizationParams.ActionId, 14, DbType.Int32);
            parameters.Add(DBParameterName.OrganizationParams.OrgId, orgId, DbType.Int64);
            parameters.Add(DBParameterName.OrganizationParams.AuthUserId, authUserId, DbType.Int64);
            using var grid = await dapperHandler.QueryMultipleAsync(StoredProc.Organization.OrganizationCrud, parameters, CommandType.StoredProcedure);
            var detail = (await grid.ReadAsync<OrganizationUserDetailOutput>()).FirstOrDefault();
            if (detail == null) return null;
            detail.Apps = (await grid.ReadAsync<ProductLookupOutput>()).AsList();
            return detail;
        }

        /// <summary>
        /// Fetches the real products assigned to an organization using StoredProc.Organization.OrganizationCrud.
        /// </summary>
        /// <remarks>
        /// Purpose: Populate the Products section of the organization detail page.
        /// Request Flow: IOrganizationService -> OrganizationRepository.GetOrganizationProductsAsync() -> Database.
        /// Validation Details: OrgId parameter mapping.
        /// Business Logic: Maps the joined lic.OrganizationProduct + core.Product rows to OrganizationProductOutput.
        /// Repository Interaction: Executes StoredProc.Organization.OrganizationCrud with ActionId 6.
        /// Response Details: Returns a list of organization product output records.
        /// </remarks>
        /// <param name="orgId">Organization identifier.</param>
        /// <returns>A list of products assigned to the organization.</returns>
        public async Task<List<OrganizationProductOutput>> GetOrganizationProductsAsync(long orgId)
        {
            var parameters = new DynamicParameters();
            parameters.Add(DBParameterName.OrganizationParams.ActionId, 6, DbType.Int32);
            parameters.Add(DBParameterName.OrganizationParams.OrgId, orgId, DbType.Int64);
            var result = await dapperHandler.QueryAsync<OrganizationProductOutput>(StoredProc.Organization.OrganizationCrud, parameters, CommandType.StoredProcedure);
            return result.ToList();
        }

        /// <summary>
        /// Fetches the products not yet assigned to an organization using StoredProc.Organization.OrganizationCrud.
        /// </summary>
        /// <remarks>
        /// Purpose: Populate the assign-product dropdown on the Products tab.
        /// Request Flow: IOrganizationService -> OrganizationRepository.GetAssignableProductsAsync() -> Database.
        /// Validation Details: OrgId parameter mapping.
        /// Business Logic: Maps rows to ProductLookupOutput.
        /// Repository Interaction: Executes StoredProc.Organization.OrganizationCrud with ActionId 7.
        /// Response Details: Returns a list of assignable product output records.
        /// </remarks>
        /// <param name="orgId">Organization identifier.</param>
        /// <returns>A list of products not yet assigned to the organization.</returns>
        public async Task<List<ProductLookupOutput>> GetAssignableProductsAsync(long orgId)
        {
            var parameters = new DynamicParameters();
            parameters.Add(DBParameterName.OrganizationParams.ActionId, 7, DbType.Int32);
            parameters.Add(DBParameterName.OrganizationParams.OrgId, orgId, DbType.Int64);
            var result = await dapperHandler.QueryAsync<ProductLookupOutput>(StoredProc.Organization.OrganizationCrud, parameters, CommandType.StoredProcedure);
            return result.ToList();
        }

        /// <summary>
        /// Fetches the real licenses issued against an organization's assigned products using StoredProc.Organization.OrganizationCrud.
        /// </summary>
        /// <remarks>
        /// Purpose: Populate the Licenses section of the organization detail page.
        /// Request Flow: IOrganizationService -> OrganizationRepository.GetOrganizationLicensesAsync() -> Database.
        /// Validation Details: OrgId parameter mapping.
        /// Business Logic: Maps the joined lic.License + lic.OrganizationProduct + core.Product rows to OrganizationLicenseOutput.
        /// Repository Interaction: Executes StoredProc.Organization.OrganizationCrud with ActionId 10.
        /// Response Details: Returns a list of organization license output records.
        /// </remarks>
        /// <param name="orgId">Organization identifier.</param>
        /// <returns>A list of licenses issued against the organization's products.</returns>
        public async Task<List<OrganizationLicenseOutput>> GetOrganizationLicensesAsync(long orgId)
        {
            var parameters = new DynamicParameters();
            parameters.Add(DBParameterName.OrganizationParams.ActionId, 10, DbType.Int32);
            parameters.Add(DBParameterName.OrganizationParams.OrgId, orgId, DbType.Int64);
            var result = await dapperHandler.QueryAsync<OrganizationLicenseOutput>(StoredProc.Organization.OrganizationCrud, parameters, CommandType.StoredProcedure);
            return result.ToList();
        }

        #endregion GET Methods

        #region POST Methods

        /// <summary>
        /// Creates a new organization using StoredProc.Organization.OrganizationCrud.
        /// </summary>
        /// <remarks>
        /// Purpose: Add a new organization from the Add Organization page.
        /// Request Flow: IOrganizationService -> OrganizationRepository.CreateOrganizationAsync() -> Database.
        /// Validation Details: Maps CreateOrganizationInput to stored procedure parameters.
        /// Business Logic: Executes StoredProc.Organization.OrganizationCrud with ActionId 4; SQL assigns the next OrgId.
        /// Repository Interaction: Executes StoredProc.Organization.OrganizationCrud.
        /// Response Details: Returns the scalar integer result from the stored procedure (the new org id).
        /// </remarks>
        /// <param name="input">Input DTO containing the new organization's fields.</param>
        /// <param name="insertedBy">Logged-in user identifier creating the organization.</param>
        /// <returns>Scalar result of the create stored procedure.</returns>
        public async Task<int> CreateOrganizationAsync(CreateOrganizationInput input, long? insertedBy)
        {
            ArgumentNullException.ThrowIfNull(input);
            var parameters = new DynamicParameters();
            parameters.Add(DBParameterName.OrganizationParams.ActionId, 4, DbType.Int32);
            parameters.Add(DBParameterName.OrganizationParams.OrgName, input.OrgName, DbType.String);
            parameters.Add(DBParameterName.OrganizationParams.OrgStatus, input.OrgStatus, DbType.String);
            parameters.Add(DBParameterName.OrganizationParams.OrgType, input.OrgType, DbType.String);
            parameters.Add(DBParameterName.OrganizationParams.ContactEmail, input.ContactEmail, DbType.String);
            parameters.Add(DBParameterName.OrganizationParams.Website, input.Website, DbType.String);
            parameters.Add(DBParameterName.OrganizationParams.ContactPerson, input.ContactPerson, DbType.String);
            parameters.Add(DBParameterName.OrganizationParams.ContactPhone, input.ContactPhone, DbType.String);
            parameters.Add(DBParameterName.OrganizationParams.Address, input.Address, DbType.String);
            parameters.Add(DBParameterName.OrganizationParams.City, input.City, DbType.String);
            parameters.Add(DBParameterName.OrganizationParams.State, input.State, DbType.String);
            parameters.Add(DBParameterName.OrganizationParams.Zip, input.Zip, DbType.String);
            parameters.Add(DBParameterName.OrganizationParams.UpdatedBy, insertedBy, DbType.Int64);
            parameters.Add(DBParameterName.OrganizationParams.ReturnValue, dbType: DbType.Int32, direction: ParameterDirection.Output);
            _ = await dapperHandler.ExecuteAsync(StoredProc.Organization.OrganizationCrud, parameters, CommandType.StoredProcedure);
            return parameters.Get<int>(DBParameterName.OrganizationParams.ReturnValue);
        }

        /// <summary>
        /// Assigns a product to an organization using StoredProc.Organization.OrganizationCrud.
        /// </summary>
        /// <remarks>
        /// Purpose: Give an organization access to a product from the Products tab.
        /// Request Flow: IOrganizationService -> OrganizationRepository.AssignOrganizationProductAsync() -> Database.
        /// Validation Details: Maps AssignOrganizationProductInput to stored procedure parameters.
        /// Business Logic: Executes StoredProc.Organization.OrganizationCrud with ActionId 8.
        /// Repository Interaction: Executes StoredProc.Organization.OrganizationCrud.
        /// Response Details: Returns the scalar integer result from the stored procedure.
        /// </remarks>
        /// <param name="input">Input DTO containing the organization and product identifiers.</param>
        /// <param name="updatedBy">Logged-in user identifier performing the assignment.</param>
        /// <returns>Scalar result of the assign stored procedure.</returns>
        public async Task<int> AssignOrganizationProductAsync(AssignOrganizationProductInput input, long? updatedBy)
        {
            ArgumentNullException.ThrowIfNull(input);
            var parameters = new DynamicParameters();
            parameters.Add(DBParameterName.OrganizationParams.ActionId, 8, DbType.Int32);
            parameters.Add(DBParameterName.OrganizationParams.OrgId, input.OrgId, DbType.Int64);
            parameters.Add(DBParameterName.OrganizationParams.ProductId, input.ProductId, DbType.Int32);
            parameters.Add(DBParameterName.OrganizationParams.UpdatedBy, updatedBy, DbType.Int64);
            parameters.Add(DBParameterName.OrganizationParams.ReturnValue, dbType: DbType.Int32, direction: ParameterDirection.Output);
            _ = await dapperHandler.ExecuteAsync(StoredProc.Organization.OrganizationCrud, parameters, CommandType.StoredProcedure);
            return parameters.Get<int>(DBParameterName.OrganizationParams.ReturnValue);
        }

        #endregion POST Methods

        #region DELETE Methods

        /// <summary>
        /// Removes a product assignment from an organization using StoredProc.Organization.OrganizationCrud.
        /// </summary>
        /// <remarks>
        /// Purpose: Revoke an organization's access to a product from the Products tab.
        /// Request Flow: IOrganizationService -> OrganizationRepository.RemoveOrganizationProductAsync() -> Database.
        /// Validation Details: OrgId/ProductId parameter mapping.
        /// Business Logic: Executes StoredProc.Organization.OrganizationCrud with ActionId 9.
        /// Repository Interaction: Executes StoredProc.Organization.OrganizationCrud.
        /// Response Details: Returns the scalar integer result from the stored procedure.
        /// </remarks>
        /// <param name="orgId">Organization identifier.</param>
        /// <param name="productId">Product identifier to remove.</param>
        /// <param name="updatedBy">Logged-in user identifier performing the removal.</param>
        /// <returns>Scalar result of the remove stored procedure.</returns>
        public async Task<int> RemoveOrganizationProductAsync(long orgId, int productId, long? updatedBy)
        {
            var parameters = new DynamicParameters();
            parameters.Add(DBParameterName.OrganizationParams.ActionId, 9, DbType.Int32);
            parameters.Add(DBParameterName.OrganizationParams.OrgId, orgId, DbType.Int64);
            parameters.Add(DBParameterName.OrganizationParams.ProductId, productId, DbType.Int32);
            parameters.Add(DBParameterName.OrganizationParams.UpdatedBy, updatedBy, DbType.Int64);
            parameters.Add(DBParameterName.OrganizationParams.ReturnValue, dbType: DbType.Int32, direction: ParameterDirection.Output);
            _ = await dapperHandler.ExecuteAsync(StoredProc.Organization.OrganizationCrud, parameters, CommandType.StoredProcedure);
            return parameters.Get<int>(DBParameterName.OrganizationParams.ReturnValue);
        }

        /// <summary>
        /// Unlinks a user from an organization using StoredProc.Organization.OrganizationCrud.
        /// </summary>
        /// <remarks>
        /// Purpose: Remove a user from an organization from the Users tab.
        /// Request Flow: IOrganizationService -> OrganizationRepository.UnlinkOrganizationUserAsync() -> Database.
        /// Validation Details: OrgId/AuthUserId parameter mapping.
        /// Business Logic: Executes StoredProc.Organization.OrganizationCrud with ActionId 13.
        /// Repository Interaction: Executes StoredProc.Organization.OrganizationCrud.
        /// Response Details: Returns the scalar integer result from the stored procedure.
        /// </remarks>
        /// <param name="orgId">Organization identifier.</param>
        /// <param name="authUserId">User identifier to unlink.</param>
        /// <param name="updatedBy">Logged-in user identifier performing the removal.</param>
        /// <returns>Scalar result of the unlink stored procedure.</returns>
        public async Task<int> UnlinkOrganizationUserAsync(long orgId, long authUserId, long? updatedBy)
        {
            var parameters = new DynamicParameters();
            parameters.Add(DBParameterName.OrganizationParams.ActionId, 13, DbType.Int32);
            parameters.Add(DBParameterName.OrganizationParams.OrgId, orgId, DbType.Int64);
            parameters.Add(DBParameterName.OrganizationParams.AuthUserId, authUserId, DbType.Int64);
            parameters.Add(DBParameterName.OrganizationParams.UpdatedBy, updatedBy, DbType.Int64);
            parameters.Add(DBParameterName.OrganizationParams.ReturnValue, dbType: DbType.Int32, direction: ParameterDirection.Output);
            _ = await dapperHandler.ExecuteAsync(StoredProc.Organization.OrganizationCrud, parameters, CommandType.StoredProcedure);
            return parameters.Get<int>(DBParameterName.OrganizationParams.ReturnValue);
        }

        #endregion DELETE Methods

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
            parameters.Add(DBParameterName.OrganizationParams.OrgType, input.OrgType, DbType.String);
            parameters.Add(DBParameterName.OrganizationParams.ContactEmail, input.ContactEmail, DbType.String);
            parameters.Add(DBParameterName.OrganizationParams.Website, input.Website, DbType.String);
            parameters.Add(DBParameterName.OrganizationParams.ContactPerson, input.ContactPerson, DbType.String);
            parameters.Add(DBParameterName.OrganizationParams.ContactPhone, input.ContactPhone, DbType.String);
            parameters.Add(DBParameterName.OrganizationParams.Address, input.Address, DbType.String);
            parameters.Add(DBParameterName.OrganizationParams.City, input.City, DbType.String);
            parameters.Add(DBParameterName.OrganizationParams.State, input.State, DbType.String);
            parameters.Add(DBParameterName.OrganizationParams.Zip, input.Zip, DbType.String);
            parameters.Add(DBParameterName.OrganizationParams.UpdatedBy, updatedBy, DbType.Int64);
            parameters.Add(DBParameterName.OrganizationParams.ReturnValue, dbType: DbType.Int32, direction: ParameterDirection.Output);
            _ = await dapperHandler.ExecuteAsync(StoredProc.Organization.OrganizationCrud, parameters, CommandType.StoredProcedure);
            return parameters.Get<int>(DBParameterName.OrganizationParams.ReturnValue);
        }

        #endregion PUT Methods
    }
}
