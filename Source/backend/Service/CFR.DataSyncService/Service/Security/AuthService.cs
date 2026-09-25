// Copyright (c) OptionC. All rights reserved.

using System.Security.Cryptography;
using System.Text;

namespace CFR.DataSyncService.Service.Security
{
    /// <summary>
    /// Implements the ClientId/ClientSecret login that issues the JWT every other CFR.DataSync
    /// endpoint requires.
    /// </summary>
    public class AuthService(IApiClientRepository repository, IJwtTokenGenerator tokenGenerator, ILogger<AuthService> logger): IAuthService
    {
        #region POST Methods

        /// <inheritdoc />
        public async Task<MSResultArgs> LoginAsync(AuthLoginInput input)
        {
            var result = new MSResultArgs();
            try
            {
                if (string.IsNullOrWhiteSpace(input?.ClientId) || string.IsNullOrWhiteSpace(input.ClientSecret))
                {
                    SetUnauthenticated(result);
                    return result;
                }

                var apiClient = await repository.GetByClientIdAsync(input.ClientId);

                // Never reveal whether the ClientId or the ClientSecret was wrong — one generic
                // failure either way, same as the HMAC pipeline this replaces.
                if (apiClient == null || !apiClient.IsActive || !SecretMatches(input.ClientSecret, apiClient.ClientSecret))
                {
                    SetUnauthenticated(result);
                    return result;
                }

                (string token, DateTime expiresAt) = tokenGenerator.GenerateToken(apiClient);

                result.StatusCode = ErrorCodes.Success;
                result.StatusMessage = ErrorMessages.Success;
                result.ResultData = new AuthLoginOutput
                {
                    AccessToken = token,
                    ExpiresAt = expiresAt,
                };
            }
            catch (Exception ex)
            {
                AppLogger.LogError(logger, ex, SerilogErrorMessages.SyncLogMessages.AuthenticationFailed, input?.ClientId ?? string.Empty);
                result.StatusCode = ErrorCodes.InternalServerError;
                result.StatusMessage = ErrorMessages.InternalServerError;
            }

            return result;
        }

        #endregion POST Methods

        #region Helpers

        private static bool SecretMatches(string provided, string stored)
        {
            byte[] providedBytes = Encoding.UTF8.GetBytes(provided);
            byte[] storedBytes = Encoding.UTF8.GetBytes(stored);
            return providedBytes.Length == storedBytes.Length && CryptographicOperations.FixedTimeEquals(providedBytes, storedBytes);
        }

        private static void SetUnauthenticated(MSResultArgs result)
        {
            result.StatusCode = ErrorCodes.UnAuthorized;
            result.StatusMessage = ErrorMessages.Unauthenticated;
            result.Errors.Add(new ErrorDetail("code", SyncErrorCodes.Unauthenticated));
        }

        #endregion Helpers
    }
}
