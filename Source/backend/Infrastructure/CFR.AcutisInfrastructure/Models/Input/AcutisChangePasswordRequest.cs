// Copyright (c) OptionC. All rights reserved.

using System.ComponentModel.DataAnnotations;

namespace CFR.AcutisInfrastructure.Models.Input;

/// <summary>
/// Request body for <c>POST /acutis/api/v1/auth/change-password</c>.
/// Matches docs/acutis-auth-spec/api-contract.md §5. The acting user is always resolved from the
/// caller's JWT, never from this DTO.
/// </summary>
public class AcutisChangePasswordRequest
{
    [Required]
    public string CurrentPassword { get; set; } = string.Empty;

    [Required]
    public string NewPassword { get; set; } = string.Empty;

    [Required]
    public string ConfirmPassword { get; set; } = string.Empty;
}
