// Copyright (c) OptionC. All rights reserved.

namespace CFR.AcutisInfrastructure.Repositorys.Administration
{
    /// <summary>
    /// Dapper implementation of IUserRolesRepository for the Administration module.
    /// Infrastructure Responsibility:
    /// - Uses IDapperHandler to execute stored procedures and map results to UserRolesOutput.
    /// </summary>
    public class UserRolesRepository(IDapperHandler dapperHandler, ICurrentUserService currentUserService): IUserRolesRepository
    {
        #region GET Methods

        /// <summary>
        /// Fetches role rows using StoredProc.Administration.UserRolesCrud.
        /// </summary>
        /// <remarks>
        /// Purpose: Retrieve all Acutis roles from the database.
        /// Request Flow: IUserRolesService -> UserRolesRepository.GetUserRolesListAsync() -> Database.
        /// Validation Details: None.
        /// Business Logic: Maps stored procedure rows to UserRolesOutput.
        /// Repository Interaction: Executes StoredProc.Administration.UserRolesCrud with ActionId 4.
        /// Response Details: Returns a list of UserRolesOutput records.
        /// </remarks>
        /// <returns>A list of role output records.</returns>
        public async Task<List<UserRolesOutput>> GetUserRolesListAsync()
        {
            var parameters = new DynamicParameters();
            parameters.Add(DBParameterName.AdministrationParams.ActionId, 4, DbType.Int32);
            var result = await dapperHandler.QueryAsync<UserRolesOutput>(StoredProc.Administration.UserRolesCrud, parameters, CommandType.StoredProcedure);
            return result.ToList();
        }

        /// <summary>
        /// Fetches one role using StoredProc.Administration.UserRolesCrud.
        /// </summary>
        /// <remarks>
        /// Purpose: Retrieve a single Acutis role from the database.
        /// Request Flow: IUserRolesService -> UserRolesRepository.GetUserRoleByIdAsync() -> Database.
        /// Validation Details: RoleId parameter mapping.
        /// Business Logic: Maps the stored procedure row to UserRolesOutput.
        /// Repository Interaction: Executes StoredProc.Administration.UserRolesCrud with ActionId 3.
        /// Response Details: Returns a UserRolesOutput record or null.
        /// </remarks>
        /// <param name="roleId">Role identifier.</param>
        /// <returns>The matching role, or null when not found.</returns>
        public async Task<UserRolesOutput?> GetUserRoleByIdAsync(int roleId)
        {
            var parameters = new DynamicParameters();
            parameters.Add(DBParameterName.AdministrationParams.ActionId, 3, DbType.Int32);
            parameters.Add(DBParameterName.AdministrationParams.RoleId, roleId, DbType.Int32);
            var result = await dapperHandler.QueryAsync<UserRolesOutput>(StoredProc.Administration.UserRolesCrud, parameters, CommandType.StoredProcedure);
            return result.FirstOrDefault();
        }

        #endregion GET Methods

        #region POST Methods

        /// <summary>
        /// Adds or updates a role using StoredProc.Administration.UserRolesCrud.
        /// </summary>
        /// <remarks>
        /// Purpose: Insert or update an Acutis role.
        /// Request Flow: IUserRolesService -> UserRolesRepository.SaveUserRoleAsync() -> Database.
        /// Validation Details: Parameter names match stored procedure arguments.
        /// Business Logic: Binds UserRolesInput and executes the save stored procedure.
        /// Repository Interaction: Executes StoredProc.Administration.UserRolesCrud with ActionId 1.
        /// Response Details: Returns the scalar integer result from the stored procedure.
        /// </remarks>
        /// <param name="input">Input DTO containing role fields.</param>
        /// <returns>Scalar result of the save stored procedure.</returns>
        public async Task<int> SaveUserRoleAsync(UserRolesInput input)
        {
            ArgumentNullException.ThrowIfNull(input);
            var parameters = new DynamicParameters();
            parameters.Add(DBParameterName.AdministrationParams.ActionId, 1, DbType.Int32);
            parameters.Add(DBParameterName.AdministrationParams.RoleId, input.RoleId, DbType.Int32);
            parameters.Add(DBParameterName.AdministrationParams.RoleName, input.RoleName, DbType.String);
            parameters.Add(DBParameterName.AdministrationParams.Description, input.Description, DbType.String);
            parameters.Add(DBParameterName.AdministrationParams.Status, input.Status, DbType.String);
            parameters.Add(DBParameterName.AdministrationParams.InsertedBy, currentUserService.UserId, DbType.Int64);
            parameters.Add(DBParameterName.AdministrationParams.ReturnValue, dbType: DbType.Int32, direction: ParameterDirection.Output);
            _ = await dapperHandler.ExecuteAsync(StoredProc.Administration.UserRolesCrud, parameters, CommandType.StoredProcedure);
            return parameters.Get<int>(DBParameterName.AdministrationParams.ReturnValue);
        }

        #endregion POST Methods

        #region PUT Methods

        /// <summary>
        /// Updates role status using StoredProc.Administration.UserRolesCrud.
        /// </summary>
        /// <remarks>
        /// Purpose: Activate or deactivate an Acutis role.
        /// Request Flow: IUserRolesService -> UserRolesRepository.UpdateUserRoleStatusAsync() -> Database.
        /// Validation Details: RoleId and Status parameter mapping.
        /// Business Logic: Binds the status payload and executes the update stored procedure.
        /// Repository Interaction: Executes StoredProc.Administration.UserRolesCrud with ActionId 2.
        /// Response Details: Returns the updated role identifier.
        /// </remarks>
        /// <param name="input">Status change payload.</param>
        /// <returns>The updated role identifier.</returns>
        public async Task<int> UpdateUserRoleStatusAsync(UserRoleStatusInput input)
        {
            ArgumentNullException.ThrowIfNull(input);
            var parameters = new DynamicParameters();
            parameters.Add(DBParameterName.AdministrationParams.ActionId, 2, DbType.Int32);
            parameters.Add(DBParameterName.AdministrationParams.RoleId, input.RoleId, DbType.Int32);
            parameters.Add(DBParameterName.AdministrationParams.Status, input.Status, DbType.String);
            parameters.Add(DBParameterName.AdministrationParams.UpdatedBy, currentUserService.UserId, DbType.Int64);
            parameters.Add(DBParameterName.AdministrationParams.ReturnValue, dbType: DbType.Int32, direction: ParameterDirection.Output);
            _ = await dapperHandler.ExecuteAsync(StoredProc.Administration.UserRolesCrud, parameters, CommandType.StoredProcedure);
            return parameters.Get<int>(DBParameterName.AdministrationParams.ReturnValue);
        }

        #endregion PUT Methods

        #region DELETE Methods

        /// <summary>
        /// Soft-deletes a role using StoredProc.Administration.UserRolesCrud.
        /// </summary>
        /// <remarks>
        /// Purpose: Remove an Acutis role that is not assigned to users.
        /// Request Flow: IUserRolesService -> UserRolesRepository.DeleteUserRoleAsync() -> Database.
        /// Validation Details: RoleId parameter mapping.
        /// Business Logic: Binds the identifier and executes the delete stored procedure.
        /// Repository Interaction: Executes StoredProc.Administration.UserRolesCrud with ActionId 5.
        /// Response Details: Returns the RoleId, or -98 when the role is in use.
        /// </remarks>
        /// <param name="roleId">Role identifier.</param>
        /// <returns>Scalar result of the delete stored procedure.</returns>
        public async Task<int> DeleteUserRoleAsync(int roleId)
        {
            var parameters = new DynamicParameters();
            parameters.Add(DBParameterName.AdministrationParams.ActionId, 5, DbType.Int32);
            parameters.Add(DBParameterName.AdministrationParams.RoleId, roleId, DbType.Int32);
            parameters.Add(DBParameterName.AdministrationParams.UpdatedBy, currentUserService.UserId, DbType.Int64);
            parameters.Add(DBParameterName.AdministrationParams.ReturnValue, dbType: DbType.Int32, direction: ParameterDirection.Output);
            _ = await dapperHandler.ExecuteAsync(StoredProc.Administration.UserRolesCrud, parameters, CommandType.StoredProcedure);
            return parameters.Get<int>(DBParameterName.AdministrationParams.ReturnValue);
        }

        #endregion DELETE Methods
    }
}
