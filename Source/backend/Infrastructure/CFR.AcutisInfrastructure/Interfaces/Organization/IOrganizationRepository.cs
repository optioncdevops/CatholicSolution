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

        /// <summary>
        /// Retrieves the real users linked to an organization.
        /// </summary>
        /// <remarks>
        /// Purpose: Populate the Users section of the organization detail page.
        /// Request Flow: IOrganizationService -> IOrganizationRepository.GetOrganizationUsersAsync() -> SQL Database.
        /// Validation Details: OrgId parameter mapping.
        /// Business Logic: Joins auth.OrganizationUser to auth.AuthUser; directly retrieves rows without manipulation.
        /// Repository Interaction: Executes StoredProc.Organization.OrganizationCrud with ActionId 5.
        /// Response Details: Returns a list of OrganizationUserOutput records.
        /// </remarks>
        /// <param name="orgId">Organization identifier.</param>
        /// <returns>A list of users linked to the organization.</returns>
        Task<List<OrganizationUserOutput>> GetOrganizationUsersAsync(long orgId);

        /// <summary>
        /// Retrieves the real products assigned to an organization.
        /// </summary>
        /// <remarks>
        /// Purpose: Populate the Products section of the organization detail page.
        /// Request Flow: IOrganizationService -> IOrganizationRepository.GetOrganizationProductsAsync() -> SQL Database.
        /// Validation Details: OrgId parameter mapping.
        /// Business Logic: Joins lic.OrganizationProduct to core.Product; directly retrieves rows without manipulation.
        /// Repository Interaction: Executes StoredProc.Organization.OrganizationCrud with ActionId 6.
        /// Response Details: Returns a list of OrganizationProductOutput records.
        /// </remarks>
        /// <param name="orgId">Organization identifier.</param>
        /// <returns>A list of products assigned to the organization.</returns>
        Task<List<OrganizationProductOutput>> GetOrganizationProductsAsync(long orgId);

        /// <summary>
        /// Retrieves the products not yet assigned to an organization.
        /// </summary>
        /// <remarks>
        /// Purpose: Populate the assign-product dropdown on the Products tab.
        /// Request Flow: IOrganizationService -> IOrganizationRepository.GetAssignableProductsAsync() -> SQL Database.
        /// Validation Details: OrgId parameter mapping.
        /// Business Logic: Directly retrieves rows without manipulation.
        /// Repository Interaction: Executes StoredProc.Organization.OrganizationCrud with ActionId 7.
        /// Response Details: Returns a list of ProductLookupOutput records.
        /// </remarks>
        /// <param name="orgId">Organization identifier.</param>
        /// <returns>A list of products not yet assigned to the organization.</returns>
        Task<List<ProductLookupOutput>> GetAssignableProductsAsync(long orgId);

        /// <summary>
        /// Retrieves the real licenses issued against an organization's assigned products.
        /// </summary>
        /// <remarks>
        /// Purpose: Populate the Licenses section of the organization detail page.
        /// Request Flow: IOrganizationService -> IOrganizationRepository.GetOrganizationLicensesAsync() -> SQL Database.
        /// Validation Details: OrgId parameter mapping.
        /// Business Logic: Joins lic.License to lic.OrganizationProduct and core.Product; directly retrieves rows without manipulation.
        /// Repository Interaction: Executes StoredProc.Organization.OrganizationCrud with ActionId 10.
        /// Response Details: Returns a list of OrganizationLicenseOutput records.
        /// </remarks>
        /// <param name="orgId">Organization identifier.</param>
        /// <returns>A list of licenses issued against the organization's products.</returns>
        Task<List<OrganizationLicenseOutput>> GetOrganizationLicensesAsync(long orgId);

        #endregion GET Methods

        #region POST Methods

        /// <summary>
        /// Creates a new organization.
        /// </summary>
        /// <remarks>
        /// Purpose: Add a new organization from the Add Organization page.
        /// Request Flow: IOrganizationService -> IOrganizationRepository.CreateOrganizationAsync() -> SQL Database.
        /// Validation Details: Parameter names match stored procedure arguments.
        /// Business Logic: Executes StoredProc.Organization.OrganizationCrud with ActionId 4; SQL assigns the next OrgId (not an IDENTITY column).
        /// Repository Interaction: Executes StoredProc.Organization.OrganizationCrud.
        /// Response Details: Returns the scalar integer result from the stored procedure (the new org id).
        /// </remarks>
        /// <param name="input">Input DTO containing the new organization's fields.</param>
        /// <param name="insertedBy">Logged-in user identifier creating the organization.</param>
        /// <returns>Scalar result of the create stored procedure.</returns>
        Task<int> CreateOrganizationAsync(CreateOrganizationInput input, long? insertedBy);

        /// <summary>
        /// Assigns a product to an organization.
        /// </summary>
        /// <remarks>
        /// Purpose: Give an organization access to a product from the Products tab.
        /// Request Flow: IOrganizationService -> IOrganizationRepository.AssignOrganizationProductAsync() -> SQL Database.
        /// Validation Details: Parameter names match stored procedure arguments.
        /// Business Logic: Executes StoredProc.Organization.OrganizationCrud with ActionId 8.
        /// Repository Interaction: Executes StoredProc.Organization.OrganizationCrud.
        /// Response Details: Returns the scalar integer result (the product id, or -98 when already assigned).
        /// </remarks>
        /// <param name="input">Input DTO containing the organization and product identifiers.</param>
        /// <param name="updatedBy">Logged-in user identifier performing the assignment.</param>
        /// <returns>Scalar result of the assign stored procedure.</returns>
        Task<int> AssignOrganizationProductAsync(AssignOrganizationProductInput input, long? updatedBy);

        #endregion POST Methods

        #region DELETE Methods

        /// <summary>
        /// Removes a product assignment from an organization.
        /// </summary>
        /// <remarks>
        /// Purpose: Revoke an organization's access to a product from the Products tab.
        /// Request Flow: IOrganizationService -> IOrganizationRepository.RemoveOrganizationProductAsync() -> SQL Database.
        /// Validation Details: Parameter names match stored procedure arguments.
        /// Business Logic: Executes StoredProc.Organization.OrganizationCrud with ActionId 9.
        /// Repository Interaction: Executes StoredProc.Organization.OrganizationCrud.
        /// Response Details: Returns the scalar integer result (the product id, or -99 when not assigned).
        /// </remarks>
        /// <param name="orgId">Organization identifier.</param>
        /// <param name="productId">Product identifier to remove.</param>
        /// <param name="updatedBy">Logged-in user identifier performing the removal.</param>
        /// <returns>Scalar result of the remove stored procedure.</returns>
        Task<int> RemoveOrganizationProductAsync(long orgId, int productId, long? updatedBy);

        #endregion DELETE Methods

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
