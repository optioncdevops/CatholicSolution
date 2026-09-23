// Copyright (c) OptionC. All rights reserved.

namespace CFR.Portal.Controllers.PlatformLaunch
{
    /// <summary>
    /// API controller for App Hub platform-launch code exchange.
    /// Service Responsibility:
    /// - IPlatformLaunchService validates and consumes a one-time code, issuing a normal Portal session JWT.
    /// </summary>
    [ApiExplorerSettings(GroupName = SwaggerModuleDoc.PortalPlatformLaunch)]
    public class PlatformLaunchController(IPlatformLaunchService service): BaseController
    {
        #region POST Methods

        /// <summary>
        /// Exchanges a one-time platform-launch code for a Portal session.
        /// </summary>
        /// <remarks>
        /// Purpose: Let a browser that arrived with a code (minted server-to-server by a trusted
        /// caller, e.g. CFR.DataSync on behalf of a linked SMS session) land on the App Hub
        /// already signed in, without re-entering credentials.
        /// Request Flow: Client API POST -> PlatformLaunchController.ExchangeToken() -> IPlatformLaunchService.ExchangeTokenAsync() -> Database.
        /// Validation Details: Model binding maps PlatformLaunchExchangeInput from the request body.
        /// Business Logic: None at the controller level; delegates to the service layer.
        /// Service Interaction: Calls IPlatformLaunchService.ExchangeTokenAsync().
        /// Response Details: Standard API result enclosing the same {user} shape as normal Portal login.
        /// </remarks>
        /// <param name="input">Exchange request containing the one-time code.</param>
        /// <returns>Portal session payload.</returns>
        /// <response code="200">Successfully exchanged the platform-launch code.</response>
        /// <response code="401">The code is invalid, expired, or already used.</response>
        /// <response code="500">Internal server error occurred.</response>
        [AllowAnonymous]
        [HttpPost]
        [ActionName(API_Portal.PlatformLaunch.ExchangeToken)]
        public async Task<IActionResult> ExchangeToken([FromBody] PlatformLaunchExchangeInput input)
        {
            return ApiResultArgs(await service.ExchangeTokenAsync(input), APIHttpType.HttpPost);
        }

        #endregion POST Methods
    }
}
