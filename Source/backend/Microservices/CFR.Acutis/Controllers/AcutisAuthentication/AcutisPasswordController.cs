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
        /// Response Details: Standard API result confirming the email was sent, or a not-found result when no account matches the email.
        /// </remarks>
        /// <param name="input">Input DTO containing the account email address.</param>
        /// <returns>An API response confirming the request was processed.</returns>
        /// <response code="200">Reset instructions were sent to the account's email address.</response>
        /// <response code="400">Invalid request.</response>
        /// <response code="404">No account matches the given email address.</response>
        /// <response code="500">Internal server error occurred.</response>
        [AllowAnonymous]
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
        [HttpPut]
        [ActionName(API_Acutis.AcutisAuthentication.ResetPassword)]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordInput input)
        {
            return ApiResultArgs(await service.ResetPasswordAsync(input), APIHttpType.HttpPut);
        }

        #endregion PUT Methods
    }
}
