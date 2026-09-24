// Copyright (c) OptionC. All rights reserved.

namespace CFR.DataSyncService.Service.ProductRole
{
    /// <summary>
    /// Implements the per-product role catalog business logic: validation and
    /// ResultCode-to-MSResultArgs mapping.
    /// Repository Responsibility:
    /// - Invokes IProductRoleRepository for the actual upsert/list call.
    /// </summary>
    public class ProductRoleService(IProductRoleRepository repository, ICurrentApiClient currentApiClient, ILogger<ProductRoleService> logger): IProductRoleService
    {
        #region POST Methods

        /// <inheritdoc />
        public async Task<MSResultArgs> UpsertRoleAsync(ProductRoleInput input, string traceId)
        {
            var result = new MSResultArgs { TraceId = traceId };
            try
            {
                if (input == null || input.RoleId <= 0 || string.IsNullOrWhiteSpace(input.RoleName))
                {
                    result.StatusCode = ErrorCodes.BadRequest;
                    result.StatusMessage = ErrorMessages.ValidationFailed;
                    result.Errors.Add(new ErrorDetail("code", SyncErrorCodes.ValidationFailed));
                    return result;
                }

                var role = await repository.UpsertRoleAsync(currentApiClient.ProductId, input.RoleId, input.RoleName.Trim());
                result.StatusCode = ErrorCodes.Success;
                result.StatusMessage = ErrorMessages.Success;
                result.ResultData = role;
            }
            catch (Exception ex)
            {
                AppLogger.LogError(logger, ex, SerilogErrorMessages.SyncLogMessages.UpsertProductRoleFailed, currentApiClient.ProductId);
                result.StatusCode = ErrorCodes.InternalServerError;
                result.StatusMessage = ErrorMessages.InternalServerError;
                result.Errors.Add(new ErrorDetail("code", SyncErrorCodes.InternalError));
            }

            return result;
        }

        #endregion POST Methods

        #region GET Methods

        /// <inheritdoc />
        public async Task<MSResultArgs> GetRolesAsync(string traceId)
        {
            var result = new MSResultArgs { TraceId = traceId };
            try
            {
                result.StatusCode = ErrorCodes.Success;
                result.StatusMessage = ErrorMessages.Success;
                result.ResultData = await repository.GetRolesAsync(currentApiClient.ProductId);
            }
            catch (Exception ex)
            {
                AppLogger.LogError(logger, ex, SerilogErrorMessages.SyncLogMessages.GetProductRolesFailed, currentApiClient.ProductId);
                result.StatusCode = ErrorCodes.InternalServerError;
                result.StatusMessage = ErrorMessages.InternalServerError;
                result.Errors.Add(new ErrorDetail("code", SyncErrorCodes.InternalError));
            }

            return result;
        }

        #endregion GET Methods
    }
}
