// Copyright (c) OptionC. All rights reserved.

namespace CFR.AcutisService.Interfaces.Administration
{
    /// <summary>
    /// Service contract for the platform-wide Email Settings (SMTP + branding) page.
    /// Acts as the business-logic layer between EmailSettingsController and IConfSettingsService.
    /// Responsibility:
    /// - Declares methods to read and update the file-backed email configuration
    ///   (_configurationSettings.json), not a database table.
    /// </summary>
    public interface IEmailSettingsService
    {
        #region GET Methods

        /// <summary>
        /// Retrieves the current platform-wide email configuration.
        /// </summary>
        /// <remarks>
        /// Purpose: Fetch SMTP and branding settings for the admin editor.
        /// Request Flow: EmailSettingsController -> IEmailSettingsService.GetEmailSettingsAsync() -> IConfSettingsService.LoadData().
        /// Validation Details: None.
        /// Business Logic: Maps SMTPMailConfig to EmailSettingsOutput; the stored password is masked to a boolean flag.
        /// Repository Interaction: None — reads _configurationSettings.json via IConfSettingsService.
        /// Response Details: MSResultArgs containing EmailSettingsOutput.
        /// </remarks>
        /// <returns>MSResultArgs containing the email settings.</returns>
        Task<MSResultArgs> GetEmailSettingsAsync();

        /// <summary>
        /// Retrieves the uploaded platform email logo image bytes.
        /// </summary>
        /// <remarks>
        /// Purpose: Stream the uploaded logo so it can be embedded in outgoing emails and previewed in the admin UI.
        /// Request Flow: EmailSettingsController -> IEmailSettingsService.GetEmailLogoAsync() -> IFileHandlerService.GetFile().
        /// Validation Details: fileName must be a jpg/jpeg/png name with no directory segments.
        /// Business Logic: Reads bytes via IFileHandlerService from the email logo storage folder.
        /// Repository Interaction: None (file storage only).
        /// Response Details: MSResultArgs containing the image byte array, or NoRecordFound.
        /// </remarks>
        /// <param name="fileName">Stored logo file name.</param>
        /// <returns>MSResultArgs containing the image bytes.</returns>
        Task<MSResultArgs> GetEmailLogoAsync(string fileName);

        #endregion GET Methods

        #region POST Methods

        /// <summary>
        /// Updates the platform-wide email configuration.
        /// </summary>
        /// <remarks>
        /// Purpose: Persist SMTP and branding settings edited by an admin.
        /// Request Flow: EmailSettingsController -> IEmailSettingsService.SaveEmailSettingsAsync() -> IConfSettingsService.SaveData().
        /// Validation Details: Input DTO, SMTP server, and username are required.
        /// Business Logic: Merges the input onto the currently loaded settings, only overwriting the password when a non-blank value is supplied, then writes the file.
        /// Repository Interaction: None — writes _configurationSettings.json via IConfSettingsService.
        /// Response Details: MSResultArgs indicating success, or BadRequest.
        /// </remarks>
        /// <param name="input">Input DTO containing the email settings fields.</param>
        /// <returns>MSResultArgs containing the save status.</returns>
        Task<MSResultArgs> SaveEmailSettingsAsync(EmailSettingsInput input);

        /// <summary>
        /// Sets which Acutis user receives "new product suggestion" notification emails.
        /// </summary>
        /// <remarks>
        /// Purpose: Let an admin pick the recipient from the CFR Settings page's Acutis User dropdown, without touching any SMTP/branding field.
        /// Request Flow: EmailSettingsController -> IEmailSettingsService.SaveProductRequestNotifyUserAsync() -> IProductRequestRepository.SaveProductRequestNotifyUserIdAsync().
        /// Validation Details: None — a null value clears the setting.
        /// Business Logic: Persists the selection to the database, shared by both CFR.Acutis and CFR.Portal (not _configurationSettings.json, which is a separate, unshared file per microservice).
        /// Repository Interaction: Executes StoredProc.Requests.ProductRequestCrud with ActionId 7 via IProductRequestRepository.
        /// Response Details: MSResultArgs indicating success.
        /// </remarks>
        /// <param name="input">Input DTO containing the Acutis user identifier to notify.</param>
        /// <returns>MSResultArgs containing the save status.</returns>
        Task<MSResultArgs> SaveProductRequestNotifyUserAsync(ProductRequestNotifyUserInput input);

        /// <summary>
        /// Sets this API's own public base URL, used to build the email logo's image link.
        /// </summary>
        /// <remarks>
        /// Purpose: Let an admin edit this API base URL from the CFR Settings page, without resubmitting the rest of the SMTP/branding form.
        /// Request Flow: EmailSettingsController -> IEmailSettingsService.SaveApiBaseUrlAsync() -> IConfSettingsService.SaveData().
        /// Validation Details: When non-blank, must be an absolute https URL and not a localhost/loopback address.
        /// Business Logic: Loads the currently saved settings, updates only SMTPMailConfig.ApiBaseUrl, then writes the file.
        /// Repository Interaction: None — writes _configurationSettings.json via IConfSettingsService.
        /// Response Details: MSResultArgs indicating success, or BadRequest.
        /// </remarks>
        /// <param name="input">Input DTO containing the API base URL.</param>
        /// <returns>MSResultArgs containing the save status.</returns>
        Task<MSResultArgs> SaveApiBaseUrlAsync(ApiBaseUrlInput input);

        /// <summary>
        /// Validates, saves, and applies an uploaded platform email logo image (JPG or PNG, max 2MB).
        /// </summary>
        /// <remarks>
        /// Purpose: Store the platform email logo and make it the shared logo used by every outgoing email.
        /// Request Flow: EmailSettingsController -> IEmailSettingsService.UploadEmailLogoAsync() -> IFileHandlerService -> IConfSettingsService.SaveData().
        /// Validation Details: File is required, max 2 MB, extensions .jpg/.jpeg/.png only.
        /// Business Logic: Deletes the previous logo file (if any), saves the new one, and persists its file name onto SMTPMailConfig.LogoUrl.
        /// Repository Interaction: None — writes _configurationSettings.json via IConfSettingsService.
        /// Response Details: MSResultArgs containing the updated EmailSettingsOutput, or BadRequest.
        /// </remarks>
        /// <param name="file">Uploaded image file from multipart form data.</param>
        /// <returns>MSResultArgs containing the updated email settings.</returns>
        Task<MSResultArgs> UploadEmailLogoAsync(IFormFile? file);

        /// <summary>
        /// Removes the currently uploaded platform email logo.
        /// </summary>
        /// <remarks>
        /// Purpose: Let an admin clear the platform email logo so emails fall back to the text brand mark or legacy default.
        /// Request Flow: EmailSettingsController -> IEmailSettingsService.RemoveEmailLogoAsync() -> IFileHandlerService.DeleteFile() -> IConfSettingsService.SaveData().
        /// Validation Details: None — a no-op when no logo is currently uploaded.
        /// Business Logic: Deletes the stored file and clears SMTPMailConfig.LogoUrl.
        /// Repository Interaction: None — writes _configurationSettings.json via IConfSettingsService.
        /// Response Details: MSResultArgs containing the updated EmailSettingsOutput.
        /// </remarks>
        /// <returns>MSResultArgs containing the updated email settings.</returns>
        Task<MSResultArgs> RemoveEmailLogoAsync();

        /// <summary>
        /// Verifies SMTP connectivity and authentication without sending a real email.
        /// </summary>
        /// <remarks>
        /// Purpose: Let an admin confirm server/port/SSL/credentials work before enabling Send Mail.
        /// Request Flow: EmailSettingsController -> IEmailSettingsService.TestSmtpConnectionAsync() -> ISMTPMailService.TestConnectionAsync().
        /// Validation Details: SMTP server and username are required, same as save.
        /// Business Logic: Tests against the submitted (possibly unsaved) form values; a blank password falls back to the currently stored one, never an empty string.
        /// Repository Interaction: None — reads _configurationSettings.json via IConfSettingsService for the password fallback only.
        /// Response Details: MSResultArgs containing a success flag and a safe (no password, no stack trace) message.
        /// </remarks>
        /// <param name="input">The in-progress form values to test.</param>
        /// <returns>MSResultArgs containing the test outcome.</returns>
        Task<MSResultArgs> TestSmtpConnectionAsync(EmailSettingsInput input);

        #endregion POST Methods
    }
}
