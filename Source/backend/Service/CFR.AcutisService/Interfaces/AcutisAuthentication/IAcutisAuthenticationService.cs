// Copyright (c) OptionC. All rights reserved.

namespace CFR.AcutisService.Interfaces.AcutisAuthentication
{
    /// <summary>
    /// Service contract for Acutis authentication operations.
    /// Acts as the business-logic layer between AcutisLoginController and IAcutisAuthenticationRepository.
    /// Responsibility:
    /// - Declares methods to authenticate credentials, verify the password hash, and issue a JWT.
    /// - Relies on IAcutisAuthenticationRepository for stored procedure execution.
    /// </summary>
    public interface IAcutisAuthenticationService
    {
        #region POST Methods

        /// <summary>
        /// Authenticates an Acutis user and returns the profile, menu, and JWT.
        /// </summary>
        /// <remarks>
        /// Purpose: Authenticate credentials and return permissions and menu structures.
        /// Request Flow: AcutisLoginController -> IAcutisAuthenticationService.LoginAuthenticationAsync() -> IAcutisAuthenticationRepository.AuthenticateAsync().
        /// Validation Details: Service rejects a missing user or a password that does not verify.
        /// Business Logic: SQL verifies credentials with dbo.DecryptUserPassword and the service attaches a JWT.
        /// Repository Interaction: Calls IAcutisAuthenticationRepository.AuthenticateAsync().
        /// Response Details: MSResultArgs containing AcutisLoginQueryResult, or UnAuthorized / InternalServerError.
        /// </remarks>
        /// <param name="request">The authentication DTO.</param>
        /// <returns>MSResultArgs containing login query details.</returns>
        Task<MSResultArgs> LoginAuthenticationAsync(AcutisAuthenticationInput request);

        #endregion POST Methods
    }
}
