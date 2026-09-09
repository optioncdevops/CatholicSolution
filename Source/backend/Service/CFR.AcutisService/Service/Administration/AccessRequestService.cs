// Copyright (c) OptionC. All rights reserved.

namespace CFR.AcutisService.Service.Administration
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
        private const string AccessApprovedTemplateCode = "AccessApproved";
        private const string AccessInfoTemplateCode = "AccessInfo";

        private static readonly HashSet<string> AllowedResolveStatuses = new(StringComparer.OrdinalIgnoreCase)
        {
            "approved",
            "rejected",
            "info-requested"
        };

        #region GET Methods

        /// <summary>
        /// Retrieves all access requests.
        /// </summary>
        /// <remarks>
        /// Purpose: Fetch the access request inbox list.
        /// Request Flow: AccessRequestController -> AccessRequestService.GetAccessRequestsListAsync() -> IAccessRequestRepository.GetAccessRequestsListAsync().
        /// Validation Details: Service checks for an empty or null result set.
        /// Business Logic: Wraps the typed list in MSResultArgs.
        /// Repository Interaction: Calls IAccessRequestRepository.GetAccessRequestsListAsync().
        /// Response Details: MSResultArgs containing List of AccessRequestOutput.
        /// </remarks>
        /// <returns>MSResultArgs containing the access request list.</returns>
        public async Task<MSResultArgs> GetAccessRequestsListAsync()
        {
            var result = new MSResultArgs();
            try
            {
                var data = await repository.GetAccessRequestsListAsync();
                result.ResultData = data ?? [];
            }
            catch (Exception ex)
            {
                AppLogger.LogError(logger, ex, SerilogErrorMessages.PortalLogMessages.FetchAccessRequestsFailed);
                result.StatusCode = ErrorCodes.InternalServerError;
                result.StatusMessage = ErrorMessages.InternalServerError;
            }

            return result;
        }

        /// <summary>
        /// Retrieves one access request by identifier.
        /// </summary>
        /// <remarks>
        /// Purpose: Fetch a request for the review modal.
        /// Request Flow: AccessRequestController -> AccessRequestService.GetAccessRequestByIdAsync() -> IAccessRequestRepository.GetAccessRequestByIdAsync().
        /// Validation Details: Identifier must be a positive integer.
        /// Business Logic: Wraps the typed record in MSResultArgs.
        /// Repository Interaction: Calls IAccessRequestRepository.GetAccessRequestByIdAsync().
        /// Response Details: MSResultArgs containing AccessRequestOutput, or NoRecordFound.
        /// </remarks>
        /// <param name="accessRequestId">Access request identifier.</param>
        /// <returns>MSResultArgs containing the access request.</returns>
        public async Task<MSResultArgs> GetAccessRequestByIdAsync(int accessRequestId)
        {
            var result = new MSResultArgs();
            try
            {
                if (accessRequestId <= 0)
                {
                    result.StatusCode = ErrorCodes.BadRequest;
                    result.StatusMessage = ErrorMessages.BadRequest;
                    return result;
                }

                var data = await repository.GetAccessRequestByIdAsync(accessRequestId);
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
                AppLogger.LogError(logger, ex, SerilogErrorMessages.PortalLogMessages.FetchAccessRequestByIdFailed, accessRequestId);
                result.StatusCode = ErrorCodes.InternalServerError;
                result.StatusMessage = ErrorMessages.InternalServerError;
            }

            return result;
        }



        #endregion GET Methods

        #region PUT Methods

        /// <summary>
        /// Updates an access request status.
        /// </summary>
        /// <remarks>
        /// Purpose: Approve, reject, or request more information, then email the requester from the matching template.
        /// Request Flow: AccessRequestController -> AccessRequestService.UpdateAccessRequestStatusAsync() -> IAccessRequestRepository.UpdateAccessRequestStatusAsync().
        /// Validation Details: Identifier must be a positive integer; status must be an allowed resolve value.
        /// Business Logic: Delegates the status update to the repository, then sends AccessApproved or AccessInfo to the requester. Mail failure does not fail the update.
        /// Repository Interaction: Calls IAccessRequestRepository.UpdateAccessRequestStatusAsync() and IEmailTemplatesRepository.GetEmailTemplateByCodeAsync().
        /// Response Details: MSResultArgs containing the access request identifier.
        /// </remarks>
        /// <param name="input">Status change payload.</param>
        /// <returns>MSResultArgs containing the update outcome.</returns>
        public async Task<MSResultArgs> UpdateAccessRequestStatusAsync(AccessRequestStatusInput input)
        {
            var result = new MSResultArgs();
            try
            {
                if (input == null || input.AccessRequestId <= 0 || string.IsNullOrWhiteSpace(input.Status) || !AllowedResolveStatuses.Contains(input.Status.Trim()))
                {
                    result.StatusCode = ErrorCodes.BadRequest;
                    result.StatusMessage = ErrorMessages.BadRequest;
                    return result;
                }

                int updatedId = await repository.UpdateAccessRequestStatusAsync(input);
                if (updatedId == -94)
                {
                    result.StatusCode = ErrorCodes.Conflict;
                    result.StatusMessage = ErrorMessages.AccessRequestAlreadyDecided;
                    return result;
                }

                if (updatedId <= 0)
                {
                    result.StatusCode = ErrorCodes.NoRecordFound;
                    result.StatusMessage = ErrorMessages.NoRecordFound;
                    return result;
                }

                result.ResultData = updatedId;
                await NotifyRequesterOfStatusAsync(updatedId, input.Status, input.Note);
            }
            catch (Exception ex)
            {
                AppLogger.LogError(logger, ex, SerilogErrorMessages.PortalLogMessages.UpdateAccessRequestStatusFailed, input?.AccessRequestId);
                result.StatusCode = ErrorCodes.InternalServerError;
                result.StatusMessage = ErrorMessages.InternalServerError;
            }

            return result;
        }

        #endregion PUT Methods

        #region Private Helper Methods



        /// <summary>
        /// Emails the requester when an admin approves the request or asks for more information.
        /// </summary>
        private async Task NotifyRequesterOfStatusAsync(int accessRequestId, string status, string? note)
        {
            try
            {
                string normalizedStatus = status.Trim().ToLowerInvariant();
                if (normalizedStatus is not ("approved" or "info-requested"))
                {
                    return;
                }

                var request = await repository.GetAccessRequestByIdAsync(accessRequestId);
                if (request == null || string.IsNullOrWhiteSpace(request.RequesterEmail))
                {
                    return;
                }

                var placeholders = BuildRequestPlaceholders(request, note);
                if (normalizedStatus == "approved")
                {
                    await SendTemplatedEmailAsync(
                        AccessApprovedTemplateCode,
                        accessRequestId,
                        request.RequesterEmail,
                        placeholders,
                        "Your application access request was approved",
                        "Hi [FirstName],\n\nYour request for access to [AppName] has been approved. You can now launch it from App Hub.");
                    return;
                }

                await SendTemplatedEmailAsync(
                    AccessInfoTemplateCode,
                    accessRequestId,
                    request.RequesterEmail,
                    placeholders,
                    "More information needed for your request",
                    "Hi [FirstName],\n\nWe need a bit more information to process your request for [AppName]:\n\n[Note]");
            }
            catch (Exception ex)
            {
                AppLogger.LogError(logger, ex, SerilogErrorMessages.PortalLogMessages.SendAccessRequestEmailFailed, status, accessRequestId);
            }
        }

        /// <summary>
        /// Loads the named template (or a built-in fallback), merges placeholders, and sends the message.
        /// </summary>
        private async Task SendTemplatedEmailAsync(string templateCode, int accessRequestId, string toAddress, Dictionary<string, string> placeholders, string fallbackSubject, string fallbackBody)
        {
            try
            {
                var template = await emailTemplatesRepository.GetEmailTemplateByCodeAsync(templateCode);
                placeholders["AccentColor"] = SMTPMailService.GetAccentColor();
                string subject = template?.Subject ?? fallbackSubject;
                string body = template?.Body ?? fallbackBody;
                string mergedSubject = SMTPMailService.FormatMailContent(subject, placeholders);
                string mergedBody = SMTPMailService.FormatMailContent(body, placeholders);
                _ = await mailService.SendMailAsync(mergedSubject, mergedBody, toAddress);
            }
            catch (Exception ex)
            {
                AppLogger.LogError(logger, ex, SerilogErrorMessages.PortalLogMessages.SendAccessRequestEmailFailed, templateCode, accessRequestId);
            }
        }

        /// <summary>
        /// Builds merge-tag values from the saved request row and optional reviewer note.
        /// </summary>
        private Dictionary<string, string> BuildRequestPlaceholders(AccessRequestOutput request, string? note)
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
                ["Note"] = string.IsNullOrWhiteSpace(note) ? "More information requested." : note.Trim(),
            };
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
