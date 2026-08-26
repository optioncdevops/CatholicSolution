// Copyright (c) OptionC. All rights reserved.

namespace CFR.AcutisInfrastructure.Models.Output;

/// <summary>
/// Thin identity payload for a logged-in Acutis user — deliberately minimal, matching the
/// reference app's "thin JWT" design (email/sub/name only; see
/// docs/acutis-auth-spec/security-model.md). Field names/source are ASSUMPTIONS carried over from
/// the reference app's <c>ViperLoginUserResult</c> doc comments, not verified against a live
/// database (see docs/acutis-auth-spec/database-contract.md).
/// </summary>
public class AcutisLoginUser
{
    public long UserId { get; set; }

    public string? Email { get; set; }

    public string? FirstName { get; set; }

    public string? LastName { get; set; }

    public string? FullName { get; set; }

    /// <summary>
    /// Populated by the JWT token generator once that foundation exists. Empty until then —
    /// this task does not implement token generation.
    /// </summary>
    public string Token { get; set; } = string.Empty;
}
