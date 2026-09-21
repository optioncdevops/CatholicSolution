// Copyright (c) OptionC. All rights reserved.

namespace CFR.PortalService.Service.Authentication
{
    /// <summary>
    /// Implements Portal authentication business logic including password verification and JWT issuance.
    /// Repository Responsibility:
    /// - Invokes IPortalAuthenticationRepository to query the member row.
    /// </summary>
    public class PortalAuthenticationService(IPortalAuthenticationRepository repository, IPortalJwtTokenGenerator jwtTokenGenerator, IAuth0UserInfoClient auth0UserInfoClient, ILogger<PortalAuthenticationService> logger): IPortalAuthenticationService
    {
        #region POST Methods

        /// <summary>
        /// Authenticates the member credentials asynchronously.
        /// </summary>
        /// <remarks>
        /// Purpose: Authenticate credentials and return a session JWT.
        /// Request Flow: PortalLoginController -> PortalAuthenticationService.LoginAuthenticationAsync() -> IPortalAuthenticationRepository.AuthenticateAsync().
        /// Validation Details: Checks if the stored procedure returns an authenticated member.
        /// Business Logic: SQL verifies credentials with dbo.DecryptUserPassword and the service attaches a JWT.
        /// Repository Interaction: Calls IPortalAuthenticationRepository.AuthenticateAsync(request).
        /// Response Details: MSResultArgs wrapper holding the member profile.
        /// </remarks>
        /// <param name="request">The authentication DTO.</param>
        /// <returns>MSResultArgs containing login details.</returns>
        public async Task<MSResultArgs> LoginAuthenticationAsync(PortalAuthenticationInput request)
        {
            var result = new MSResultArgs();
            try
            {
                if (request == null || string.IsNullOrWhiteSpace(request.UserName) || string.IsNullOrWhiteSpace(request.Password))
                {
                    result.StatusCode = ErrorCodes.BadRequest;
                    result.StatusMessage = ErrorMessages.BadRequest;
                    return result;
                }

                var user = await repository.AuthenticateAsync(request);
                if (user is null || user.UserId <= 0)
                {
                    result.StatusCode = ErrorCodes.UnAuthorized;
                    result.StatusMessage = ErrorMessages.InvalidLogin;
                    return result;
                }

                user.Token = jwtTokenGenerator.GenerateToken(user);
                result.ResultData = new PortalLoginQueryResult { User = user };
            }
            catch (Exception ex)
            {
                AppLogger.LogError(logger, ex, SerilogErrorMessages.PortalLogMessages.LoginAuthenticationFailed, request?.UserName);
                result.StatusCode = ErrorCodes.InternalServerError;
                result.StatusMessage = ErrorMessages.InternalServerError;
            }

            return result;
        }

        /// <summary>
        /// Exchanges a verified Auth0 access token for a CFR Portal session JWT.
        /// </summary>
        /// <remarks>
        /// Purpose: Let a CFR frontend already authenticated via Auth0 obtain a Portal
        /// JWT that CFR.Portal's own [Authorize] endpoints will actually accept.
        /// Request Flow: PortalLoginController -> PortalAuthenticationService.ExchangeAuth0TokenAsync() -> IAuth0UserInfoClient.GetUserInfoAsync() -> IPortalAuthenticationRepository.GetByEmailAsync().
        /// Validation Details: AccessToken is required.
        /// Business Logic: Verifies the token via Auth0's /userinfo, then issues a CFR-signed session JWT for the matching member.
        /// Repository Interaction: Calls IPortalAuthenticationRepository.GetByEmailAsync().
        /// Response Details: MSResultArgs containing PortalLoginQueryResult, or UnAuthorized when the token is invalid or no matching member exists.
        /// </remarks>
        /// <param name="request">Exchange request containing the Auth0 access token.</param>
        /// <returns>MSResultArgs containing the login result.</returns>
        public async Task<MSResultArgs> ExchangeAuth0TokenAsync(Auth0ExchangeInput request)
        {
            var result = new MSResultArgs();
            try
            {
                if (request == null || string.IsNullOrWhiteSpace(request.AccessToken))
                {
                    result.StatusCode = ErrorCodes.BadRequest;
                    result.StatusMessage = ErrorMessages.BadRequest;
                    return result;
                }

                var userInfo = await auth0UserInfoClient.GetUserInfoAsync(request.AccessToken);
                if (userInfo is null || string.IsNullOrWhiteSpace(userInfo.Email))
                {
                    result.StatusCode = ErrorCodes.UnAuthorized;
                    result.StatusMessage = ErrorMessages.InvalidAuth0Token;
                    return result;
                }

                var user = await repository.GetByEmailAsync(userInfo.Email);
                if (user is null || user.UserId <= 0)
                {
                    result.StatusCode = ErrorCodes.UnAuthorized;
                    result.StatusMessage = ErrorMessages.Auth0UserNotFound;
                    return result;
                }

                user.Token = jwtTokenGenerator.GenerateToken(user);
                result.ResultData = new PortalLoginQueryResult { User = user };
            }
            catch (Exception ex)
            {
                AppLogger.LogError(logger, ex, SerilogErrorMessages.PortalLogMessages.ExchangeAuth0TokenFailed);
                result.StatusCode = ErrorCodes.InternalServerError;
                result.StatusMessage = ErrorMessages.InternalServerError;
            }

            return result;
        }

        #endregion POST Methods
    }
}
