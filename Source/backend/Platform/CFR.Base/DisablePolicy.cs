// Copyright (c) OptionC. All rights reserved.

namespace CFR.Base;

/// <summary>
/// Treats every request as authenticated and authorized, regardless of any bearer token —
/// <see cref="AuthenticateAsync"/> fabricates a successful ticket even for an anonymous request,
/// and <see cref="AuthorizeAsync"/> always returns success. This must NEVER be registered outside
/// a local developer machine that has explicitly opted in — see
/// <see cref="ServiceExtension.DisableAuthenticationPolicy"/>, the only place that registers this
/// type, which gates it behind both <c>IWebHostEnvironment.IsDevelopment()</c> and the
/// <c>Authentication:AllowAnonymousDevelopmentBypass</c> configuration flag.
/// </summary>
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