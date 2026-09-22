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
    }
}
