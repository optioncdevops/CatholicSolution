// Copyright (c) OptionC. All rights reserved.

namespace CFR.PortalInfrastructure.Interfaces.Authentication
{
    /// <summary>
    /// Repository interface for Portal member authentication.
    /// Repository Responsibility:
    /// - Declares credential lookup against SQL Server via Dapper stored procedures.
    /// </summary>
    public interface IPortalAuthenticationRepository
    {
        #region POST Methods

        /// <summary>
        /// Authenticates a CFR member by email and password.
        /// </summary>
        /// <remarks>
        /// Purpose: Verify credentials against [auth].[User].
        /// Request Flow: IPortalAuthenticationService -> IPortalAuthenticationRepository.AuthenticateAsync() -> SQL Database.
        /// Validation Details: Parameter names match stored procedure arguments.
        /// Business Logic: Directly retrieves the matching member row.
        /// Repository Interaction: Executes StoredProc.PortalAuth.DoLogin.
        /// Response Details: Returns a PortalLoginUserResult or null.
        /// </remarks>
        /// <param name="input">Credential request.</param>
        /// <returns>The authenticated member, or null when credentials are invalid.</returns>
        Task<PortalLoginUserResult?> AuthenticateAsync(PortalAuthenticationInput input);

        #endregion POST Methods
    }
}
