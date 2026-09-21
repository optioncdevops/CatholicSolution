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

        #region GET Methods

        /// <summary>
        /// Looks up a CFR member by email with no password check - used only after the
        /// caller (Auth0) has already verified the user's identity out of band.
        /// </summary>
        /// <remarks>
        /// Purpose: Resolve a CFR member for federated (Auth0) sign-in.
        /// Request Flow: IPortalAuthenticationService -> PortalAuthenticationRepository.GetByEmailAsync() -> SQL Database.
        /// Validation Details: Email is matched case-insensitively.
        /// Business Logic: No credential check - the caller is responsible for having already authenticated the user.
        /// Repository Interaction: Executes StoredProc.PortalAuth.GetUserByEmail.
        /// Response Details: Returns a PortalLoginUserResult or null.
        /// </remarks>
        /// <param name="email">Email address to look up.</param>
        /// <returns>The matching member, or null when no account exists for that email.</returns>
        Task<PortalLoginUserResult?> GetByEmailAsync(string email);

        #endregion GET Methods
    }
}
