// Copyright (c) OptionC. All rights reserved.

namespace CFR.Acutis.Controllers.AcutisAuthentication
{
    /// <summary>
    /// API controller for Acutis forgot/reset password.
    /// Handles issuing password reset emails and completing a reset with a token.
    /// Service Responsibility:
    /// - IAcutisPasswordService validates input, manages reset tokens, and returns ResultArgs.
    /// </summary>
    [ApiExplorerSettings(GroupName = SwaggerModuleDoc.CFRAcutisAuthentication)]
    public class AcutisPasswordController(IAcutisPasswordService service): BaseController
    {
        #region POST Methods

        /// <summary>
        /// Requests a password reset email for an Acutis account.
        /// </summary>
        /// <remarks>
        /// Purpose: Issue a time-limited reset token and email the reset link to the account owner.
        /// Request Flow: Client API POST -> AcutisPasswordController.ForgotPassword() -> IAcutisPasswordService.ForgotPasswordAsync() -> Database.
        /// Validation Details: Model binding maps ForgotPasswordInput from the request body.
        /// Business Logic: None at the controller level; delegates to the service layer.
        /// Service Interaction: Calls IAcutisPasswordService.ForgotPasswordAsync().
        /// Response Details: Standard API result with an identical generic success message whether or not an account matches the email — see AcutisPasswordService.ForgotPasswordAsync for why this deliberately never reveals account existence.
        /// </remarks>
        /// <param name="input">Input DTO containing the account email address.</param>
        /// <returns>An API response confirming the request was processed.</returns>
        /// <response code="200">Always returned for a well-formed request, regardless of whether the account exists.</response>
        /// <response code="400">Invalid request.</response>
        /// <response code="429">Too many requests from this client — rate-limited.</response>
        /// <response code="500">Internal server error occurred.</response>
        [AllowAnonymous]
        [EnableRateLimiting("auth-sensitive")]
        [HttpPost]
        [ActionName(API_Acutis.AcutisAuthentication.ForgotPassword)]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordInput input)
        {
            return ApiResultArgs(await service.ForgotPasswordAsync(input), APIHttpType.HttpPost);
        }

        #endregion POST Methods

        #region PUT Methods

        /// <summary>
        /// Completes a password reset using a previously issued token.
        /// </summary>
        /// <remarks>
        /// Purpose: Validate the reset token and set a new password.
        /// Request Flow: Client API PUT -> AcutisPasswordController.ResetPassword() -> IAcutisPasswordService.ResetPasswordAsync() -> Database.
        /// Validation Details: Model binding maps ResetPasswordInput from the request body.
        /// Business Logic: None at the controller level; delegates to the service layer.
        /// Service Interaction: Calls IAcutisPasswordService.ResetPasswordAsync().
        /// Response Details: Standard API result indicating success, or a bad request when the token is invalid or expired.
        /// </remarks>
        /// <param name="input">Input DTO containing the reset token and new password.</param>
        /// <returns>Result of the reset operation.</returns>
        /// <response code="200">Successfully reset the password.</response>
        /// <response code="400">The token is invalid or expired, or the passwords do not meet the rules.</response>
        /// <response code="500">Internal server error occurred.</response>
        [AllowAnonymous]
        [EnableRateLimiting("auth-sensitive")]
        [HttpPut]
        [ActionName(API_Acutis.AcutisAuthentication.ResetPassword)]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordInput input)
        {
            return ApiResultArgs(await service.ResetPasswordAsync(input), APIHttpType.HttpPut);
        }

        #endregion PUT Methods

        #region GET Methods

        /// <summary>
        /// Checks a reset token's validity and returns which account it belongs to.
        /// </summary>
        /// <remarks>
        /// Purpose: Let the Reset Password page confirm/display the account being reset, and reject
        /// an already-used/expired link immediately, before the visitor submits a new password.
        /// Request Flow: Client API GET -> AcutisPasswordController.ValidateResetToken() -> IAcutisPasswordService.ValidateResetTokenAsync() -> Database.
        /// Validation Details: Token is required as a query parameter.
        /// Business Logic: None at the controller level; delegates to the service layer.
        /// Service Interaction: Calls IAcutisPasswordService.ValidateResetTokenAsync().
        /// Response Details: Standard API result containing the account's email/first name, or a bad request with a specific already-used/expired/invalid message.
        /// </remarks>
        /// <param name="token">Raw reset token from the reset link.</param>
        /// <returns>Result of the token check.</returns>
        /// <response code="200">The token is valid; result contains the account's email/first name.</response>
        /// <response code="400">The token is missing, invalid, already used, or expired.</response>
        /// <response code="500">Internal server error occurred.</response>
        [AllowAnonymous]
        [EnableRateLimiting("auth-sensitive")]
        [HttpGet]
        [ActionName(API_Acutis.AcutisAuthentication.ValidateResetToken)]
        public async Task<IActionResult> ValidateResetToken([FromQuery]    string token)
        {
            return ApiResultArgs(await service.ValidateResetTokenAsync(token), APIHttpType.HttpGet);
        }

        #endregion GET Methods
    }
}
