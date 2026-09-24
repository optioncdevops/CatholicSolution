// Copyright (c) OptionC. All rights reserved.

using System.Net.Mail;
using System.Security.Cryptography;

namespace CFR.DataSyncService.Service.UserSync
{
    /// <summary>
    /// Implements the single-user sync business logic: validation, Idempotency-Key handling,
    /// If-Match concurrency, and ResultCode-to-MSResultArgs mapping.
    /// Repository Responsibility:
    /// - Invokes IUserSyncRepository for the actual create/update/get/deactivate/reactivate call.
    /// </summary>
    public class UserSyncService(IUserSyncRepository repository, IApiClientRepository apiClientRepository, ICurrentApiClient currentApiClient, ILogger<UserSyncService> logger): IUserSyncService
    {
        private static readonly TimeSpan IdempotencyTtl = TimeSpan.FromHours(24);

        /// <summary>Row cap for one bulk request — a large one-time migration should be chunked
        /// by the caller rather than sent as a single, very long-running HTTP call.</summary>
        private const int MaxBulkUserCount = 500;

        #region POST Methods

        /// <inheritdoc />
        public async Task<MSResultArgs> CreateUserAsync(UserSyncInput input, string? idempotencyKey, string contentSha256Hex, string traceId, string? sourceIp)
        {
            var result = new MSResultArgs { TraceId = traceId };
            try
            {
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

        /// <inheritdoc />
        public async Task<MSResultArgs> BulkCreateUsersAsync(BulkUserSyncInput input, string traceId, string? sourceIp)
        {
            var result = new MSResultArgs { TraceId = traceId };
            List<UserSyncInput> users = input?.Users ?? [];
            try
            {
                if (users.Count == 0)
                {
                    SetValidationFailed(result, "users", SyncErrorCodes.ValidationFailed);
                    return result;
                }

                if (users.Count > MaxBulkUserCount)
                {
                    result.StatusCode = ErrorCodes.BadRequest;
                    result.StatusMessage = ErrorMessages.PayloadTooLarge;
                    result.Errors.Add(new ErrorDetail("code", SyncErrorCodes.PayloadTooLarge));
                    return result;
                }

                if (TryFindDuplicateRow(users, result))
                {
                    return result;
                }

                var output = new BulkUserSyncOutput { TotalCount = users.Count, TraceId = traceId };
                foreach (var user in users)
                {
                    // No Idempotency-Key per row — that header dedupes retries of one request, and
                    // reusing the same key across many different payloads here would make every row
                    // after the first look like an IDEMPOTENCY_KEY_REUSE conflict instead of its own
                    // real outcome. Each row still gets CreateUserAsync's full validation; one bad
                    // row does not fail the whole batch.
                    var rowResult = await CreateUserAsync(user, idempotencyKey: null, contentSha256Hex: string.Empty, traceId, sourceIp);
                    bool success = rowResult.StatusCode is ErrorCodes.Created or ErrorCodes.Success;
                    output.Results.Add(new UserSyncBulkResultItem
                    {
                        ExternalUserId = user.ExternalUserId,
                        Success = success,
                        StatusCode = rowResult.StatusCode,
                        StatusMessage = rowResult.StatusMessage ?? string.Empty,
                        User = success ? rowResult.ResultData as UserSyncOutput : null,
                    });

                    if (success)
                    {
                        output.SuccessCount++;
                    }
                    else
                    {
                        output.FailedCount++;
                    }
                }

                result.StatusCode = ErrorCodes.Success;
                result.StatusMessage = ErrorMessages.Success;
                result.ResultData = output;
            }
            catch (Exception ex)
            {
                AppLogger.LogError(logger, ex, SerilogErrorMessages.SyncLogMessages.BulkCreateUsersFailed, users.Count);
                SetInternalError(result);
            }

            return result;
        }

        #endregion POST Methods

        #region PUT Methods

        /// <inheritdoc />
        public async Task<MSResultArgs> UpdateUserFullAsync(string externalUserId, UserSyncUpdateInput input, string? ifMatchRowVersionBase64, string traceId, string? sourceIp)
        {
            var result = new MSResultArgs { TraceId = traceId };
            try
            {
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
        public async Task<MSResultArgs> UpdateUserPartialAsync(string externalUserId, UserSyncUpdateInput input, string? ifMatchRowVersionBase64, string traceId, string? sourceIp)
        {
            var result = new MSResultArgs { TraceId = traceId };
            try
            {
                if (!ValidateRequiredFields(input, result))
                {
                    return result;
                }

                byte[]? expectedRowVersion = ParseRowVersion(ifMatchRowVersionBase64);
                var upsertResult = await repository.UpdateUserPartialAsync(currentApiClient.ProductId, externalUserId, input, currentApiClient.ApiClientId, traceId, expectedRowVersion, sourceIp);
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

        /// <inheritdoc />
        public async Task<MSResultArgs> SetLoginDisabledAsync(string externalUserId, int productOrgId, bool isLoginDisabled, string? ifMatchRowVersionBase64, string traceId, string? sourceIp)
        {
            var result = new MSResultArgs { TraceId = traceId };
            try
            {
                byte[]? expectedRowVersion = ParseRowVersion(ifMatchRowVersionBase64);
                var upsertResult = await repository.SetLoginDisabledAsync(currentApiClient.ProductId, externalUserId, productOrgId, isLoginDisabled, currentApiClient.ApiClientId, traceId, expectedRowVersion, sourceIp);
                MapResultToEnvelope(upsertResult, ErrorCodes.Success, result);
            }
            catch (Exception ex)
            {
                AppLogger.LogError(logger, ex, SerilogErrorMessages.SyncLogMessages.SetLoginDisabledFailed, externalUserId);
                SetInternalError(result);
            }

            return result;
        }

        /// <inheritdoc />
        public async Task<MSResultArgs> SetActiveAsync(string externalUserId, int productOrgId, bool isActive, string? ifMatchRowVersionBase64, string traceId, string? sourceIp)
        {
            var result = new MSResultArgs { TraceId = traceId };
            try
            {
                byte[]? expectedRowVersion = ParseRowVersion(ifMatchRowVersionBase64);
                var upsertResult = await repository.SetActiveAsync(currentApiClient.ProductId, externalUserId, productOrgId, isActive, currentApiClient.ApiClientId, traceId, expectedRowVersion, sourceIp);
                MapResultToEnvelope(upsertResult, ErrorCodes.Success, result);
            }
            catch (Exception ex)
            {
                AppLogger.LogError(logger, ex, SerilogErrorMessages.SyncLogMessages.SetActiveFailed, externalUserId);
                SetInternalError(result);
            }

            return result;
        }

        #endregion STATUS Methods

        #region Helpers

        private static bool ValidateRequiredFields(IUserSyncFields input, MSResultArgs result)
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

        private static bool TryFindDuplicateRow(List<UserSyncInput> users, MSResultArgs result)
        {
            var seen = new HashSet<(string ExternalUserId, int ProductOrgId)>();
            foreach (var user in users)
            {
                if (!seen.Add((user.ExternalUserId, user.ProductOrgId)))
                {
                    result.StatusCode = ErrorCodes.BadRequest;
                    result.StatusMessage = ErrorMessages.DuplicateInFile;
                    result.Errors.Add(new ErrorDetail("code", SyncErrorCodes.DuplicateInFile));
                    return true;
                }
            }

            return false;
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
                CfrUserId = upsertResult.CFRUserId ?? Guid.Empty,
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
