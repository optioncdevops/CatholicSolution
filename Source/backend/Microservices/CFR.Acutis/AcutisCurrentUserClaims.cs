// Copyright (c) OptionC. All rights reserved.

using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

using CFR.CommonService;

namespace CFR.Acutis;

/// <summary>
/// Reads the caller's identity from their validated JWT claims — shared by every Acutis
/// controller that needs "who is the current authenticated user" (<c>AuthController</c>,
/// <c>NavigationController</c>), extracted here so the logic exists in exactly one place.
///
/// Matches exactly what <see cref="AcutisJwtTokenGenerator"/> issues —
/// <c>JwtRegisteredClaimNames.Sub/Email/Name</c>, each individually encrypted via
/// <c>CommonMethods.EncryptValue</c> — NOT the SSO-shaped claims
/// <c>CFR.Base.ClientInfoMiddleware</c>/<c>ICurrentUserService</c> expect, since Acutis
/// deliberately does not use SSO.
///
/// Signature and expiry are already enforced by the JWT bearer middleware before this method ever
/// runs (an expired/invalid/missing token yields 401 at the framework level, since callers only
/// invoke this from <c>[Authorize]</c> actions) — this method only needs to handle a claim being
/// absent or its decrypted value being malformed, which it does by failing safe:
/// <c>CommonMethods.DecryptValue</c> never throws (returns the sentinel <c>"0"</c> on any
/// decryption failure), and that sentinel is treated as "no value" below rather than a real
/// email/name, so a tampered-but-still-validly-signed claim degrades to an unauthenticated-
/// looking identity rather than a plausible-but-wrong one.
/// </summary>
public static class AcutisCurrentUserClaims
{
    public static (long UserId, string? Email, string? FullName) Resolve(ClaimsPrincipal user)
    {
        ArgumentNullException.ThrowIfNull(user);

        string? subClaim = user.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
        string? emailClaim = user.FindFirst(JwtRegisteredClaimNames.Email)?.Value;
        string? nameClaim = user.FindFirst(JwtRegisteredClaimNames.Name)?.Value;

        long userId = 0;
        if (!string.IsNullOrEmpty(subClaim))
        {
            _ = long.TryParse(CommonMethods.DecryptValue(subClaim), out userId);
        }

        string? email = DecryptClaimOrNull(emailClaim);
        string? fullName = DecryptClaimOrNull(nameClaim);

        return (userId, email, fullName);
    }

    /// <summary>Decrypts a claim value, treating both "absent" and DecryptValue's failure sentinel ("0") as null.</summary>
    private static string? DecryptClaimOrNull(string? claimValue)
    {
        if (string.IsNullOrEmpty(claimValue))
        {
            return null;
        }

        string decrypted = CommonMethods.DecryptValue(claimValue);
        return decrypted == "0" ? null : decrypted;
    }
}
