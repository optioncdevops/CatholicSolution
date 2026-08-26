// Copyright (c) OptionC. All rights reserved.

using CFR.AcutisInfrastructure.Models.Input;
using CFR.AcutisService.Interfaces.AcutisAuthentication;
using CFR.Base;
using CFR.Common;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CFR.Acutis.Controllers.Auth;

/// <summary>
/// Acutis authentication endpoints. Acutis-only — no SSO code path is involved anywhere in this
/// controller or the services it calls. See docs/acutis-auth-spec/api-contract.md for the full
/// contract this controller implements.
///
/// IMPORTANT: <see cref="IAcutisAuthenticationService"/> is currently backed by a DEVELOPMENT-ONLY
/// fake repository (registered in <c>ServiceExtension.AddDIServicesSetup</c>) that makes no
/// database call. Every response this controller produces reflects that fake, not a real account
/// store — see docs/acutis-auth-spec/database-contract.md.
/// </summary>
[ApiExplorerSettings(GroupName = Constant.SwaggerModuleDoc.AcutisOrganization)]
public class AuthController(IAcutisAuthenticationService authService, IJwtTokenGenerator jwtTokenGenerator) : BaseController
{
    /// <summary>
    /// POST api/v1/Auth/Login. Pre-authentication — anonymous by design. The JWT is generated here
    /// (matching the reference app's controller-level pattern) only after
    /// <see cref="IAcutisAuthenticationService.LoginAsync"/> reports success against the
    /// DEV FAKE repository — never before, and never for a failed credential check.
    /// </summary>
    [AllowAnonymous]
    [HttpPost]
    public async Task<IActionResult> Login([FromBody] AcutisLoginRequest request, CancellationToken cancellationToken)
    {
        if (request is null)
        {
            return BadRequestApi("Request body is required.");
        }

        var result = await authService.LoginAsync(request, cancellationToken).ConfigureAwait(false);

        if (result.StatusCode == ErrorCodes.Success && result.ResultData?.User is not null)
        {
            result.ResultData.User.Token = jwtTokenGenerator.GenerateToken(result.ResultData.User);
        }

        return ApiResultArgs(result, APIHttpType.HttpPost);
    }

    /// <summary>
    /// GET api/v1/Auth/Me. Requires a valid bearer token — identity is read from the caller's own
    /// JWT claims, never from a request parameter.
    /// </summary>
    [Authorize]
    [HttpGet]
    public async Task<IActionResult> Me(CancellationToken cancellationToken)
    {
        (long userId, string? email, string? fullName) = AcutisCurrentUserClaims.Resolve(User);

        var result = await authService.GetCurrentUserAsync(userId, email, fullName, cancellationToken).ConfigureAwait(false);
        return ApiResultArgs(result, APIHttpType.HttpGet);
    }

    /// <summary>
    /// POST api/v1/Auth/Logout. Requires a valid bearer token. Stateless — no server-side token
    /// invalidation occurs (see docs/acutis-auth-spec/reference-comparison.md §2).
    /// </summary>
    [Authorize]
    [HttpPost]
    public async Task<IActionResult> Logout(CancellationToken cancellationToken)
    {
        (long userId, _, _) = AcutisCurrentUserClaims.Resolve(User);

        var result = await authService.LogoutAsync(userId, cancellationToken).ConfigureAwait(false);
        return ApiResultArgs(result, APIHttpType.HttpPost);
    }

    /// <summary>
    /// POST api/v1/Auth/ChangePassword. Requires a valid bearer token. The current-password
    /// verify step reuses the login credential check; the write step is a confirmed database
    /// blocker (see docs/acutis-auth-spec/database-contract.md) and will never report a false
    /// success while backed by the development fake repository.
    /// </summary>
    [Authorize]
    [HttpPost]
    public async Task<IActionResult> ChangePassword([FromBody] AcutisChangePasswordRequest request, CancellationToken cancellationToken)
    {
        if (request is null)
        {
            return BadRequestApi("Request body is required.");
        }

        (long userId, string? email, _) = AcutisCurrentUserClaims.Resolve(User);

        if (userId <= 0 || string.IsNullOrWhiteSpace(email))
        {
            return Unauthorized();
        }

        var result = await authService.ChangePasswordAsync(userId, email, request, cancellationToken).ConfigureAwait(false);
        return ApiResultArgs(result, APIHttpType.HttpPost);
    }

    /// <summary>
    /// POST api/v1/Auth/ForgotPassword. Pre-authentication — anonymous by design. Always returns
    /// the same generic response regardless of whether the email matches an account
    /// (enumeration-safety — see docs/acutis-auth-spec/security-model.md). Never log this
    /// endpoint's request/response content beyond what the service itself already logs safely.
    /// </summary>
    [AllowAnonymous]
    [HttpPost]
    public async Task<IActionResult> ForgotPassword([FromBody] AcutisForgotPasswordRequest request, CancellationToken cancellationToken)
    {
        if (request is null)
        {
            return BadRequestApi("Request body is required.");
        }

        var result = await authService.ForgotPasswordAsync(request, cancellationToken).ConfigureAwait(false);
        return ApiResultArgs(result, APIHttpType.HttpPost);
    }

    /// <summary>
    /// POST api/v1/Auth/ResetPassword. Anonymous at the bearer-token level by design — per
    /// docs/acutis-auth-spec/api-contract.md §4, the single-use reset token carried in the request
    /// body (not a JWT) is this endpoint's credential, since a user resetting a forgotten password
    /// by definition does not hold a valid session. "Authorization" for this endpoint is therefore
    /// enforced inside <see cref="IAcutisAuthenticationService.ResetPasswordAsync"/> via
    /// <c>IPasswordResetTokenStore.ValidateAndConsumeTokenAsync</c>, not via <c>[Authorize]</c>.
    /// </summary>
    [AllowAnonymous]
    [HttpPost]
    public async Task<IActionResult> ResetPassword([FromBody] AcutisResetPasswordRequest request, CancellationToken cancellationToken)
    {
        if (request is null)
        {
            return BadRequestApi("Request body is required.");
        }

        var result = await authService.ResetPasswordAsync(request, cancellationToken).ConfigureAwait(false);
        return ApiResultArgs(result, APIHttpType.HttpPost);
    }

    // Current-user identity resolution moved to CFR.Acutis.AcutisCurrentUserClaims — shared with
    // NavigationController so the claim-reading logic exists in exactly one place.
}
