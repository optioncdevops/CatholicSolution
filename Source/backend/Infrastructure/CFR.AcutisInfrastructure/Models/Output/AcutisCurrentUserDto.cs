// Copyright (c) OptionC. All rights reserved.

namespace CFR.AcutisInfrastructure.Models.Output;

/// <summary>
/// Success payload for <c>GET /acutis/api/v1/auth/me</c>. Matches
/// docs/acutis-auth-spec/api-contract.md §6 — decoded directly from the caller's JWT claims,
/// no database dependency for the minimal version this task implements.
/// </summary>
public class AcutisCurrentUserDto
{
    public long UserId { get; set; }

    public string? Email { get; set; }

    public string? FullName { get; set; }
}
