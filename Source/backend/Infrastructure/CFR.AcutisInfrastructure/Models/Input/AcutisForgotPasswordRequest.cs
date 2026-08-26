// Copyright (c) OptionC. All rights reserved.

using System.ComponentModel.DataAnnotations;

namespace CFR.AcutisInfrastructure.Models.Input;

/// <summary>
/// Request body for <c>POST /acutis/api/v1/auth/forgot-password</c>.
/// Matches docs/acutis-auth-spec/api-contract.md §3. The response is always the same generic
/// message regardless of whether <see cref="Email"/> matches an account (enumeration-safety —
/// see docs/acutis-auth-spec/security-model.md).
/// </summary>
public class AcutisForgotPasswordRequest
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;
}
