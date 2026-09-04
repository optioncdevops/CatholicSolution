// Copyright (c) OptionC. All rights reserved.

namespace CFR.PortalService.Service.Authentication
{
    /// <summary>
    /// Implements Portal authentication business logic including password verification and JWT issuance.
    /// Repository Responsibility:
    /// - Invokes IPortalAuthenticationRepository to query the member row.
    /// </summary>
    public class PortalAuthenticationService(IPortalAuthenticationRepository repository, IPortalJwtTokenGenerator jwtTokenGenerator, ILogger<PortalAuthenticationService> logger): IPortalAuthenticationService
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

        #endregion POST Methods
    }
}
