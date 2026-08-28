// Copyright (c) OptionC. All rights reserved.

namespace CFR.AcutisInfrastructure.Repositorys.Administration
{
    /// <summary>
    /// Dapper implementation of IUsersRepository for the Administration module.
    /// Infrastructure Responsibility:
    /// - Uses IDapperHandler to execute stored procedures and map results to UsersOutput.
    /// - Stamps InsertedBy / UpdatedBy from ICurrentUserService.UserId.
    /// </summary>
    public class UsersRepository(IDapperHandler dapperHandler, ICurrentUserService currentUserService): IUsersRepository
    {
        #region GET Methods

        /// <summary>
        /// Fetches user rows using StoredProc.Administration.UsersCrud.
        /// </summary>
        /// <remarks>
        /// Purpose: Retrieve all Acutis users from the database.
        /// Request Flow: IUsersService -> UsersRepository.GetUsersListAsync() -> Database.
        /// Validation Details: None.
        /// Business Logic: Maps stored procedure rows to UsersOutput.
        /// Repository Interaction: Executes StoredProc.Administration.UsersCrud with ActionId 4.
        /// Response Details: Returns a list of UsersOutput records.
        /// </remarks>
        /// <returns>A list of user output records.</returns>
        public async Task<List<UsersOutput>> GetUsersListAsync()
        {
            var parameters = new DynamicParameters();
            parameters.Add(DBParameterName.AdministrationParams.ActionId, 4, DbType.Int32);
            var result = await dapperHandler.QueryAsync<UsersOutput>(StoredProc.Administration.UsersCrud, parameters, CommandType.StoredProcedure);
            return result.ToList();
        }

        /// <summary>
        /// Fetches one user using StoredProc.Administration.UsersCrud.
        /// </summary>
        /// <remarks>
        /// Purpose: Retrieve a single Acutis user from the database.
        /// Request Flow: IUsersService -> UsersRepository.GetUserByIdAsync() -> Database.
        /// Validation Details: UserId parameter mapping.
        /// Business Logic: Maps the stored procedure row to UsersOutput.
        /// Repository Interaction: Executes StoredProc.Administration.UsersCrud with ActionId 3.
        /// Response Details: Returns a UsersOutput record or null.
        /// </remarks>
        /// <param name="userId">User identifier.</param>
        /// <returns>The matching user, or null when not found.</returns>
        public async Task<UsersOutput?> GetUserByIdAsync(int userId)
        {
            var parameters = new DynamicParameters();
            parameters.Add(DBParameterName.AdministrationParams.ActionId, 3, DbType.Int32);
            parameters.Add(DBParameterName.AdministrationParams.UserId, userId, DbType.Int32);
            var result = await dapperHandler.QueryAsync<UsersOutput>(StoredProc.Administration.UsersCrud, parameters, CommandType.StoredProcedure);
            return result.FirstOrDefault();
        }

        /// <summary>
        /// Fetches organization and role lookups using StoredProc.Administration.UsersCrud.
        /// </summary>
        /// <remarks>
        /// Purpose: Retrieve dropdown data for the Users form.
        /// Request Flow: IUsersService -> UsersRepository.GetUserLookupsAsync() -> Database.
        /// Validation Details: None.
        /// Business Logic: Reads two result sets into UserLookupOutput.
        /// Repository Interaction: Executes StoredProc.Administration.UsersCrud with ActionId 5.
        /// Response Details: Returns organizations and roles.
        /// </remarks>
        /// <returns>Lookup lists for organizations and roles.</returns>
        public async Task<UserLookupOutput> GetUserLookupsAsync()
        {
            var parameters = new DynamicParameters();
            parameters.Add(DBParameterName.AdministrationParams.ActionId, 5, DbType.Int32);
            using var grid = await dapperHandler.QueryMultipleAsync(StoredProc.Administration.UsersCrud, parameters, CommandType.StoredProcedure);
            var organizations = (await grid.ReadAsync<OrganizationLookupOutput>()).AsList();
            var roles = (await grid.ReadAsync<RoleLookupOutput>()).AsList();
            return new UserLookupOutput { Organizations = organizations, Roles = roles };
        }

        #endregion GET Methods

        #region POST Methods

        /// <summary>
        /// Adds or updates a user using StoredProc.Administration.UsersCrud.
        /// </summary>
        /// <remarks>
        /// Purpose: Insert or update an Acutis user.
        /// Request Flow: IUsersService -> UsersRepository.SaveUserAsync() -> Database.
        /// Validation Details: Parameter names match stored procedure arguments.
        /// Business Logic: Binds UsersInput and the plain password; SQL encrypts with dbo.EncryptUserPassword.
        /// Repository Interaction: Executes StoredProc.Administration.UsersCrud with ActionId 1.
        /// Response Details: Returns the scalar integer result from the stored procedure.
        /// </remarks>
        /// <param name="input">Input DTO containing user fields.</param>
        /// <param name="password">Plain password, or null to keep the existing password on update.</param>
        /// <returns>Scalar result of the save stored procedure.</returns>
        public async Task<int> SaveUserAsync(UsersInput input, string? password)
        {
            ArgumentNullException.ThrowIfNull(input);
            var parameters = new DynamicParameters();
            parameters.Add(DBParameterName.AdministrationParams.ActionId, 1, DbType.Int32);
            parameters.Add(DBParameterName.AdministrationParams.UserId, input.UserId, DbType.Int32);
            parameters.Add(DBParameterName.AdministrationParams.FirstName, input.FirstName, DbType.String);
            parameters.Add(DBParameterName.AdministrationParams.LastName, input.LastName, DbType.String);
            parameters.Add(DBParameterName.AdministrationParams.Email, input.EMail, DbType.String);
            parameters.Add(DBParameterName.AdministrationParams.Password, password, DbType.String);
            parameters.Add(DBParameterName.AdministrationParams.RoleId, input.RoleId, DbType.Int32);
            parameters.Add(DBParameterName.AdministrationParams.IsActive, input.IsActive, DbType.Int32);
            parameters.Add(DBParameterName.AdministrationParams.IsLocked, input.IsLocked, DbType.Int32);
            parameters.Add(DBParameterName.AdministrationParams.DateOfBirth, input.DateOfBirth, DbType.Date);
            if (input.UserId == 0)
            {
                parameters.Add(DBParameterName.AdministrationParams.InsertedBy, currentUserService.UserId, DbType.Int64);
            }
            else
            {
                parameters.Add(DBParameterName.AdministrationParams.UpdatedBy, currentUserService.UserId, DbType.Int64);
            }
            parameters.Add(DBParameterName.AdministrationParams.ReturnValue, dbType: DbType.Int32, direction: ParameterDirection.Output);
            _ = await dapperHandler.ExecuteAsync(StoredProc.Administration.UsersCrud, parameters, CommandType.StoredProcedure);
            return parameters.Get<int>(DBParameterName.AdministrationParams.ReturnValue);
        }

        #endregion POST Methods

        #region PUT Methods

        /// <summary>
        /// Updates user IsActive using StoredProc.Administration.UsersCrud.
        /// </summary>
        /// <remarks>
        /// Purpose: Activate or deactivate an Acutis user.
        /// Request Flow: IUsersService -> UsersRepository.UpdateUserStatusAsync() -> Database.
        /// Validation Details: UserId and IsActive parameter mapping.
        /// Business Logic: Binds the status payload and executes the update stored procedure.
        /// Repository Interaction: Executes StoredProc.Administration.UsersCrud with ActionId 2.
        /// Response Details: Returns the updated user identifier.
        /// </remarks>
        /// <param name="input">Status change payload with IsActive 0 or 1.</param>
        /// <returns>The updated user identifier.</returns>
        public async Task<int> UpdateUserStatusAsync(UserStatusInput input)
        {
            ArgumentNullException.ThrowIfNull(input);
            var parameters = new DynamicParameters();
            parameters.Add(DBParameterName.AdministrationParams.ActionId, 2, DbType.Int32);
            parameters.Add(DBParameterName.AdministrationParams.UserId, input.UserId, DbType.Int32);
            parameters.Add(DBParameterName.AdministrationParams.IsActive, input.IsActive, DbType.Int32);
            parameters.Add(DBParameterName.AdministrationParams.UpdatedBy, currentUserService.UserId, DbType.Int64);
            parameters.Add(DBParameterName.AdministrationParams.ReturnValue, dbType: DbType.Int32, direction: ParameterDirection.Output);
            _ = await dapperHandler.ExecuteAsync(StoredProc.Administration.UsersCrud, parameters, CommandType.StoredProcedure);
            return parameters.Get<int>(DBParameterName.AdministrationParams.ReturnValue);
        }

        #endregion PUT Methods

        #region DELETE Methods

        /// <summary>
        /// Soft-deletes a user using StoredProc.Administration.UsersCrud.
        /// </summary>
        /// <remarks>
        /// Purpose: Remove an Acutis user.
        /// Request Flow: IUsersService -> UsersRepository.DeleteUserAsync() -> Database.
        /// Validation Details: UserId parameter mapping.
        /// Business Logic: Binds the identifier and executes the delete stored procedure.
        /// Repository Interaction: Executes StoredProc.Administration.UsersCrud with ActionId 6.
        /// Response Details: Returns the deleted user identifier.
        /// </remarks>
        /// <param name="userId">User identifier.</param>
        /// <returns>Scalar result of the delete stored procedure.</returns>
        public async Task<int> DeleteUserAsync(int userId)
        {
            var parameters = new DynamicParameters();
            parameters.Add(DBParameterName.AdministrationParams.ActionId, 6, DbType.Int32);
            parameters.Add(DBParameterName.AdministrationParams.UserId, userId, DbType.Int32);
            parameters.Add(DBParameterName.AdministrationParams.UpdatedBy, currentUserService.UserId, DbType.Int64);
            parameters.Add(DBParameterName.AdministrationParams.ReturnValue, dbType: DbType.Int32, direction: ParameterDirection.Output);
            _ = await dapperHandler.ExecuteAsync(StoredProc.Administration.UsersCrud, parameters, CommandType.StoredProcedure);
            return parameters.Get<int>(DBParameterName.AdministrationParams.ReturnValue);
        }

        #endregion DELETE Methods
    }
}
