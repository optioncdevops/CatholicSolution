// Copyright (c) OptionC. All rights reserved.

using System.Net.Mail;

namespace CFR.DataSyncService.Service.ProductSync
{
    /// <summary>
    /// Implements the CFR-user product-lookup business logic: email validation and
    /// ResultCode-to-MSResultArgs mapping. Deliberately does not consult ICurrentApiClient's own
    /// ProductId — see the header comment on 009_Sync_ProductLookup.sql for why this lookup is
    /// intentionally cross-product.
    /// Repository Responsibility:
    /// - Invokes IProductSyncRepository for the actual lookup.
    /// </summary>
    public class ProductSyncService(IProductSyncRepository repository, ICurrentApiClient currentApiClient, IConfiguration configuration, ILogger<ProductSyncService> logger): IProductSyncService
    {
        #region GET Methods

        /// <inheritdoc />
        public async Task<MSResultArgs> GetUserProductsAsync(string email, string traceId)
        {
            var result = new MSResultArgs { TraceId = traceId };
            try
            {
                if (!MailAddress.TryCreate(email, out _))
                {
                    result.StatusCode = ErrorCodes.BadRequest;
                    result.StatusMessage = ErrorMessages.InvalidEmail;
                    result.Errors.Add(new ErrorDetail("code", SyncErrorCodes.InvalidEmail));
                    return result;
                }

                var (found, products) = await repository.GetUserProductsAsync(email, configuration["Environment"] ?? string.Empty);
                if (!found)
                {
                    result.StatusCode = ErrorCodes.NotFound;
                    result.StatusMessage = ErrorMessages.SyncUserNotFoundByEmail;
                    result.Errors.Add(new ErrorDetail("code", SyncErrorCodes.UserNotFound));
                    return result;
                }

                // Minted alongside the product list (not a separate endpoint) so the App Switcher
                // widget's "All apps in App Hub" link can carry it in one round trip. Short-lived
                // (10 minutes) and single-use — see [dbo].[Portal_PlatformLaunch] — never a
                // standing credential.
                string rawCode = ConversionHelper.CreateAuthorizationCode();
                string codeHash = ConversionHelper.HashAuthorizationCode(rawCode);
                bool codeCreated = await repository.CreatePlatformLaunchCodeAsync(email, codeHash, currentApiClient.ClientId);

                result.StatusCode = ErrorCodes.Success;
                result.StatusMessage = ErrorMessages.Success;
                result.ResultData = new UserProductsResult
                {
                    Products = products,
                    PlatformLaunchCode = codeCreated ? rawCode : null
                };
            }
            catch (Exception ex)
            {
                AppLogger.LogError(logger, ex, SerilogErrorMessages.SyncLogMessages.GetUserProductsFailed, email);
                result.StatusCode = ErrorCodes.InternalServerError;
                result.StatusMessage = ErrorMessages.InternalServerError;
                result.Errors.Add(new ErrorDetail("code", SyncErrorCodes.InternalError));
            }

            return result;
        }

        #endregion GET Methods

        #region POST Methods

        /// <inheritdoc />
        public async Task<MSResultArgs> LaunchProductAsync(ProductLaunchInput input, string traceId)
        {
            var result = new MSResultArgs { TraceId = traceId };
            try
            {
                if (input == null || !MailAddress.TryCreate(input.Email, out _) || input.ProductId <= 0)
                {
                    result.StatusCode = ErrorCodes.BadRequest;
                    result.StatusMessage = ErrorMessages.BadRequest;
                    return result;
                }

                string code = ConversionHelper.CreateAuthorizationCode();
                string codeHash = ConversionHelper.HashAuthorizationCode(code);
                var (returnValue, row) = await repository.CreateProductLaunchAsync(input.Email, input.ProductId, codeHash, configuration["Environment"] ?? string.Empty);

                if (returnValue == -1 || returnValue == 0)
                {
                    result.StatusCode = ErrorCodes.NotFound;
                    result.StatusMessage = ErrorMessages.SyncUserNotFoundByEmail;
                    result.Errors.Add(new ErrorDetail("code", SyncErrorCodes.UserNotFound));
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

                result.StatusCode = ErrorCodes.Success;
                result.StatusMessage = ErrorMessages.Success;
                result.ResultData = new ProductLaunchOutput
                {
                    ProductId = row.ProductId,
                    LaunchUrl = ConversionHelper.AppendCode(row.BaseUrl, code),
                    ExpiresAt = row.ExpiresAt
                };
            }
            catch (Exception ex)
            {
                AppLogger.LogError(logger, ex, SerilogErrorMessages.SyncLogMessages.LaunchProductFailed, input?.ProductId ?? 0, input?.Email);
                result.StatusCode = ErrorCodes.InternalServerError;
                result.StatusMessage = ErrorMessages.InternalServerError;
            }

            return result;
        }

        #endregion POST Methods
    }
}
