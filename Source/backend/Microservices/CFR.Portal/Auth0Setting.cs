// Copyright (c) OptionC. All rights reserved.

namespace CFR.Portal;

/// <summary>
/// Auth0 tenant details used to validate an Auth0 access token by calling
/// its /userinfo endpoint (see PortalAuthenticationService.ExchangeAuth0TokenAsync).
/// </summary>
public class Auth0Setting
{
    /// <summary>
    /// Gets or sets the Auth0 tenant domain (e.g. dev-xxxx.us.auth0.com),
    /// matching the frontend's VITE_AUTH0_DOMAIN for this environment.
    /// </summary>
    public string? Domain { get; set; }
}
