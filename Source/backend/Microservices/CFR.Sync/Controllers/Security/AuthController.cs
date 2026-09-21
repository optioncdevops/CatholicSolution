// Copyright (c) OptionC. All rights reserved.

namespace CFR.Sync.Controllers.Security
{
    /// <summary>
    /// Login endpoint that exchanges a product's registered ClientId/ClientSecret for a JWT.
    /// That token is the only credential every other CFR.Sync endpoint accepts.
    /// Service Responsibility:
    /// - IAuthService validates the credential and issues the token, returning MSResultArgs.
    /// </summary>
    [ApiExplorerSettings(GroupName = SwaggerModuleDoc.SyncUserSync)]
    public class AuthController(IAuthService service): BaseController
    {
        #region POST Methods

        /// <summary>
        /// Exchanges a ClientId/ClientSecret for a bearer JWT.
        /// </summary>
        /// <remarks>
        /// Purpose: Let a product log in once and reuse the token for every other call.
        /// Request Flow: Client API POST -> AuthController.Login() -> IAuthService.LoginAsync() -> Database.
        /// Validation Details: Handled inside the service layer.
        /// Business Logic: None at the controller level; delegates to the service layer.
        /// Service Interaction: Calls service.LoginAsync().
        /// Response Details: Standard API result enclosing the access token, or a 401 UNAUTHENTICATED error.
        /// </remarks>
        /// <param name="input">The ClientId/ClientSecret to validate.</param>
        /// <returns>A consistent API response containing the access token.</returns>
        /// <response code="200">Successfully authenticated.</response>
        /// <response code="401">ClientId/ClientSecret did not match a registered, active ApiClient.</response>
        [HttpPost]
        [AllowAnonymous]
        [ActionName(API_SyncAuth.Login)]
        public async Task<IActionResult> Login([FromBody] AuthLoginInput input)
        {
            ArgumentNullException.ThrowIfNull(input);

            return ApiResultArgs(await service.LoginAsync(input), APIHttpType.HttpPost);
        }

        #endregion POST Methods
    }
}
