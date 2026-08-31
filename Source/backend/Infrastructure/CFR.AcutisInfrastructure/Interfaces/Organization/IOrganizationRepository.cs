// Copyright (c) OptionC. All rights reserved.

namespace CFR.AcutisInfrastructure.Interfaces.Organization
{
    /// <summary>
    /// Repository interface for Organization database operations.
    /// Repository Responsibility:
    /// - Declares SELECT and UPDATE operations against SQL Server via Dapper stored procedures.
    /// </summary>
    public interface IOrganizationRepository
    {
        #region GET Methods

        /// <summary>
        /// Retrieves all organizations.
        /// </summary>
        /// <remarks>
        /// Purpose: Fetch the list of organizations for the admin directory.
        /// Request Flow: IOrganizationService -> IOrganizationRepository.GetOrganizationsListAsync() -> SQL Database.
        /// Validation Details: None.
        /// Business Logic: Directly retrieves rows without manipulation.
        /// Repository Interaction: Executes StoredProc.Organization.OrganizationCrud with ActionId 1.
        /// Response Details: Returns a list of OrganizationOutput records.
        /// </remarks>
        /// <returns>A list of organization output records.</returns>
        Task<List<OrganizationOutput>> GetOrganizationsListAsync();

        /// <summary>
        /// Retrieves one organization by identifier.
        /// </summary>
        /// <remarks>
        /// Purpose: Fetch an organization for the edit form.
        /// Request Flow: IOrganizationService -> IOrganizationRepository.GetOrganizationByIdAsync() -> SQL Database.
        /// Validation Details: OrgId parameter mapping.
        /// Business Logic: Directly retrieves the row without manipulation.
        /// Repository Interaction: Executes StoredProc.Organization.OrganizationCrud with ActionId 2.
        /// Response Details: Returns an OrganizationOutput record, or null when not found.
        /// </remarks>
        /// <param name="orgId">Organization identifier.</param>
        /// <returns>The matching organization, or null when not found.</returns>
        Task<OrganizationOutput?> GetOrganizationByIdAsync(long orgId);

        #endregion GET Methods

        #region PUT Methods

        /// <summary>
        /// Updates an organization's name, status, and contact email.
        /// </summary>
        /// <remarks>
        /// Purpose: Save changes to an organization's core identity fields.
        /// Request Flow: IOrganizationService -> IOrganizationRepository.UpdateOrganizationAsync() -> SQL Database.
        /// Validation Details: Parameter names match stored procedure arguments.
        /// Business Logic: Executes StoredProc.Organization.OrganizationCrud with ActionId 3.
        /// Repository Interaction: Executes StoredProc.Organization.OrganizationCrud.
        /// Response Details: Returns the scalar integer result from the stored procedure (the org id, or -99 when not found).
        /// </remarks>
        /// <param name="input">Input DTO containing the organization fields.</param>
        /// <param name="updatedBy">Logged-in user identifier performing the update.</param>
        /// <returns>Scalar result of the update stored procedure.</returns>
        Task<int> UpdateOrganizationAsync(UpdateOrganizationInput input, long? updatedBy);

        #endregion PUT Methods
    }
}
