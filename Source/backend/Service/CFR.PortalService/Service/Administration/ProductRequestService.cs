// Copyright (c) OptionC. All rights reserved.

using CFR.CommonService.MailService;

namespace CFR.PortalService.Service.Administration
{
    /// <summary>
    /// Implements public "Suggest a product" business logic for the submit operation.
    /// Repository Responsibility:
    /// - Invokes IProductRequestRepository for stored procedure execution.
    /// - Invokes IEmailTemplatesRepository and ISMTPMailService to email admins from a configurable template.
    /// - Invokes IConfSettingsService to read the CFR Settings page's configured notification recipient.
    /// </summary>
    public class ProductRequestService(IProductRequestRepository repository, IEmailTemplatesRepository emailTemplatesRepository, ISMTPMailService mailService, IConfSettingsService confSettingsService, IConfiguration configuration, ILogger<ProductRequestService> logger): IProductRequestService
    {
        private const string ProductRequestedTemplateCode = "ProductRequested";

        #region POST Methods

        /// <summary>
        /// Creates a product request.
        /// </summary>
        /// <remarks>
        /// Purpose: Insert the request, its features, and initial status history, then email the platform's admins.
        /// Request Flow: ProductRequestController -> ProductRequestService.SaveProductRequestAsync() -> IProductRequestRepository.SaveProductRequestAsync().
        /// Validation Details: Product name, description, requester name, and requester email are required.
        /// Business Logic: Delegates insert to the repository, then emails notification recipients from the ProductRequested template. Mail failure does not fail the save.
        /// Repository Interaction: Calls IProductRequestRepository.SaveProductRequestAsync() and IProductRequestRepository.GetProductRequestNotificationRecipientsAsync().
        /// Response Details: MSResultArgs containing the new product request identifier.
        /// </remarks>
        /// <param name="input">Input DTO containing the proposed product and requester fields.</param>
        /// <returns>MSResultArgs containing the save status.</returns>
        public async Task<MSResultArgs> SaveProductRequestAsync(ProductRequestInput input)
        {
            var result = new MSResultArgs();
            try
            {
                if (input == null
                    || string.IsNullOrWhiteSpace(input.ProductName)
                    || string.IsNullOrWhiteSpace(input.ProdDescription)
                    || string.IsNullOrWhiteSpace(input.RequesterName)
                    || string.IsNullOrWhiteSpace(input.RequesterEmail))
                {
                    result.StatusCode = ErrorCodes.BadRequest;
                    result.StatusMessage = ErrorMessages.BadRequest;
                    return result;
                }

                int savedId = await repository.SaveProductRequestAsync(input);
                if (savedId <= 0)
                {
                    result.StatusCode = ErrorCodes.Failed;
                    result.StatusMessage = ErrorMessages.SaveFailed;
                    return result;
                }

                await NotifyAdminsOfNewRequestAsync(savedId, input);
                result.ResultData = savedId;
            }
            catch (Exception ex)
            {
                AppLogger.LogError(logger, ex, SerilogErrorMessages.PortalLogMessages.SaveProductRequestFailed);
                result.StatusCode = ErrorCodes.InternalServerError;
                result.StatusMessage = ErrorMessages.InternalServerError;
            }

            return result;
        }

        // Logo upload is NOT implemented here - see ProductRequestService.UploadProductRequestLogoAsync
        // in CFR.AcutisService instead. A Portal-hosted upload would land in Portal's own wwwroot,
        // not the folder [core].[Product].[LogoName] is actually served from.

        #endregion POST Methods

        #region Private Helper Methods

        /// <summary>
        /// Emails the platform's admins that a new product request needs review, using the ProductRequested template.
        /// </summary>
        private async Task NotifyAdminsOfNewRequestAsync(int productRequestId, ProductRequestInput input)
        {
            try
            {
                long? notifyUserId = confSettingsService.LoadData()?.SMTPMailConfig?.ProductRequestNotifyUserId;
                var recipients = await repository.GetProductRequestNotificationRecipientsAsync(notifyUserId);
                var addresses = (recipients ?? [])
                    .Where(recipient => !string.IsNullOrWhiteSpace(recipient.EMail))
                    .Select(recipient => recipient.EMail.Trim())
                    .Distinct(StringComparer.OrdinalIgnoreCase)
                    .ToList();

                if (addresses.Count == 0)
                {
                    logger.LogWarning("No notification recipients found for product request {ProductRequestId}.", productRequestId);
                    return;
                }

                string baseUrl = (configuration["FrontendSetting:CfrAdminBaseUrl"] ?? string.Empty).TrimEnd('/');
                string reviewLink = string.IsNullOrWhiteSpace(baseUrl) ? string.Empty : $"{baseUrl}/admin/product-requests";
                var placeholders = new Dictionary<string, string>
                {
                    ["RequesterName"] = input.RequesterName,
                    ["RequesterEmail"] = input.RequesterEmail,
                    ["OrganizationName"] = input.OrganizationName ?? string.Empty,
                    ["ProductName"] = input.ProductName,
                    ["ReviewLink"] = reviewLink,
                };

                var template = await emailTemplatesRepository.GetEmailTemplateByCodeAsync(ProductRequestedTemplateCode);
                string subject = template?.Subject ?? $"New product suggestion: {input.ProductName}";
                string body = template?.Body ?? "<p>A visitor has suggested a new product for the platform.</p><p><strong>Product:</strong> [ProductName]</p><p><strong>Submitted by:</strong> [RequesterName] ([RequesterEmail])</p><p><strong>Organization:</strong> [OrganizationName]</p><p><a href=\"[ReviewLink]\">Review this suggestion</a></p>";
                string mergedSubject = SMTPMailService.FormatMailContent(subject, placeholders);
                string mergedBody = SMTPMailService.FormatMailContent(body, placeholders);
                await mailService.SendMailAsync(mergedSubject, mergedBody, string.Join(';', addresses));
            }
            catch (Exception ex)
            {
                AppLogger.LogError(logger, ex, SerilogErrorMessages.PortalLogMessages.SendProductRequestEmailFailed, ProductRequestedTemplateCode, productRequestId);
            }
        }

        #endregion Private Helper Methods
    }
}
