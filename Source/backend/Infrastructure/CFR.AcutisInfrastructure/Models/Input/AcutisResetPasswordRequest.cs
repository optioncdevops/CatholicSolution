// Copyright (c) OptionC. All rights reserved.

using System.ComponentModel.DataAnnotations;

namespace CFR.AcutisInfrastructure.Models.Input;

/// <summary>
/// Request body for <c>POST /acutis/api/v1/auth/reset-password</c>.
/// Matches docs/acutis-auth-spec/api-contract.md §4. <see cref="Token"/> is the single-use,
/// time-limited value issued by <c>IPasswordResetTokenStore.IssueResetTokenAsync</c> — never the
/// account's email/username encoded in a decodable way.
/// </summary>
public class AcutisResetPasswordRequest
{
    [Required]
    public string Token { get; set; } = string.Empty;

    [Required]
    public string NewPassword { get; set; } = string.Empty;

    [Required]
    public string ConfirmPassword { get; set; } = string.Empty;
}
