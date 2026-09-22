// Copyright (c) OptionC. All rights reserved.

namespace CFR.Acutis.Controllers.Administration
{
    /// <summary>
    /// API controller for viewing and managing the platform-wide email configuration
    /// (SMTP + branding). Values are stored in _configurationSettings.json, not a database table.
    /// Service Responsibility:
    /// - IEmailSettingsService retrieves data, applies validation, and returns ResultArgs.
    /// </summary>
    [ApiExplorerSettings(GroupName = SwaggerModuleDoc.CFRAcutisAdministration)]
    public class EmailSettingsController(IEmailSettingsService service): BaseController
    {
        #region GET Methods

        /// <summary>
        /// Retrieves the current platform-wide email configuration.
        /// </summary>
        /// <remarks>
        /// Purpose: Fetch SMTP and branding settings for the admin editor.
        /// Request Flow: Client API GET -> EmailSettingsController.GetEmailSettings() -> IEmailSettingsService.GetEmailSettingsAsync() -> _configurationSettings.json.
        /// Validation Details: Handled inside the service layer.
        /// Business Logic: None at the controller level; delegates to the service layer.
        /// Service Interaction: Calls IEmailSettingsService.GetEmailSettingsAsync().
        /// Response Details: Standard API result enclosing EmailSettingsOutput with status 200 or 500.
        /// </remarks>
        /// <returns>A consistent API response containing the email settings.</returns>
        /// <response code="200">Successfully fetched email settings.</response>
        /// <response code="500">Internal server error occurred.</response>
        [HttpGet]
        [ActionName(API_Administration.GetEmailSettings)]
        public async Task<IActionResult> GetEmailSettings()
        {
            return ApiResultArgs(await service.GetEmailSettingsAsync(), APIHttpType.HttpGet);
        }

        /// <summary>
        /// Retrieves the uploaded platform email logo image.
        /// </summary>
        /// <remarks>
        /// Purpose: Stream the uploaded logo for use as an &lt;img&gt; source — both the outgoing email HTML and the admin preview point at this action.
        /// Request Flow: Client GET (anonymous) -> EmailSettingsController.GetEmailLogo() -> IEmailSettingsService.GetEmailLogoAsync() -> File storage.
        /// Validation Details: Query parameter fileName must be a jpg/jpeg/png file name.
        /// Business Logic: None at the controller level; delegates to the service layer and returns a file result.
        /// Service Interaction: Calls IEmailSettingsService.GetEmailLogoAsync(fileName).
        /// Response Details: Image bytes with image/jpeg or image/png, or 404 when the file is missing.
        /// </remarks>
        /// <param name="fileName">Stored logo file name.</param>
        /// <returns>The logo image file, or not found.</returns>
        /// <response code="200">Successfully streamed the email logo.</response>
        /// <response code="400">Invalid file name.</response>
        /// <response code="404">Logo file was not found.</response>
        /// <response code="500">Internal server error occurred.</response>
        [HttpGet]
        [AllowAnonymous]
        [ActionName(nameof(GetEmailLogo))]
        [Produces("image/jpeg", "image/png")]
        public async Task<IActionResult> GetEmailLogo(string fileName)
        {
            var result = await service.GetEmailLogoAsync(fileName);
            if (result.ResultData is not byte[] bytes || bytes.Length == 0)
            {
                return NotFound();
            }

            string extension = Path.GetExtension(fileName).ToLowerInvariant();
            string contentType = extension == ".png" ? "image/png" : "image/jpeg";
            return File(bytes, contentType);
        }

        #endregion GET Methods

        #region POST Methods

        /// <summary>
        /// Updates the platform-wide email configuration.
        /// </summary>
        /// <remarks>
        /// Purpose: Persist SMTP and branding settings edited by an admin.
        /// Request Flow: Client API POST -> EmailSettingsController.SaveEmailSettings() -> IEmailSettingsService.SaveEmailSettingsAsync() -> _configurationSettings.json.
        /// Validation Details: Model binding maps EmailSettingsInput from the request body.
        /// Business Logic: None at the controller level; delegates to the service layer.
        /// Service Interaction: Calls IEmailSettingsService.SaveEmailSettingsAsync().
        /// Response Details: Standard API result indicating execution status.
        /// </remarks>
        /// <param name="input">Input DTO containing the email settings fields.</param>
        /// <returns>Result of the save operation.</returns>
        /// <response code="200">Successfully saved the email settings.</response>
        /// <response code="400">Required fields are missing.</response>
        /// <response code="500">Internal server error occurred.</response>
        [HttpPost]
        [ActionName(API_Administration.SaveEmailSettings)]
        public async Task<IActionResult> SaveEmailSettings([FromBody] EmailSettingsInput input)
        {
            return ApiResultArgs(await service.SaveEmailSettingsAsync(input), APIHttpType.HttpPost);
        }

        /// <summary>
        /// Sets which Acutis user receives "new product suggestion" notification emails.
        /// </summary>
        /// <remarks>
        /// Purpose: Persist the CFR Settings page's Acutis User dropdown selection, without touching any SMTP/branding field.
        /// Request Flow: Client API POST -> EmailSettingsController.SaveProductRequestNotifyUser() -> IEmailSettingsService.SaveProductRequestNotifyUserAsync() -> _configurationSettings.json.
        /// Validation Details: Model binding maps ProductRequestNotifyUserInput from the request body.
        /// Business Logic: None at the controller level; delegates to the service layer.
        /// Service Interaction: Calls IEmailSettingsService.SaveProductRequestNotifyUserAsync().
        /// Response Details: Standard API result indicating execution status.
        /// </remarks>
        /// <param name="input">Input DTO containing the Acutis user identifier to notify.</param>
        /// <returns>Result of the save operation.</returns>
        /// <response code="200">Successfully saved the notification recipient.</response>
        /// <response code="500">Internal server error occurred.</response>
        [HttpPost]
        [ActionName(API_Administration.SaveProductRequestNotifyUser)]
        public async Task<IActionResult> SaveProductRequestNotifyUser([FromBody] ProductRequestNotifyUserInput input)
        {
            return ApiResultArgs(await service.SaveProductRequestNotifyUserAsync(input), APIHttpType.HttpPost);
        }

        /// <summary>
        /// Uploads the platform email logo image, replacing any previously uploaded one.
        /// </summary>
        /// <remarks>
        /// Purpose: Accepts an image file, saves it securely, and applies it as the shared logo used by every outgoing email.
        /// Request Flow: Client API POST -> EmailSettingsController.UploadEmailLogo() -> IEmailSettingsService.UploadEmailLogoAsync() -> Storage.
        /// Validation Details: Bound from multipart form data; validates extension (.jpg, .jpeg, .png) and size (up to 2 MB).
        /// Business Logic: None at controller level; delegates to service layer.
        /// Service Interaction: Calls IEmailSettingsService.UploadEmailLogoAsync(file).
        /// Response Details: Standard API result enclosing the updated EmailSettingsOutput.
        /// </remarks>
        /// <param name="form">Multipart form containing the logo image file.</param>
        /// <returns>A consistent API response containing the updated email settings.</returns>
        /// <response code="200">Successfully uploaded the email logo.</response>
        /// <response code="400">Invalid image file or size exceeds 2 MB.</response>
        /// <response code="500">Internal server error occurred.</response>
        [HttpPost]
        [ActionName(API_Administration.UploadEmailLogo)]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UploadEmailLogo([FromForm] EmailLogoUploadInput form)
        {
            return ApiResultArgs(await service.UploadEmailLogoAsync(form.File), APIHttpType.HttpPost);
        }

        /// <summary>
        /// Removes the currently uploaded platform email logo.
        /// </summary>
        /// <remarks>
        /// Purpose: Let an admin clear the platform email logo.
        /// Request Flow: Client API POST -> EmailSettingsController.RemoveEmailLogo() -> IEmailSettingsService.RemoveEmailLogoAsync() -> Storage.
        /// Validation Details: None.
        /// Business Logic: None at the controller level; delegates to the service layer.
        /// Service Interaction: Calls IEmailSettingsService.RemoveEmailLogoAsync().
        /// Response Details: Standard API result enclosing the updated EmailSettingsOutput.
        /// </remarks>
        /// <returns>Result of the remove operation.</returns>
        /// <response code="200">Successfully removed the email logo.</response>
        /// <response code="500">Internal server error occurred.</response>
        [HttpPost]
        [ActionName(API_Administration.RemoveEmailLogo)]
        public async Task<IActionResult> RemoveEmailLogo()
        {
            return ApiResultArgs(await service.RemoveEmailLogoAsync(), APIHttpType.HttpPost);
        }

        /// <summary>
        /// Verifies SMTP connectivity and authentication without sending a real email.
        /// </summary>
        /// <remarks>
        /// Purpose: Let an admin confirm server/port/SSL/credentials work before enabling Send Mail.
        /// Request Flow: Client API POST -> EmailSettingsController.TestConnection() -> IEmailSettingsService.TestSmtpConnectionAsync().
        /// Validation Details: SMTP server and username are required, same as save.
        /// Business Logic: None at the controller level; delegates to the service layer.
        /// Service Interaction: Calls IEmailSettingsService.TestSmtpConnectionAsync(input).
        /// Response Details: Standard API result enclosing a success flag and a safe status message.
        /// </remarks>
        /// <param name="input">The in-progress form values to test.</param>
        /// <returns>Result of the connection test.</returns>
        /// <response code="200">The test ran (result may still be success=false).</response>
        /// <response code="400">Required fields are missing.</response>
        /// <response code="500">Internal server error occurred.</response>
        [HttpPost]
        [ActionName(API_Administration.TestConnection)]
        public async Task<IActionResult> TestConnection([FromBody] EmailSettingsInput input)
        {
            return ApiResultArgs(await service.TestSmtpConnectionAsync(input), APIHttpType.HttpPost);
        }

        #endregion POST Methods
    }
}
