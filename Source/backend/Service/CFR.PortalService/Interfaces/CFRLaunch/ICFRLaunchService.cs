// Copyright (c) OptionC. All rights reserved.

namespace CFR.PortalService.Interfaces.CFRLaunch
{
    /// <summary>
    /// Service contract for product SSO launch and code exchange.
    /// Acts as the business-logic layer between CFRLaunchController and ICFRLaunchRepository.
    /// Responsibility:
    /// - Declares assigned-product listing, launch-code issuance, and code exchange.
    /// - Relies on ICFRLaunchRepository for stored procedure execution.
    /// </summary>
    public interface ICFRLaunchService
    {
        #region GET Methods

        /// <summary>
        /// Retrieves products assigned to the authenticated CFR member.
        /// </summary>
        /// <remarks>
        /// Purpose: Return hub products classified from UserProduct assignments and ProductEnvironment BaseUrl.
        /// Request Flow: CFRLaunchController -> ICFRLaunchService.GetAssignedProductsAsync() -> ICFRLaunchRepository.GetAssignedProductsAsync().
        /// Validation Details: Current user must be authenticated.
        /// Business Logic: Wraps the typed list in MSResultArgs.
        /// Repository Interaction: Calls ICFRLaunchRepository.GetAssignedProductsAsync().
        /// Response Details: MSResultArgs containing List of AssignedProductOutput, or UnAuthorized.
        /// </remarks>
        /// <returns>MSResultArgs containing the assigned product list.</returns>
        Task<MSResultArgs> GetAssignedProductsAsync();

        #endregion GET Methods

        #region POST Methods

        /// <summary>
        /// Creates a one-time authorization code and returns the product launch URL.
        /// </summary>
        /// <remarks>
        /// Purpose: Start a product launch for the authenticated member.
        /// Request Flow: CFRLaunchController -> ICFRLaunchService.LaunchProductAsync() -> ICFRLaunchRepository.CreateLaunchAsync().
        /// Validation Details: ProductId is required; current user comes from ICurrentUserService.
        /// Business Logic: Generates a random code, stores only its SHA-256 hash, and appends the raw code to ProductEnvironment BaseUrl. Prior launch rows for the same user and product are replaced. Expiry is computed in SQL.
        /// Repository Interaction: Calls ICFRLaunchRepository.CreateLaunchAsync().
        /// Response Details: MSResultArgs containing CFRLaunchOutput.
        /// </remarks>
        /// <param name="input">Launch request containing ProductId.</param>
        /// <returns>MSResultArgs containing the launch URL.</returns>
        Task<MSResultArgs> LaunchProductAsync(CFRLaunchInput input);

        /// <summary>
        /// Exchanges a one-time authorization code for a signed CFR identity.
        /// </summary>
        /// <remarks>
        /// Purpose: Allow a product backend to consume a launch code.
        /// Request Flow: CFRLaunchController -> ICFRLaunchService.ExchangeTokenAsync() -> ICFRLaunchRepository.ExchangeCodeAsync().
        /// Validation Details: Code and ProductId are required.
        /// Business Logic: Hashes the incoming code, consumes it on first use, and returns the same identity on later calls until ExpiresAt.
        /// Repository Interaction: Calls ICFRLaunchRepository.ExchangeCodeAsync().
        /// Response Details: MSResultArgs containing CFRExchangeOutput.
        /// </remarks>
        /// <param name="input">Exchange request containing code and productId.</param>
        /// <returns>MSResultArgs containing the signed identity.</returns>
        Task<MSResultArgs> ExchangeTokenAsync(CFRExchangeInput input);

        #endregion POST Methods
    }
}
