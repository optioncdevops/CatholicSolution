// Copyright (c) OptionC. All rights reserved.

namespace CFR.AcutisService.Service.AcutisAuthentication
{
    /// <summary>
    /// Implements Acutis authentication business logic including password verification and JWT issuance.
    /// Repository Responsibility:
    /// - Invokes IAcutisAuthenticationRepository to query user privileges.
    /// </summary>
    public class AcutisAuthenticationService(IAcutisAuthenticationRepository repository, IAcutisJwtTokenGenerator jwtTokenGenerator, ILogger<AcutisAuthenticationService> logger): IAcutisAuthenticationService
    {
        #region POST Methods

        /// <summary>
        /// Authenticates the user credentials asynchronously.
        /// </summary>
        /// <remarks>
        /// Purpose: Authenticate credentials and return permissions and menu structures.
        /// Request Flow: AcutisLoginController -> AcutisAuthenticationService.LoginAuthenticationAsync() -> IAcutisAuthenticationRepository.AuthenticateAsync().
        /// Validation Details: Checks if the stored procedure returns an authenticated user.
        /// Business Logic: SQL verifies credentials with dbo.DecryptUserPassword and the service attaches a JWT.
        /// Repository Interaction: Calls IAcutisAuthenticationRepository.AuthenticateAsync(request).
        /// Response Details: MSResultArgs wrapper holding the user profile and menus.
        /// </remarks>
        /// <param name="request">The authentication DTO.</param>
        /// <returns>MSResultArgs containing login query details.</returns>
        public async Task<MSResultArgs> LoginAuthenticationAsync(AcutisAuthenticationInput request)
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

                var data = await repository.AuthenticateAsync(request);
                if (data?.User is null)
                {
                    result.StatusCode = ErrorCodes.UnAuthorized;
                    result.StatusMessage = ErrorMessages.InvalidLogin;
                    return result;
                }

                data.User.Token = jwtTokenGenerator.GenerateToken(data.User);
                result.ResultData = data;
            }
            catch (Exception ex)
            {
                AppLogger.LogError(logger, ex, SerilogErrorMessages.AcutisLogMessages.LoginAuthenticationFailed, request?.UserName);
                result.StatusCode = ErrorCodes.InternalServerError;
                result.StatusMessage = ErrorMessages.InternalServerError;
            }

            return result;
        }

        #endregion POST Methods
    }
}
