// Copyright (c) OptionC. All rights reserved.

using System.Reflection;
using System.Security.Claims;

using CFR.Acutis.Controllers.Navigation;
using CFR.Acutis.Tests.TestDoubles;
using CFR.AcutisInfrastructure.Models.Output;
using CFR.Common;
using CFR.DBEngine;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

using Xunit;

namespace CFR.Acutis.Tests;

/// <summary>
/// Both dependencies are in-memory fakes — no real service logic, no HTTP host, no database.
/// </summary>
public class NavigationControllerTests
{
    private static NavigationController CreateController(FakeAcutisAuthenticationService? service = null, ClaimsPrincipal? user = null)
    {
        var controller = new NavigationController(service ?? new FakeAcutisAuthenticationService());
        controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext { User = user ?? new ClaimsPrincipal(new ClaimsIdentity()) },
        };
        return controller;
    }

    private static ClaimsPrincipal PrincipalWithUserId(long userId)
    {
        var claims = new[] { new Claim(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub, CFR.CommonService.CommonMethods.EncryptValue(userId.ToString())) };
        return new ClaimsPrincipal(new ClaimsIdentity(claims, "TestAuthType"));
    }

    [Fact]
    public void Menus_DeclaresAuthorizeAttribute()
    {
        MethodInfo action = typeof(NavigationController).GetMethod(nameof(NavigationController.Menus))!;
        Assert.NotNull(action.GetCustomAttribute<AuthorizeAttribute>());
    }

    [Fact]
    public async Task Menus_ValidUser_ReturnsOkWithMenuTree()
    {
        var group = new AcutisMenuGroup { Title = "Dashboard", SessionKey = "Dashboard", Path = "/dashboard" };
        var service = new FakeAcutisAuthenticationService
        {
            GetMenusHandler = userId => new MSResultArgs<List<AcutisMenuGroup>>
            {
                StatusCode = ErrorCodes.Success,
                ResultData = userId == 1 ? [group] : [],
            },
        };

        var actionResult = await CreateController(service, PrincipalWithUserId(1)).Menus(CancellationToken.None);

        var ok = Assert.IsType<OkObjectResult>(actionResult);
        var body = Assert.IsType<MSResultArgs<List<AcutisMenuGroup>>>(ok.Value);
        Assert.Equal(ErrorCodes.Success, body.StatusCode);
        var returnedGroup = Assert.Single(body.ResultData!);
        Assert.Equal("Dashboard", returnedGroup.Title);
    }

    [Fact]
    public async Task Menus_NoResolvableIdentity_PassesZeroToService_WhichRejectsIt()
    {
        long? capturedUserId = null;
        var service = new FakeAcutisAuthenticationService
        {
            GetMenusHandler = userId =>
            {
                capturedUserId = userId;
                return userId <= 0
                    ? new MSResultArgs<List<AcutisMenuGroup>> { StatusCode = ErrorCodes.BadRequest, StatusMessage = "No authenticated user context was found." }
                    : new MSResultArgs<List<AcutisMenuGroup>> { StatusCode = ErrorCodes.Success, ResultData = [] };
            },
        };

        // Empty principal — no sub claim at all, matching an authenticated-but-malformed token.
        var actionResult = await CreateController(service).Menus(CancellationToken.None);

        Assert.Equal(0, capturedUserId);
        var badRequest = Assert.IsType<BadRequestObjectResult>(actionResult);
        Assert.Equal(ErrorCodes.BadRequest, Assert.IsType<MSResultArgs<List<AcutisMenuGroup>>>(badRequest.Value).StatusCode);
    }

    [Fact]
    public async Task Menus_EmptyMenuTree_ReturnsSuccessWithEmptyList_NotAnError()
    {
        var service = new FakeAcutisAuthenticationService
        {
            GetMenusHandler = _ => new MSResultArgs<List<AcutisMenuGroup>> { StatusCode = ErrorCodes.Success, ResultData = [] },
        };

        var actionResult = await CreateController(service, PrincipalWithUserId(1)).Menus(CancellationToken.None);

        var ok = Assert.IsType<OkObjectResult>(actionResult);
        var body = Assert.IsType<MSResultArgs<List<AcutisMenuGroup>>>(ok.Value);
        Assert.Empty(body.ResultData!);
    }
}
