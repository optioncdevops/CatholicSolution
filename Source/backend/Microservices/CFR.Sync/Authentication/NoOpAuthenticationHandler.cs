// Copyright (c) OptionC. All rights reserved.

using System.Text.Encodings.Web;

using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Options;

namespace CFR.Sync.Authentication
{
    /// <summary>
    /// A scheme that authenticates nothing. CFR.Sync has no ASP.NET Core identity — every request
    /// is verified by HmacAuthenticationMiddleware instead — but BaseController.ApiResultArgs'
    /// StatusCode 403 branch calls the framework's Forbid(), which throws without any registered
    /// scheme to forbid against. Registering this as the default scheme lets Forbid()/Challenge()
    /// resolve to the base AuthenticationHandler's default 403/401 status-code behavior instead of
    /// crashing, without pulling in JWT/cookies/any real credential check.
    /// </summary>
    public class NoOpAuthenticationHandler(IOptionsMonitor<AuthenticationSchemeOptions> options, ILoggerFactory logger, UrlEncoder encoder)
        : AuthenticationHandler<AuthenticationSchemeOptions>(options, logger, encoder)
    {
        public const string SchemeName = "NoOp";

        protected override Task<AuthenticateResult> HandleAuthenticateAsync()
        {
            return Task.FromResult(AuthenticateResult.NoResult());
        }
    }
}
