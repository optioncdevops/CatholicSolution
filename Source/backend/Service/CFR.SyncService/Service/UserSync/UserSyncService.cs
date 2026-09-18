// Copyright (c) OptionC. All rights reserved.

using System.Net.Mail;
using System.Security.Cryptography;

namespace CFR.SyncService.Service.UserSync
{
    /// <summary>
    /// Implements the single-user sync business logic: validation, the productId-in-body hard
    /// rule, Idempotency-Key handling, If-Match concurrency, and ResultCode-to-MSResultArgs mapping.
    /// Repository Responsibility:
    /// - Invokes IUserSyncRepository for the actual create/update/get/deactivate/reactivate call.
    /// </summary>
    public class UserSyncService(IUserSyncRepository repository, IApiClientRepository apiClientRepository, ICurrentApiClient currentApiClient, ILogger<UserSyncService> logger): IUserSyncService
    {
        private static readonly TimeSpan IdempotencyTtl = TimeSpan.FromHours(24);

        #region POST Methods

        /// <inheritdoc />
        public async Task<MSResultArgs> CreateUserAsync(UserSyncInput input, string? idempotencyKey, string contentSha256Hex, string traceId, string? sourceIp)
        {
            var result = new MSResultArgs { TraceId = traceId };
            try
            {
                if (TryRejectProductIdInBody(input, result))
                {
                    return result;
                }

                if (!ValidateRequiredFields(input, result))
                {
                    return result;
                }

                if (!string.IsNullOrWhiteSpace(idempotencyKey))
                {
                    var replay = await TryGetIdempotencyReplayAsync(idempotencyKey, contentSha256Hex, result);
                    if (replay != null)
                    {
                        return replay;
                    }
                }

                var upsertResult = await repository.CreateUserAsync(currentApiClient.ProductId, input, currentApiClient.ApiClientId, traceId, sourceIp);
                MapResultToEnvelope(upsertResult, ErrorCodes.Created, result);

                if (!string.IsNullOrWhiteSpace(idempotencyKey) && result.StatusCode is ErrorCodes.Created or ErrorCodes.Success)
                {
                    await SaveIdempotencyRecordAsync(idempotencyKey, contentSha256Hex, result);
                }
            }
            catch (Exception ex)
            {
                AppLogger.LogError(logger, ex, SerilogErrorMessages.SyncLogMessages.CreateUserFailed, input.ProductOrgId);
                SetInternalError(result);
            }

            return result;
        }

        #endregion POST Methods

        #region PUT Methods

        /// <inheritdoc />
        public async Task<MSResultArgs> UpdateUserFullAsync(string externalUserId, UserSyncInput input, string? ifMatchRowVersionBase64, string traceId, string? sourceIp)
        {
            var result = new MSResultArgs { TraceId = traceId };
            try
            {
                if (TryRejectProductIdInBody(input, result))
                {
                    return result;
                }

                if (!ValidateRequiredFields(input, result))
                {
                    return result;
                }

                byte[]? expectedRowVersion = ParseRowVersion(ifMatchRowVersionBase64);
                var upsertResult = await repository.UpdateUserFullAsync(currentApiClient.ProductId, externalUserId, input, currentApiClient.ApiClientId, traceId, expectedRowVersion, sourceIp);
                MapResultToEnvelope(upsertResult, ErrorCodes.Success, result);
            }
            catch (Exception ex)
            {
                AppLogger.LogError(logger, ex, SerilogErrorMessages.SyncLogMessages.UpdateUserFailed, externalUserId);
                SetInternalError(result);
            }

            return result;
        }

        #endregion PUT Methods

        #region PATCH Methods

        /// <inheritdoc />
        public async Task<MSResultArgs> UpdateUserPartialAsync(string externalUserId, UserSyncInput input, bool firstNameSupplied, bool lastNameSupplied, bool roleIdSupplied, bool isLoginDisabledSupplied, bool isActiveSupplied, string? ifMatchRowVersionBase64, string traceId, string? sourceIp)
        {
            var result = new MSResultArgs { TraceId = traceId };
            try
            {
                if (TryRejectProductIdInBody(input, result))
                {
                    return result;
                }

                if (input.ProductOrgId <= 0)
                {
                    SetValidationFailed(result, "productOrgId", SyncErrorCodes.ValidationFailed);
                    return result;
                }

                byte[]? expectedRowVersion = ParseRowVersion(ifMatchRowVersionBase64);
                var upsertResult = await repository.UpdateUserPartialAsync(
                    currentApiClient.ProductId, externalUserId, input,
                    firstNameSupplied, lastNameSupplied, roleIdSupplied, isLoginDisabledSupplied, isActiveSupplied,
                    currentApiClient.ApiClientId, traceId, expectedRowVersion, sourceIp);

                MapResultToEnvelope(upsertResult, ErrorCodes.Success, result);
            }
            catch (Exception ex)
            {
                AppLogger.LogError(logger, ex, SerilogErrorMessages.SyncLogMessages.PatchUserFailed, externalUserId);
                SetInternalError(result);
            }

            return result;
        }

        #endregion PATCH Methods

        #region GET Methods

        /// <inheritdoc />
        public async Task<MSResultArgs> GetUserAsync(string externalUserId, int productOrgId, string traceId)
        {
            var result = new MSResultArgs { TraceId = traceId };
            try
            {
                var upsertResult = await repository.GetUserAsync(currentApiClient.ProductId, externalUserId, productOrgId, currentApiClient.ApiClientId, traceId);
                MapResultToEnvelope(upsertResult, ErrorCodes.Success, result);
            }
            catch (Exception ex)
            {
                AppLogger.LogError(logger, ex, SerilogErrorMessages.SyncLogMessages.GetUserFailed, externalUserId);
                SetInternalError(result);
            }

            return result;
        }

        #endregion GET Methods

        #region STATUS Methods

        /// <inheritdoc />
        public async Task<MSResultArgs> DeactivateUserAsync(string externalUserId, int productOrgId, string? ifMatchRowVersionBase64, string traceId, string? sourceIp)
        {
            var result = new MSResultArgs { TraceId = traceId };
            try
            {
                byte[]? expectedRowVersion = ParseRowVersion(ifMatchRowVersionBase64);
                var upsertResult = await repository.DeactivateUserAsync(currentApiClient.ProductId, externalUserId, productOrgId, currentApiClient.ApiClientId, traceId, expectedRowVersion, sourceIp);
                MapResultToEnvelope(upsertResult, ErrorCodes.Success, result);
            }
            catch (Exception ex)
            {
                AppLogger.LogError(logger, ex, SerilogErrorMessages.SyncLogMessages.DeactivateUserFailed, externalUserId);
                SetInternalError(result);
            }

            return result;
        }

        /// <inheritdoc />
        public async Task<MSResultArgs> ReactivateUserAsync(string externalUserId, int productOrgId, string? ifMatchRowVersionBase64, string traceId, string? sourceIp)
        {
            var result = new MSResultArgs { TraceId = traceId };
            try
            {
                byte[]? expectedRowVersion = ParseRowVersion(ifMatchRowVersionBase64);
                var upsertResult = await repository.ReactivateUserAsync(currentApiClient.ProductId, externalUserId, productOrgId, currentApiClient.ApiClientId, traceId, expectedRowVersion, sourceIp);
                MapResultToEnvelope(upsertResult, ErrorCodes.Success, result);
            }
            catch (Exception ex)
            {
                AppLogger.LogError(logger, ex, SerilogErrorMessages.SyncLogMessages.ReactivateUserFailed, externalUserId);
                SetInternalError(result);
            }

            return result;
        }

        #endregion STATUS Methods

        #region Helpers

        private static bool TryRejectProductIdInBody(UserSyncInput input, MSResultArgs result)
        {
            if (input.ExtraFields == null)
            {
                return false;
            }

            foreach (string key in input.ExtraFields.Keys)
            {
                if (string.Equals(key, "productId", StringComparison.OrdinalIgnoreCase))
                {
                    result.StatusCode = 403; // Microsoft.AspNetCore.Http.StatusCodes.Status403Forbidden — not referenceable from this non-Web project
                    result.StatusMessage = ErrorMessages.ProductScopeViolation;
                    result.Errors.Add(new ErrorDetail("code", SyncErrorCodes.ProductScopeViolation));
                    return true;
                }
            }

            return false;
        }

        private static bool ValidateRequiredFields(UserSyncInput input, MSResultArgs result)
        {
            if (string.IsNullOrWhiteSpace(input.ExternalUserId))
            {
                SetValidationFailed(result, "externalUserId", SyncErrorCodes.ValidationFailed);
                return false;
            }

            if (input.ProductOrgId <= 0)
            {
                SetValidationFailed(result, "productOrgId", SyncErrorCodes.ValidationFailed);
                return false;
            }

            if (!MailAddress.TryCreate(input.Email, out _))
            {
                SetValidationFailed(result, "email", SyncErrorCodes.InvalidEmail);
                return false;
            }

            if (string.IsNullOrWhiteSpace(input.FirstName) || string.IsNullOrWhiteSpace(input.LastName) || input.RoleId is null or <= 0)
            {
                SetValidationFailed(result, "firstName/lastName/roleId", SyncErrorCodes.ValidationFailed);
                return false;
            }

            return true;
        }

        private static void SetValidationFailed(MSResultArgs result, string field, string code)
        {
            result.StatusCode = ErrorCodes.BadRequest;
            result.StatusMessage = code == SyncErrorCodes.InvalidEmail ? ErrorMessages.InvalidEmail : ErrorMessages.ValidationFailed;
            result.Errors.Add(new ErrorDetail("code", code));
            result.Errors.Add(new ErrorDetail(field, result.StatusMessage));
        }

        private static byte[]? ParseRowVersion(string? ifMatchRowVersionBase64)
        {
            return string.IsNullOrWhiteSpace(ifMatchRowVersionBase64) ? null : Convert.FromBase64String(ifMatchRowVersionBase64);
        }

        private static void SetInternalError(MSResultArgs result)
        {
            result.StatusCode = ErrorCodes.InternalServerError;
            result.StatusMessage = ErrorMessages.InternalServerError;
            result.Errors.Add(new ErrorDetail("code", SyncErrorCodes.InternalError));
        }

        private static void MapResultToEnvelope(UserProductUpsertResult upsertResult, long successStatusCode, MSResultArgs result)
        {
            if (upsertResult.ResultCode != "OK")
            {
                var (statusCode, message, code) = upsertResult.ResultCode switch
                {
                    "ORG_NOT_ONBOARDED" => ((long)ErrorCodes.UnprocessableEntity, ErrorMessages.OrgNotOnboarded, SyncErrorCodes.OrgNotOnboarded),
                    "USER_ALREADY_EXISTS" => ((long)ErrorCodes.Conflict, ErrorMessages.SyncUserAlreadyExists, SyncErrorCodes.UserAlreadyExists),
                    "USER_NOT_FOUND" => ((long)ErrorCodes.NotFound, ErrorMessages.SyncUserNotFound, SyncErrorCodes.UserNotFound),
                    "CONCURRENCY_CONFLICT" => ((long)ErrorCodes.PreconditionFailed, ErrorMessages.ConcurrencyConflict, SyncErrorCodes.ConcurrencyConflict),
                    "EMAIL_REBIND_CONFLICT" => ((long)ErrorCodes.Conflict, ErrorMessages.EmailRebindConflict, SyncErrorCodes.EmailRebindConflict),
                    _ => ((long)ErrorCodes.InternalServerError, ErrorMessages.InternalServerError, SyncErrorCodes.InternalError),
                };

                result.StatusCode = statusCode;
                result.StatusMessage = message;
                result.Errors.Add(new ErrorDetail("code", code));
                return;
            }

            result.StatusCode = successStatusCode;
            result.StatusMessage = ErrorMessages.Success;
            result.ResultData = new UserSyncOutput
            {
                CfrUserId = upsertResult.CFRUserId ?? 0,
                CfrUserDetailId = upsertResult.CFRUserDetailId ?? 0,
                CfrOrgId = upsertResult.CFROrgId ?? 0,
                Email = upsertResult.Email ?? string.Empty,
                Outcome = upsertResult.Outcome ?? string.Empty,
                RowVersion = upsertResult.RowVersionBytes != null ? Convert.ToBase64String(upsertResult.RowVersionBytes) : null,
                TraceId = result.TraceId,
            };
        }

        private async Task<MSResultArgs?> TryGetIdempotencyReplayAsync(string idempotencyKey, string contentSha256Hex, MSResultArgs result)
        {
            var existing = await apiClientRepository.GetIdempotencyRecordAsync(currentApiClient.ApiClientId, idempotencyKey);
            if (existing == null)
            {
                return null;
            }

            byte[] requestHash = Convert.FromHexString(contentSha256Hex);
            if (!CryptographicOperations.FixedTimeEquals(requestHash, existing.RequestHash))
            {
                result.StatusCode = ErrorCodes.Conflict;
                result.StatusMessage = ErrorMessages.IdempotencyKeyReuse;
                result.Errors.Add(new ErrorDetail("code", SyncErrorCodes.IdempotencyKeyReuse));
                return result;
            }

            result.StatusCode = existing.ResponseStatusCode;
            result.ResultData = JsonSerializer.Deserialize<UserSyncOutput>(existing.ResponseBody);
            result.StatusMessage = ErrorMessages.Success;
            return result;
        }

        private async Task SaveIdempotencyRecordAsync(string idempotencyKey, string contentSha256Hex, MSResultArgs result)
        {
            byte[] requestHash = Convert.FromHexString(contentSha256Hex);
            string responseBody = JsonSerializer.Serialize(result.ResultData);
            await apiClientRepository.SaveIdempotencyRecordAsync(
                currentApiClient.ApiClientId, idempotencyKey, requestHash, (int)result.StatusCode, responseBody, DateTime.UtcNow.Add(IdempotencyTtl));
        }

        #endregion Helpers
    }
}
