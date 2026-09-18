// Copyright (c) OptionC. All rights reserved.

namespace CFR.SyncService.Service.OrganizationSync
{
    /// <summary>
    /// Implements organization onboarding business logic: validation, the productId-in-body hard
    /// rule, and result-to-MSResultArgs mapping.
    /// Repository Responsibility:
    /// - Invokes IOrganizationSyncRepository for the actual create/update/get call.
    /// </summary>
    public class OrganizationSyncService(IOrganizationSyncRepository repository, ICurrentApiClient currentApiClient, ILogger<OrganizationSyncService> logger): IOrganizationSyncService
    {
        #region POST Methods

        /// <inheritdoc />
        public async Task<MSResultArgs> UpsertOrganizationAsync(OrganizationSyncInput input, string traceId)
        {
            var result = new MSResultArgs { TraceId = traceId };
            try
            {
                if (TryRejectProductIdInBody(input, result))
                {
                    return result;
                }

                if (input.ProductOrgId <= 0 || string.IsNullOrWhiteSpace(input.OrgName))
                {
                    result.StatusCode = ErrorCodes.BadRequest;
                    result.StatusMessage = ErrorMessages.ValidationFailed;
                    result.Errors.Add(new ErrorDetail("code", SyncErrorCodes.ValidationFailed));
                    return result;
                }

                var upsertResult = await repository.UpsertOrganizationAsync(currentApiClient.ProductId, input, currentApiClient.ApiClientId);

                result.StatusCode = upsertResult.Outcome == "Created" ? ErrorCodes.Created : ErrorCodes.Success;
                result.StatusMessage = ErrorMessages.Success;
                result.ResultData = new OrganizationSyncOutput
                {
                    CfrOrgId = upsertResult.CFROrgId ?? 0,
                    ProductOrgId = upsertResult.ProductOrgId ?? 0,
                    OrgName = upsertResult.OrgName ?? string.Empty,
                    Outcome = upsertResult.Outcome ?? string.Empty,
                    TraceId = traceId,
                };
            }
            catch (Exception ex)
            {
                AppLogger.LogError(logger, ex, SerilogErrorMessages.SyncLogMessages.CreateUserFailed, input.ProductOrgId);
                result.StatusCode = ErrorCodes.InternalServerError;
                result.StatusMessage = ErrorMessages.InternalServerError;
                result.Errors.Add(new ErrorDetail("code", SyncErrorCodes.InternalError));
            }

            return result;
        }

        #endregion POST Methods

        #region GET Methods

        /// <inheritdoc />
        public async Task<MSResultArgs> GetOrganizationAsync(int productOrgId, string traceId)
        {
            var result = new MSResultArgs { TraceId = traceId };
            try
            {
                var upsertResult = await repository.GetOrganizationAsync(currentApiClient.ProductId, productOrgId);
                if (upsertResult == null)
                {
                    result.StatusCode = ErrorCodes.NotFound;
                    result.StatusMessage = ErrorMessages.NoRecordFound;
                    result.Errors.Add(new ErrorDetail("code", SyncErrorCodes.UserNotFound));
                    return result;
                }

                result.StatusCode = ErrorCodes.Success;
                result.StatusMessage = ErrorMessages.Success;
                result.ResultData = new OrganizationSyncOutput
                {
                    CfrOrgId = upsertResult.CFROrgId ?? 0,
                    ProductOrgId = upsertResult.ProductOrgId ?? 0,
                    OrgName = upsertResult.OrgName ?? string.Empty,
                    Outcome = "NoChange",
                    TraceId = traceId,
                };
            }
            catch (Exception ex)
            {
                AppLogger.LogError(logger, ex, SerilogErrorMessages.SyncLogMessages.GetUserFailed, productOrgId.ToString());
                result.StatusCode = ErrorCodes.InternalServerError;
                result.StatusMessage = ErrorMessages.InternalServerError;
                result.Errors.Add(new ErrorDetail("code", SyncErrorCodes.InternalError));
            }

            return result;
        }

        #endregion GET Methods

        private static bool TryRejectProductIdInBody(OrganizationSyncInput input, MSResultArgs result)
        {
            if (input.ExtraFields == null)
            {
                return false;
            }

            foreach (string key in input.ExtraFields.Keys)
            {
                if (string.Equals(key, "productId", StringComparison.OrdinalIgnoreCase))
                {
                    result.StatusCode = ErrorCodes.Forbidden;
                    result.StatusMessage = ErrorMessages.ProductScopeViolation;
                    result.Errors.Add(new ErrorDetail("code", SyncErrorCodes.ProductScopeViolation));
                    return true;
                }
            }

            return false;
        }
    }
}
