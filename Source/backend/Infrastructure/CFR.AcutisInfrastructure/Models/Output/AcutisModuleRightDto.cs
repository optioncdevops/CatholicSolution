// Copyright (c) OptionC. All rights reserved.

namespace CFR.AcutisInfrastructure.Models.Output;

/// <summary>
/// A single module-right entry as surfaced to the frontend's <c>AuthContext.permissions</c>
/// (matches the reference frontend's <c>AcutisModuleRight</c> type: moduleName/userRight/roleId).
/// Filtered to <c>UserRight &gt; 0</c> before being placed on <see cref="AcutisLoginResult"/>.
/// </summary>
public class AcutisModuleRightDto
{
    public string ModuleName { get; set; } = string.Empty;

    public int UserRight { get; set; }

    public int RoleId { get; set; }
}

/// <summary>
/// Raw module-right row as read from the data-access layer (mirrors the reference app's
/// <c>ViperLoginModuleRightRow</c>) — the source both <see cref="AcutisModuleRightDto"/> and the
/// shaped menu tree (<see cref="AcutisMenuMapper"/>) are derived from. NOT the same as the DTO
/// exposed to the API — this is the internal repository-facing shape.
/// </summary>
public class AcutisModuleRightRow
{
    public string DisplayName { get; set; } = string.Empty;

    public string ModuleName { get; set; } = string.Empty;

    public int UserRight { get; set; }

    public int RoleId { get; set; }

    public int FeatureID { get; set; }

    public int LevelId { get; set; }

    public int ParentId { get; set; }

    public int IsHideMenu { get; set; }

    public int DisplayOrder { get; set; }

    public string Icon { get; set; } = string.Empty;

    public string RoutingUrl { get; set; } = string.Empty;
}
