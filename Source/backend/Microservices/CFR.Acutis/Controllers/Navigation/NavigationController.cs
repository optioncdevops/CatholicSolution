// Copyright (c) OptionC. All rights reserved.

using CFR.AcutisService.Interfaces.AcutisAuthentication;
using CFR.Base;
using CFR.Common;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CFR.Acutis.Controllers.Navigation;

/// <summary>
/// Acutis dynamic-menu endpoint. Closes the gap noted since Task 4 in
/// docs/acutis-auth-spec/api-contract.md — <c>IAcutisAuthenticationService.GetMenusAsync</c> has
/// existed since Task 2 but was never reachable over HTTP until this controller.
///
/// The menu tree returned is exactly the one the authenticated user's own rights produce — the
/// server resolves the user id from the caller's own validated JWT (never a request parameter),
/// and <c>AcutisMenuMapper</c> (called inside the service) has already filtered out zero-right and
/// hidden-menu rows and preserved parent/child relationships and display order before this
/// controller ever sees the result. No permission or menu data is ever placed in the JWT itself —
/// see docs/acutis-auth-spec/security-model.md.
/// </summary>
[ApiExplorerSettings(GroupName = Constant.SwaggerModuleDoc.AcutisOrganization)]
public class NavigationController(IAcutisAuthenticationService authService) : BaseController
{
    /// <summary>
    /// GET api/v1/Navigation/Menus. Requires a valid bearer token. Backed by the same
    /// DEVELOPMENT-ONLY fake repository as every other Acutis endpoint until a real,
    /// database-verified repository is registered — see docs/acutis-auth-spec/database-contract.md.
    /// </summary>
    [Authorize]
    [HttpGet]
    public async Task<IActionResult> Menus(CancellationToken cancellationToken)
    {
        (long userId, _, _) = AcutisCurrentUserClaims.Resolve(User);

        var result = await authService.GetMenusAsync(userId, cancellationToken).ConfigureAwait(false);
        return ApiResultArgs(result, APIHttpType.HttpGet);
    }
}
