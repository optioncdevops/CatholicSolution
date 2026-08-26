// Copyright (c) OptionC. All rights reserved.

using System.ComponentModel.DataAnnotations;

namespace CFR.AcutisInfrastructure.Models.Input;

/// <summary>
/// Request body for <c>POST /acutis/api/v1/auth/login</c>.
/// Matches docs/acutis-auth-spec/api-contract.md §1. Does not accept a client-supplied IP address —
/// the reference app's equivalent field is never actually populated from the request either.
/// </summary>
public class AcutisLoginRequest
{
    [Required]
    public string UserName { get; set; } = string.Empty;

    [Required]
    public string Password { get; set; } = string.Empty;
}
