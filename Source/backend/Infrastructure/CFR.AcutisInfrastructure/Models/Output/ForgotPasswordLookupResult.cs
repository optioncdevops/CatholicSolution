// Copyright (c) OptionC. All rights reserved.

namespace CFR.AcutisInfrastructure.Models.Output;

/// <summary>
/// Internal (never client-facing) result of resolving an email address to an Acutis account, used
/// by Forgot Password. The service must never let <see cref="AccountFound"/> influence the
/// client-facing response — see docs/acutis-auth-spec/security-model.md's enumeration-safety rule.
/// </summary>
public class ForgotPasswordLookupResult
{
    public bool AccountFound { get; set; }

    public long? UserId { get; set; }

    public string? Email { get; set; }
}
