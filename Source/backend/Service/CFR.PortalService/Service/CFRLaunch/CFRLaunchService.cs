// Copyright (c) OptionC. All rights reserved.

namespace CFR.PortalService.Service.CFRLaunch
{
    /// <summary>
    /// Implements product SSO launch and authorization-code exchange.
    /// Repository Responsibility:
    /// - Invokes ICFRLaunchRepository for stored procedure execution.
    /// </summary>
    public class CFRLaunchService(ICFRLaunchRepository repository, IPortalJwtTokenGenerator jwtTokenGenerator, ICurrentUserService currentUserService, IConfiguration configuration, ILogger<CFRLaunchService> logger): ICFRLaunchService
    {
        #region GET Methods

        /// <summary>
        /// Retrieves products assigned to the authenticated CFR member.
        /// </summary>
        /// <remarks>
        /// Purpose: Return hub products classified from [auth].[UserProduct] and [core].[Product], with BaseUrl from [core].[ProductEnvironment] for the login environment.
        /// Request Flow: CFRLaunchController -> CFRLaunchService.GetAssignedProductsAsync() -> ICFRLaunchRepository.GetAssignedProductsAsync().
        /// Validation Details: Current user must be authenticated.
        /// Business Logic: Passes appsettings Environment to the stored procedure as ProductEnvironment.EnvironmentName, then wraps the typed list in MSResultArgs.
        /// Repository Interaction: Calls ICFRLaunchRepository.GetAssignedProductsAsync().
        /// Response Details: MSResultArgs containing List of AssignedProductOutput, or UnAuthorized.
        /// </remarks>
        /// <returns>MSResultArgs containing the assigned product list.</returns>
        public async Task<MSResultArgs> GetAssignedProductsAsync()
        {
            var result = new MSResultArgs();
            try
            {
                if (currentUserService.CFRUserId is not { } cfrUserId || cfrUserId == Guid.Empty)
                {
                    result.StatusCode = ErrorCodes.UnAuthorized;
                    result.StatusMessage = ErrorMessages.UnAuthorized;
                    return result;
                }

                result.ResultData = await repository.GetAssignedProductsAsync(configuration["Environment"] ?? string.Empty) ?? [];
            }
            catch (Exception ex)
            {
                AppLogger.LogError(logger, ex, SerilogErrorMessages.PortalLogMessages.FetchAssignedProductsFailed, currentUserService.CFRUserId);
                result.StatusCode = ErrorCodes.InternalServerError;
                result.StatusMessage = ErrorMessages.InternalServerError;
            }

            return result;
        }

        #endregion GET Methods

        #region POST Methods

        /// <summary>
        /// Creates a one-time authorization code and returns the product launch URL.
        /// </summary>
        /// <remarks>
        /// Purpose: Start a product launch for the authenticated member.
        /// Request Flow: CFRLaunchController -> CFRLaunchService.LaunchProductAsync() -> ICFRLaunchRepository.CreateLaunchAsync().
        /// Validation Details: ProductId is required; current user comes from ICurrentUserService.
        /// Business Logic: Generates a random code, stores only its SHA-256 hash, and appends the raw code to ProductEnvironment BaseUrl. Prior launch rows for the same user and product are replaced. Expiry is computed in SQL (10 minutes from SYSUTCDATETIME).
        /// Repository Interaction: Calls ICFRLaunchRepository.CreateLaunchAsync().
        /// Response Details: MSResultArgs containing CFRLaunchOutput.
        /// </remarks>
        /// <param name="input">Launch request containing ProductId.</param>
        /// <returns>MSResultArgs containing the launch URL.</returns>
        public async Task<MSResultArgs> LaunchProductAsync(CFRLaunchInput input)
        {
            var result = new MSResultArgs();
            try
            {
                if (currentUserService.CFRUserId is not { } cfrUserId || cfrUserId == Guid.Empty)
                {
                    result.StatusCode = ErrorCodes.UnAuthorized;
                    result.StatusMessage = ErrorMessages.UnAuthorized;
                    return result;
                }

                if (input == null || input.ProductId <= 0)
                {
                    result.StatusCode = ErrorCodes.BadRequest;
                    result.StatusMessage = ErrorMessages.BadRequest;
                    return result;
                }

                string code = ConversionHelper.CreateAuthorizationCode();
                string codeHash = ConversionHelper.HashAuthorizationCode(code);
                var (returnValue, row) = await repository.CreateLaunchAsync(input.ProductId, codeHash, configuration["Environment"] ?? string.Empty);

                if (returnValue == -1 || returnValue == 0)
                {
                    result.StatusCode = ErrorCodes.UnAuthorized;
                    result.StatusMessage = ErrorMessages.UnAuthorized;
                    return result;
                }

                if (returnValue == -2)
                {
                    result.StatusCode = ErrorCodes.NotFound;
                    result.StatusMessage = ErrorMessages.ProductNotFound;
                    return result;
                }

                if (returnValue == -3)
                {
                    result.StatusCode = ErrorCodes.BadRequest;
                    result.StatusMessage = ErrorMessages.ProductDisabled;
                    return result;
                }

                if (returnValue == -4)
                {
                    result.StatusCode = ErrorCodes.BadRequest;
                    result.StatusMessage = ErrorMessages.ExternalPageUrlMissing;
                    return result;
                }

                if (returnValue == -5)
                {
                    result.StatusCode = ErrorCodes.UnAuthorized;
                    result.StatusMessage = ErrorMessages.ProductNotAssignedToUser;
                    return result;
                }

                if (row == null || string.IsNullOrWhiteSpace(row.BaseUrl))
                {
                    result.StatusCode = ErrorCodes.BadRequest;
                    result.StatusMessage = ErrorMessages.ExternalPageUrlMissing;
                    return result;
                }

                logger.LogInformation("SSO launch created. UserId {UserId} ProductId {ProductId} LaunchId {LaunchId}", currentUserService.CFRUserId, row.ProductId, row.LaunchId);
                result.ResultData = new CFRLaunchOutput
                {
                    ProductId = row.ProductId,
                    LaunchUrl = ConversionHelper.AppendCode(row.BaseUrl, code),
                    ExpiresAt = row.ExpiresAt
                };
            }
            catch (Exception ex)
            {
                AppLogger.LogError(logger, ex, SerilogErrorMessages.PortalLogMessages.LaunchProductFailed, input?.ProductId ?? 0, currentUserService.CFRUserId);
                result.StatusCode = ErrorCodes.InternalServerError;
                result.StatusMessage = ErrorMessages.InternalServerError;
            }

            return result;
        }

        /// <summary>
        /// Exchanges a one-time authorization code for a signed CFR identity.
        /// </summary>
        /// <remarks>
        /// Purpose: Allow a product backend to consume a launch code.
        /// Request Flow: CFRLaunchController -> CFRLaunchService.ExchangeTokenAsync() -> ICFRLaunchRepository.ExchangeCodeAsync().
        /// Validation Details: Code and ProductId are required.
        /// Business Logic: Hashes the incoming code, consumes it on first use, and returns the same identity on later calls until ExpiresAt.
        /// Repository Interaction: Calls ICFRLaunchRepository.ExchangeCodeAsync().
        /// Response Details: MSResultArgs containing CFRExchangeOutput.
        /// </remarks>
        /// <param name="input">Exchange request containing code and productId.</param>
        /// <returns>MSResultArgs containing the signed identity.</returns>
        public async Task<MSResultArgs> ExchangeTokenAsync(CFRExchangeInput input)
        {
            var result = new MSResultArgs();
            try
            {
                if (input == null || string.IsNullOrWhiteSpace(input.Code) || input.ProductId <= 0)
                {
                    result.StatusCode = ErrorCodes.BadRequest;
                    result.StatusMessage = ErrorMessages.BadRequest;
                    return result;
                }

                string codeHash = ConversionHelper.HashAuthorizationCode(input.Code.Trim());
                var (returnValue, row) = await repository.ExchangeCodeAsync(input.ProductId, codeHash);

                if (returnValue == -2)
                {
                    result.StatusCode = ErrorCodes.UnAuthorized;
                    result.StatusMessage = ErrorMessages.ExpiredAuthorizationCode;
                    return result;
                }

                if (returnValue == -3)
                {
                    result.StatusCode = ErrorCodes.UnAuthorized;
                    result.StatusMessage = ErrorMessages.AuthorizationCodeUsed;
                    return result;
                }

                if (returnValue == -4)
                {
                    result.StatusCode = ErrorCodes.UnAuthorized;
                    result.StatusMessage = ErrorMessages.AuthorizationCodeProductMismatch;
                    return result;
                }

                if (returnValue == -5)
                {
                    result.StatusCode = ErrorCodes.UnAuthorized;
                    result.StatusMessage = ErrorMessages.ProductNotAssignedToUser;
                    return result;
                }

                if (returnValue == -6)
                {
                    result.StatusCode = ErrorCodes.BadRequest;
                    result.StatusMessage = ErrorMessages.ProductDisabled;
                    return result;
                }

                if (returnValue != 1 || row == null || string.IsNullOrWhiteSpace(row.EMail) || row.CFRUserId == Guid.Empty)
                {
                    result.StatusCode = ErrorCodes.UnAuthorized;
                    result.StatusMessage = ErrorMessages.InvalidAuthorizationCode;
                    return result;
                }

                logger.LogInformation("SSO code exchanged. UserId {UserId} ProductId {ProductId} LaunchId {LaunchId}", row.CFRUserId, row.ProductId, row.LaunchId);
                result.ResultData = new CFRExchangeOutput
                {
                    IdentityToken = jwtTokenGenerator.GenerateIdentityToken(row.CFRUserId, row.EMail, row.ProductId, row.LaunchId)
                };
            }
            catch (Exception ex)
            {
                AppLogger.LogError(logger, ex, SerilogErrorMessages.PortalLogMessages.ExchangeTokenFailed, input?.ProductId ?? 0);
                result.StatusCode = ErrorCodes.InternalServerError;
                result.StatusMessage = ErrorMessages.InternalServerError;
            }

            return result;
        }

        #endregion POST Methods
    }
}
