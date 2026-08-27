// Copyright (c) OptionC. All rights reserved.

namespace CFR.AcutisInfrastructure.Models.Output;

/// <summary>
/// Identity payload for a logged-in Acutis user, returned in the Login response BODY (not the
/// JWT — see <see cref="CFR.Acutis.IJwtTokenGenerator"/>, which reads only
/// <see cref="UserId"/>/<see cref="Email"/>/<see cref="FullName"/> from this class and nothing
/// else). Column mapping confirmed live against the real database's first result set — see
/// docs/acutis-auth-spec/database-contract.md's "Verification succeeded" section.
/// </summary>
public class AcutisLoginUser
{
    public long UserId { get; set; }

    public string? Email { get; set; }

    public string? FirstName { get; set; }

    public string? LastName { get; set; }

    public string? FullName { get; set; }

    /// <summary>
    /// Confirmed live column on <c>NewViper.DoLogin</c>'s first result set. A coarse-grained
    /// authorization signal (not a fine-grained permission) — deliberately kept out of the JWT,
    /// same as every other authorization value, per docs/acutis-auth-spec/security-model.md.
    /// </summary>
    public bool IsSuperUser { get; set; }

    /// <summary>
    /// Populated by the JWT token generator once that foundation exists. Empty until then —
    /// this task does not implement token generation.
    /// </summary>
    public string Token { get; set; } = string.Empty;
}
