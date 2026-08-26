// Copyright (c) OptionC. All rights reserved.

namespace CFR.AcutisInfrastructure.Models.Output;

/// <summary>
/// Success payload for <c>POST /acutis/api/v1/auth/login</c>, wrapped in
/// <c>MSResultArgs&lt;AcutisLoginResult&gt;</c> by the service. Matches
/// docs/acutis-auth-spec/api-contract.md §1.
/// </summary>
public class AcutisLoginResult
{
    public AcutisLoginUser User { get; set; } = new();

    public List<AcutisModuleRightDto> ModuleRights { get; set; } = [];

    public List<AcutisMenuGroup> MenuItems { get; set; } = [];
}
