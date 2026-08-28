// Copyright (c) OptionC. All rights reserved.

namespace CFR.AcutisInfrastructure.Interfaces.AcutisAuthentication
{
    /// <summary>
    /// Repository interface for Acutis authentication database operations.
    /// Repository Responsibility:
    /// - Declares login SELECT operations against SQL Server via Dapper stored procedures.
    /// </summary>
    public interface IAcutisAuthenticationRepository
    {
        #region POST Methods

        /// <summary>
        /// Validates login credentials and returns matching user details and privileges.
        /// </summary>
        /// <remarks>
        /// Purpose: Authenticate credentials.
        /// Request Flow: IAcutisAuthenticationService -> IAcutisAuthenticationRepository.AuthenticateAsync() -> SQL Database.
        /// Validation Details: Parameter names match stored procedure arguments.
        /// Business Logic: Builds DynamicParameters and executes StoredProc.AcutisAuth.DoLogin, then maps rights to a menu tree.
        /// Repository Interaction: Executes StoredProc.AcutisAuth.DoLogin.
        /// Response Details: Returns AcutisLoginQueryResult with user, rights, and menu items.
        /// </remarks>
        /// <param name="request">Credential request model.</param>
        /// <returns>Authenticating query result details.</returns>
        Task<AcutisLoginQueryResult> AuthenticateAsync(AcutisAuthenticationInput request);

        #endregion POST Methods
    }
}
