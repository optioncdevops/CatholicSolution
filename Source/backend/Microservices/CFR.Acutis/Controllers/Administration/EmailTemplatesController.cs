// Copyright (c) OptionC. All rights reserved.

namespace CFR.Acutis.Controllers.Administration
{
    /// <summary>
    /// API controller for viewing and managing email templates.
    /// Handles listing, saving, and test-sending configurable email templates.
    /// Service Responsibility:
    /// - IEmailTemplatesService retrieves data, applies validation, and returns ResultArgs.
    /// </summary>
    [ApiExplorerSettings(GroupName = SwaggerModuleDoc.CFRAcutisAdministration)]
    public class EmailTemplatesController(IEmailTemplatesService service): BaseController
    {
        #region GET Methods

        /// <summary>
        /// Retrieves the list of all email templates.
        /// </summary>
        /// <remarks>
        /// Purpose: Fetch configurable email templates for the admin editor.
        /// Request Flow: Client API GET -> EmailTemplatesController.GetEmailTemplates() -> IEmailTemplatesService.GetEmailTemplatesListAsync() -> Database.
        /// Validation Details: Handled inside the service layer.
        /// Business Logic: None at the controller level; delegates to the service layer.
        /// Service Interaction: Calls IEmailTemplatesService.GetEmailTemplatesListAsync().
        /// Response Details: Standard API result enclosing List of EmailTemplateOutput with status 200 or 500.
        /// </remarks>
        /// <returns>A consistent API response containing the templates dataset.</returns>
        /// <response code="200">Successfully fetched templates list.</response>
        /// <response code="500">Internal server error occurred.</response>
        [HttpGet]
        [ActionName(API_Administration.GetEmailTemplates)]
        public async Task<IActionResult> GetEmailTemplates()
        {
            return ApiResultArgs(await service.GetEmailTemplatesListAsync(), APIHttpType.HttpGet);
        }

        /// <summary>
        /// Retrieves one email template by identifier.
        /// </summary>
        /// <remarks>
        /// Purpose: Fetch a template for the editor.
        /// Request Flow: Client API GET -> EmailTemplatesController.GetEmailTemplateById() -> IEmailTemplatesService.GetEmailTemplateByIdAsync() -> Database.
        /// Validation Details: Query parameter binding maps the identifier.
        /// Business Logic: None at the controller level; delegates to the service layer.
        /// Service Interaction: Calls IEmailTemplatesService.GetEmailTemplateByIdAsync().
        /// Response Details: Standard API result enclosing EmailTemplateOutput with status 200 or 500.
        /// </remarks>
        /// <param name="templateId">Template identifier.</param>
        /// <returns>A consistent API response containing the template.</returns>
        /// <response code="200">Successfully fetched the template.</response>
        /// <response code="500">Internal server error occurred.</response>
        [HttpGet]
        [ActionName(API_Administration.GetEmailTemplateById)]
        public async Task<IActionResult> GetEmailTemplateById(int templateId)
        {
            return ApiResultArgs(await service.GetEmailTemplateByIdAsync(templateId), APIHttpType.HttpGet);
        }

        #endregion GET Methods

        #region POST Methods

        /// <summary>
        /// Saves a new or existing email template.
        /// </summary>
        /// <remarks>
        /// Purpose: Add or update an email template's subject and body.
        /// Request Flow: Client API POST -> EmailTemplatesController.SaveEmailTemplate() -> IEmailTemplatesService.SaveEmailTemplateAsync() -> Database.
        /// Validation Details: Model binding maps EmailTemplateInput from the request body.
        /// Business Logic: None at the controller level; delegates to the service layer.
        /// Service Interaction: Calls IEmailTemplatesService.SaveEmailTemplateAsync().
        /// Response Details: Standard API result indicating execution status.
        /// </remarks>
        /// <param name="input">Input DTO containing template fields.</param>
        /// <returns>Result of the save operation.</returns>
        /// <response code="200">Successfully saved the template.</response>
        /// <response code="409">A template with this code already exists.</response>
        /// <response code="500">Internal server error occurred.</response>
        [HttpPost]
        [ActionName(API_Administration.SaveEmailTemplate)]
        public async Task<IActionResult> SaveEmailTemplate([FromBody] EmailTemplateInput input)
        {
            return ApiResultArgs(await service.SaveEmailTemplateAsync(input), APIHttpType.HttpPost);
        }

        /// <summary>
        /// Sends a test email using the current (possibly unsaved) editor content.
        /// </summary>
        /// <remarks>
        /// Purpose: Let an admin preview a template in their own inbox before saving it.
        /// Request Flow: Client API POST -> EmailTemplatesController.SendTestEmail() -> IEmailTemplatesService.SendTestEmailAsync() -> SMTP.
        /// Validation Details: Model binding maps SendTestEmailInput from the request body.
        /// Business Logic: None at the controller level; delegates to the service layer.
        /// Service Interaction: Calls IEmailTemplatesService.SendTestEmailAsync().
        /// Response Details: Standard API result indicating whether the mail server accepted the message.
        /// </remarks>
        /// <param name="input">Input DTO containing the template code, subject, body, and recipient.</param>
        /// <returns>Result of the send operation.</returns>
        /// <response code="200">Test email accepted for delivery.</response>
        /// <response code="500">Internal server error occurred.</response>
        [HttpPost]
        [ActionName(API_Administration.SendTestEmail)]
        public async Task<IActionResult> SendTestEmail([FromBody] SendTestEmailInput input)
        {
            return ApiResultArgs(await service.SendTestEmailAsync(input), APIHttpType.HttpPost);
        }

        #endregion POST Methods
    }
}
