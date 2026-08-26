// Copyright (c) OptionC. All rights reserved.

namespace CFR.AcutisInfrastructure.Models.Output;

/// <summary>
/// Shaped navigation tree returned by Login (embedded) and
/// <c>GET /acutis/api/v1/navigation/menus</c> (standalone). Mirrors the reference app's
/// <c>MenuItems</c>/<c>SubMenuItems</c>/<c>SubMenuTabItems</c> shape exactly — see
/// docs/acutis-auth-spec/reference-comparison.md §7.
/// </summary>
public class AcutisMenuGroup
{
    public string Title { get; set; } = string.Empty;

    public string Icon { get; set; } = string.Empty;

    public string SessionKey { get; set; } = string.Empty;

    public string Path { get; set; } = string.Empty;

    public List<AcutisMenuLink> Links { get; set; } = [];

    public List<AcutisMenuLink> Btnlinks { get; set; } = [];

    public List<AcutisMenuLink> Activity { get; set; } = [];
}

public class AcutisMenuLink
{
    public string Label { get; set; } = string.Empty;

    public string Icon { get; set; } = string.Empty;

    public string SessionKey { get; set; } = string.Empty;

    public string Path { get; set; } = string.Empty;

    public List<AcutisMenuTab> Tablinks { get; set; } = [];

    public List<AcutisMenuTab> Activity { get; set; } = [];
}

public class AcutisMenuTab
{
    public string Label { get; set; } = string.Empty;

    public string Icon { get; set; } = string.Empty;

    public string SessionKey { get; set; } = string.Empty;

    public string Path { get; set; } = string.Empty;
}
