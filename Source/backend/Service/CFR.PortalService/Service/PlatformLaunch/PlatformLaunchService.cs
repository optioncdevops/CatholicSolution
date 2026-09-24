// Copyright (c) OptionC. All rights reserved.

namespace CFR.PortalService.Service.PlatformLaunch
{
    /// <summary>
    /// Implements App Hub platform-launch code exchange.
    /// Repository Responsibility:
    /// - Invokes IPlatformLaunchRepository for the actual validate/consume operation.
    /// - Issues the same session JWT shape as normal Portal password login via IPortalJwtTokenGenerator.
    /// </summary>
    public class PlatformLaunchService(IPlatformLaunchRepository repository, IPortalJwtTokenGenerator jwtTokenGenerator, ILogger<PlatformLaunchService> logger): IPlatformLaunchService
    {
        #region POST Methods

        /// <inheritdoc />
        public async Task<MSResultArgs> ExchangeTokenAsync(PlatformLaunchExchangeInput input)
        {
            var result = new MSResultArgs();
            try
            {
                if (input == null || string.IsNullOrWhiteSpace(input.Code))
                {
                    result.StatusCode = ErrorCodes.BadRequest;
                    result.StatusMessage = ErrorMessages.BadRequest;
                    return result;
                }

                string codeHash = ConversionHelper.HashAuthorizationCode(input.Code.Trim());
                var (returnValue, user) = await repository.ExchangeCodeAsync(codeHash);
                if (returnValue == -2)
                {
                    result.StatusCode = ErrorCodes.UnAuthorized;
                    result.StatusMessage = ErrorMessages.ExpiredAuthorizationCode;
                    return result;
                }

                if (returnValue <= 0 || user == null || user.UserId == Guid.Empty)
                {
                    result.StatusCode = ErrorCodes.UnAuthorized;
                    result.StatusMessage = ErrorMessages.InvalidAuthorizationCode;
                    return result;
                }

                user.Token = jwtTokenGenerator.GenerateToken(user);
                result.ResultData = new PortalLoginQueryResult { User = user };
            }
            catch (Exception ex)
            {
                AppLogger.LogError(logger, ex, SerilogErrorMessages.PortalLogMessages.PlatformLaunchExchangeFailed);
                result.StatusCode = ErrorCodes.InternalServerError;
                result.StatusMessage = ErrorMessages.InternalServerError;
            }

            return result;
        }

        #endregion POST Methods
    }
}
