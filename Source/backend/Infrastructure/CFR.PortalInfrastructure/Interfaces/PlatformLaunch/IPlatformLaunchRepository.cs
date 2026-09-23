// Copyright (c) OptionC. All rights reserved.

namespace CFR.PortalInfrastructure.Interfaces.PlatformLaunch
{
    /// <summary>
    /// Repository interface for platform (App Hub) launch code create/exchange.
    /// Repository Responsibility:
    /// - Declares the anonymous, machine-client-facing code create/consume operations against
    ///   SQL Server. Unlike ICFRLaunchRepository, these take no dependency on ICurrentUserService -
    ///   the caller is a trusted API client, not a signed-in Portal user.
    /// </summary>
    public interface IPlatformLaunchRepository
    {
        #region POST Methods

        /// <summary>
        /// Creates a one-time platform-launch code for the CFR member matched by email.
        /// </summary>
        /// <remarks>
        /// Purpose: Let a trusted caller hand a browser a code that later establishes a real
        /// Portal session for a specific, already-known-linked CFR member.
        /// Request Flow: IPlatformLaunchService -> IPlatformLaunchRepository.CreateLaunchAsync() -> SQL Database.
        /// Validation Details: Email must resolve to a CFR member via [auth].[User].NormalizedEmail.
        /// Business Logic: Executes StoredProc.PlatformLaunch.PlatformLaunchCrud with ActionId 1.
        /// Repository Interaction: Inserts a row into [auth].[CFRPlatformLaunch] with a 10-minute expiry.
        /// Response Details: Returns the stored procedure return value (1 success, -1 email not matched).
        /// </remarks>
        /// <param name="email">Email address of the CFR member the code is issued for.</param>
        /// <param name="codeHash">SHA-256 hex hash of the raw one-time code.</param>
        /// <param name="insertedBy">Audit identifier for the caller (e.g. an API client id).</param>
        /// <returns>Stored procedure return value.</returns>
        Task<int> CreateLaunchAsync(string email, string codeHash, string insertedBy);

        /// <summary>
        /// Consumes a one-time platform-launch code and returns the member's login profile.
        /// </summary>
        /// <remarks>
        /// Purpose: Atomically validate and mark the code as used, then return enough member
        /// profile data to mint a normal Portal session JWT.
        /// Request Flow: IPlatformLaunchService -> IPlatformLaunchRepository.ExchangeCodeAsync() -> SQL Database.
        /// Validation Details: CodeHash parameter mapping.
        /// Business Logic: Executes StoredProc.PlatformLaunch.PlatformLaunchCrud with ActionId 2.
        /// Repository Interaction: SQL performs existence, expiry, and replay checks then updates IsUsed.
        /// Response Details: Returns the member profile row and stored-procedure return value.
        /// </remarks>
        /// <param name="codeHash">SHA-256 hex hash of the raw one-time code.</param>
        /// <returns>Exchange result and return value.</returns>
        Task<(int ReturnValue, PortalLoginUserResult? User)> ExchangeCodeAsync(string codeHash);

        #endregion POST Methods
    }
}
