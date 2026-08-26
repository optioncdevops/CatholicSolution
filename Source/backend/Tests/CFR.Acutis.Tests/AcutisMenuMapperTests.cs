// Copyright (c) OptionC. All rights reserved.

using CFR.AcutisInfrastructure;
using CFR.AcutisInfrastructure.Models.Output;

using Xunit;

namespace CFR.Acutis.Tests;

public class AcutisMenuMapperTests
{
    private static AcutisModuleRightRow Row(
        string moduleName, string displayName, int userRight, int roleId,
        int featureId, int levelId, int parentId, int isHideMenu, int displayOrder,
        string path = "") => new()
    {
        ModuleName = moduleName,
        DisplayName = displayName,
        UserRight = userRight,
        RoleId = roleId,
        FeatureID = featureId,
        LevelId = levelId,
        ParentId = parentId,
        IsHideMenu = isHideMenu,
        DisplayOrder = displayOrder,
        Icon = string.Empty,
        RoutingUrl = path,
    };

    [Fact]
    public void MapModuleRightsToMenu_EmptyInput_ReturnsEmptyList()
    {
        var result = AcutisMenuMapper.MapModuleRightsToMenu([]);

        Assert.NotNull(result);
        Assert.Empty(result);
    }

    [Fact]
    public void MapModuleRightsToMenu_NullInput_Throws()
    {
        Assert.Throws<ArgumentNullException>(() => AcutisMenuMapper.MapModuleRightsToMenu(null!));
    }

    [Fact]
    public void MapModuleRightsToMenu_PreservesParentChildRelationship()
    {
        List<AcutisModuleRightRow> rows =
        [
            Row("Dashboard", "Dashboard", userRight: 1, roleId: 1, featureId: 100, levelId: 1, parentId: 0, isHideMenu: 0, displayOrder: 1, path: "/dashboard"),
            Row("Reports", "Reports", userRight: 1, roleId: 1, featureId: 200, levelId: 2, parentId: 100, isHideMenu: 0, displayOrder: 1, path: "/dashboard/reports"),
        ];

        var groups = AcutisMenuMapper.MapModuleRightsToMenu(rows);

        var group = Assert.Single(groups);
        Assert.Equal("Dashboard", group.Title);
        var link = Assert.Single(group.Links);
        Assert.Equal("Reports", link.Label);
        Assert.Equal("/dashboard/reports", link.Path);
    }

    [Fact]
    public void MapModuleRightsToMenu_PreservesDisplayOrder()
    {
        List<AcutisModuleRightRow> rows =
        [
            Row("Second", "Second", 1, 1, featureId: 20, levelId: 1, parentId: 0, isHideMenu: 0, displayOrder: 2),
            Row("First", "First", 1, 1, featureId: 10, levelId: 1, parentId: 0, isHideMenu: 0, displayOrder: 1),
            Row("Third", "Third", 1, 1, featureId: 30, levelId: 1, parentId: 0, isHideMenu: 0, displayOrder: 3),
        ];

        var groups = AcutisMenuMapper.MapModuleRightsToMenu(rows);

        Assert.Equal(["First", "Second", "Third"], groups.Select(g => g.Title));
    }

    [Fact]
    public void MapModuleRightsToMenu_ZeroUserRight_IsExcludedFromTheTree()
    {
        List<AcutisModuleRightRow> rows =
        [
            Row("Visible", "Visible", userRight: 1, roleId: 1, featureId: 1, levelId: 1, parentId: 0, isHideMenu: 0, displayOrder: 1),
            Row("NoAccess", "NoAccess", userRight: 0, roleId: 1, featureId: 2, levelId: 1, parentId: 0, isHideMenu: 0, displayOrder: 2),
        ];

        var groups = AcutisMenuMapper.MapModuleRightsToMenu(rows);

        Assert.Single(groups);
        Assert.DoesNotContain(groups, g => g.Title == "NoAccess");
    }

    [Fact]
    public void MapModuleRightsToMenu_HiddenMenuFlag_IsExcludedFromTheTopLevelTree()
    {
        List<AcutisModuleRightRow> rows =
        [
            Row("Hidden", "Hidden", userRight: 1, roleId: 1, featureId: 1, levelId: 1, parentId: 0, isHideMenu: 1, displayOrder: 1),
        ];

        var groups = AcutisMenuMapper.MapModuleRightsToMenu(rows);

        Assert.Empty(groups);
    }

    [Fact]
    public void MapModuleRightsToMenu_OrphanedChild_DoesNotAppearAnywhere()
    {
        // A LevelId=2 row whose ParentId matches no real top-level group's FeatureID — must not
        // silently attach itself somewhere unauthorized, and must not crash the mapper.
        List<AcutisModuleRightRow> rows =
        [
            Row("Orphan", "Orphan", userRight: 1, roleId: 1, featureId: 999, levelId: 2, parentId: 12345, isHideMenu: 0, displayOrder: 1),
        ];

        var groups = AcutisMenuMapper.MapModuleRightsToMenu(rows);

        Assert.Empty(groups);
    }

    [Fact]
    public void ToModuleRightDtos_FiltersToPositiveUserRightOnly()
    {
        List<AcutisModuleRightRow> rows =
        [
            Row("A", "A", userRight: 1, roleId: 2, featureId: 1, levelId: 1, parentId: 0, isHideMenu: 0, displayOrder: 1),
            Row("B", "B", userRight: 0, roleId: 2, featureId: 2, levelId: 1, parentId: 0, isHideMenu: 0, displayOrder: 2),
        ];

        var dtos = AcutisMenuMapper.ToModuleRightDtos(rows);

        var dto = Assert.Single(dtos);
        Assert.Equal("A", dto.ModuleName);
        Assert.Equal(2, dto.RoleId);
    }
}
