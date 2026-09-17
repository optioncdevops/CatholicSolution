// Copyright (c) OptionC. All rights reserved.

using System.Net.Http.Json;

namespace CFR.PortalService.Service.Administration
{
    /// <summary>
    /// Implements Access Request business logic for list, get, save, and status updates.
    /// Repository Responsibility:
    /// - Invokes IAccessRequestRepository for stored procedure execution.
    /// - Invokes IEmailTemplatesRepository and ISMTPMailService to send admin/requester emails from configurable templates.
    /// </summary>
    public class AccessRequestService(IAccessRequestRepository repository, IEmailTemplatesRepository emailTemplatesRepository, ISMTPMailService mailService, IConfiguration configuration, IHttpClientFactory httpClientFactory, ILogger<AccessRequestService> logger): IAccessRequestService
    {
        private const string AccessRequestedTemplateCode = "AccessRequested";
        private const string ExternalOrganizationApiHttpClientName = "ExternalOrganizationApi";

        /// <summary>
        /// Retrieves App Hub products for a member email.
        /// </summary>
        /// <remarks>
        /// Purpose: Return every core.Product with hubSection your / available / future from [auth].[UserProduct].
        /// Request Flow: AccessRequestController -> AccessRequestService.GetHubProductsAsync() -> IAccessRequestRepository.GetHubProductsAsync().
        /// Validation Details: Email is optional; a missing email returns products without a Your Apps assignment.
        /// Business Logic: Wraps the typed list in MSResultArgs.
        /// Repository Interaction: Calls IAccessRequestRepository.GetHubProductsAsync().
        /// Response Details: MSResultArgs containing List of HubProductOutput.
        /// </remarks>
        /// <param name="requesterEmail">Member email used to resolve [auth].[User].CFRUserId.</param>
        /// <returns>MSResultArgs containing the hub product list.</returns>
        public async Task<MSResultArgs> GetHubProductsAsync(string? requesterEmail)
        {
            var result = new MSResultArgs();
            try
            {
                var data = await repository.GetHubProductsAsync(requesterEmail);
                result.ResultData = data ?? [];
            }
            catch (Exception ex)
            {
                AppLogger.LogError(logger, ex, SerilogErrorMessages.PortalLogMessages.FetchHubProductsFailed, requesterEmail);
                result.StatusCode = ErrorCodes.InternalServerError;
                result.StatusMessage = ErrorMessages.InternalServerError;
            }

            return result;
        }

        /// <summary>
        /// Retrieves every non-deleted diocese for the Request Access page's Diocese dropdown.
        /// </summary>
        /// <remarks>
        /// Purpose: Populate the Diocese dropdown on the public Request Access page.
        /// Request Flow: AccessRequestController -> AccessRequestService.GetDiocesesListAsync() -> IAccessRequestRepository.GetDiocesesListAsync().
        /// Validation Details: None.
        /// Business Logic: Wraps the typed list in MSResultArgs.
        /// Repository Interaction: Calls IAccessRequestRepository.GetDiocesesListAsync().
        /// Response Details: MSResultArgs containing List of DioceseOutput.
        /// </remarks>
        /// <returns>MSResultArgs containing the diocese list.</returns>
        public async Task<MSResultArgs> GetDiocesesListAsync()
        {
            var result = new MSResultArgs();
            try
            {
                var data = await repository.GetDiocesesListAsync();
                result.ResultData = data ?? [];
            }
            catch (Exception ex)
            {
                AppLogger.LogError(logger, ex, SerilogErrorMessages.PortalLogMessages.FetchDiocesesFailed);
                result.StatusCode = ErrorCodes.InternalServerError;
                result.StatusMessage = ErrorMessages.InternalServerError;
            }

            return result;
        }

        #region POST Methods

        /// <summary>
        /// Creates an access request.
        /// </summary>
        /// <remarks>
        /// Purpose: Insert request, product, status history, and optional comment rows, then email admins.
        /// Request Flow: AccessRequestController -> AccessRequestService.SaveAccessRequestAsync() -> IAccessRequestRepository.SaveAccessRequestAsync().
        /// Validation Details: Input DTO is required. Member saves need a product and requester email. Public portal saves also need name, organization, and address fields.
        /// Business Logic: Delegates insert to the repository, maps duplicate results to Conflict, then sends the AccessRequested template to users matched to the product. Mail failure does not fail the save.
        /// Repository Interaction: Calls IAccessRequestRepository.SaveAccessRequestAsync(), IAccessRequestRepository.GetProductNotificationRecipientsAsync(), and IEmailTemplatesRepository.GetEmailTemplateByCodeAsync().
        /// Response Details: MSResultArgs containing the access request identifier, or Conflict.
        /// </remarks>
        /// <param name="input">Input DTO containing request fields.</param>
        /// <returns>MSResultArgs containing the save status.</returns>
        public async Task<MSResultArgs> SaveAccessRequestAsync(AccessRequestInput input)
        {
            var result = new MSResultArgs();
            try
            {
                if (input == null)
                {
                    result.StatusCode = ErrorCodes.BadRequest;
                    result.StatusMessage = ErrorMessages.BadRequest;
                    return result;
                }

                bool isPublicRequest = !string.IsNullOrWhiteSpace(input.OrganizationName);
                bool hasProduct = !string.IsNullOrWhiteSpace(input.ProductName)
                    || !string.IsNullOrWhiteSpace(input.ProductId)
                    || (input.Products != null && input.Products.Count > 0);

                if (!hasProduct)
                {
                    result.StatusCode = ErrorCodes.BadRequest;
                    result.StatusMessage = ErrorMessages.BadRequest;
                    return result;
                }

                if (isPublicRequest
                    && (string.IsNullOrWhiteSpace(input.FirstName)
                        || string.IsNullOrWhiteSpace(input.LastName)
                        || string.IsNullOrWhiteSpace(input.RequesterEmail)
                        || string.IsNullOrWhiteSpace(input.OrganizationType)
                        || string.IsNullOrWhiteSpace(input.Address)
                        || string.IsNullOrWhiteSpace(input.City)
                        || string.IsNullOrWhiteSpace(input.State)
                        || string.IsNullOrWhiteSpace(input.Zip)))
                {
                    result.StatusCode = ErrorCodes.BadRequest;
                    result.StatusMessage = ErrorMessages.BadRequest;
                    return result;
                }

                if (!isPublicRequest && string.IsNullOrWhiteSpace(input.RequesterEmail)
                    && string.IsNullOrWhiteSpace(input.ProductName) && string.IsNullOrWhiteSpace(input.ProductId))
                {
                    result.StatusCode = ErrorCodes.BadRequest;
                    result.StatusMessage = ErrorMessages.BadRequest;
                    return result;
                }

                int savedId = await repository.SaveAccessRequestAsync(input);
                if (savedId == -99)
                {
                    result.StatusCode = ErrorCodes.Conflict;
                    result.StatusMessage = ErrorMessages.ExistAccessRequest;
                    return result;
                }

                if (savedId == -98)
                {
                    result.StatusCode = ErrorCodes.BadRequest;
                    result.StatusMessage = ErrorMessages.AccessRequestMemberNotFound;
                    return result;
                }

                if (savedId == -97)
                {
                    result.StatusCode = ErrorCodes.BadRequest;
                    result.StatusMessage = ErrorMessages.AccessRequestProductNotFound;
                    return result;
                }

                if (savedId == -96)
                {
                    result.StatusCode = ErrorCodes.BadRequest;
                    result.StatusMessage = ErrorMessages.AccessRequestOrgNotFound;
                    return result;
                }

                if (savedId == -93)
                {
                    result.StatusCode = ErrorCodes.BadRequest;
                    result.StatusMessage = ErrorMessages.BadRequest;
                    return result;
                }

                if (savedId <= 0)
                {
                    result.StatusCode = ErrorCodes.Failed;
                    result.StatusMessage = ErrorMessages.SaveFailed;
                    return result;
                }

                result.ResultData = savedId;
                if (input.Products != null && input.Products.Count > 0)
                {
                    foreach (var product in input.Products)
                    {
                        await NotifyAdminsOfNewRequestAsync(savedId, input.SendToEmail, product.ProductId, product.ProductName);
                    }
                }
                else
                {
                    await NotifyAdminsOfNewRequestAsync(savedId, input.SendToEmail);
                }

                if (isPublicRequest)
                {
                    await SendExternalOrganizationRequestAsync(savedId, input);
                }
            }
            catch (Exception ex)
            {
                AppLogger.LogError(logger, ex, SerilogErrorMessages.PortalLogMessages.SaveAccessRequestFailed);
                result.StatusCode = ErrorCodes.InternalServerError;
                result.StatusMessage = ErrorMessages.InternalServerError;
            }

            return result;
        }

        #endregion POST Methods



        #region Private Helper Methods

        /// <summary>
        /// Sends the new organization/contact details to the external organization-registration API
        /// for a public Request Access submission. Never throws - a failure here must not fail the
        /// access request save itself, matching how NotifyAdminsOfNewRequestAsync's mail failures
        /// are handled. No-ops silently when ExternalOrganizationApiSettings:ApiUrl isn't configured.
        /// </summary>
        private async Task SendExternalOrganizationRequestAsync(int accessRequestId, AccessRequestInput input)
        {
            try
            {
                string? apiUrl = configuration["ExternalOrganizationApiSettings:ApiUrl"];
                if (string.IsNullOrWhiteSpace(apiUrl))
                {
                    return;
                }

                var payload = new ExternalOrganizationRequestPayload
                {
                    UserName = $"{input.FirstName} {input.LastName}".Trim(),
                    FirstName = input.FirstName ?? string.Empty,
                    LastName = input.LastName ?? string.Empty,
                    DioId = input.DioceseId?.ToString() ?? string.Empty,
                    OrganizationName = input.OrganizationName ?? string.Empty,
                    ContactNo = input.Phone ?? string.Empty,
                    EmailAddress = input.RequesterEmail ?? string.Empty,
                    Address = input.Address ?? string.Empty,
                    City = input.City ?? string.Empty,
                    State = input.State ?? string.Empty,
                    PostalCode = input.Zip ?? string.Empty,
                };

                var client = httpClientFactory.CreateClient(ExternalOrganizationApiHttpClientName);
                using var response = await client.PostAsJsonAsync(apiUrl, payload);
                if (!response.IsSuccessStatusCode)
                {
                    AppLogger.LogError(logger, null, SerilogErrorMessages.PortalLogMessages.ExternalOrganizationRequestFailed, accessRequestId);
                }
            }
            catch (Exception ex)
            {
                AppLogger.LogError(logger, ex, SerilogErrorMessages.PortalLogMessages.ExternalOrganizationRequestFailed, accessRequestId);
            }
        }

        /// <summary>
        /// Emails users matched to the requested product that a new access request needs review, using the AccessRequested template.
        /// </summary>
        private async Task NotifyAdminsOfNewRequestAsync(int accessRequestId, string? sendToEmail = null, string? overrideProductId = null, string? overrideProductName = null)
        {
            try
            {
                var request = await repository.GetAccessRequestByIdAsync(accessRequestId);
                if (request == null)
                {
                    return;
                }

                string productId = !string.IsNullOrWhiteSpace(overrideProductId) ? overrideProductId : request.ProductId;
                string productName = !string.IsNullOrWhiteSpace(overrideProductName) ? overrideProductName : request.ProductName;

                var recipients = await GetProductRecipientAddressesAsync(productId, productName);
                if (!string.IsNullOrWhiteSpace(sendToEmail))
                {
                    var parsedEmails = sendToEmail.Split(new[] { ';', ',' }, StringSplitOptions.RemoveEmptyEntries);
                    foreach (var parsedEmail in parsedEmails)
                    {
                        if (!string.IsNullOrWhiteSpace(parsedEmail))
                        {
                            recipients.Add(parsedEmail.Trim());
                        }
                    }
                }

                if (recipients.Count == 0)
                {
                    logger.LogWarning("No users matched product {ProductName} for AccessRequested email on request {AccessRequestId}.", request.ProductName, accessRequestId);
                    return;
                }

                var placeholders = BuildRequestPlaceholders(request);
                placeholders["AppName"] = productName;
                placeholders["AdditionalInfo"] = request.Comments.FirstOrDefault()?.Comment ?? "None provided";
                placeholders["SendToEmail"] = sendToEmail ?? "Default Admins";

                await SendTemplatedEmailAsync(
                    AccessRequestedTemplateCode,
                    accessRequestId,
                    string.Join(';', recipients.Distinct(StringComparer.OrdinalIgnoreCase)),
                    placeholders,
                    $"New access request for {productName}",
                    "<p>A member has requested access and needs an admin review.</p><p><strong>Requester:</strong> [RequesterName] ([RequesterEmail])</p><p><strong>Organization:</strong> [OrganizationName]</p><p><strong>Application:</strong> [AppName]</p><p><strong>Reason:</strong> [AdditionalInfo]</p><p><strong>Send To:</strong> [SendToEmail]</p><p><a href=\"[ReviewLink]\">Review this request</a></p>");
            }
            catch (Exception ex)
            {
                AppLogger.LogError(logger, ex, SerilogErrorMessages.PortalLogMessages.SendAccessRequestEmailFailed, AccessRequestedTemplateCode, accessRequestId);
            }
        }

        /// <summary>
        /// Loads the named template (or a built-in fallback), merges placeholders, and sends the message using ISMTPMailService.
        /// </summary>
        private async Task SendTemplatedEmailAsync(string templateCode, int accessRequestId, string toAddress, Dictionary<string, string> placeholders, string fallbackSubject, string fallbackBody)
        {
            try
            {
                var template = await emailTemplatesRepository.GetEmailTemplateByCodeAsync(templateCode);
                placeholders["AccentColor"] = string.IsNullOrWhiteSpace(template?.AccentColor) ? "#1d4ed8" : template.AccentColor;
                string subject = template?.Subject ?? fallbackSubject;
                string body = template?.Body ?? fallbackBody;
                string mergedSubject = SMTPMailService.FormatMailContent(subject, placeholders);
                string mergedBody = SMTPMailService.FormatMailContent(body, placeholders);
                await mailService.SendMailAsync(mergedSubject, mergedBody, toAddress);
            }
            catch (Exception ex)
            {
                AppLogger.LogError(logger, ex, SerilogErrorMessages.PortalLogMessages.SendAccessRequestEmailFailed, templateCode, accessRequestId);
            }
        }

        /// <summary>
        /// Builds merge-tag values from the saved request row.
        /// </summary>
        private Dictionary<string, string> BuildRequestPlaceholders(AccessRequestOutput request)
        {
            string baseUrl = (configuration["FrontendSetting:CfrAdminBaseUrl"] ?? string.Empty).TrimEnd('/');
            string reviewLink = string.IsNullOrWhiteSpace(baseUrl) ? string.Empty : $"{baseUrl}/admin/requests";
            return new Dictionary<string, string>
            {
                ["FirstName"] = FirstNameOf(request.RequesterName),
                ["RequesterName"] = request.RequesterName ?? string.Empty,
                ["RequesterEmail"] = request.RequesterEmail ?? string.Empty,
                ["OrganizationName"] = request.OrganizationName ?? string.Empty,
                ["AppName"] = request.ProductName ?? string.Empty,
                ["ReviewLink"] = reviewLink,
            };
        }

        /// <summary>
        /// Returns email addresses for users matched to the requested product name/id.
        /// </summary>
        private async Task<List<string>> GetProductRecipientAddressesAsync(string productId, string productName)
        {
            var recipients = await repository.GetProductNotificationRecipientsAsync(productId, productName);
            return (recipients ?? [])
                .Where(recipient => !string.IsNullOrWhiteSpace(recipient.EMail))
                .Select(recipient => recipient.EMail.Trim())
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .ToList();
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

        #endregion Private Helper Methods
    }
}
