// Copyright (c) OptionC. All rights reserved.

using CFR.AcutisInfrastructure.Models.Output;

namespace CFR.AcutisInfrastructure;

/// <summary>
/// Groups a flat module-rights rowset into the parent/link/activity/tab navigation tree consumed
/// by the frontend. Pure function, no I/O — ported from the reference app's
/// <c>AcutisAuthenticationRepository.MapModuleRightsToMenu</c> (see
/// docs/acutis-auth-spec/reference-comparison.md §7). Deliberately kept static and side-effect-free
/// so it is unit-testable without a repository, service, or database.
/// </summary>
public static class AcutisMenuMapper
{
    public static List<AcutisModuleRightDto> ToModuleRightDtos(IEnumerable<AcutisModuleRightRow> rights)
    {
        ArgumentNullException.ThrowIfNull(rights);

        return [.. rights
            .Where(x => x.UserRight > 0)
            .Select(x => new AcutisModuleRightDto
            {
                ModuleName = x.ModuleName,
                UserRight = x.UserRight,
                RoleId = x.RoleId,
            })];
    }

    public static List<AcutisMenuGroup> MapModuleRightsToMenu(IEnumerable<AcutisModuleRightRow> rights)
    {
        ArgumentNullException.ThrowIfNull(rights);

        var rightsList = rights.ToList();
        if (rightsList.Count == 0)
        {
            return [];
        }

        var visibleRights = rightsList
            .Where(x => x.UserRight > 0 && x.IsHideMenu == 0)
            .OrderBy(x => x.DisplayOrder)
            .ToList();

        var allowedRights = rightsList
            .Where(x => x.UserRight > 0)
            .OrderBy(x => x.DisplayOrder)
            .ToList();

        return [.. visibleRights
            .Where(x => x.ParentId == 0 && x.LevelId == 1)
            .Select(parent => new AcutisMenuGroup
            {
                Title = parent.DisplayName,
                Icon = string.Empty,
                SessionKey = parent.ModuleName,
                Path = parent.RoutingUrl,
                Activity = [.. allowedRights
                    .Where(child => child.ParentId == parent.FeatureID && child.LevelId == 5)
                    .Select(child => ToLink(child, allowedRights))],
                Links = [.. visibleRights
                    .Where(child => child.ParentId == parent.FeatureID && child.LevelId == 2)
                    .Select(child => ToLink(child, allowedRights))],
                Btnlinks = [.. allowedRights
                    .Where(child => child.ParentId == parent.FeatureID && child.LevelId == 2)
                    .Select(child => ToLink(child, allowedRights))],
            })];
    }

    private static AcutisMenuLink ToLink(AcutisModuleRightRow row, List<AcutisModuleRightRow> allowedRights)
    {
        return new AcutisMenuLink
        {
            Label = row.DisplayName,
            Icon = row.Icon,
            SessionKey = row.ModuleName,
            Path = row.RoutingUrl,
            Tablinks = [.. allowedRights
                .Where(tab => tab.ParentId == row.FeatureID && tab.LevelId == 4)
                .Select(ToTab)],
        };
    }

    private static AcutisMenuTab ToTab(AcutisModuleRightRow row)
    {
        return new AcutisMenuTab
        {
            Label = row.DisplayName,
            Icon = row.Icon,
            SessionKey = row.ModuleName,
            Path = row.RoutingUrl,
        };
    }
}
