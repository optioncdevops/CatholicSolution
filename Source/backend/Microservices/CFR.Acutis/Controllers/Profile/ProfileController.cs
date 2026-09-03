// Copyright (c) OptionC. All rights reserved.

namespace CFR.Acutis.Controllers.Profile
{
    /// <summary>
    /// API controller for the signed-in user's own account: profile fields and password.
    /// Handles fetching, updating, and changing the password of the caller's own account only.
    /// Service Responsibility:
    /// - IProfileService resolves the signed-in user id, validates input, and returns ResultArgs.
    /// </summary>
    [Authorize]
    [ApiExplorerSettings(GroupName = SwaggerModuleDoc.CFRAcutisAdministration)]
    public class ProfileController(IProfileService service): BaseController
    {
        #region GET Methods

        /// <summary>
        /// Retrieves the signed-in user's own profile.
        /// </summary>
        /// <remarks>
        /// Purpose: Fetch profile fields for the account menu's Profile dialog.
        /// Request Flow: Client API GET -> ProfileController.GetProfile() -> IProfileService.GetProfileAsync() -> Database.
        /// Validation Details: Handled inside the service layer.
        /// Business Logic: None at the controller level; delegates to the service layer.
        /// Service Interaction: Calls IProfileService.GetProfileAsync().
        /// Response Details: Standard API result enclosing ProfileOutput with status 200, 401, or 500.
        /// </remarks>
        /// <returns>A consistent API response containing the caller's profile.</returns>
        /// <response code="200">Successfully fetched the profile.</response>
        /// <response code="401">No authenticated user is associated with this request.</response>
        /// <response code="500">Internal server error occurred.</response>
        [HttpGet]
        [ActionName(API_Profile.GetProfile)]
        public async Task<IActionResult> GetProfile()
        {
            return ApiResultArgs(await service.GetProfileAsync(), APIHttpType.HttpGet);
        }

        #endregion GET Methods

        #region PUT Methods

        /// <summary>
        /// Updates the signed-in user's own profile fields, including an optional new profile
        /// image in the same call (JPG or PNG, max 2MB) — no separate upload step.
        /// </summary>
        /// <remarks>
        /// Purpose: Save the account owner's name, email, and profile photo together.
        /// Request Flow: Client API PUT -> ProfileController.UpdateProfile() -> IProfileService.UpdateProfileAsync() -> Database (+ local file storage).
        /// Validation Details: Bound from multipart form data; a provided image must be a JPG/PNG under 2MB.
        /// Business Logic: None at the controller level; delegates to the service layer.
        /// Service Interaction: Calls IProfileService.UpdateProfileAsync().
        /// Response Details: Standard API result indicating execution status.
        /// </remarks>
        /// <param name="input">Input DTO containing the new profile fields and optional image.</param>
        /// <returns>Result of the update operation.</returns>
        /// <response code="200">Successfully updated the profile.</response>
        /// <response code="400">Invalid image file or size exceeds 2 MB.</response>
        /// <response code="409">Another account already uses this email address.</response>
        /// <response code="500">Internal server error occurred.</response>
        [HttpPut]
        [ActionName(API_Profile.UpdateProfile)]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UpdateProfile([FromForm] UpdateProfileInput input)
        {
            return ApiResultArgs(await service.UpdateProfileAsync(input), APIHttpType.HttpPut);
        }

        /// <summary>
        /// Changes the signed-in user's own password after verifying the current one.
        /// </summary>
        /// <remarks>
        /// Purpose: Let the account owner set a new password.
        /// Request Flow: Client API PUT -> ProfileController.ChangePassword() -> IProfileService.ChangePasswordAsync() -> Database.
        /// Validation Details: Model binding maps ChangePasswordInput from the request body.
        /// Business Logic: None at the controller level; delegates to the service layer.
        /// Service Interaction: Calls IProfileService.ChangePasswordAsync().
        /// Response Details: Standard API result indicating execution status.
        /// </remarks>
        /// <param name="input">Input DTO containing the current and new password.</param>
        /// <returns>Result of the change-password operation.</returns>
        /// <response code="200">Successfully changed the password.</response>
        /// <response code="400">The current password is incorrect, or the new passwords do not meet the rules.</response>
        /// <response code="500">Internal server error occurred.</response>
        [HttpPut]
        [ActionName(API_Profile.ChangePassword)]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordInput input)
        {
            return ApiResultArgs(await service.ChangePasswordAsync(input), APIHttpType.HttpPut);
        }

        #endregion PUT Methods
    }
}
