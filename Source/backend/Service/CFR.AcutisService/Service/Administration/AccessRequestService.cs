// Copyright (c) OptionC. All rights reserved.

using System.Net.Http.Headers;
using System.Net.Http.Json;

namespace CFR.AcutisService.Service.Administration
{
    /// <summary>
    /// Implements Access Request business logic for list, get, save, and status updates.
    /// Repository Responsibility:
    /// - Invokes IAccessRequestRepository for stored procedure execution.
    /// - Invokes IEmailTemplatesRepository and ISMTPMailService to send admin/requester emails from configurable templates.
    /// </summary>
    public class AccessRequestService(IAccessRequestRepository repository, IEmailTemplatesRepository emailTemplatesRepository, ISMTPMailService mailService, IConfiguration configuration, IHttpClientFactory httpClientFactory, ICurrentUserService currentUserService, ILogger<AccessRequestService> logger): IAccessRequestService
    {
        private const string AccessRequestedTemplateCode = "AccessRequested";
        private const string AccessApprovedTemplateCode = "AccessApproved";
        private const string AccessInfoTemplateCode = "AccessInfo";
        private const string ExternalOrganizationApiHttpClientName = "ExternalOrganizationApi";

        /// <summary>
        /// core.Product.ProductName that routes SetupNewOrganizationAsync to SMS's Parish-specific
        /// endpoint (SetupNewParishOrganizationByCFR) instead of the generic SetupNewOrganizationByCFR.
        /// </summary>
        private const string ParishProductName = "Parish Hub";

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
        /// <param name="accessRequestProductId">Optional product line to scope the result to, when the request has more than one.</param>
        /// <returns>MSResultArgs containing the access request.</returns>
        public async Task<MSResultArgs> GetAccessRequestByIdAsync(int accessRequestId, int? accessRequestProductId = null)
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

                var data = await repository.GetAccessRequestByIdAsync(accessRequestId, accessRequestProductId);
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
        /// Business Logic: Statuses are Requested -> Sent to vendor -> Approved, or Rejected. On approve, the AccessApproved email (with the org/contact/product details) is sent first and the line only moves to sent-to-vendor once it has gone out - a mail failure returns 422 and leaves the request Requested. The final Approved status is set by CFR.DataSync when the vendor adds the user. Reject / request-info update first, then email (AccessInfo); their mail failure does not fail the update.
        /// Repository Interaction: Calls IAccessRequestRepository.GetAccessRequestByIdAsync(), IAccessRequestRepository.UpdateAccessRequestStatusAsync() and IEmailTemplatesRepository.GetEmailTemplateByCodeAsync().
        /// Response Details: MSResultArgs containing the access request identifier, product line, whether the email was sent, and the resulting status.
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

                // Status flow: Requested -> Sent to vendor -> Approved (or Rejected).
                // Approve click: the approval email (with the org/contact/product details) is sent to
                // the requester FIRST, and only once it has gone out is the line moved to
                // sent-to-vendor - if mail fails, nothing changes and the request stays Requested so
                // the admin can retry. The final Approved step is not done here: it happens in
                // CFR.DataSync ([dbo].[Sync_UserProductUpsert]) when the vendor adds the user to their
                // product and syncs that user back to CFR.
                bool isApproved = string.Equals(input.Status.Trim(), "approved", StringComparison.OrdinalIgnoreCase);
                bool emailSent = false;
                if (isApproved)
                {
                    var request = await repository.GetAccessRequestByIdAsync(input.AccessRequestId, input.AccessRequestProductId);
                    if (request == null)
                    {
                        result.StatusCode = ErrorCodes.NoRecordFound;
                        result.StatusMessage = ErrorMessages.NoRecordFound;
                        return result;
                    }

                    if (!string.Equals(request.Status, "pending", StringComparison.OrdinalIgnoreCase))
                    {
                        result.StatusCode = ErrorCodes.Conflict;
                        result.StatusMessage = ErrorMessages.AccessRequestAlreadyDecided;
                        return result;
                    }

                    emailSent = await NotifyRequesterOfStatusAsync(request, input.Status, input.Note);
                    if (!emailSent)
                    {
                        result.StatusCode = ErrorCodes.UnprocessableEntity;
                        result.StatusMessage = ErrorMessages.AccessRequestApprovalEmailFailed;
                        return result;
                    }
                }

                var updateResult = await repository.UpdateAccessRequestStatusAsync(input);
                int updatedId = updateResult.AccessRequestId;
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

                int? resolvedProductId = updateResult.AccessRequestProductId;
                if (!isApproved)
                {
                    var request = await repository.GetAccessRequestByIdAsync(updatedId, resolvedProductId);
                    emailSent = request != null && await NotifyRequesterOfStatusAsync(request, input.Status, input.Note);
                }

                // Gateway sync on approve is disabled - the vendor now provisions the organization/user
                // themselves after receiving the request, and pushes it back through CFR.DataSync.
                // OrgSetupResult? setupResult = isApproved && resolvedProductId is > 0
                //     ? await SetupNewOrganizationAsync(updatedId, resolvedProductId.Value)
                //     : null;
                //
                // // Only the SMS-returned OrgId is used - UserId is intentionally ignored (it's SMS's
                // // own admin-account id, not anything CFR persists anywhere).
                // if (setupResult is { OrgId: > 0, ErrMessage: null or "" })
                // {
                //     await PersistOrgSetupResultSafeAsync(updatedId, resolvedProductId!.Value, setupResult.OrgId.Value);
                // }

                result.ResultData = new
                {
                    accessRequestId = updatedId,
                    accessRequestProductId = resolvedProductId,
                    emailSent,
                    status = isApproved ? "sent-to-vendor" : string.Equals(input.Status.Trim(), "rejected", StringComparison.OrdinalIgnoreCase) ? "rejected" : "pending",
                };
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
        /// Performs the two-step SMS "org setup" handshake when a request is approved: exchange an
        /// encrypted handshake string for a short-lived bearer token, then call
        /// SetupNewOrganizationByCFR against OrgSetupSettings:BaseUrl (the generic OptionC SMS
        /// gateway), or, when the request's product is Parish Hub, SetupNewParishOrganizationByCFR
        /// against OrgSetupSettings:ParishBaseUrl (the OptionCParish gateway) - with that token to
        /// actually provision the organization/user. Never throws - a failure here must not fail
        /// the approval itself (matches NotifyRequesterOfStatusAsync's mail-failure handling).
        /// No-ops (returns null) when the applicable BaseUrl isn't configured.
        /// </summary>
        /// <returns>The { orgId, userId, errMessage } result from SetupNewOrganizationByCFR, or null if not attempted / not reachable.</returns>
        private async Task<OrgSetupResult?> SetupNewOrganizationAsync(int accessRequestId, int accessRequestProductId)
        {
            try
            {
                string? exchangeKey = configuration["OrgSetupSettings:ExchangeKey"];
                string? exchangeIV = configuration["OrgSetupSettings:ExchangeIV"];
                if (string.IsNullOrWhiteSpace(exchangeKey) || string.IsNullOrWhiteSpace(exchangeIV))
                {
                    return null;
                }

                var context = await repository.GetOrgSetupContextAsync(accessRequestId, accessRequestProductId);
                if (context == null)
                {
                    return null;
                }

                // Parish Hub requests provision through OptionCParish's own gateway/SMS service;
                // every other product goes through the generic OptionC SMS gateway. Determined here
                // (rather than only at the SetupNewParishOrganizationByCFR call site below) because
                // it also decides which gateway BaseUrl to dial.
                bool isParishProduct = string.Equals(context.ProductName?.Trim(), ParishProductName, StringComparison.OrdinalIgnoreCase);
                string? baseUrl = isParishProduct
                    ? configuration["OrgSetupSettings:ParishBaseUrl"]
                    : configuration["OrgSetupSettings:BaseUrl"];
                if (string.IsNullOrWhiteSpace(baseUrl))
                {
                    return null;
                }

                // OrgSetupSettings:BaseUrl / ParishBaseUrl point at OptionC.Gateway / OptionCParish.Gateway
                // respectively, both of which front their SMS service under a "/sms" route prefix
                // (see each gateway's sms-route/sms-cluster) - so "/sms" is added here, at the call
                // site, rather than baked into either BaseUrl.
                string trimmedBaseUrl = baseUrl.TrimEnd('/');
                string apiRoot = $"{trimmedBaseUrl}/sms";
                var client = httpClientFactory.CreateClient(ExternalOrganizationApiHttpClientName);

                // Step 1: GetSetupAccessToken (no auth) - exchange an encrypted handshake string for a bearer token.
                string encryptedValue = OrgSetupEncryptionHelper.EncryptValue("CFR", exchangeKey, exchangeIV);
                using var tokenResponse = await client.PostAsJsonAsync(
                    $"{apiRoot}/api/v1/CFR/GetSetupAccessToken",
                    new { encryptedValue });

                if (!tokenResponse.IsSuccessStatusCode)
                {
                    AppLogger.LogError(logger, null, SerilogErrorMessages.PortalLogMessages.ExternalOrganizationRequestFailed, accessRequestId);
                    return null;
                }

                // SMS wraps every response in OptionC.Common.ResultArgs (via ApiResultArgs) - the
                // actual Token/ExpiresInMinutes are nested under "resultData", not top-level.
                var tokenEnvelope = await tokenResponse.Content.ReadFromJsonAsync<SmsApiEnvelope<OrgSetupAccessTokenResponse>>();
                var tokenResult = tokenEnvelope?.ResultData;
                if (string.IsNullOrWhiteSpace(tokenResult?.Token))
                {
                    AppLogger.LogError(logger, null, SerilogErrorMessages.PortalLogMessages.ExternalOrganizationRequestFailed, accessRequestId);
                    return null;
                }

                // Step 2: SetupNewOrganizationByCFR (Bearer token) - actually provision the org/user.
                // This call happens BEFORE any [core].[Organization] row exists on CFR's side - that
                // row (and [lic].[OrganizationProduct]) is only created afterward, in
                // AccessRequestRepository.PersistOrgSetupResultAsync, and only once SMS confirms
                // success (see UpdateAccessRequestStatusAsync). OrganizationName/Address/City/State/
                // Zip come straight from request.AccessRequest (staged there at submission time -
                // see ActionId 7 in 008_AccessRequest.sql). DioId comes from
                // request.AccessRequest.DioceseId, set at submission time via a follow-up UPDATE in
                // AccessRequestRepository.SaveAccessRequestAsync (CFR.Portal) - SMS requires DioId
                // to be non-blank (OptionC.SMSService.Service.CFR.CFRService.SetupNewOrganizationByCFRAsync).
                var payload = new ExternalOrganizationRequestPayload
                {
                    UserName = $"{context.FirstName} {context.LastName}".Trim(),
                    FirstName = context.FirstName ?? string.Empty,
                    LastName = context.LastName ?? string.Empty,
                    DioId = context.DioceseId?.ToString() ?? string.Empty,
                    OrganizationName = context.OrganizationName ?? string.Empty,
                    ContactNo = context.Phone ?? string.Empty,
                    EmailAddress = context.Email ?? string.Empty,
                    Address = context.Address ?? string.Empty,
                    City = context.City ?? string.Empty,
                    State = context.State ?? string.Empty,
                    PostalCode = context.Zip ?? string.Empty,
                    // Neither CfrOrgID nor CfrUserID has a real CFR-side identity to send yet at this
                    // point (no core.Organization row exists, and auth.User is a separate migration
                    // process) - SMS's SetupNewOrganizationByCFR requires both to be > 0 but doesn't
                    // otherwise consume them (they aren't referenced in dbo.SetupNewOrganizationByCFR's
                    // body), so these are placeholders that only satisfy that validation gate: the
                    // AccessRequestId (always > 0, traceable) for CfrOrgID, and the approving staff
                    // member's own id for CfrUserID. Revisit this if SMS ever starts using either
                    // value for something real, since neither claims to be the true CFR org/requester.
                    CfrOrgID = accessRequestId,
                    CfrUserID = context.CFRUserId is > 0 ? context.CFRUserId.Value : (int)currentUserService.UserId,
                };

                // Mirrors SMS's own required-field check (OptionC.SMSService.Service.CFR.CFRService.
                // SetupNewOrganizationByCFRAsync) so a missing field is reported clearly here instead
                // of as an opaque 400 from SMS - CfrOrgID/CfrUserID are always > 0 (placeholders, see
                // above), so in practice only DioId/OrganizationName/FirstName/LastName trip this,
                // most often DioId when request.AccessRequest.DioceseId was never set on this request.
                var missingFields = new List<string>();
                if (string.IsNullOrWhiteSpace(payload.UserName)) missingFields.Add(nameof(payload.UserName));
                if (string.IsNullOrWhiteSpace(payload.FirstName)) missingFields.Add(nameof(payload.FirstName));
                if (string.IsNullOrWhiteSpace(payload.LastName)) missingFields.Add(nameof(payload.LastName));
                if (string.IsNullOrWhiteSpace(payload.DioId)) missingFields.Add(nameof(payload.DioId));
                if (string.IsNullOrWhiteSpace(payload.OrganizationName)) missingFields.Add(nameof(payload.OrganizationName));
                if (payload.CfrOrgID <= 0) missingFields.Add(nameof(payload.CfrOrgID));
                if (payload.CfrUserID <= 0) missingFields.Add(nameof(payload.CfrUserID));

                if (missingFields.Count > 0)
                {
                    string joinedMissingFields = string.Join(", ", missingFields);
                    AppLogger.LogWarning(logger, null, SerilogErrorMessages.PortalLogMessages.ExternalOrganizationRequestMissingFields, accessRequestId, joinedMissingFields);
                    return new OrgSetupResult { ErrMessage = $"Missing required fields for SMS setup: {joinedMissingFields}" };
                }

                // Parish Hub requests provision through SMS's dedicated Parish endpoint instead of
                // the generic one - same request/response shape, different route (isParishProduct
                // computed above, since it also picks which gateway BaseUrl to dial).
                string setupAction = isParishProduct ? "SetupNewParishOrganizationByCFR" : "SetupNewOrganizationByCFR";

                using var request = new HttpRequestMessage(HttpMethod.Post, $"{apiRoot}/api/v1/CFR/{setupAction}")
                {
                    Content = JsonContent.Create(payload)
                };
                request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", tokenResult.Token);

                using var setupResponse = await client.SendAsync(request);
                if (!setupResponse.IsSuccessStatusCode)
                {
                    string responseBody = await setupResponse.Content.ReadAsStringAsync();
                    AppLogger.LogError(logger, null, SerilogErrorMessages.PortalLogMessages.ExternalOrganizationRequestRejected, accessRequestId, responseBody);
                    return new OrgSetupResult { ErrMessage = $"SMS rejected the setup request ({(int)setupResponse.StatusCode})." };
                }

                // Same envelope shape as GetSetupAccessToken - OrgId/UserId/ErrMessage are under "resultData".
                var setupEnvelope = await setupResponse.Content.ReadFromJsonAsync<SmsApiEnvelope<OrgSetupResult>>();
                return setupEnvelope?.ResultData;
            }
            catch (Exception ex)
            {
                AppLogger.LogError(logger, ex, SerilogErrorMessages.PortalLogMessages.ExternalOrganizationRequestFailed, accessRequestId);
                return null;
            }
        }

        /// <summary>
        /// Writes SMS's returned OrgId back into CFR's own license rows (creating
        /// [core].[Organization] and [lic].[OrganizationProduct] for the first time if needed).
        /// Never throws - matches SetupNewOrganizationAsync/NotifyRequesterOfStatusAsync's failure
        /// handling, so a persist error here must not fail the approval itself (it already
        /// succeeded in [request].[AccessRequest] and in SMS by this point).
        /// </summary>
        private async Task PersistOrgSetupResultSafeAsync(int accessRequestId, int accessRequestProductId, int orgId)
        {
            try
            {
                await repository.PersistOrgSetupResultAsync(accessRequestId, accessRequestProductId, orgId);
            }
            catch (Exception ex)
            {
                AppLogger.LogError(logger, ex, SerilogErrorMessages.PortalLogMessages.OrgSetupResultPersistFailed, orgId, accessRequestId);
            }
        }

        /// <summary>
        /// Emails the requester when an admin approves the request or asks for more information.
        /// The approval email carries the organization / contact / product details from the request.
        /// </summary>
        /// <returns>True when an email was actually sent.</returns>
        private async Task<bool> NotifyRequesterOfStatusAsync(AccessRequestOutput request, string status, string? note)
        {
            int accessRequestId = request.AccessRequestId;
            try
            {
                string normalizedStatus = status.Trim().ToLowerInvariant();
                if (normalizedStatus is not ("approved" or "info-requested") || string.IsNullOrWhiteSpace(request.RequesterEmail))
                {
                    return false;
                }

                var placeholders = BuildRequestPlaceholders(request, note);
                if (normalizedStatus == "approved")
                {
                    return await SendTemplatedEmailAsync(
                        AccessApprovedTemplateCode,
                        accessRequestId,
                        request.RequesterEmail,
                        placeholders,
                        "Your request for [AppName] has been approved",
                        "<p>Hi [FirstName],</p>"
                        + "<p>Your request for <strong>[AppName]</strong> has been approved. The request has been sent to the product vendor, who will contact you to complete your setup.</p>"
                        + "<p><strong>Request details</strong><br/>"
                        + "Organization: [OrganizationName]<br/>"
                        + "Organization type: [OrganizationType]<br/>"
                        + "Address: [OrganizationAddress]<br/>"
                        + "Contact: [RequesterName]<br/>"
                        + "Email: [RequesterEmail]<br/>"
                        + "Phone: [Phone]<br/>"
                        + "Application: [AppName]<br/>"
                        + "Submitted: [SubmittedDate]</p>");
                }

                return await SendTemplatedEmailAsync(
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
                return false;
            }
        }

        /// <summary>
        /// Loads the named template (or a built-in fallback), merges placeholders, and sends the message.
        /// </summary>
        /// <returns>True when the mail service reported the message as sent.</returns>
        private async Task<bool> SendTemplatedEmailAsync(string templateCode, int accessRequestId, string toAddress, Dictionary<string, string> placeholders, string fallbackSubject, string fallbackBody)
        {
            try
            {
                var template = await emailTemplatesRepository.GetEmailTemplateByCodeAsync(templateCode);
                placeholders["AccentColor"] = SMTPMailService.GetAccentColor();
                string subject = template?.Subject ?? fallbackSubject;
                string body = template?.Body ?? fallbackBody;
                string mergedSubject = SMTPMailService.FormatMailContent(subject, placeholders);
                string mergedBody = SMTPMailService.FormatMailContent(body, placeholders);
                return await mailService.SendMailAsync(mergedSubject, mergedBody, toAddress);
            }
            catch (Exception ex)
            {
                AppLogger.LogError(logger, ex, SerilogErrorMessages.PortalLogMessages.SendAccessRequestEmailFailed, templateCode, accessRequestId);
                return false;
            }
        }

        /// <summary>
        /// Builds merge-tag values from the saved request row and optional reviewer note.
        /// </summary>
        private Dictionary<string, string> BuildRequestPlaceholders(AccessRequestOutput request, string? note)
        {
            string baseUrl = (configuration["FrontendSetting:CfrAdminBaseUrl"] ?? string.Empty).TrimEnd('/');
            string reviewLink = string.IsNullOrWhiteSpace(baseUrl) ? string.Empty : $"{baseUrl}/admin/requests";
            string cityStateZip = string.Join(" ", new[] { request.State, request.Zip }.Where(part => !string.IsNullOrWhiteSpace(part)).Select(part => part!.Trim()));
            string organizationAddress = string.Join(", ", new[] { request.Address, request.City, cityStateZip }.Where(part => !string.IsNullOrWhiteSpace(part)).Select(part => part!.Trim()));
            string submittedDate = DateTime.TryParse(request.SubmittedAt, out var submittedAt) ? submittedAt.ToString("MMM d, yyyy") : string.Empty;
            return new Dictionary<string, string>
            {
                ["FirstName"] = FirstNameOf(request.RequesterName),
                ["RequesterName"] = request.RequesterName ?? string.Empty,
                ["RequesterEmail"] = request.RequesterEmail ?? string.Empty,
                ["OrganizationName"] = request.OrganizationName ?? string.Empty,
                ["OrganizationType"] = ValueOrDash(request.OrganizationType),
                ["OrganizationAddress"] = ValueOrDash(organizationAddress),
                ["Address"] = ValueOrDash(request.Address),
                ["City"] = ValueOrDash(request.City),
                ["State"] = ValueOrDash(request.State),
                ["Zip"] = ValueOrDash(request.Zip),
                ["Phone"] = ValueOrDash(request.Phone),
                ["SubmittedDate"] = ValueOrDash(submittedDate),
                ["AppName"] = request.ProductName ?? string.Empty,
                ["ReviewLink"] = reviewLink,
                ["Note"] = string.IsNullOrWhiteSpace(note) ? "More information requested." : note.Trim(),
            };
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
