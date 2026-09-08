// Copyright (c) OptionC. All rights reserved.

namespace CFR.PortalInfrastructure.Repositorys.Administration
{
    /// <summary>
    /// Dapper implementation of IEmailTemplatesRepository for the Administration module.
    /// Infrastructure Responsibility:
    /// - Uses IDapperHandler to execute stored procedures and map results to EmailTemplateOutput.
    /// </summary>
    public class EmailTemplatesRepository(IDapperHandler dapperHandler): IEmailTemplatesRepository
    {
        #region GET Methods

        /// <summary>
        /// Fetches all email templates using StoredProc.Administration.EmailTemplatesCrud.
        /// </summary>
        /// <remarks>
        /// Purpose: Retrieve all email templates from the database.
        /// Request Flow: IEmailTemplatesService -> EmailTemplatesRepository.GetEmailTemplatesListAsync() -> Database.
        /// Validation Details: None.
        /// Business Logic: Maps stored procedure rows to EmailTemplateOutput.
        /// Repository Interaction: Executes StoredProc.Administration.EmailTemplatesCrud with ActionId 3.
        /// Response Details: Returns a list of email template output records.
        /// </remarks>
        /// <returns>A list of email template output records.</returns>
        public async Task<List<EmailTemplateOutput>> GetEmailTemplatesListAsync()
        {
            var parameters = new DynamicParameters();
            parameters.Add(DBParameterName.EmailTemplateParams.ActionId, 3, DbType.Int32);
            var result = await dapperHandler.QueryAsync<EmailTemplateOutput>(StoredProc.Administration.EmailTemplatesCrud, parameters, CommandType.StoredProcedure);
            return result.ToList();
        }

        /// <summary>
        /// Fetches one email template using StoredProc.Administration.EmailTemplatesCrud.
        /// </summary>
        /// <remarks>
        /// Purpose: Retrieve a single email template from the database.
        /// Request Flow: IEmailTemplatesService -> EmailTemplatesRepository.GetEmailTemplateByIdAsync() -> Database.
        /// Validation Details: TemplateId parameter mapping.
        /// Business Logic: Maps the stored procedure row to EmailTemplateOutput.
        /// Repository Interaction: Executes StoredProc.Administration.EmailTemplatesCrud with ActionId 2.
        /// Response Details: Returns an EmailTemplateOutput record, or null when not found.
        /// </remarks>
        /// <param name="templateId">Template identifier.</param>
        /// <returns>The matching template, or null when not found.</returns>
        public async Task<EmailTemplateOutput?> GetEmailTemplateByIdAsync(int templateId)
        {
            var parameters = new DynamicParameters();
            parameters.Add(DBParameterName.EmailTemplateParams.ActionId, 2, DbType.Int32);
            parameters.Add(DBParameterName.EmailTemplateParams.TemplateId, templateId, DbType.Int32);
            var result = await dapperHandler.QueryAsync<EmailTemplateOutput>(StoredProc.Administration.EmailTemplatesCrud, parameters, CommandType.StoredProcedure);
            return result.FirstOrDefault();
        }

        /// <summary>
        /// Fetches one active email template by code using StoredProc.Administration.EmailTemplatesCrud.
        /// </summary>
        /// <remarks>
        /// Purpose: Load the current content for a system-triggered email at send time.
        /// Request Flow: AcutisPasswordService -> EmailTemplatesRepository.GetEmailTemplateByCodeAsync() -> Database.
        /// Validation Details: TemplateCode parameter mapping.
        /// Business Logic: Maps the stored procedure row to EmailTemplateOutput.
        /// Repository Interaction: Executes StoredProc.Administration.EmailTemplatesCrud with ActionId 4.
        /// Response Details: Returns an EmailTemplateOutput record, or null when not found or inactive.
        /// </remarks>
        /// <param name="templateCode">Stable template code.</param>
        /// <returns>The matching active template, or null when not found.</returns>
        public async Task<EmailTemplateOutput?> GetEmailTemplateByCodeAsync(string templateCode)
        {
            var parameters = new DynamicParameters();
            parameters.Add(DBParameterName.EmailTemplateParams.ActionId, 4, DbType.Int32);
            parameters.Add(DBParameterName.EmailTemplateParams.TemplateCode, templateCode, DbType.String);
            var result = await dapperHandler.QueryAsync<EmailTemplateOutput>(StoredProc.Administration.EmailTemplatesCrud, parameters, CommandType.StoredProcedure);
            return result.FirstOrDefault();
        }

        #endregion GET Methods

        #region POST Methods

        /// <summary>
        /// Adds or updates an email template using StoredProc.Administration.EmailTemplatesCrud.
        /// </summary>
        /// <remarks>
        /// Purpose: Insert or update a template's subject/body/status.
        /// Request Flow: IEmailTemplatesService -> EmailTemplatesRepository.SaveEmailTemplateAsync() -> Database.
        /// Validation Details: Parameter names match stored procedure arguments.
        /// Business Logic: Binds EmailTemplateInput to DynamicParameters and executes the CRUD stored procedure.
        /// Repository Interaction: Executes StoredProc.Administration.EmailTemplatesCrud with ActionId 1.
        /// Response Details: Returns the scalar integer result from the stored procedure.
        /// </remarks>
        /// <param name="input">Input DTO containing template fields.</param>
        /// <param name="updatedBy">Logged-in user identifier performing the save.</param>
        /// <returns>Scalar result of the save stored procedure.</returns>
        public async Task<int> SaveEmailTemplateAsync(EmailTemplateInput input, long? updatedBy)
        {
            ArgumentNullException.ThrowIfNull(input);
            var parameters = new DynamicParameters();
            parameters.Add(DBParameterName.EmailTemplateParams.ActionId, 1, DbType.Int32);
            parameters.Add(DBParameterName.EmailTemplateParams.TemplateId, input.TemplateId, DbType.Int32);
            parameters.Add(DBParameterName.EmailTemplateParams.TemplateCode, input.TemplateCode, DbType.String);
            parameters.Add(DBParameterName.EmailTemplateParams.Subject, input.Subject, DbType.String);
            parameters.Add(DBParameterName.EmailTemplateParams.Body, input.Body, DbType.String);
            parameters.Add(DBParameterName.EmailTemplateParams.Status, input.Status, DbType.String);
            parameters.Add(DBParameterName.EmailTemplateParams.AccentColor, input.AccentColor, DbType.String);
            parameters.Add(DBParameterName.EmailTemplateParams.LogoUrl, input.LogoUrl, DbType.String);
            parameters.Add(DBParameterName.EmailTemplateParams.FontFamily, input.FontFamily, DbType.String);
            parameters.Add(DBParameterName.EmailTemplateParams.BaseFontSize, input.BaseFontSize, DbType.Int32);
            parameters.Add(DBParameterName.EmailTemplateParams.UpdatedBy, updatedBy, DbType.Int64);
            parameters.Add(DBParameterName.EmailTemplateParams.ReturnValue, dbType: DbType.Int32, direction: ParameterDirection.Output);
            _ = await dapperHandler.ExecuteAsync(StoredProc.Administration.EmailTemplatesCrud, parameters, CommandType.StoredProcedure);
            return parameters.Get<int>(DBParameterName.EmailTemplateParams.ReturnValue);
        }

        #endregion POST Methods
    }
}
