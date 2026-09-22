// Copyright (c) OptionC. All rights reserved.

namespace CFR.DataSync.Controllers.OrganizationSync
{
    /// <summary>
    /// API controller for the CFR.DataSync organization onboarding surface — the one deliberate way a
    /// product may create a CFR organization, distinct from the user-sync endpoints which never
    /// auto-create one as a side effect.
    /// Service Responsibility:
    /// - IOrganizationSyncService validates, applies business rules, and returns MSResultArgs.
    /// </summary>
    [ApiExplorerSettings(GroupName = SwaggerModuleDoc.SyncUserSync)]
    [Authorize]
    public class OrganizationsController(IOrganizationSyncService service): BaseController
    {
        #region POST Methods

        /// <summary>
        /// Creates or updates an organization onboarding row.
        /// </summary>
        /// <remarks>
        /// Purpose: Onboard a new organization, or refresh an already-onboarded one.
        /// Request Flow: Client API POST -> OrganizationsController.UpsertOrganization() -> IOrganizationSyncService.UpsertOrganizationAsync() -> Database.
        /// Validation Details: Handled inside the service layer, including the productId-in-body hard rule.
        /// Business Logic: None at the controller level; delegates to the service layer.
        /// Service Interaction: Calls IOrganizationSyncService.UpsertOrganizationAsync().
        /// Response Details: Standard API result enclosing OrganizationSyncOutput, or an error.
        /// </remarks>
        /// <param name="input">Input DTO containing the organization fields.</param>
        /// <returns>A consistent API response containing the onboarded organization.</returns>
        /// <response code="201">Successfully created the organization.</response>
        /// <response code="500">Internal server error occurred.</response>
        [HttpPost]
        [ActionName(API_OrganizationSync.UpsertOrganization)]
        public async Task<IActionResult> UpsertOrganization([FromBody] OrganizationSyncInput input)
        {
            return ApiResultArgs(await service.UpsertOrganizationAsync(input, HttpContext.TraceIdentifier), APIHttpType.HttpPost);
        }

        #endregion POST Methods

        #region GET Methods

        /// <summary>
        /// Reads back an onboarded organization.
        /// </summary>
        /// <remarks>
        /// Purpose: Let a product confirm the current CFR organization for its own org id.
        /// Request Flow: Client API GET -> OrganizationsController.GetOrganization() -> IOrganizationSyncService.GetOrganizationAsync() -> Database.
        /// Validation Details: productOrgId is required.
        /// Business Logic: None at the controller level; delegates to the service layer.
        /// Service Interaction: Calls IOrganizationSyncService.GetOrganizationAsync().
        /// Response Details: Standard API result enclosing OrganizationSyncOutput, or NotFound.
        /// </remarks>
        /// <param name="productOrgId">The product's own organization identifier.</param>
        /// <returns>A consistent API response containing the organization.</returns>
        /// <response code="200">Successfully fetched the organization.</response>
        /// <response code="500">Internal server error occurred.</response>
        [HttpGet]
        [ActionName(API_OrganizationSync.GetOrganization)]
        public async Task<IActionResult> GetOrganization(int productOrgId)
        {
            return ApiResultArgs(await service.GetOrganizationAsync(productOrgId, HttpContext.TraceIdentifier), APIHttpType.HttpGet);
        }

        #endregion GET Methods
    }
}
