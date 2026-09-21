// Copyright (c) OptionC. All rights reserved.

namespace CFR.PortalInfrastructure.Repositorys.Authentication
{
    /// <summary>
    /// Dapper implementation of IPortalAuthenticationRepository for Portal member login.
    /// Infrastructure Responsibility:
    /// - Uses IDapperHandler to execute stored procedures and map results to PortalLoginUserResult.
    /// </summary>
    public class PortalAuthenticationRepository(IDapperHandler dapperHandler): IPortalAuthenticationRepository
    {
        #region POST Methods

        /// <summary>
        /// Validates login credentials using StoredProc.PortalAuth.DoLogin.
        /// </summary>
        /// <remarks>
        /// Purpose: Authenticate a CFR member.
        /// Request Flow: IPortalAuthenticationService -> PortalAuthenticationRepository.AuthenticateAsync() -> Database.
        /// Validation Details: Maps UserName to the Email parameter.
        /// Business Logic: Maps the stored procedure row to PortalLoginUserResult.
        /// Repository Interaction: Executes StoredProc.PortalAuth.DoLogin.
        /// Response Details: Returns the member row or null.
        /// </remarks>
        /// <param name="input">Credential request model.</param>
        /// <returns>Authenticated member details.</returns>
        public async Task<PortalLoginUserResult?> AuthenticateAsync(PortalAuthenticationInput input)
        {
            ArgumentNullException.ThrowIfNull(input);
            var parameters = new DynamicParameters();
            parameters.Add(DBParameterName.PortalAuthParams.Email, input.UserName?.Trim(), DbType.String);
            parameters.Add(DBParameterName.PortalAuthParams.Password, input.Password, DbType.String);
            var result = await dapperHandler.QueryAsync<PortalLoginUserResult>(StoredProc.PortalAuth.DoLogin, parameters, CommandType.StoredProcedure);
            return result.FirstOrDefault();
        }

        #endregion POST Methods

        #region GET Methods

        /// <summary>
        /// Looks up a CFR member by email using StoredProc.PortalAuth.GetUserByEmail.
        /// </summary>
        /// <remarks>
        /// Purpose: Resolve a CFR member for federated (Auth0) sign-in.
        /// Request Flow: IPortalAuthenticationService -> PortalAuthenticationRepository.GetByEmailAsync() -> Database.
        /// Validation Details: Maps Email parameter only - no password.
        /// Business Logic: Executes StoredProc.PortalAuth.GetUserByEmail.
        /// Repository Interaction: Executes StoredProc.PortalAuth.GetUserByEmail.
        /// Response Details: Returns the member row or null.
        /// </remarks>
        /// <param name="email">Email address to look up.</param>
        /// <returns>The matching member, or null when no account exists for that email.</returns>
        public async Task<PortalLoginUserResult?> GetByEmailAsync(string email)
        {
            var parameters = new DynamicParameters();
            parameters.Add(DBParameterName.PortalAuthParams.Email, email?.Trim(), DbType.String);
            var result = await dapperHandler.QueryAsync<PortalLoginUserResult>(StoredProc.PortalAuth.GetUserByEmail, parameters, CommandType.StoredProcedure);
            return result.FirstOrDefault();
        }

        #endregion GET Methods
    }
}
