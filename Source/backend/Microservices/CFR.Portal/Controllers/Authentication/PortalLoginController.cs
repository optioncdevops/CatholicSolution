// Copyright (c) OptionC. All rights reserved.

namespace CFR.Portal.Controllers.Authentication
{
    /// <summary>
    /// API controller for handling Portal member authentication.
    /// Handles user login and JWT issuance.
    /// Service Responsibility:
    /// - IPortalAuthenticationService validates credentials and returns ResultArgs.
    /// </summary>
    [ApiExplorerSettings(GroupName = SwaggerModuleDoc.PortalAuthentication)]
    public class PortalLoginController(IPortalAuthenticationService service): BaseController
    {
        #region POST Methods

        /// <summary>
        /// Authenticates a CFR Portal member.
        /// </summary>
        /// <remarks>
        /// Purpose: Authenticate member credentials and return a session JWT.
        /// Request Flow: Client API POST -> PortalLoginController.LoginAuthentication() -> IPortalAuthenticationService.LoginAuthenticationAsync() -> Database.
        /// Validation Details: Model binding maps PortalAuthenticationInput from the request body.
        /// Business Logic: None at the controller level; delegates to the service layer.
        /// Service Interaction: Calls IPortalAuthenticationService.LoginAuthenticationAsync().
        /// Response Details: Standard API result envelope enclosing the authenticated member profile.
        /// </remarks>
        /// <param name="request">Authentication request containing credentials.</param>
        /// <returns>Authentication result wrapper with token details.</returns>
        /// <response code="200">Successfully authenticated.</response>
        /// <response code="401">Invalid email or password.</response>
        /// <response code="500">Internal server error occurred.</response>
        [AllowAnonymous]
        [HttpPost]
        [ActionName(API_Portal.Authentication.LoginAuthentication)]
        public async Task<IActionResult> LoginAuthentication([FromBody] PortalAuthenticationInput request)
        {
            return ApiResultArgs(await service.LoginAuthenticationAsync(request), APIHttpType.HttpPost);
        }

        #endregion POST Methods
    }
}
