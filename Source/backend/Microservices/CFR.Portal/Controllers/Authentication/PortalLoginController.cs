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

        /// <summary>
        /// Exchanges a verified Auth0 access token for a CFR Portal session JWT.
        /// </summary>
        /// <remarks>
        /// Purpose: Let a CFR frontend already authenticated via Auth0 obtain a Portal
        /// JWT that CFR.Portal's own [Authorize] endpoints will actually accept.
        /// Request Flow: Client API POST -> PortalLoginController.ExchangeAuth0Token() -> IPortalAuthenticationService.ExchangeAuth0TokenAsync() -> Auth0 /userinfo -> Database.
        /// Validation Details: Model binding maps Auth0ExchangeInput from the request body.
        /// Business Logic: None at the controller level; delegates to the service layer.
        /// Service Interaction: Calls IPortalAuthenticationService.ExchangeAuth0TokenAsync().
        /// Response Details: Standard API result envelope enclosing the authenticated member profile.
        /// </remarks>
        /// <param name="request">Exchange request containing the Auth0 access token.</param>
        /// <returns>Authentication result wrapper with token details.</returns>
        /// <response code="200">Successfully exchanged the token.</response>
        /// <response code="401">The Auth0 token is invalid, or no CFR account matches its identity.</response>
        /// <response code="500">Internal server error occurred.</response>
        [AllowAnonymous]
        [HttpPost]
        [ActionName(API_Portal.Authentication.ExchangeAuth0Token)]
        public async Task<IActionResult> ExchangeAuth0Token([FromBody] Auth0ExchangeInput request)
        {
            return ApiResultArgs(await service.ExchangeAuth0TokenAsync(request), APIHttpType.HttpPost);
        }

        #endregion POST Methods
    }
}
