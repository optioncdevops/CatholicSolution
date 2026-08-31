// Copyright (c) OptionC. All rights reserved.

namespace CFR.AcutisService.Interfaces.Administration
{
    /// <summary>
    /// Service contract for Email Templates operations.
    /// Acts as the business-logic layer between EmailTemplatesController and IEmailTemplatesRepository.
    /// Responsibility:
    /// - Declares methods to fetch, save, and test-send email templates.
    /// - Relies on IEmailTemplatesRepository for stored procedure execution and ISMTPMailService for delivery.
    /// </summary>
    public interface IEmailTemplatesService
    {
        #region GET Methods

        /// <summary>
        /// Retrieves all email templates.
        /// </summary>
        /// <remarks>
        /// Purpose: Fetch the template list for the admin editor.
        /// Request Flow: EmailTemplatesController -> IEmailTemplatesService.GetEmailTemplatesListAsync() -> IEmailTemplatesRepository.GetEmailTemplatesListAsync().
        /// Validation Details: Service checks for an empty or null result set.
        /// Business Logic: Wraps the typed list in MSResultArgs.
        /// Repository Interaction: Calls IEmailTemplatesRepository.GetEmailTemplatesListAsync().
        /// Response Details: MSResultArgs containing List of EmailTemplateOutput, or NoRecordFound.
        /// </remarks>
        /// <returns>MSResultArgs containing the template list.</returns>
        Task<MSResultArgs> GetEmailTemplatesListAsync();

        /// <summary>
        /// Retrieves one email template by identifier.
        /// </summary>
        /// <remarks>
        /// Purpose: Fetch a template for the editor.
        /// Request Flow: EmailTemplatesController -> IEmailTemplatesService.GetEmailTemplateByIdAsync() -> IEmailTemplatesRepository.GetEmailTemplateByIdAsync().
        /// Validation Details: Identifier must be a positive integer.
        /// Business Logic: Wraps the typed record in MSResultArgs.
        /// Repository Interaction: Calls IEmailTemplatesRepository.GetEmailTemplateByIdAsync().
        /// Response Details: MSResultArgs containing EmailTemplateOutput, or NoRecordFound.
        /// </remarks>
        /// <param name="templateId">Template identifier.</param>
        /// <returns>MSResultArgs containing the template.</returns>
        Task<MSResultArgs> GetEmailTemplateByIdAsync(int templateId);

        #endregion GET Methods

        #region POST Methods

        /// <summary>
        /// Adds or updates an email template.
        /// </summary>
        /// <remarks>
        /// Purpose: Insert or update a template's subject/body/status.
        /// Request Flow: EmailTemplatesController -> IEmailTemplatesService.SaveEmailTemplateAsync() -> IEmailTemplatesRepository.SaveEmailTemplateAsync().
        /// Validation Details: Input DTO is required; a duplicate template code on insert is rejected.
        /// Business Logic: Delegates the save to the repository and wraps the identifier result.
        /// Repository Interaction: Calls IEmailTemplatesRepository.SaveEmailTemplateAsync().
        /// Response Details: MSResultArgs containing the template identifier, or Conflict.
        /// </remarks>
        /// <param name="input">Input DTO containing template fields.</param>
        /// <returns>MSResultArgs containing the save status.</returns>
        Task<MSResultArgs> SaveEmailTemplateAsync(EmailTemplateInput input);

        /// <summary>
        /// Sends a test email using ad-hoc (possibly unsaved) subject/body content.
        /// </summary>
        /// <remarks>
        /// Purpose: Let an admin preview a template in their own inbox before saving it.
        /// Request Flow: EmailTemplatesController -> IEmailTemplatesService.SendTestEmailAsync() -> ISMTPMailService.SendMailAsync().
        /// Validation Details: Subject, body, and recipient address are required.
        /// Business Logic: Merges sample placeholder values for the given template code with SMTPMailService.FormatMailContent, then sends via ISMTPMailService.
        /// Repository Interaction: None — does not touch the Email Templates table.
        /// Response Details: MSResultArgs indicating whether the mail server accepted the message.
        /// </remarks>
        /// <param name="input">Input DTO containing the template code, subject, body, and recipient.</param>
        /// <returns>MSResultArgs containing the send outcome.</returns>
        Task<MSResultArgs> SendTestEmailAsync(SendTestEmailInput input);

        #endregion POST Methods
    }
}
