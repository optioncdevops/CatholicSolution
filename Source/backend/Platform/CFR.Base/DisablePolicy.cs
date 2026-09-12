// Copyright (c) OptionC. All rights reserved.

namespace CFR.Base;

public class DisableAuthenticationPolicyEvaluator : IPolicyEvaluator
{
    public async Task<AuthenticateResult> AuthenticateAsync(AuthorizationPolicy policy, HttpContext context)
    {
        if (context.User?.Identity?.IsAuthenticated == true)
        {
            return await Task.FromResult(AuthenticateResult.Success(new AuthenticationTicket(context.User, JwtBearerDefaults.AuthenticationScheme)));
        }

        var authenticationTicket = new AuthenticationTicket(new ClaimsPrincipal(), new AuthenticationProperties(), JwtBearerDefaults.AuthenticationScheme);
        return await Task.FromResult(AuthenticateResult.Success(authenticationTicket));
    }

    public async Task<PolicyAuthorizationResult> AuthorizeAsync(AuthorizationPolicy policy, AuthenticateResult authenticationResult, HttpContext context, object? resource)
    {
        //throw new NotImplementedException();
        return await Task.FromResult(PolicyAuthorizationResult.Success());
    }
}