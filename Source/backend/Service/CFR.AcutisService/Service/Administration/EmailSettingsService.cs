// Copyright (c) OptionC. All rights reserved.

using CFR.CommonService.MailService;

namespace CFR.AcutisService.Service.Administration
{
    /// <summary>
    /// Implements Email Settings business logic for reading and updating the platform-wide,
    /// file-backed email configuration (SMTP + branding).
    /// Repository Responsibility:
    /// - Invokes IConfSettingsService to read/write _configurationSettings.json — no database access.
    /// </summary>
    public class EmailSettingsService(
        IConfSettingsService confSettingsService,
        IFileHandlerService fileHandler,
        IProductRequestRepository productRequestRepository,
        ICurrentUserService currentUserService,
        ISMTPMailService smtpMailService,
        ILogger<EmailSettingsService> logger): IEmailSettingsService
    {
        private static string GetEmailLogoRelativePath() => Path.Combine("Acutis", "Attachment", "EmailSettings");

        private static EmailSettingsOutput BuildOutput(SMTPMailConfig? smtp, long? productRequestNotifyUserId) => new()
        {
            SendMailEnabled = smtp?.SendMailFlag == "1",
            SmtpServer = smtp?.SMTPServer ?? string.Empty,
            SmtpPort = int.TryParse(smtp?.SMTPPort, out int port) ? port : 0,
            DisplayName = smtp?.DisplayName ?? string.Empty,
            Username = smtp?.MUserName ?? string.Empty,
            HasPassword = !string.IsNullOrWhiteSpace(smtp?.MPassword),
            IsSslEnabled = smtp?.IsSSLEnabled == "1",
            CcMailId = smtp?.CCMailId,
            ContactUsMailId = smtp?.ContactUsMailId,
            AccentColor = smtp?.AccentColor,
            FontFamily = smtp?.FontFamily,
            BaseFontSize = smtp?.BaseFontSize,
            LogoFileName = string.IsNullOrWhiteSpace(smtp?.LogoUrl) || string.Equals(smtp.LogoUrl, "none", StringComparison.OrdinalIgnoreCase) ? null : smtp.LogoUrl,
            LogoImageUrl = SMTPMailService.GetLogoImageUrl(smtp),
            ApiBaseUrl = smtp?.ApiBaseUrl,
            LastUpdatedByName = smtp?.LastUpdatedByName,
            LastUpdatedDate = smtp?.LastUpdatedDate,
            ProductRequestNotifyUserId = productRequestNotifyUserId,
        };

        #region GET Methods

        /// <summary>
        /// Retrieves the current platform-wide email configuration.
        /// </summary>
        /// <remarks>
        /// Purpose: Fetch SMTP and branding settings for the admin editor.
        /// Request Flow: EmailSettingsController -> EmailSettingsService.GetEmailSettingsAsync() -> IConfSettingsService.LoadData().
        /// Validation Details: None.
        /// Business Logic: Maps SMTPMailConfig to EmailSettingsOutput; the stored password is masked to a boolean flag.
        /// Repository Interaction: None — reads _configurationSettings.json via IConfSettingsService.
        /// Response Details: MSResultArgs containing EmailSettingsOutput.
        /// </remarks>
        /// <returns>MSResultArgs containing the email settings.</returns>
        public async Task<MSResultArgs> GetEmailSettingsAsync()
        {
            var result = new MSResultArgs();
            try
            {
                var settings = confSettingsService.LoadData();
                long? productRequestNotifyUserId = await productRequestRepository.GetProductRequestNotifyUserIdAsync();
                result.ResultData = BuildOutput(settings?.SMTPMailConfig, productRequestNotifyUserId);
            }
            catch (Exception ex)
            {
                AppLogger.LogError(logger, ex, SerilogErrorMessages.AcutisLogMessages.FetchEmailSettingsFailed);
                result.StatusCode = ErrorCodes.InternalServerError;
                result.StatusMessage = ErrorMessages.InternalServerError;
            }

            return result;
        }

        /// <summary>
        /// Retrieves the uploaded platform email logo image bytes.
        /// </summary>
        /// <remarks>
        /// Purpose: Stream the uploaded logo so it can be embedded in outgoing emails and previewed in the admin UI.
        /// Request Flow: EmailSettingsController -> EmailSettingsService.GetEmailLogoAsync() -> IFileHandlerService.GetFile().
        /// Validation Details: fileName must be a jpg/jpeg/png name with no directory segments.
        /// Business Logic: Reads bytes via IFileHandlerService from the email logo storage folder.
        /// Repository Interaction: None (file storage only).
        /// Response Details: MSResultArgs containing the image byte array, or NoRecordFound.
        /// </remarks>
        /// <param name="fileName">Stored logo file name.</param>
        /// <returns>MSResultArgs containing the image bytes.</returns>
        public Task<MSResultArgs> GetEmailLogoAsync(string fileName)
        {
            var result = new MSResultArgs();
            try
            {
                string safeName = Path.GetFileName(fileName ?? string.Empty);
                string extension = Path.GetExtension(safeName).ToLowerInvariant();
                if (string.IsNullOrWhiteSpace(safeName) || extension is not (".jpg" or ".jpeg" or ".png"))
                {
                    result.StatusCode = ErrorCodes.BadRequest;
                    result.StatusMessage = ErrorMessages.BadRequest;
                    return Task.FromResult(result);
                }

                byte[]? fileBytes = fileHandler.GetFile(GetEmailLogoRelativePath(), safeName);
                if (fileBytes == null || fileBytes.Length == 0)
                {
                    result.StatusCode = ErrorCodes.NoRecordFound;
                    result.StatusMessage = ErrorMessages.NoRecordFound;
                    return Task.FromResult(result);
                }

                result.ResultData = fileBytes;
            }
            catch (Exception ex)
            {
                AppLogger.LogError(logger, ex, SerilogErrorMessages.AcutisLogMessages.FetchEmailLogoFailed);
                result.StatusCode = ErrorCodes.InternalServerError;
                result.StatusMessage = ErrorMessages.InternalServerError;
            }

            return Task.FromResult(result);
        }

        #endregion GET Methods

        #region POST Methods

        /// <summary>
        /// Updates the platform-wide email configuration.
        /// </summary>
        /// <remarks>
        /// Purpose: Persist SMTP and branding settings edited by an admin.
        /// Request Flow: EmailSettingsController -> EmailSettingsService.SaveEmailSettingsAsync() -> IConfSettingsService.SaveData().
        /// Validation Details: Input DTO, SMTP server, and username are required.
        /// Business Logic: Merges the input onto the currently loaded settings, only overwriting the password when a non-blank value is supplied, then writes the file.
        /// Repository Interaction: None — writes _configurationSettings.json via IConfSettingsService.
        /// Response Details: MSResultArgs indicating success, or BadRequest.
        /// </remarks>
        /// <param name="input">Input DTO containing the email settings fields.</param>
        /// <returns>MSResultArgs containing the save status.</returns>
        public Task<MSResultArgs> SaveEmailSettingsAsync(EmailSettingsInput input)
        {
            var result = new MSResultArgs();
            try
            {
                if (input == null || string.IsNullOrWhiteSpace(input.SmtpServer) || string.IsNullOrWhiteSpace(input.Username))
                {
                    result.StatusCode = ErrorCodes.BadRequest;
                    result.StatusMessage = ErrorMessages.BadRequest;
                    return Task.FromResult(result);
                }

                if (input.SmtpPort is < 1 or > 65535)
                {
                    result.StatusCode = ErrorCodes.BadRequest;
                    result.StatusMessage = ErrorMessages.BadRequest;
                    return Task.FromResult(result);
                }

                // Format validation, re-checked server-side since this action can be called
                // directly - the frontend's own checks (EmailSettingsValidator.ts) can be
                // bypassed by a hand-crafted request.
                if (!string.IsNullOrWhiteSpace(input.CcMailId) && !EmailValidator.IsValidFormat(input.CcMailId))
                {
                    result.StatusCode = ErrorCodes.BadRequest;
                    result.StatusMessage = "CC address is not a valid email address.";
                    return Task.FromResult(result);
                }

                if (!string.IsNullOrWhiteSpace(input.ContactUsMailId) && !EmailValidator.IsValidFormat(input.ContactUsMailId))
                {
                    result.StatusCode = ErrorCodes.BadRequest;
                    result.StatusMessage = "Contact us address is not a valid email address.";
                    return Task.FromResult(result);
                }

                if (!ValidateApiBaseUrl(input.ApiBaseUrl, out string? apiBaseUrlError))
                {
                    result.StatusCode = ErrorCodes.BadRequest;
                    result.StatusMessage = apiBaseUrlError;
                    return Task.FromResult(result);
                }

                var settings = confSettingsService.LoadData();
                settings ??= new ConfSettings();
                var smtp = settings.SMTPMailConfig ?? new SMTPMailConfig();

                smtp.SendMailFlag = input.SendMailEnabled ? "1" : "0";
                smtp.SMTPServer = input.SmtpServer;
                smtp.SMTPPort = input.SmtpPort.ToString();
                smtp.DisplayName = input.DisplayName;
                smtp.MUserName = input.Username;
                if (!string.IsNullOrWhiteSpace(input.Password))
                {
                    smtp.MPassword = input.Password;
                }

                smtp.IsSSLEnabled = input.IsSslEnabled ? "1" : "0";
                smtp.CCMailId = input.CcMailId ?? string.Empty;
                smtp.ContactUsMailId = input.ContactUsMailId ?? string.Empty;
                smtp.AccentColor = input.AccentColor ?? string.Empty;
                smtp.FontFamily = input.FontFamily ?? string.Empty;
                smtp.BaseFontSize = input.BaseFontSize ?? 0;
                smtp.ApiBaseUrl = input.ApiBaseUrl ?? string.Empty;

                string actingUserName = $"{currentUserService.FirstName} {currentUserService.LastName}".Trim();
                smtp.LastUpdatedByName = string.IsNullOrWhiteSpace(actingUserName) ? currentUserService.UserName : actingUserName;
                smtp.LastUpdatedDate = DateTime.UtcNow;

                settings.SMTPMailConfig = smtp;
                confSettingsService.SaveData(settings);

                result.StatusMessage = ErrorMessages.Success;
            }
            catch (Exception ex)
            {
                AppLogger.LogError(logger, ex, SerilogErrorMessages.AcutisLogMessages.SaveEmailSettingsFailed);
                result.StatusCode = ErrorCodes.InternalServerError;
                result.StatusMessage = ErrorMessages.InternalServerError;
            }

            return Task.FromResult(result);
        }

        /// <summary>
        /// Sets which Acutis user receives "new product suggestion" notification emails.
        /// </summary>
        /// <remarks>
        /// Purpose: Let an admin pick the recipient from the CFR Settings page's Acutis User dropdown, without touching any SMTP/branding field.
        /// Request Flow: EmailSettingsController -> EmailSettingsService.SaveProductRequestNotifyUserAsync() -> IProductRequestRepository.SaveProductRequestNotifyUserIdAsync().
        /// Validation Details: None — a null value clears the setting.
        /// Business Logic: Persists the selection to the database (not _configurationSettings.json) - CFR.Acutis and CFR.Portal are separate host processes with their own copies of that file, so a value saved to one would never be visible to the other.
        /// Repository Interaction: Executes StoredProc.Requests.ProductRequestCrud with ActionId 7 via IProductRequestRepository.
        /// Response Details: MSResultArgs indicating success.
        /// </remarks>
        /// <param name="input">Input DTO containing the Acutis user identifier to notify.</param>
        /// <returns>MSResultArgs containing the save status.</returns>
        public async Task<MSResultArgs> SaveProductRequestNotifyUserAsync(ProductRequestNotifyUserInput input)
        {
            var result = new MSResultArgs();
            try
            {
                await productRequestRepository.SaveProductRequestNotifyUserIdAsync(input?.ProductRequestNotifyUserId);

                result.StatusMessage = ErrorMessages.Success;
            }
            catch (Exception ex)
            {
                AppLogger.LogError(logger, ex, SerilogErrorMessages.AcutisLogMessages.SaveEmailSettingsFailed);
                result.StatusCode = ErrorCodes.InternalServerError;
                result.StatusMessage = ErrorMessages.InternalServerError;
            }

            return result;
        }

        /// <summary>
        /// Sets this API's own public base URL, used to build the email logo's image link.
        /// </summary>
        /// <remarks>
        /// Purpose: Let an admin edit this API base URL from the CFR Settings page, without resubmitting the rest of the SMTP/branding form.
        /// Request Flow: EmailSettingsController -> EmailSettingsService.SaveApiBaseUrlAsync() -> IConfSettingsService.SaveData().
        /// Validation Details: When non-blank, must be an absolute https URL and not a localhost/loopback address (same rule SaveEmailSettingsAsync applies).
        /// Business Logic: Loads the currently saved settings, updates only SMTPMailConfig.ApiBaseUrl, then writes the file.
        /// Repository Interaction: None — writes _configurationSettings.json via IConfSettingsService.
        /// Response Details: MSResultArgs indicating success, or BadRequest.
        /// </remarks>
        /// <param name="input">Input DTO containing the API base URL.</param>
        /// <returns>MSResultArgs containing the save status.</returns>
        public Task<MSResultArgs> SaveApiBaseUrlAsync(ApiBaseUrlInput input)
        {
            var result = new MSResultArgs();
            try
            {
                if (!ValidateApiBaseUrl(input?.ApiBaseUrl, out string? apiBaseUrlError))
                {
                    result.StatusCode = ErrorCodes.BadRequest;
                    result.StatusMessage = apiBaseUrlError;
                    return Task.FromResult(result);
                }

                var settings = confSettingsService.LoadData();
                settings ??= new ConfSettings();
                var smtp = settings.SMTPMailConfig ?? new SMTPMailConfig();

                smtp.ApiBaseUrl = input?.ApiBaseUrl?.Trim() ?? string.Empty;

                settings.SMTPMailConfig = smtp;
                confSettingsService.SaveData(settings);

                result.StatusMessage = ErrorMessages.Success;
            }
            catch (Exception ex)
            {
                AppLogger.LogError(logger, ex, SerilogErrorMessages.AcutisLogMessages.SaveEmailSettingsFailed);
                result.StatusCode = ErrorCodes.InternalServerError;
                result.StatusMessage = ErrorMessages.InternalServerError;
            }

            return Task.FromResult(result);
        }

        /// <summary>
        /// Validates an API base URL: when non-blank, must be an absolute https URL and not a
        /// loopback/localhost address (it's embedded as an &lt;img src&gt; in every outgoing email —
        /// see SMTPMailService.BuildLogoImageUrl — so recipients' email clients must be able to
        /// reach it). Shared by SaveEmailSettingsAsync and SaveApiBaseUrlAsync so the two save paths
        /// can never drift out of sync on this rule.
        /// </summary>
        /// <param name="apiBaseUrl">The candidate API base URL, or null/blank to clear it.</param>
        /// <param name="errorMessage">The validation failure message, or null when valid.</param>
        /// <returns>True when valid (including blank/null); false otherwise.</returns>
        private static bool ValidateApiBaseUrl(string? apiBaseUrl, out string? errorMessage)
        {
            errorMessage = null;
            if (string.IsNullOrWhiteSpace(apiBaseUrl))
            {
                return true;
            }

            string trimmedApiBaseUrl = apiBaseUrl.Trim();
            if (!Uri.TryCreate(trimmedApiBaseUrl, UriKind.Absolute, out var apiBaseUri)
                || (apiBaseUri.Scheme != Uri.UriSchemeHttp && apiBaseUri.Scheme != Uri.UriSchemeHttps))
            {
                errorMessage = "API base URL must be a valid absolute URL, e.g. https://api.example.com.";
                return false;
            }

            // https:// required unless this environment's own configuration explicitly allows
            // plain http - no such override exists today, so this defaults to the safer, stricter
            // rule rather than silently permitting http.
            if (apiBaseUri.Scheme != Uri.UriSchemeHttps)
            {
                errorMessage = "API base URL must start with https://.";
                return false;
            }

            if (apiBaseUri.IsLoopback || apiBaseUri.Host.Equals("localhost", StringComparison.OrdinalIgnoreCase))
            {
                errorMessage = "API base URL cannot be a localhost address — recipients' email clients cannot reach it.";
                return false;
            }

            return true;
        }

        /// <summary>
        /// Validates, saves, and applies an uploaded platform email logo image (JPG or PNG, max 2MB).
        /// </summary>
        /// <remarks>
        /// Purpose: Store the platform email logo and make it the shared logo used by every outgoing email.
        /// Request Flow: EmailSettingsController -> EmailSettingsService.UploadEmailLogoAsync() -> IFileHandlerService -> IConfSettingsService.SaveData().
        /// Validation Details: File is required, max 2 MB, extensions .jpg/.jpeg/.png only.
        /// Business Logic: Deletes the previous logo file (if any), saves the new one, and persists its file name onto SMTPMailConfig.LogoUrl.
        /// Repository Interaction: None — writes _configurationSettings.json via IConfSettingsService.
        /// Response Details: MSResultArgs containing the updated EmailSettingsOutput, or BadRequest.
        /// </remarks>
        /// <param name="file">Uploaded image file from multipart form data.</param>
        /// <returns>MSResultArgs containing the updated email settings.</returns>
        public async Task<MSResultArgs> UploadEmailLogoAsync(IFormFile? file)
        {
            var result = new MSResultArgs();
            try
            {
                if (file == null || file.Length == 0)
                {
                    result.StatusCode = ErrorCodes.BadRequest;
                    result.StatusMessage = ErrorMessages.EmailLogoFileRequired;
                    return result;
                }

                const long maxFileSize = 2 * 1024 * 1024;
                if (file.Length > maxFileSize)
                {
                    result.StatusCode = ErrorCodes.BadRequest;
                    result.StatusMessage = ErrorMessages.EmailLogoFileTooLarge;
                    return result;
                }

                string extension = Path.GetExtension(file.FileName).ToLowerInvariant();
                if (extension is not (".jpg" or ".jpeg" or ".png"))
                {
                    result.StatusCode = ErrorCodes.BadRequest;
                    result.StatusMessage = ErrorMessages.EmailLogoInvalidType;
                    return result;
                }

                var settings = confSettingsService.LoadData();
                settings ??= new ConfSettings();
                var smtp = settings.SMTPMailConfig ?? new SMTPMailConfig();

                string relativeDirectory = GetEmailLogoRelativePath();
                if (!string.IsNullOrWhiteSpace(smtp.LogoUrl) && !string.Equals(smtp.LogoUrl, "none", StringComparison.OrdinalIgnoreCase))
                {
                    _ = fileHandler.DeleteFile(Path.Combine(relativeDirectory, smtp.LogoUrl));
                }

                string savedPath = fileHandler.SaveUniqueFile(file, relativeDirectory, "email-logo");
                smtp.LogoUrl = Path.GetFileName(savedPath);

                settings.SMTPMailConfig = smtp;
                confSettingsService.SaveData(settings);

                long? productRequestNotifyUserId = await productRequestRepository.GetProductRequestNotifyUserIdAsync();
                result.ResultData = BuildOutput(smtp, productRequestNotifyUserId);
            }
            catch (Exception ex)
            {
                AppLogger.LogError(logger, ex, SerilogErrorMessages.AcutisLogMessages.UploadEmailLogoFailed);
                result.StatusCode = ErrorCodes.InternalServerError;
                result.StatusMessage = ErrorMessages.InternalServerError;
            }

            return result;
        }

        /// <summary>
        /// Removes the currently uploaded platform email logo.
        /// </summary>
        /// <remarks>
        /// Purpose: Let an admin clear the platform email logo so emails fall back to the text brand mark or legacy default.
        /// Request Flow: EmailSettingsController -> EmailSettingsService.RemoveEmailLogoAsync() -> IFileHandlerService.DeleteFile() -> IConfSettingsService.SaveData().
        /// Validation Details: None — a no-op when no logo is currently uploaded.
        /// Business Logic: Deletes the stored file and clears SMTPMailConfig.LogoUrl.
        /// Repository Interaction: None — writes _configurationSettings.json via IConfSettingsService.
        /// Response Details: MSResultArgs containing the updated EmailSettingsOutput.
        /// </remarks>
        /// <returns>MSResultArgs containing the updated email settings.</returns>
        public async Task<MSResultArgs> RemoveEmailLogoAsync()
        {
            var result = new MSResultArgs();
            try
            {
                var settings = confSettingsService.LoadData();
                settings ??= new ConfSettings();
                var smtp = settings.SMTPMailConfig ?? new SMTPMailConfig();

                if (!string.IsNullOrWhiteSpace(smtp.LogoUrl) && !string.Equals(smtp.LogoUrl, "none", StringComparison.OrdinalIgnoreCase))
                {
                    _ = fileHandler.DeleteFile(Path.Combine(GetEmailLogoRelativePath(), smtp.LogoUrl));
                }

                smtp.LogoUrl = string.Empty;
                settings.SMTPMailConfig = smtp;
                confSettingsService.SaveData(settings);

                long? productRequestNotifyUserId = await productRequestRepository.GetProductRequestNotifyUserIdAsync();
                result.ResultData = BuildOutput(smtp, productRequestNotifyUserId);
            }
            catch (Exception ex)
            {
                AppLogger.LogError(logger, ex, SerilogErrorMessages.AcutisLogMessages.RemoveEmailLogoFailed);
                result.StatusCode = ErrorCodes.InternalServerError;
                result.StatusMessage = ErrorMessages.InternalServerError;
            }

            return result;
        }

        /// <summary>
        /// Verifies SMTP connectivity and authentication without sending a real email.
        /// </summary>
        /// <remarks>
        /// Purpose: Let an admin confirm server/port/SSL/credentials work before enabling Send Mail.
        /// Request Flow: EmailSettingsController -> EmailSettingsService.TestSmtpConnectionAsync() -> ISMTPMailService.TestConnectionAsync().
        /// Validation Details: SMTP server and username are required, same as save.
        /// Business Logic: Tests the in-progress form values; a blank password falls back to the currently stored one so a blank UI field never sends an empty password.
        /// Repository Interaction: None — reads _configurationSettings.json via IConfSettingsService for the password fallback only.
        /// Response Details: MSResultArgs containing a success flag and a safe message.
        /// </remarks>
        /// <param name="input">The in-progress form values to test.</param>
        /// <returns>MSResultArgs containing the test outcome.</returns>
        public async Task<MSResultArgs> TestSmtpConnectionAsync(EmailSettingsInput input)
        {
            var result = new MSResultArgs();
            try
            {
                if (input == null || string.IsNullOrWhiteSpace(input.SmtpServer) || string.IsNullOrWhiteSpace(input.Username))
                {
                    result.StatusCode = ErrorCodes.BadRequest;
                    result.StatusMessage = ErrorMessages.BadRequest;
                    return result;
                }

                if (input.SmtpPort is < 1 or > 65535)
                {
                    result.StatusCode = ErrorCodes.BadRequest;
                    result.StatusMessage = ErrorMessages.BadRequest;
                    return result;
                }

                var settings = confSettingsService.LoadData();
                var storedSmtp = settings?.SMTPMailConfig;

                var testConfig = new SMTPMailConfig
                {
                    SendMailFlag = "0",
                    SMTPServer = input.SmtpServer,
                    SMTPPort = input.SmtpPort.ToString(),
                    DisplayName = input.DisplayName,
                    MUserName = input.Username,
                    // Never send an empty password merely because the UI field was left blank -
                    // same "blank means keep existing" rule Save uses.
                    MPassword = !string.IsNullOrWhiteSpace(input.Password) ? input.Password : storedSmtp?.MPassword ?? string.Empty,
                    IsSSLEnabled = input.IsSslEnabled ? "1" : "0",
                };

                (bool success, string message) = await smtpMailService.TestConnectionAsync(testConfig);
                result.StatusMessage = message;
                if (!success)
                {
                    // Not a server error - a failed connectivity/auth test is an expected, valid
                    // outcome the admin needs to see, so this stays 200 with Success=false in the
                    // message rather than surfacing as a BadRequest/500 toast.
                    result.ResultData = new { success };
                    return result;
                }

                result.ResultData = new { success };
            }
            catch (Exception ex)
            {
                AppLogger.LogError(logger, ex, SerilogErrorMessages.AcutisLogMessages.TestSmtpConnectionFailed);
                result.StatusCode = ErrorCodes.InternalServerError;
                result.StatusMessage = ErrorMessages.InternalServerError;
            }

            return result;
        }

        #endregion POST Methods
    }
}
