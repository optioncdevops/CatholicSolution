// Copyright (c) OptionC. All rights reserved.

namespace CFR.Acutis.Controllers.AcutisAuthentication
{
    /// <summary>
    /// API controller for handling Acutis Authentication.
    /// Handles user login, privilege loading, and JWT issuance.
    /// Service Responsibility:
    /// - IAcutisAuthenticationService validates credentials, retrieves user profiles/privileges, and returns ResultArgs.
    /// </summary>
    [ApiExplorerSettings(GroupName = SwaggerModuleDoc.CFRAcutisAuthentication)]
    public class AcutisLoginController(IAcutisAuthenticationService service): BaseController
    {
        #region POST Methods

        /// <summary>
        /// Authenticates an Acutis user.
        /// </summary>
        /// <remarks>
        /// Purpose: Authenticate user credentials and return the user profile with permissions and menu structures.
        /// Request Flow: Client API POST -> AcutisLoginController.LoginAuthentication() -> IAcutisAuthenticationService.LoginAuthenticationAsync() -> Database.
        /// Validation Details: Model binding maps AcutisAuthenticationInput from the request body.
        /// Business Logic: None at the controller level; delegates to the service layer.
        /// Service Interaction: Calls IAcutisAuthenticationService.LoginAuthenticationAsync().
        /// Response Details: Standard API result envelope enclosing the authenticated user profile and menu structure.
        /// </remarks>
        /// <param name="request">Authentication request containing credentials.</param>
        /// <returns>Authentication result wrapper with token details.</returns>
        /// <response code="200">Successfully authenticated.</response>
        /// <response code="401">Invalid email or password.</response>
        /// <response code="500">Internal server error occurred.</response>
        [AllowAnonymous]
        [HttpPost]
        [ActionName(API_Acutis.AcutisAuthentication.LoginAuthentication)]
        public async Task<IActionResult> LoginAuthentication([FromBody] AcutisAuthenticationInput request)
        {
            return ApiResultArgs(await service.LoginAuthenticationAsync(request), APIHttpType.HttpPost);
        }

        #endregion POST Methods
    }
}
