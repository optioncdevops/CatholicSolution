// Copyright (c) OptionC. All rights reserved.

namespace CFR.PortalService.Service.Administration
{
    /// <summary>
    /// Implements Access Request business logic for list, get, save, and status updates.
    /// Repository Responsibility:
    /// - Invokes IAccessRequestRepository for stored procedure execution.
    /// - Invokes IEmailTemplatesRepository and ISMTPMailService to send admin/requester emails from configurable templates.
    /// </summary>
    public class AccessRequestService(IAccessRequestRepository repository, IEmailTemplatesRepository emailTemplatesRepository, ISMTPMailService mailService, IConfiguration configuration, ILogger<AccessRequestService> logger): IAccessRequestService
    {
        private const string AccessRequestedTemplateCode = "AccessRequested";

        /// <summary>
        /// Built-in AccessRequested subject - deliberately different from the Send to Vendor email's
        /// "New customer request for ..." so the two are easy to tell apart in an inbox.
        /// </summary>
        private const string AccessRequestedFallbackSubject = "Review needed: [AppName] access request from [OrganizationName]";

        /// <summary>
        /// Built-in AccessRequested body (used when no saved template exists) - sent to the product
        /// support user with the requester on CC. Same text as the seed in 006_Acutis_EmailTemplates.sql.
        /// </summary>
        private const string AccessRequestedFallbackBody =
            "<p>Hello [SupportUserName],</p>"
            + "<p>A new access request for <strong>[AppName]</strong> has come through Catholic Solutions, and you have been requested for this product. "
            + "Please review the request; the requester's details are below.</p>"
            + "<p><strong>Request details</strong><br/>"
            + "Organization: [OrganizationName]<br/>"
            + "Address: [OrganizationAddress]<br/>"
            + "Contact name: [RequesterName]<br/>"
            + "Contact email: [RequesterEmail]<br/>"
            + "Contact phone: [Phone]<br/>"
            + "Submitted: [SubmittedDate]<br/>"
            + "Goals &amp; context: [AdditionalInfo]</p>"
            + "<p><a href=\"[ReviewLink]\">Review this request</a></p>";

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
        /// Validation Details: Input DTO is required. Member saves need a product and requester email. Public portal saves also need name, organization, diocese, and address fields.
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
                        || input.DioceseId is null or <= 0
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

                // Public Request Access only: the email already belongs to a Catholic Solutions (CFR)
                // user - for this same organization (-91) or a different one (-92).
                if (savedId == -91)
                {
                    result.StatusCode = ErrorCodes.Conflict;
                    result.StatusMessage = ErrorMessages.AccessRequestEmailOrganizationExists;
                    return result;
                }

                if (savedId == -92)
                {
                    result.StatusCode = ErrorCodes.Conflict;
                    result.StatusMessage = ErrorMessages.AccessRequestEmailAlreadyCfrUser;
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

                // The SMS org-setup call happens when the request is approved, not here at submission -
                // see AccessRequestService.UpdateAccessRequestStatusAsync in CFR.Acutis.
                result.ResultData = savedId;
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

                var supportUsers = await GetProductRecipientsAsync(productId, productName);
                var recipients = supportUsers.Select(recipient => recipient.EMail).ToList();
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
                placeholders["AdditionalInfo"] = ValueOrDash(request.Comments.FirstOrDefault()?.Comment);
                placeholders["SendToEmail"] = sendToEmail ?? "Default Admins";
                // "Hello Sal Palomares," - the product support user(s) this email is addressed to;
                // "Hello there," when none of them has a name recorded.
                string supportUserNames = string.Join(", ", supportUsers
                    .Select(recipient => recipient.FullName?.Trim())
                    .Where(name => !string.IsNullOrWhiteSpace(name))
                    .Distinct(StringComparer.OrdinalIgnoreCase));
                placeholders["SupportUserName"] = string.IsNullOrWhiteSpace(supportUserNames) ? "there" : supportUserNames;

                // The requester is CC'd so they get a copy of what was sent to the product support user
                // (skipped when they're already one of the recipients).
                string ccAddress = !string.IsNullOrWhiteSpace(request.RequesterEmail)
                    && !recipients.Contains(request.RequesterEmail.Trim(), StringComparer.OrdinalIgnoreCase)
                        ? request.RequesterEmail.Trim()
                        : string.Empty;

                await SendTemplatedEmailAsync(
                    AccessRequestedTemplateCode,
                    accessRequestId,
                    string.Join(';', recipients.Distinct(StringComparer.OrdinalIgnoreCase)),
                    placeholders,
                    AccessRequestedFallbackSubject,
                    AccessRequestedFallbackBody,
                    ccAddress);
            }
            catch (Exception ex)
            {
                AppLogger.LogError(logger, ex, SerilogErrorMessages.PortalLogMessages.SendAccessRequestEmailFailed, AccessRequestedTemplateCode, accessRequestId);
            }
        }

        /// <summary>
        /// Loads the named template (or a built-in fallback), merges placeholders, and sends the message using ISMTPMailService.
        /// </summary>
        private async Task SendTemplatedEmailAsync(string templateCode, int accessRequestId, string toAddress, Dictionary<string, string> placeholders, string fallbackSubject, string fallbackBody, string ccAddress = "")
        {
            try
            {
                var template = await emailTemplatesRepository.GetEmailTemplateByCodeAsync(templateCode);
                placeholders["AccentColor"] = string.IsNullOrWhiteSpace(template?.AccentColor) ? "#1d4ed8" : template.AccentColor;
                string subject = template?.Subject ?? fallbackSubject;
                string body = template?.Body ?? fallbackBody;
                string mergedSubject = SMTPMailService.FormatMailContent(subject, placeholders);
                string mergedBody = SMTPMailService.FormatMailContent(body, placeholders);
                await mailService.SendMailAsync(mergedSubject, mergedBody, toAddress, ccAddress);
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
            string stateZip = string.Join(" ", new[] { request.State, request.Zip }.Where(part => !string.IsNullOrWhiteSpace(part)).Select(part => part!.Trim()));
            string organizationAddress = string.Join(", ", new[] { request.Address, request.City, stateZip }.Where(part => !string.IsNullOrWhiteSpace(part)).Select(part => part!.Trim()));
            string submittedDate = DateTime.TryParse(request.SubmittedAt, out var submittedAt) ? submittedAt.ToString("MMM d, yyyy") : string.Empty;
            return new Dictionary<string, string>
            {
                ["FirstName"] = FirstNameOf(request.RequesterName),
                ["RequesterName"] = request.RequesterName ?? string.Empty,
                ["RequesterEmail"] = request.RequesterEmail ?? string.Empty,
                ["OrganizationName"] = request.OrganizationName ?? string.Empty,
                ["OrganizationType"] = ValueOrDash(request.OrganizationType),
                ["OrganizationAddress"] = ValueOrDash(organizationAddress),
                ["Phone"] = ValueOrDash(request.Phone),
                ["SubmittedDate"] = ValueOrDash(submittedDate),
                ["AppName"] = request.ProductName ?? string.Empty,
                ["ReviewLink"] = reviewLink,
            };
        }

        /// <summary>
        /// Returns the users matched to the requested product name/id (the product support user first -
        /// see [request].[AccessRequestManage] ActionId 5), with their names for the greeting.
        /// </summary>
        private async Task<List<AccessRequestRecipientOutput>> GetProductRecipientsAsync(string productId, string productName)
        {
            var recipients = await repository.GetProductNotificationRecipientsAsync(productId, productName);
            return (recipients ?? [])
                .Where(recipient => !string.IsNullOrWhiteSpace(recipient.EMail))
                .Select(recipient => new AccessRequestRecipientOutput { EMail = recipient.EMail.Trim(), FullName = recipient.FullName })
                .DistinctBy(recipient => recipient.EMail, StringComparer.OrdinalIgnoreCase)
                .ToList();
        }

        /// <summary>
        /// Returns the trimmed value, or an em dash when it is empty, so email detail rows never render blank.
        /// </summary>
        private static string ValueOrDash(string? value) => string.IsNullOrWhiteSpace(value) ? "—" : value.Trim();

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
