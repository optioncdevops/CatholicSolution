// Copyright (c) OptionC. All rights reserved.

namespace CFR.AcutisInfrastructure.Repositorys.AcutisAuthentication
{
    /// <summary>
    /// Dapper implementation of IAcutisPasswordRepository for Acutis forgot/reset password.
    /// Infrastructure Responsibility:
    /// - Uses IDapperHandler to execute stored procedures and map results to ForgotPasswordUserResult.
    /// </summary>
    public class AcutisPasswordRepository(IDapperHandler dapperHandler): IAcutisPasswordRepository
    {
        #region POST Methods

        /// <summary>
        /// Stores a password reset token using StoredProc.AcutisAuth.PasswordResetCrud.
        /// </summary>
        /// <remarks>
        /// Purpose: Persist a hashed reset token for a matched user.
        /// Request Flow: IAcutisPasswordService -> AcutisPasswordRepository.RequestResetAsync() -> Database.
        /// Validation Details: Maps email, token hash, and expiry to stored procedure parameters.
        /// Business Logic: Executes StoredProc.AcutisAuth.PasswordResetCrud with ActionId 1.
        /// Repository Interaction: Executes StoredProc.AcutisAuth.PasswordResetCrud.
        /// Response Details: Returns the matched user's identity, or null when no row is returned.
        /// </remarks>
        /// <param name="email">Account email address.</param>
        /// <param name="tokenHash">SHA-256 hash of the raw reset token.</param>
        /// <param name="expiresAtUtc">UTC expiry for the token.</param>
        /// <returns>The matched user's identity, or null when not found.</returns>
        public async Task<ForgotPasswordUserResult?> RequestResetAsync(string email, string tokenHash, DateTime expiresAtUtc)
        {
            var parameters = new DynamicParameters();
            parameters.Add(DBParameterName.AcutisAuthParams.ActionId, 1, DbType.Int32);
            parameters.Add(DBParameterName.AcutisAuthParams.Email, email, DbType.String);
            parameters.Add(DBParameterName.AcutisAuthParams.TokenHash, tokenHash, DbType.String);
            parameters.Add(DBParameterName.AcutisAuthParams.ExpiresAtUtc, expiresAtUtc, DbType.DateTime2);
            var result = await dapperHandler.QueryAsync<ForgotPasswordUserResult>(StoredProc.AcutisAuth.PasswordResetCrud, parameters, CommandType.StoredProcedure);
            return result.FirstOrDefault();
        }

        #endregion POST Methods

        #region PUT Methods

        /// <summary>
        /// Completes a password reset using StoredProc.AcutisAuth.PasswordResetCrud.
        /// </summary>
        /// <remarks>
        /// Purpose: Validate the reset token and update the password.
        /// Request Flow: IAcutisPasswordService -> AcutisPasswordRepository.ResetPasswordAsync() -> Database.
        /// Validation Details: Maps the token hash and new password to stored procedure parameters.
        /// Business Logic: Executes StoredProc.AcutisAuth.PasswordResetCrud with ActionId 2; SQL encrypts the password with dbo.EncryptUserPassword.
        /// Repository Interaction: Executes StoredProc.AcutisAuth.PasswordResetCrud.
        /// Response Details: Returns the scalar integer result from the stored procedure.
        /// </remarks>
        /// <param name="tokenHash">SHA-256 hash of the raw reset token supplied by the user.</param>
        /// <param name="newPassword">Plain-text new password.</param>
        /// <returns>Scalar result of the reset stored procedure.</returns>
        public async Task<int> ResetPasswordAsync(string tokenHash, string newPassword)
        {
            var parameters = new DynamicParameters();
            parameters.Add(DBParameterName.AcutisAuthParams.ActionId, 2, DbType.Int32);
            parameters.Add(DBParameterName.AcutisAuthParams.TokenHash, tokenHash, DbType.String);
            parameters.Add(DBParameterName.AcutisAuthParams.NewPassword, newPassword, DbType.String);
            parameters.Add(DBParameterName.AcutisAuthParams.ReturnValue, dbType: DbType.Int32, direction: ParameterDirection.Output);
            _ = await dapperHandler.ExecuteAsync(StoredProc.AcutisAuth.PasswordResetCrud, parameters, CommandType.StoredProcedure);
            return parameters.Get<int>(DBParameterName.AcutisAuthParams.ReturnValue);
        }

        #endregion PUT Methods
    }
}
