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

        #endregion GET Methods

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
