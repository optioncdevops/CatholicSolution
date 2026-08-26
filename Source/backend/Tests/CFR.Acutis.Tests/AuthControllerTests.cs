// Copyright (c) OptionC. All rights reserved.

using System.Reflection;
using System.Security.Claims;

using CFR.Acutis.Controllers.Auth;
using CFR.Acutis.Tests.TestDoubles;
using CFR.AcutisInfrastructure.Models.Input;
using CFR.AcutisInfrastructure.Models.Output;
using CFR.Common;
using CFR.DBEngine;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

using Xunit;

namespace CFR.Acutis.Tests;

/// <summary>
/// Controller-level tests. Both constructor dependencies are in-memory fakes — no real service
/// logic, no HTTP host, no database. Authorization-attribute tests use reflection against the
/// compiled controller (the actual mechanism ASP.NET Core itself reads at request time), not a
/// live request pipeline.
/// </summary>
public class AuthControllerTests
{
    private static AuthController CreateController(
        FakeAcutisAuthenticationService? service = null,
        FakeJwtTokenGenerator? tokenGenerator = null,
        ClaimsPrincipal? user = null)
    {
        var controller = new AuthController(service ?? new FakeAcutisAuthenticationService(), tokenGenerator ?? new FakeJwtTokenGenerator());
        controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext { User = user ?? new ClaimsPrincipal(new ClaimsIdentity()) },
        };
        return controller;
    }

    private static MethodInfo Action(string name) => typeof(AuthController).GetMethod(name)!;

    // --- Authorization attributes (reflection — the same metadata ASP.NET Core reads) ---

    [Theory]
    [InlineData(nameof(AuthController.Me))]
    [InlineData(nameof(AuthController.Logout))]
    [InlineData(nameof(AuthController.ChangePassword))]
    public void ProtectedActions_DeclareAuthorizeAttribute(string actionName)
    {
        Assert.NotNull(Action(actionName).GetCustomAttribute<AuthorizeAttribute>());
    }

    [Theory]
    [InlineData(nameof(AuthController.Login))]
    [InlineData(nameof(AuthController.ForgotPassword))]
    [InlineData(nameof(AuthController.ResetPassword))]
    public void AnonymousActions_DeclareAllowAnonymousAttribute(string actionName)
    {
        Assert.NotNull(Action(actionName).GetCustomAttribute<AllowAnonymousAttribute>());
    }

    [Fact]
    public void ResetPassword_IsAnonymous_NotAuthorize()
    {
        // Token-gated internally (see AuthController's own doc comment), not JWT-gated.
        Assert.Null(Action(nameof(AuthController.ResetPassword)).GetCustomAttribute<AuthorizeAttribute>());
    }

    // --- Response contract ---

    [Fact]
    public async Task Login_Success_ReturnsOkWithMSResultArgsOfLoginResult()
    {
        var service = new FakeAcutisAuthenticationService
        {
            LoginHandler = _ => new MSResultArgs<AcutisLoginResult>
            {
                StatusCode = ErrorCodes.Success,
                StatusMessage = ErrorMessages.Success,
                ResultData = new AcutisLoginResult { User = new AcutisLoginUser { UserId = 1, Email = "a@b.test" } },
            },
        };

        var actionResult = await CreateController(service).Login(new AcutisLoginRequest { UserName = "a@b.test", Password = "x" }, CancellationToken.None);

        var ok = Assert.IsType<OkObjectResult>(actionResult);
        var body = Assert.IsType<MSResultArgs<AcutisLoginResult>>(ok.Value);
        Assert.Equal(ErrorCodes.Success, body.StatusCode);
        Assert.Equal("a@b.test", body.ResultData!.User.Email);
    }

    [Fact]
    public async Task Login_Success_TokenIsGeneratedAndAttachedToUser()
    {
        var service = new FakeAcutisAuthenticationService
        {
            LoginHandler = _ => new MSResultArgs<AcutisLoginResult>
            {
                StatusCode = ErrorCodes.Success,
                ResultData = new AcutisLoginResult { User = new AcutisLoginUser { UserId = 1, Email = "a@b.test" } },
            },
        };
        var tokenGenerator = new FakeJwtTokenGenerator { TokenToReturn = "issued-test-token" };

        var actionResult = await CreateController(service, tokenGenerator).Login(new AcutisLoginRequest { UserName = "a@b.test", Password = "x" }, CancellationToken.None);

        var ok = Assert.IsType<OkObjectResult>(actionResult);
        var body = Assert.IsType<MSResultArgs<AcutisLoginResult>>(ok.Value);
        Assert.Equal("issued-test-token", body.ResultData!.User.Token);
        Assert.NotNull(tokenGenerator.LastUser);
    }

    [Fact]
    public async Task Login_FailedCredentials_TokenGeneratorIsNeverCalled()
    {
        var service = new FakeAcutisAuthenticationService
        {
            LoginHandler = _ => new MSResultArgs<AcutisLoginResult> { StatusCode = ErrorCodes.Failed, StatusMessage = "Invalid username or password." },
        };
        var tokenGenerator = new FakeJwtTokenGenerator();

        await CreateController(service, tokenGenerator).Login(new AcutisLoginRequest { UserName = "a@b.test", Password = "wrong" }, CancellationToken.None);

        Assert.Null(tokenGenerator.LastUser);
    }

    [Fact]
    public async Task Login_NullRequest_ReturnsBadRequest()
    {
        var actionResult = await CreateController().Login(null!, CancellationToken.None);

        var badRequest = Assert.IsType<BadRequestObjectResult>(actionResult);
        var body = Assert.IsType<MSResultArgs>(badRequest.Value);
        Assert.Equal(ErrorCodes.BadRequest, body.StatusCode);
    }

    [Theory]
    [InlineData(nameof(AuthController.ChangePassword))]
    [InlineData(nameof(AuthController.ForgotPassword))]
    [InlineData(nameof(AuthController.ResetPassword))]
    public async Task PostActionsWithABody_NullRequest_ReturnBadRequest(string actionName)
    {
        var controller = CreateController(user: PrincipalWithClaims(userId: 1, email: "a@b.test", fullName: "A B"));

        IActionResult actionResult = actionName switch
        {
            nameof(AuthController.ChangePassword) => await controller.ChangePassword(null!, CancellationToken.None),
            nameof(AuthController.ForgotPassword) => await controller.ForgotPassword(null!, CancellationToken.None),
            nameof(AuthController.ResetPassword) => await controller.ResetPassword(null!, CancellationToken.None),
            _ => throw new InvalidOperationException(),
        };

        var badRequest = Assert.IsType<BadRequestObjectResult>(actionResult);
        Assert.Equal(ErrorCodes.BadRequest, Assert.IsType<MSResultArgs>(badRequest.Value).StatusCode);
    }

    [Fact]
    public async Task ChangePassword_NoResolvableIdentity_ReturnsUnauthorizedWithoutCallingService()
    {
        var service = new FakeAcutisAuthenticationService();
        // Empty ClaimsPrincipal — no sub/email claims at all, matching an authenticated-but-malformed token.
        var controller = CreateController(service);

        var actionResult = await controller.ChangePassword(
            new AcutisChangePasswordRequest { CurrentPassword = "x", NewPassword = "y", ConfirmPassword = "y" },
            CancellationToken.None);

        Assert.IsType<UnauthorizedResult>(actionResult);
    }

    private static ClaimsPrincipal PrincipalWithClaims(long userId, string email, string fullName)
    {
        var claims = new[]
        {
            new Claim(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub, CFR.CommonService.CommonMethods.EncryptValue(userId.ToString())),
            new Claim(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Email, CFR.CommonService.CommonMethods.EncryptValue(email)),
            new Claim(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Name, CFR.CommonService.CommonMethods.EncryptValue(fullName)),
        };
        return new ClaimsPrincipal(new ClaimsIdentity(claims, "TestAuthType"));
    }
}
