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
        ILogger<EmailSettingsService> logger): IEmailSettingsService
    {
        private static string GetEmailLogoRelativePath() => Path.Combine("Acutis", "Attachment", "EmailSettings");

        private static EmailSettingsOutput BuildOutput(SMTPMailConfig? smtp) => new()
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
        public Task<MSResultArgs> GetEmailSettingsAsync()
        {
            var result = new MSResultArgs();
            try
            {
                var settings = confSettingsService.LoadData();
                result.ResultData = BuildOutput(settings?.SMTPMailConfig);
            }
            catch (Exception ex)
            {
                AppLogger.LogError(logger, ex, SerilogErrorMessages.AcutisLogMessages.FetchEmailSettingsFailed);
                result.StatusCode = ErrorCodes.InternalServerError;
                result.StatusMessage = ErrorMessages.InternalServerError;
            }

            return Task.FromResult(result);
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
        public Task<MSResultArgs> UploadEmailLogoAsync(IFormFile? file)
        {
            var result = new MSResultArgs();
            try
            {
                if (file == null || file.Length == 0)
                {
                    result.StatusCode = ErrorCodes.BadRequest;
                    result.StatusMessage = ErrorMessages.EmailLogoFileRequired;
                    return Task.FromResult(result);
                }

                const long maxFileSize = 2 * 1024 * 1024;
                if (file.Length > maxFileSize)
                {
                    result.StatusCode = ErrorCodes.BadRequest;
                    result.StatusMessage = ErrorMessages.EmailLogoFileTooLarge;
                    return Task.FromResult(result);
                }

                string extension = Path.GetExtension(file.FileName).ToLowerInvariant();
                if (extension is not (".jpg" or ".jpeg" or ".png"))
                {
                    result.StatusCode = ErrorCodes.BadRequest;
                    result.StatusMessage = ErrorMessages.EmailLogoInvalidType;
                    return Task.FromResult(result);
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

                result.ResultData = BuildOutput(smtp);
            }
            catch (Exception ex)
            {
                AppLogger.LogError(logger, ex, SerilogErrorMessages.AcutisLogMessages.UploadEmailLogoFailed);
                result.StatusCode = ErrorCodes.InternalServerError;
                result.StatusMessage = ErrorMessages.InternalServerError;
            }

            return Task.FromResult(result);
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
        public Task<MSResultArgs> RemoveEmailLogoAsync()
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

                result.ResultData = BuildOutput(smtp);
            }
            catch (Exception ex)
            {
                AppLogger.LogError(logger, ex, SerilogErrorMessages.AcutisLogMessages.RemoveEmailLogoFailed);
                result.StatusCode = ErrorCodes.InternalServerError;
                result.StatusMessage = ErrorMessages.InternalServerError;
            }

            return Task.FromResult(result);
        }

        #endregion POST Methods
    }
}
