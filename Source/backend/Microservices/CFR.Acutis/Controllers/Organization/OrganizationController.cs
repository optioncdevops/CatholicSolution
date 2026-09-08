// Copyright (c) OptionC. All rights reserved.

namespace CFR.Acutis.Controllers.Organization
{
    /// <summary>
    /// API controller for viewing and managing organizations.
    /// Handles listing, fetching, and updating organization identity fields.
    /// Service Responsibility:
    /// - IOrganizationService retrieves data, applies validation, and returns ResultArgs.
    /// </summary>
    [Authorize]
    [ApiExplorerSettings(GroupName = SwaggerModuleDoc.CFRAcutisOrganization)]
    public class OrganizationController(IOrganizationService service): BaseController
    {
        #region GET Methods

        /// <summary>
        /// Retrieves the list of all organizations.
        /// </summary>
        /// <remarks>
        /// Purpose: Fetch organizations for the admin directory.
        /// Request Flow: Client API GET -> OrganizationController.GetOrganizations() -> IOrganizationService.GetOrganizationsListAsync() -> Database.
        /// Validation Details: Handled inside the service layer.
        /// Business Logic: None at the controller level; delegates to the service layer.
        /// Service Interaction: Calls IOrganizationService.GetOrganizationsListAsync().
        /// Response Details: Standard API result enclosing List of OrganizationOutput with status 200 or 500.
        /// </remarks>
        /// <returns>A consistent API response containing the organizations dataset.</returns>
        /// <response code="200">Successfully fetched organizations list.</response>
        /// <response code="500">Internal server error occurred.</response>
        [HttpGet]
        [ActionName(API_Organization.GetOrganizations)]
        public async Task<IActionResult> GetOrganizations()
        {
            return ApiResultArgs(await service.GetOrganizationsListAsync(), APIHttpType.HttpGet);
        }

        /// <summary>
        /// Retrieves one organization by identifier.
        /// </summary>
        /// <remarks>
        /// Purpose: Fetch an organization for the edit form.
        /// Request Flow: Client API GET -> OrganizationController.GetOrganizationById() -> IOrganizationService.GetOrganizationByIdAsync() -> Database.
        /// Validation Details: Query parameter binding maps the identifier.
        /// Business Logic: None at the controller level; delegates to the service layer.
        /// Service Interaction: Calls IOrganizationService.GetOrganizationByIdAsync().
        /// Response Details: Standard API result enclosing OrganizationOutput with status 200, 204, or 500.
        /// </remarks>
        /// <param name="orgId">Organization identifier.</param>
        /// <returns>A consistent API response containing the organization.</returns>
        /// <response code="200">Successfully fetched the organization.</response>
        /// <response code="500">Internal server error occurred.</response>
        [HttpGet]
        [ActionName(API_Organization.GetOrganizationById)]
        public async Task<IActionResult> GetOrganizationById(long orgId)
        {
            return ApiResultArgs(await service.GetOrganizationByIdAsync(orgId), APIHttpType.HttpGet);
        }

        /// <summary>
        /// Retrieves the real users linked to an organization.
        /// </summary>
        /// <remarks>
        /// Purpose: Populate the Users section of the organization detail page.
        /// Request Flow: Client API GET -> OrganizationController.GetOrganizationUsers() -> IOrganizationService.GetOrganizationUsersAsync() -> Database.
        /// Validation Details: Query parameter binding maps the identifier.
        /// Business Logic: None at the controller level; delegates to the service layer.
        /// Service Interaction: Calls IOrganizationService.GetOrganizationUsersAsync().
        /// Response Details: Standard API result enclosing List of OrganizationUserOutput with status 200 or 500.
        /// </remarks>
        /// <param name="orgId">Organization identifier.</param>
        /// <returns>A consistent API response containing the linked users.</returns>
        /// <response code="200">Successfully fetched the organization's users.</response>
        /// <response code="500">Internal server error occurred.</response>
        [HttpGet]
        [ActionName(API_Organization.GetOrganizationUsers)]
        public async Task<IActionResult> GetOrganizationUsers(long orgId)
        {
            return ApiResultArgs(await service.GetOrganizationUsersAsync(orgId), APIHttpType.HttpGet);
        }

        /// <summary>
        /// Retrieves the real products assigned to an organization.
        /// </summary>
        /// <remarks>
        /// Purpose: Populate the Products section of the organization detail page.
        /// Request Flow: Client API GET -> OrganizationController.GetOrganizationProducts() -> IOrganizationService.GetOrganizationProductsAsync() -> Database.
        /// Validation Details: Query parameter binding maps the identifier.
        /// Business Logic: None at the controller level; delegates to the service layer.
        /// Service Interaction: Calls IOrganizationService.GetOrganizationProductsAsync().
        /// Response Details: Standard API result enclosing List of OrganizationProductOutput with status 200 or 500.
        /// </remarks>
        /// <param name="orgId">Organization identifier.</param>
        /// <returns>A consistent API response containing the assigned products.</returns>
        /// <response code="200">Successfully fetched the organization's products.</response>
        /// <response code="500">Internal server error occurred.</response>
        [HttpGet]
        [ActionName(API_Organization.GetOrganizationProducts)]
        public async Task<IActionResult> GetOrganizationProducts(long orgId)
        {
            return ApiResultArgs(await service.GetOrganizationProductsAsync(orgId), APIHttpType.HttpGet);
        }

        /// <summary>
        /// Retrieves one member's organization-membership detail plus their effective app access.
        /// </summary>
        /// <remarks>
        /// Purpose: Populate the Organization Users tab's user-detail view.
        /// Request Flow: Client API GET -> OrganizationController.GetOrganizationUserDetail() -> IOrganizationService.GetOrganizationUserDetailAsync() -> Database.
        /// Validation Details: Query parameter binding maps the identifiers.
        /// Business Logic: None at the controller level; delegates to the service layer.
        /// Service Interaction: Calls IOrganizationService.GetOrganizationUserDetailAsync().
        /// Response Details: Standard API result enclosing OrganizationUserDetailOutput with status 200, 204, or 500.
        /// </remarks>
        /// <param name="orgId">Organization identifier.</param>
        /// <param name="authUserId">Member identifier.</param>
        /// <returns>A consistent API response containing the membership detail.</returns>
        /// <response code="200">Successfully fetched the membership detail.</response>
        /// <response code="204">The member is not linked to this organization.</response>
        /// <response code="500">Internal server error occurred.</response>
        [HttpGet]
        [ActionName(API_Organization.GetOrganizationUserDetail)]
        public async Task<IActionResult> GetOrganizationUserDetail(long orgId, long authUserId)
        {
            return ApiResultArgs(await service.GetOrganizationUserDetailAsync(orgId, authUserId), APIHttpType.HttpGet);
        }

        /// <summary>
        /// Retrieves the products not yet assigned to an organization.
        /// </summary>
        /// <remarks>
        /// Purpose: Populate the assign-product dropdown on the Products tab.
        /// Request Flow: Client API GET -> OrganizationController.GetAssignableProducts() -> IOrganizationService.GetAssignableProductsAsync() -> Database.
        /// Validation Details: Query parameter binding maps the identifier.
        /// Business Logic: None at the controller level; delegates to the service layer.
        /// Service Interaction: Calls IOrganizationService.GetAssignableProductsAsync().
        /// Response Details: Standard API result enclosing List of ProductLookupOutput with status 200 or 500.
        /// </remarks>
        /// <param name="orgId">Organization identifier.</param>
        /// <returns>A consistent API response containing the assignable products.</returns>
        /// <response code="200">Successfully fetched the assignable products.</response>
        /// <response code="500">Internal server error occurred.</response>
        [HttpGet]
        [ActionName(API_Organization.GetAssignableProducts)]
        public async Task<IActionResult> GetAssignableProducts(long orgId)
        {
            return ApiResultArgs(await service.GetAssignableProductsAsync(orgId), APIHttpType.HttpGet);
        }

        /// <summary>
        /// Retrieves the real licenses issued against an organization's assigned products.
        /// </summary>
        /// <remarks>
        /// Purpose: Populate the Licenses section of the organization detail page.
        /// Request Flow: Client API GET -> OrganizationController.GetOrganizationLicenses() -> IOrganizationService.GetOrganizationLicensesAsync() -> Database.
        /// Validation Details: Query parameter binding maps the identifier.
        /// Business Logic: None at the controller level; delegates to the service layer.
        /// Service Interaction: Calls IOrganizationService.GetOrganizationLicensesAsync().
        /// Response Details: Standard API result enclosing List of OrganizationLicenseOutput with status 200 or 500.
        /// </remarks>
        /// <param name="orgId">Organization identifier.</param>
        /// <returns>A consistent API response containing the organization's licenses.</returns>
        /// <response code="200">Successfully fetched the organization's licenses.</response>
        /// <response code="500">Internal server error occurred.</response>
        [HttpGet]
        [ActionName(API_Organization.GetOrganizationLicenses)]
        public async Task<IActionResult> GetOrganizationLicenses(long orgId)
        {
            return ApiResultArgs(await service.GetOrganizationLicensesAsync(orgId), APIHttpType.HttpGet);
        }

        /// <summary>
        /// Retrieves every license issued across all organizations.
        /// </summary>
        /// <remarks>
        /// Purpose: Populate the admin dashboard's platform-wide "Licenses" KPI.
        /// Request Flow: Client API GET -> OrganizationController.GetAllLicenses() -> IOrganizationService.GetAllLicensesAsync() -> Database.
        /// Validation Details: None.
        /// Business Logic: None at the controller level; delegates to the service layer.
        /// Service Interaction: Calls IOrganizationService.GetAllLicensesAsync().
        /// Response Details: Standard API result enclosing List of LicenseSummaryOutput with status 200 or 500.
        /// </remarks>
        /// <returns>A consistent API response containing every license across all organizations.</returns>
        /// <response code="200">Successfully fetched all licenses.</response>
        /// <response code="500">Internal server error occurred.</response>
        [HttpGet]
        [ActionName(API_Organization.GetAllLicenses)]
        public async Task<IActionResult> GetAllLicenses()
        {
            return ApiResultArgs(await service.GetAllLicensesAsync(), APIHttpType.HttpGet);
        }

        #endregion GET Methods

        #region POST Methods

        /// <summary>
        /// Creates a new organization.
        /// </summary>
        /// <remarks>
        /// Purpose: Add a new organization from the Add Organization page.
        /// Request Flow: Client API POST -> OrganizationController.CreateOrganization() -> IOrganizationService.CreateOrganizationAsync() -> Database.
        /// Validation Details: Model binding maps CreateOrganizationInput from the request body.
        /// Business Logic: None at the controller level; delegates to the service layer.
        /// Service Interaction: Calls IOrganizationService.CreateOrganizationAsync().
        /// Response Details: Standard API result indicating execution status.
        /// </remarks>
        /// <param name="input">Input DTO containing the new organization's fields.</param>
        /// <returns>Result of the create operation.</returns>
        /// <response code="201">Successfully created the organization.</response>
        /// <response code="400">Invalid request.</response>
        /// <response code="500">Internal server error occurred.</response>
        [HttpPost]
        [ActionName(API_Organization.CreateOrganization)]
        public async Task<IActionResult> CreateOrganization([FromBody] CreateOrganizationInput input)
        {
            return ApiResultArgs(await service.CreateOrganizationAsync(input), APIHttpType.HttpPost);
        }

        /// <summary>
        /// Assigns a product to an organization.
        /// </summary>
        /// <remarks>
        /// Purpose: Give an organization access to a product from the Products tab.
        /// Request Flow: Client API POST -> OrganizationController.AssignOrganizationProduct() -> IOrganizationService.AssignOrganizationProductAsync() -> Database.
        /// Validation Details: Model binding maps AssignOrganizationProductInput from the request body.
        /// Business Logic: None at the controller level; delegates to the service layer.
        /// Service Interaction: Calls IOrganizationService.AssignOrganizationProductAsync().
        /// Response Details: Standard API result indicating execution status.
        /// </remarks>
        /// <param name="input">Input DTO containing the organization and product identifiers.</param>
        /// <returns>Result of the assign operation.</returns>
        /// <response code="201">Successfully assigned the product.</response>
        /// <response code="400">Invalid request.</response>
        /// <response code="409">The product is already assigned.</response>
        /// <response code="500">Internal server error occurred.</response>
        [HttpPost]
        [ActionName(API_Organization.AssignOrganizationProduct)]
        public async Task<IActionResult> AssignOrganizationProduct([FromBody] AssignOrganizationProductInput input)
        {
            return ApiResultArgs(await service.AssignOrganizationProductAsync(input), APIHttpType.HttpPost);
        }

        #endregion POST Methods

        #region DELETE Methods

        /// <summary>
        /// Removes a product assignment from an organization.
        /// </summary>
        /// <remarks>
        /// Purpose: Revoke an organization's access to a product from the Products tab.
        /// Request Flow: Client API DELETE -> OrganizationController.RemoveOrganizationProduct() -> IOrganizationService.RemoveOrganizationProductAsync() -> Database.
        /// Validation Details: Query parameter binding maps the identifiers.
        /// Business Logic: None at the controller level; delegates to the service layer.
        /// Service Interaction: Calls IOrganizationService.RemoveOrganizationProductAsync().
        /// Response Details: Standard API result indicating execution status.
        /// </remarks>
        /// <param name="orgId">Organization identifier.</param>
        /// <param name="productId">Product identifier to remove.</param>
        /// <returns>Result of the remove operation.</returns>
        /// <response code="200">Successfully removed the product.</response>
        /// <response code="204">The product was not assigned.</response>
        /// <response code="500">Internal server error occurred.</response>
        [HttpDelete]
        [ActionName(API_Organization.RemoveOrganizationProduct)]
        public async Task<IActionResult> RemoveOrganizationProduct(long orgId, int productId)
        {
            return ApiResultArgs(await service.RemoveOrganizationProductAsync(orgId, productId), APIHttpType.HttpDelete);
        }

        /// <summary>
        /// Unlinks a user from an organization.
        /// </summary>
        /// <remarks>
        /// Purpose: Remove a user from an organization from the Users tab.
        /// Request Flow: Client API DELETE -> OrganizationController.UnlinkOrganizationUser() -> IOrganizationService.UnlinkOrganizationUserAsync() -> Database.
        /// Validation Details: Query parameter binding maps the identifiers.
        /// Business Logic: None at the controller level; delegates to the service layer.
        /// Service Interaction: Calls IOrganizationService.UnlinkOrganizationUserAsync().
        /// Response Details: Standard API result indicating execution status.
        /// </remarks>
        /// <param name="orgId">Organization identifier.</param>
        /// <param name="authUserId">User identifier to unlink.</param>
        /// <returns>Result of the unlink operation.</returns>
        /// <response code="200">Successfully unlinked the user.</response>
        /// <response code="204">The user was not linked.</response>
        /// <response code="500">Internal server error occurred.</response>
        [HttpDelete]
        [ActionName(API_Organization.UnlinkOrganizationUser)]
        public async Task<IActionResult> UnlinkOrganizationUser(long orgId, long authUserId)
        {
            return ApiResultArgs(await service.UnlinkOrganizationUserAsync(orgId, authUserId), APIHttpType.HttpDelete);
        }

        #endregion DELETE Methods

        #region PUT Methods

        /// <summary>
        /// Updates an organization's name, status, and contact email.
        /// </summary>
        /// <remarks>
        /// Purpose: Save changes to an organization's core identity fields.
        /// Request Flow: Client API PUT -> OrganizationController.UpdateOrganization() -> IOrganizationService.UpdateOrganizationAsync() -> Database.
        /// Validation Details: Model binding maps UpdateOrganizationInput from the request body.
        /// Business Logic: None at the controller level; delegates to the service layer.
        /// Service Interaction: Calls IOrganizationService.UpdateOrganizationAsync().
        /// Response Details: Standard API result indicating execution status.
        /// </remarks>
        /// <param name="input">Input DTO containing the organization fields.</param>
        /// <returns>Result of the update operation.</returns>
        /// <response code="200">Successfully updated the organization.</response>
        /// <response code="500">Internal server error occurred.</response>
        [HttpPut]
        [ActionName(API_Organization.UpdateOrganization)]
        public async Task<IActionResult> UpdateOrganization([FromBody] UpdateOrganizationInput input)
        {
            return ApiResultArgs(await service.UpdateOrganizationAsync(input), APIHttpType.HttpPut);
        }

        #endregion PUT Methods
    }
}
