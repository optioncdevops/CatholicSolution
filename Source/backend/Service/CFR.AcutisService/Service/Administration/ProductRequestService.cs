// Copyright (c) OptionC. All rights reserved.

using System.Security.Cryptography;

namespace CFR.AcutisService.Service.Administration
{
    /// <summary>
    /// Implements admin review business logic for public "Suggest a product" requests.
    /// Repository Responsibility:
    /// - Invokes IProductRequestRepository for stored procedure execution.
    /// - Invokes IEmailTemplatesRepository and ISMTPMailService to email the requester from configurable templates.
    /// </summary>
    public class ProductRequestService(IProductRequestRepository repository, IEmailTemplatesRepository emailTemplatesRepository, ISMTPMailService mailService, IWebHostEnvironment environment, ILogger<ProductRequestService> logger): IProductRequestService
    {
        private const string ProductRequestApprovedTemplateCode = "ProductRequestApproved";
        private const string ProductRequestRejectedTemplateCode = "ProductRequestRejected";

        #region GET Methods

        /// <summary>
        /// Retrieves product requests for the admin review list.
        /// </summary>
        /// <remarks>
        /// Purpose: Fetch pending/approved/rejected product requests.
        /// Request Flow: ProductRequestController -> ProductRequestService.GetProductRequestsListAsync() -> IProductRequestRepository.GetProductRequestsListAsync().
        /// Validation Details: None.
        /// Business Logic: Wraps the typed list in MSResultArgs.
        /// Repository Interaction: Calls IProductRequestRepository.GetProductRequestsListAsync().
        /// Response Details: MSResultArgs containing List of ProductRequestOutput.
        /// </remarks>
        /// <param name="requestStatus">Optional status filter: 1 = pending, 2 = approved, 3 = rejected.</param>
        /// <returns>MSResultArgs containing the product request list.</returns>
        public async Task<MSResultArgs> GetProductRequestsListAsync(int? requestStatus)
        {
            var result = new MSResultArgs();
            try
            {
                var data = await repository.GetProductRequestsListAsync(requestStatus);
                result.ResultData = data ?? [];
            }
            catch (Exception ex)
            {
                AppLogger.LogError(logger, ex, SerilogErrorMessages.AcutisLogMessages.FetchProductRequestsFailed);
                result.StatusCode = ErrorCodes.InternalServerError;
                result.StatusMessage = ErrorMessages.InternalServerError;
            }

            return result;
        }

        /// <summary>
        /// Retrieves one product request by identifier.
        /// </summary>
        /// <remarks>
        /// Purpose: Fetch a request for the review detail view.
        /// Request Flow: ProductRequestController -> ProductRequestService.GetProductRequestByIdAsync() -> IProductRequestRepository.GetProductRequestByIdAsync().
        /// Validation Details: ProductRequestId must be greater than zero.
        /// Business Logic: Wraps the typed record in MSResultArgs.
        /// Repository Interaction: Calls IProductRequestRepository.GetProductRequestByIdAsync().
        /// Response Details: MSResultArgs containing ProductRequestOutput, or NoRecordFound.
        /// </remarks>
        /// <param name="productRequestId">Product request identifier.</param>
        /// <returns>MSResultArgs containing the product request.</returns>
        public async Task<MSResultArgs> GetProductRequestByIdAsync(int productRequestId)
        {
            var result = new MSResultArgs();
            try
            {
                if (productRequestId <= 0)
                {
                    result.StatusCode = ErrorCodes.BadRequest;
                    result.StatusMessage = ErrorMessages.BadRequest;
                    return result;
                }

                var data = await repository.GetProductRequestByIdAsync(productRequestId);
                if (data == null)
                {
                    result.StatusCode = ErrorCodes.NoRecordFound;
                    result.StatusMessage = ErrorMessages.NoRecordFound;
                    return result;
                }

                result.ResultData = data;
            }
            catch (Exception ex)
            {
                AppLogger.LogError(logger, ex, SerilogErrorMessages.AcutisLogMessages.FetchProductRequestByIdFailed, productRequestId);
                result.StatusCode = ErrorCodes.InternalServerError;
                result.StatusMessage = ErrorMessages.InternalServerError;
            }

            return result;
        }

        #endregion GET Methods

        #region PUT Methods

        /// <summary>
        /// Approves a product request, promoting it into the live product catalog.
        /// </summary>
        /// <remarks>
        /// Purpose: Copy the proposed product into [core].[Product] / [core].[ProductFeature], register its [sec].[ApiClient] credential, then email the requester.
        /// Request Flow: ProductRequestController -> ProductRequestService.ApproveProductRequestAsync() -> IProductRequestRepository.ApproveProductRequestAsync().
        /// Validation Details: ProductRequestId must be greater than zero.
        /// Business Logic: Generates a random secret key (see GenerateSecretKey) saved as [sec].[ApiClient].[ClientSecret], delegates the approval to the repository, maps duplicate-name/already-decided results to Conflict, then emails the requester the ClientId and secret. Mail failure does not fail the approval.
        /// Repository Interaction: Calls IProductRequestRepository.ApproveProductRequestAsync() and IProductRequestRepository.GetProductRequestByIdAsync().
        /// Response Details: MSResultArgs containing the new ProductId.
        /// </remarks>
        /// <param name="input">Decision payload containing the request identifier and optional remarks.</param>
        /// <returns>MSResultArgs containing the approval outcome.</returns>
        public async Task<MSResultArgs> ApproveProductRequestAsync(ProductRequestDecisionInput input)
        {
            var result = new MSResultArgs();
            try
            {
                if (input == null || input.ProductRequestId <= 0)
                {
                    result.StatusCode = ErrorCodes.BadRequest;
                    result.StatusMessage = ErrorMessages.BadRequest;
                    return result;
                }

                string secretKey = GenerateSecretKey();
                (int newProductId, string? clientId) = await repository.ApproveProductRequestAsync(input.ProductRequestId, input.DecisionRemarks, secretKey);
                if (newProductId == -95)
                {
                    result.StatusCode = ErrorCodes.Conflict;
                    result.StatusMessage = ErrorMessages.ProductRequestAlreadyDecided;
                    return result;
                }

                if (newProductId == -99)
                {
                    result.StatusCode = ErrorCodes.Conflict;
                    result.StatusMessage = ErrorMessages.ExistProduct;
                    return result;
                }

                if (newProductId <= 0)
                {
                    result.StatusCode = ErrorCodes.Failed;
                    result.StatusMessage = ErrorMessages.Failed;
                    return result;
                }

                await NotifyRequesterOfDecisionAsync(input.ProductRequestId, approved: true, input.DecisionRemarks, newProductId, clientId, secretKey);
                result.ResultData = new { productRequestId = input.ProductRequestId, approvedProductId = newProductId };
            }
            catch (Exception ex)
            {
                AppLogger.LogError(logger, ex, SerilogErrorMessages.AcutisLogMessages.ApproveProductRequestFailed, input?.ProductRequestId);
                result.StatusCode = ErrorCodes.InternalServerError;
                result.StatusMessage = ErrorMessages.InternalServerError;
            }

            return result;
        }

        /// <summary>
        /// Rejects a product request. No catalog changes are made.
        /// </summary>
        /// <remarks>
        /// Purpose: Record a rejection decision, then email the requester.
        /// Request Flow: ProductRequestController -> ProductRequestService.RejectProductRequestAsync() -> IProductRequestRepository.RejectProductRequestAsync().
        /// Validation Details: ProductRequestId must be greater than zero.
        /// Business Logic: Delegates the rejection to the repository, maps an already-decided result to Conflict, then emails the requester. Mail failure does not fail the rejection.
        /// Repository Interaction: Calls IProductRequestRepository.RejectProductRequestAsync() and IProductRequestRepository.GetProductRequestByIdAsync().
        /// Response Details: MSResultArgs containing the rejection outcome.
        /// </remarks>
        /// <param name="input">Decision payload containing the request identifier and optional remarks.</param>
        /// <returns>MSResultArgs containing the rejection outcome.</returns>
        public async Task<MSResultArgs> RejectProductRequestAsync(ProductRequestDecisionInput input)
        {
            var result = new MSResultArgs();
            try
            {
                if (input == null || input.ProductRequestId <= 0)
                {
                    result.StatusCode = ErrorCodes.BadRequest;
                    result.StatusMessage = ErrorMessages.BadRequest;
                    return result;
                }

                int updatedId = await repository.RejectProductRequestAsync(input.ProductRequestId, input.DecisionRemarks);
                if (updatedId == -95)
                {
                    result.StatusCode = ErrorCodes.Conflict;
                    result.StatusMessage = ErrorMessages.ProductRequestAlreadyDecided;
                    return result;
                }

                if (updatedId <= 0)
                {
                    result.StatusCode = ErrorCodes.Failed;
                    result.StatusMessage = ErrorMessages.Failed;
                    return result;
                }

                await NotifyRequesterOfDecisionAsync(input.ProductRequestId, approved: false, input.DecisionRemarks);
                result.ResultData = updatedId;
            }
            catch (Exception ex)
            {
                AppLogger.LogError(logger, ex, SerilogErrorMessages.AcutisLogMessages.RejectProductRequestFailed, input?.ProductRequestId);
                result.StatusCode = ErrorCodes.InternalServerError;
                result.StatusMessage = ErrorMessages.InternalServerError;
            }

            return result;
        }

        #endregion PUT Methods

        #region POST Methods

        /// <summary>
        /// Uploads a proposed product's logo image ahead of a public submission.
        /// </summary>
        /// <remarks>
        /// Purpose: Let a visitor attach a logo to their suggestion before Submit is clicked - hosted in CFR.Acutis (not CFR.Portal) so the saved file lands in the exact folder [core].[Product].[LogoName] is served from; a Portal-hosted upload would land in Portal's own wwwroot instead.
        /// Request Flow: ProductRequestController -> ProductRequestService.UploadProductRequestLogoAsync() -> local disk (IWebHostEnvironment.WebRootPath).
        /// Validation Details: File is required, max 2 MB, extensions .jpg/.jpeg/.png only.
        /// Business Logic: Saves via the same portable WebRootPath-based pattern ProductsService.UpdateProductLogoAsync uses - deliberately NOT IFileHandlerService/ApplicationFilePath:Doc_BasePath, which is a per-developer path that breaks on any other machine (see ProductsService.GetProductDocBasePath).
        /// Repository Interaction: None (file storage only).
        /// Response Details: MSResultArgs containing the saved logo file name, or BadRequest.
        /// </remarks>
        /// <param name="file">Uploaded image file from multipart form data.</param>
        /// <returns>MSResultArgs containing the saved logo file name.</returns>
        public Task<MSResultArgs> UploadProductRequestLogoAsync(IFormFile? file)
        {
            var result = new MSResultArgs();
            try
            {
                if (file == null || file.Length == 0)
                {
                    result.StatusCode = ErrorCodes.BadRequest;
                    result.StatusMessage = ErrorMessages.ProductLogoFileRequired;
                    return Task.FromResult(result);
                }

                const long maxFileSize = 2 * 1024 * 1024;
                if (file.Length > maxFileSize)
                {
                    result.StatusCode = ErrorCodes.BadRequest;
                    result.StatusMessage = ErrorMessages.ProductLogoFileTooLarge;
                    return Task.FromResult(result);
                }

                var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
                var allowedExtensions = new[] { ".jpg", ".jpeg", ".png" };
                if (!allowedExtensions.Contains(extension))
                {
                    result.StatusCode = ErrorCodes.BadRequest;
                    result.StatusMessage = ErrorMessages.ProductLogoInvalidType;
                    return Task.FromResult(result);
                }

                string uniquePrefix = $"productrequest_{Guid.NewGuid().ToString("N")[..8]}";
                string savedPath = SaveProductLogoFile(file, GetProductLogoRelativePath(), uniquePrefix);
                result.ResultData = Path.GetFileName(savedPath);
            }
            catch (Exception ex)
            {
                AppLogger.LogError(logger, ex, SerilogErrorMessages.AcutisLogMessages.UploadProductLogoFailed);
                result.StatusCode = ErrorCodes.InternalServerError;
                result.StatusMessage = ErrorMessages.InternalServerError;
            }

            return Task.FromResult(result);
        }

        #endregion POST Methods

        #region Private Helper Methods

        /// <summary>
        /// Emails the requester once their product suggestion has been approved or rejected.
        /// </summary>
        /// <param name="productRequestId">Product request identifier.</param>
        /// <param name="approved">True for an approval email, false for a rejection email.</param>
        /// <param name="decisionRemarks">Optional reviewer remarks.</param>
        /// <param name="approvedProductId">The new [core].[Product].[ProductId] - only set when approved.</param>
        /// <param name="clientId">The [sec].[ApiClient].[ClientId] created for that product - only set when approved.</param>
        /// <param name="secretKey">The generated secret saved as that ApiClient's ClientSecret - only set when approved.</param>
        private async Task NotifyRequesterOfDecisionAsync(int productRequestId, bool approved, string? decisionRemarks, int? approvedProductId = null, string? clientId = null, string? secretKey = null)
        {
            string templateCode = approved ? ProductRequestApprovedTemplateCode : ProductRequestRejectedTemplateCode;
            try
            {
                var request = await repository.GetProductRequestByIdAsync(productRequestId);
                if (request == null || string.IsNullOrWhiteSpace(request.RequesterEmail))
                {
                    return;
                }

                var placeholders = new Dictionary<string, string>
                {
                    ["FirstName"] = FirstNameOf(request.RequesterName),
                    ["RequesterName"] = request.RequesterName,
                    ["ProductName"] = request.ProductName,
                    ["Remarks"] = string.IsNullOrWhiteSpace(decisionRemarks) ? "None provided" : decisionRemarks.Trim(),
                    ["ProductId"] = approvedProductId?.ToString() ?? string.Empty,
                    ["ClientId"] = clientId ?? string.Empty,
                    ["SecurityKey"] = secretKey ?? string.Empty,
                };

                var template = await emailTemplatesRepository.GetEmailTemplateByCodeAsync(templateCode);
                string fallbackSubject = approved ? $"Your product suggestion was approved: {request.ProductName}" : $"Your product suggestion was not approved: {request.ProductName}";
                string fallbackBody = approved
                    ? "<p>Hi [FirstName],</p><p>Good news - your suggested product, [ProductName], has been approved and added to the platform.</p><p><strong>Client ID:</strong> [ClientId]</p><p><strong>Security Key:</strong> [SecurityKey]</p><p>Keep this security key confidential - use it with your Client ID for API access.</p>"
                    : "<p>Hi [FirstName],</p><p>Thanks for suggesting [ProductName]. After review, we won't be adding it at this time.</p><p><strong>Notes:</strong> [Remarks]</p>";
                string subject = template?.Subject ?? fallbackSubject;
                string body = template?.Body ?? fallbackBody;
                string mergedSubject = SMTPMailService.FormatMailContent(subject, placeholders);
                string mergedBody = SMTPMailService.FormatMailContent(body, placeholders);
                bool sent = await mailService.SendMailAsync(mergedSubject, mergedBody, request.RequesterEmail);
                if (!sent)
                {
                    AppLogger.LogWarning(logger, null, SerilogErrorMessages.AcutisLogMessages.ProductRequestEmailNotSent, templateCode, productRequestId);
                }
            }
            catch (Exception ex)
            {
                AppLogger.LogError(logger, ex, SerilogErrorMessages.AcutisLogMessages.SendProductRequestEmailFailed, templateCode, productRequestId);
            }
        }

        /// <summary>
        /// Generates the ClientSecret saved into [sec].[ApiClient] for a newly-approved product: 32
        /// cryptographically random bytes, Base64-encoded (44 characters, fits [ClientSecret]
        /// NVARCHAR(200) with room to spare).
        /// </summary>
        private static string GenerateSecretKey()
        {
            byte[] keyBytes = RandomNumberGenerator.GetBytes(32);
            return Convert.ToBase64String(keyBytes);
        }

        /// <summary>
        /// Returns the first token of a full name, or a generic greeting when the name is empty.
        /// </summary>
        private static string FirstNameOf(string? fullName)
        {
            if (string.IsNullOrWhiteSpace(fullName))
            {
                return "there";
            }

            string trimmed = fullName.Trim();
            int space = trimmed.IndexOf(' ');
            return space < 0 ? trimmed : trimmed[..space];
        }

        /// <summary>
        /// Same portable base-path pattern as ProductsService.GetProductDocBasePath - always
        /// resolves relative to this running app's own wwwroot, which exists on every machine by
        /// definition, instead of trusting the per-developer ApplicationFilePath:Doc_BasePath value.
        /// </summary>
        private string GetProductDocBasePath()
        {
            return !string.IsNullOrWhiteSpace(environment.WebRootPath)
                ? environment.WebRootPath
                : Path.Combine(environment.ContentRootPath, "wwwroot");
        }

        private string SaveProductLogoFile(IFormFile file, string relativeDirectory, string uniquePrefix)
        {
            string basePath = Path.Combine(GetProductDocBasePath(), relativeDirectory);
            if (!Directory.Exists(basePath))
            {
                _ = Directory.CreateDirectory(basePath);
            }

            string fileExtension = Path.GetExtension(file.FileName);
            string uniqueFileName = $"{uniquePrefix}_{DateTime.Now:ddMMyyyy}{fileExtension}";
            string fullPath = Path.Combine(basePath, uniqueFileName);

            using (var fileStream = new FileStream(fullPath, FileMode.Create))
            {
                file.CopyTo(fileStream);
            }

            return fullPath;
        }

        /// <summary>Same folder [core].[Product].[LogoName] is served from - see ProductsService.</summary>
        private static string GetProductLogoRelativePath() => Path.Combine("Acutis", "Attachment", "Products");

        #endregion Private Helper Methods
    }
}
