// Copyright (c) OptionC. All rights reserved.

namespace CFR.AcutisService.Service.Administration
{
    /// <summary>
    /// Implements Email Templates business logic for list, get, save, and test-send.
    /// Repository Responsibility:
    /// - Invokes IEmailTemplatesRepository for stored procedure execution.
    /// </summary>
    public class EmailTemplatesService(
        IEmailTemplatesRepository repository,
        ISMTPMailService mailService,
        ICurrentUserService currentUserService,
        ILogger<EmailTemplatesService> logger): IEmailTemplatesService
    {
        #region GET Methods

        /// <summary>
        /// Retrieves all email templates.
        /// </summary>
        /// <remarks>
        /// Purpose: Fetch the template list.
        /// Request Flow: EmailTemplatesController -> EmailTemplatesService.GetEmailTemplatesListAsync() -> IEmailTemplatesRepository.GetEmailTemplatesListAsync().
        /// Validation Details: Service checks for an empty or null result set.
        /// Business Logic: Wraps the typed list in MSResultArgs.
        /// Repository Interaction: Calls IEmailTemplatesRepository.GetEmailTemplatesListAsync().
        /// Response Details: MSResultArgs containing List of EmailTemplateOutput, or NoRecordFound.
        /// </remarks>
        /// <returns>MSResultArgs containing the template list.</returns>
        public async Task<MSResultArgs> GetEmailTemplatesListAsync()
        {
            var result = new MSResultArgs();
            try
            {
                var data = await repository.GetEmailTemplatesListAsync();
                result.ResultData = data ?? [];
            }
            catch (Exception ex)
            {
                AppLogger.LogError(logger, ex, SerilogErrorMessages.AcutisLogMessages.FetchEmailTemplatesFailed);
                result.StatusCode = ErrorCodes.InternalServerError;
                result.StatusMessage = ErrorMessages.InternalServerError;
            }

            return result;
        }

        /// <summary>
        /// Retrieves one email template by identifier.
        /// </summary>
        /// <remarks>
        /// Purpose: Fetch a template for the editor.
        /// Request Flow: EmailTemplatesController -> EmailTemplatesService.GetEmailTemplateByIdAsync() -> IEmailTemplatesRepository.GetEmailTemplateByIdAsync().
        /// Validation Details: Identifier must be a positive integer.
        /// Business Logic: Wraps the typed record in MSResultArgs.
        /// Repository Interaction: Calls IEmailTemplatesRepository.GetEmailTemplateByIdAsync().
        /// Response Details: MSResultArgs containing EmailTemplateOutput, or NoRecordFound.
        /// </remarks>
        /// <param name="templateId">Template identifier.</param>
        /// <returns>MSResultArgs containing the template.</returns>
        public async Task<MSResultArgs> GetEmailTemplateByIdAsync(int templateId)
        {
            var result = new MSResultArgs();
            try
            {
                if (templateId <= 0)
                {
                    result.StatusCode = ErrorCodes.BadRequest;
                    result.StatusMessage = ErrorMessages.BadRequest;
                    return result;
                }

                var data = await repository.GetEmailTemplateByIdAsync(templateId);
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
                AppLogger.LogError(logger, ex, SerilogErrorMessages.AcutisLogMessages.FetchEmailTemplateByIdFailed, templateId);
                result.StatusCode = ErrorCodes.InternalServerError;
                result.StatusMessage = ErrorMessages.InternalServerError;
            }

            return result;
        }

        #endregion GET Methods

        #region POST Methods

        /// <summary>
        /// Adds or updates an email template.
        /// </summary>
        /// <remarks>
        /// Purpose: Insert or update a template's subject/body/status.
        /// Request Flow: EmailTemplatesController -> EmailTemplatesService.SaveEmailTemplateAsync() -> IEmailTemplatesRepository.SaveEmailTemplateAsync().
        /// Validation Details: Input DTO is required; a new template must include a TemplateCode.
        /// Business Logic: Passes the logged-in user id as UpdatedBy and wraps the scalar result.
        /// Repository Interaction: Calls IEmailTemplatesRepository.SaveEmailTemplateAsync().
        /// Response Details: MSResultArgs containing the template identifier, or Conflict.
        /// </remarks>
        /// <param name="input">Input DTO containing template fields.</param>
        /// <returns>MSResultArgs containing the save status.</returns>
        public async Task<MSResultArgs> SaveEmailTemplateAsync(EmailTemplateInput input)
        {
            var result = new MSResultArgs();
            try
            {
                if (input == null || string.IsNullOrWhiteSpace(input.Subject) || string.IsNullOrWhiteSpace(input.Body))
                {
                    result.StatusCode = ErrorCodes.BadRequest;
                    result.StatusMessage = ErrorMessages.BadRequest;
                    return result;
                }

                if (input.TemplateId == 0 && string.IsNullOrWhiteSpace(input.TemplateCode))
                {
                    result.StatusCode = ErrorCodes.BadRequest;
                    result.StatusMessage = ErrorMessages.BadRequest;
                    return result;
                }

                int savedId = await repository.SaveEmailTemplateAsync(input, currentUserService.UserId);
                if (savedId == -99)
                {
                    result.StatusCode = ErrorCodes.Conflict;
                    result.StatusMessage = ErrorMessages.ExistEmailTemplateCode;
                    return result;
                }

                result.ResultData = savedId;
            }
            catch (Exception ex)
            {
                AppLogger.LogError(logger, ex, SerilogErrorMessages.AcutisLogMessages.SaveEmailTemplateFailed);
                result.StatusCode = ErrorCodes.InternalServerError;
                result.StatusMessage = ErrorMessages.InternalServerError;
            }

            return result;
        }

        /// <summary>
        /// Sends a test email using ad-hoc (possibly unsaved) subject/body content.
        /// </summary>
        /// <remarks>
        /// Purpose: Let an admin preview a template in their own inbox before saving it.
        /// Request Flow: EmailTemplatesController -> EmailTemplatesService.SendTestEmailAsync() -> ISMTPMailService.SendMailAsync().
        /// Validation Details: Subject, body, and recipient address are required.
        /// Business Logic: Sends the editor subject and body as written via ISMTPMailService. Merge tags are not filled with demo values.
        /// Repository Interaction: None.
        /// Response Details: MSResultArgs indicating whether the mail server accepted the message.
        /// </remarks>
        /// <param name="input">Input DTO containing the template code, subject, body, and recipient.</param>
        /// <returns>MSResultArgs containing the send outcome.</returns>
        public async Task<MSResultArgs> SendTestEmailAsync(SendTestEmailInput input)
        {
            var result = new MSResultArgs();
            try
            {
                if (input == null || string.IsNullOrWhiteSpace(input.Subject) || string.IsNullOrWhiteSpace(input.Body) || string.IsNullOrWhiteSpace(input.ToAddress))
                {
                    result.StatusCode = ErrorCodes.BadRequest;
                    result.StatusMessage = ErrorMessages.BadRequest;
                    return result;
                }

                string accentColor = string.IsNullOrWhiteSpace(input.AccentColor) ? "#1d4ed8" : input.AccentColor;
                string testSubject = input.Subject.Replace("[AccentColor]", accentColor);
                string testBody = input.Body.Replace("[AccentColor]", accentColor);
                bool sent = await mailService.SendMailAsync(testSubject, testBody, input.ToAddress, templateLogoUrl: input.LogoUrl, fontFamily: input.FontFamily, baseFontSize: input.BaseFontSize);
                if (!sent)
                {
                    result.StatusCode = ErrorCodes.Failed;
                    result.StatusMessage = ErrorMessages.Failed;
                    return result;
                }

                result.StatusMessage = ErrorMessages.Success;
            }
            catch (Exception ex)
            {
                AppLogger.LogError(logger, ex, SerilogErrorMessages.AcutisLogMessages.SendTestEmailFailed);
                result.StatusCode = ErrorCodes.InternalServerError;
                result.StatusMessage = ErrorMessages.InternalServerError;
            }

            return result;
        }

        #endregion POST Methods
    }
}
