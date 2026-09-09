// Copyright (c) OptionC. All rights reserved.

namespace CFR.PortalInfrastructure.Interfaces.Administration
{
    /// <summary>
    /// Repository interface for Email Templates database operations.
    /// Repository Responsibility:
    /// - Declares SELECT and INSERT/UPDATE operations against SQL Server via Dapper stored procedures.
    /// </summary>
    public interface IEmailTemplatesRepository
    {
        #region GET Methods

        /// <summary>
        /// Retrieves all email templates.
        /// </summary>
        /// <remarks>
        /// Purpose: Fetch the list of email templates for the admin editor.
        /// Request Flow: IEmailTemplatesService -> IEmailTemplatesRepository.GetEmailTemplatesListAsync() -> SQL Database.
        /// Validation Details: None.
        /// Business Logic: Directly retrieves rows without manipulation.
        /// Repository Interaction: Executes StoredProc.Administration.EmailTemplatesCrud with ActionId 3.
        /// Response Details: Returns a list of EmailTemplateOutput records.
        /// </remarks>
        /// <returns>A list of email template output records.</returns>
        Task<List<EmailTemplateOutput>> GetEmailTemplatesListAsync();

        /// <summary>
        /// Retrieves one email template by identifier.
        /// </summary>
        /// <remarks>
        /// Purpose: Fetch a template for the editor.
        /// Request Flow: IEmailTemplatesService -> IEmailTemplatesRepository.GetEmailTemplateByIdAsync() -> SQL Database.
        /// Validation Details: TemplateId parameter mapping.
        /// Business Logic: Directly retrieves the row without manipulation.
        /// Repository Interaction: Executes StoredProc.Administration.EmailTemplatesCrud with ActionId 2.
        /// Response Details: Returns an EmailTemplateOutput record, or null when not found.
        /// </remarks>
        /// <param name="templateId">Template identifier.</param>
        /// <returns>The matching template, or null when not found.</returns>
        Task<EmailTemplateOutput?> GetEmailTemplateByIdAsync(int templateId);

        /// <summary>
        /// Retrieves one active email template by its stable code.
        /// </summary>
        /// <remarks>
        /// Purpose: Load the current content for a system-triggered email (e.g. password reset) at send time.
        /// Request Flow: AcutisPasswordService -> IEmailTemplatesRepository.GetEmailTemplateByCodeAsync() -> SQL Database.
        /// Validation Details: TemplateCode parameter mapping.
        /// Business Logic: Only returns a row when the template is active.
        /// Repository Interaction: Executes StoredProc.Administration.EmailTemplatesCrud with ActionId 4.
        /// Response Details: Returns an EmailTemplateOutput record, or null when not found or inactive.
        /// </remarks>
        /// <param name="templateCode">Stable template code.</param>
        /// <returns>The matching active template, or null when not found.</returns>
        Task<EmailTemplateOutput?> GetEmailTemplateByCodeAsync(string templateCode);

        #endregion GET Methods

        #region POST Methods

        /// <summary>
        /// Adds or updates an email template.
        /// </summary>
        /// <remarks>
        /// Purpose: Insert or update a template's subject/body/status.
        /// Request Flow: IEmailTemplatesService -> IEmailTemplatesRepository.SaveEmailTemplateAsync() -> SQL Database.
        /// Validation Details: Parameter names match stored procedure arguments.
        /// Business Logic: Executes StoredProc.Administration.EmailTemplatesCrud with ActionId 1.
        /// Repository Interaction: Executes StoredProc.Administration.EmailTemplatesCrud.
        /// Response Details: Returns the scalar integer result from the stored procedure (the template id, or -99 for a duplicate code).
        /// </remarks>
        /// <param name="input">Input DTO containing template fields.</param>
        /// <param name="updatedBy">Logged-in user identifier performing the save.</param>
        /// <returns>Scalar result of the save stored procedure.</returns>
        Task<int> SaveEmailTemplateAsync(EmailTemplateInput input, long? updatedBy);

        #endregion POST Methods
    }
}
