// Copyright (c) OptionC. All rights reserved.

namespace CFR.AcutisService.Service.AcutisAuthentication;

/// <summary>
/// Shared, framework-agnostic validation rules used by <see cref="AcutisAuthenticationService"/>
/// for business rules DataAnnotations cannot express (composite password policy, cross-field
/// equality/inequality, token plausibility). See docs/acutis-auth-spec/validation-standard.md.
/// </summary>
public static class AcutisAuthValidation
{
    /// <summary>
    /// Industry-baseline default (minimum length + letter + digit) — NOT confirmed against any
    /// real database-side password policy, since no such policy exists to confirm (the real
    /// password-write path is itself a documented blocker — see database-contract.md). Documented
    /// here explicitly so this is never mistaken for a verified production rule.
    /// </summary>
    public const int MinimumPasswordLength = 8;

    public const string PasswordPolicyDescription =
        "Password must be at least 8 characters long and include at least one letter and one number.";

    public static bool IsPasswordPolicyCompliant(string? password)
    {
        if (string.IsNullOrEmpty(password) || password.Length < MinimumPasswordLength)
        {
            return false;
        }

        bool hasLetter = false;
        bool hasDigit = false;

        foreach (char c in password)
        {
            if (char.IsLetter(c))
            {
                hasLetter = true;
            }
            else if (char.IsDigit(c))
            {
                hasDigit = true;
            }

            if (hasLetter && hasDigit)
            {
                return true;
            }
        }

        return false;
    }

    /// <summary>
    /// Minimum plausibility check only — NOT the security boundary (that is
    /// <c>IPasswordResetTokenStore.ValidateAndConsumeTokenAsync</c>). Exists purely so an obviously
    /// malformed token (empty after trimming, too short, contains internal whitespace) never even
    /// reaches the token store. A failure here must be reported identically to a token the store
    /// itself rejects — never as a distinguishable error — so it reveals nothing about token shape.
    /// The real token generator produces 43-character URL-safe base64 tokens; 16 is a generous
    /// lower bound, not a claim about the real/production token shape.
    /// </summary>
    public const int MinimumPlausibleResetTokenLength = 16;

    public static bool IsPlausibleResetToken(string? token)
    {
        if (string.IsNullOrWhiteSpace(token))
        {
            return false;
        }

        string trimmed = token.Trim();
        return trimmed.Length >= MinimumPlausibleResetTokenLength && !trimmed.Any(char.IsWhiteSpace);
    }
}
