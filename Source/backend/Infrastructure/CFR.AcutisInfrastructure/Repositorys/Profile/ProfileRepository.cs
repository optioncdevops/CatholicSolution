// Copyright (c) OptionC. All rights reserved.

namespace CFR.AcutisInfrastructure.Repositorys.Profile
{
    /// <summary>
    /// Dapper implementation of IProfileRepository for self-service profile and change-password.
    /// Infrastructure Responsibility:
    /// - Uses IDapperHandler to execute stored procedures and map results to ProfileOutput.
    /// </summary>
    public class ProfileRepository(IDapperHandler dapperHandler): IProfileRepository
    {
        #region GET Methods

        /// <summary>
        /// Fetches the signed-in user's own profile using StoredProc.Profile.ProfileCrud.
        /// </summary>
        /// <remarks>
        /// Purpose: Retrieve profile fields for the account menu's Profile dialog.
        /// Request Flow: IProfileService -> ProfileRepository.GetProfileAsync() -> Database.
        /// Validation Details: UserId parameter mapping.
        /// Business Logic: Maps the stored procedure row to ProfileOutput.
        /// Repository Interaction: Executes StoredProc.Profile.ProfileCrud with ActionId 1.
        /// Response Details: Returns a ProfileOutput record, or null when not found.
        /// </remarks>
        /// <param name="userId">Signed-in user identifier.</param>
        /// <returns>The matching profile, or null when not found.</returns>
        public async Task<ProfileOutput?> GetProfileAsync(long userId)
        {
            var parameters = new DynamicParameters();
            parameters.Add(DBParameterName.ProfileParams.ActionId, 1, DbType.Int32);
            parameters.Add(DBParameterName.ProfileParams.UserId, userId, DbType.Int64);
            var result = await dapperHandler.QueryAsync<ProfileOutput>(StoredProc.Profile.ProfileCrud, parameters, CommandType.StoredProcedure);
            return result.FirstOrDefault();
        }

        #endregion GET Methods

        #region PUT Methods

        /// <summary>
        /// Updates the signed-in user's own profile fields using StoredProc.Profile.ProfileCrud.
        /// </summary>
        /// <remarks>
        /// Purpose: Save the account owner's name and email.
        /// Request Flow: IProfileService -> ProfileRepository.UpdateProfileAsync() -> Database.
        /// Validation Details: Maps UserId and UpdateProfileInput to stored procedure parameters.
        /// Business Logic: Executes StoredProc.Profile.ProfileCrud with ActionId 2.
        /// Repository Interaction: Executes StoredProc.Profile.ProfileCrud.
        /// Response Details: Returns the scalar integer result from the stored procedure.
        /// </remarks>
        /// <param name="userId">Signed-in user identifier.</param>
        /// <param name="input">Input DTO containing the new profile fields.</param>
        /// <returns>Scalar result of the update stored procedure.</returns>
        public async Task<int> UpdateProfileAsync(long userId, UpdateProfileInput input)
        {
            ArgumentNullException.ThrowIfNull(input);
            var parameters = new DynamicParameters();
            parameters.Add(DBParameterName.ProfileParams.ActionId, 2, DbType.Int32);
            parameters.Add(DBParameterName.ProfileParams.UserId, userId, DbType.Int64);
            parameters.Add(DBParameterName.ProfileParams.FirstName, input.FirstName, DbType.String);
            parameters.Add(DBParameterName.ProfileParams.LastName, input.LastName, DbType.String);
            parameters.Add(DBParameterName.ProfileParams.Email, input.Email, DbType.String);
            parameters.Add(DBParameterName.ProfileParams.ProfileImageUrl, input.ProfileImageUrl, DbType.String);
            parameters.Add(DBParameterName.ProfileParams.ReturnValue, dbType: DbType.Int32, direction: ParameterDirection.Output);
            _ = await dapperHandler.ExecuteAsync(StoredProc.Profile.ProfileCrud, parameters, CommandType.StoredProcedure);
            return parameters.Get<int>(DBParameterName.ProfileParams.ReturnValue);
        }

        /// <summary>
        /// Changes the signed-in user's own password using StoredProc.Profile.ProfileCrud.
        /// </summary>
        /// <remarks>
        /// Purpose: Let the account owner set a new password.
        /// Request Flow: IProfileService -> ProfileRepository.ChangePasswordAsync() -> Database.
        /// Validation Details: Maps UserId, current password, and new password to stored procedure parameters.
        /// Business Logic: Executes StoredProc.Profile.ProfileCrud with ActionId 3; SQL verifies the current password with dbo.DecryptUserPassword.
        /// Repository Interaction: Executes StoredProc.Profile.ProfileCrud.
        /// Response Details: Returns the scalar integer result from the stored procedure.
        /// </remarks>
        /// <param name="userId">Signed-in user identifier.</param>
        /// <param name="currentPassword">Current plain-text password.</param>
        /// <param name="newPassword">New plain-text password.</param>
        /// <returns>Scalar result of the change-password stored procedure.</returns>
        public async Task<int> ChangePasswordAsync(long userId, string currentPassword, string newPassword)
        {
            var parameters = new DynamicParameters();
            parameters.Add(DBParameterName.ProfileParams.ActionId, 3, DbType.Int32);
            parameters.Add(DBParameterName.ProfileParams.UserId, userId, DbType.Int64);
            parameters.Add(DBParameterName.ProfileParams.CurrentPassword, currentPassword, DbType.String);
            parameters.Add(DBParameterName.ProfileParams.NewPassword, newPassword, DbType.String);
            parameters.Add(DBParameterName.ProfileParams.ReturnValue, dbType: DbType.Int32, direction: ParameterDirection.Output);
            _ = await dapperHandler.ExecuteAsync(StoredProc.Profile.ProfileCrud, parameters, CommandType.StoredProcedure);
            return parameters.Get<int>(DBParameterName.ProfileParams.ReturnValue);
        }

        #endregion PUT Methods
    }
}
