// Copyright (c) OptionC. All rights reserved.

using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

using CFR.Acutis.Controllers.Auth;
using CFR.Acutis.Tests.TestDoubles;
using CFR.AcutisInfrastructure.Models.Output;
using CFR.Base;
using CFR.CommonService;
using CFR.DBEngine;

using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

using Xunit;

namespace CFR.Acutis.Tests;

/// <summary>
/// Exercises the exact <see cref="TokenValidationParameters"/> shape
/// <c>AcutisAuthenticationHardening.AddAcutisJwtValidationHardening</c> configures on the JWT
/// bearer scheme, but does so directly against <see cref="JwtSecurityTokenHandler"/> — no ASP.NET
/// Core host, no HTTP, no network. Tokens are minted with the real <see cref="AcutisJwtTokenGenerator"/>
/// (or hand-crafted for negative cases) using a test-only signing key.
/// </summary>
public class JwtValidationBehaviorTests
{
    private const string TestSecurityKey = "unit-test-only-signing-key-not-a-real-secret-32bytes!";
    private const string TestIssuer = "cfr-acutis-tests";
    private const string TestAudience = "cfr-client-tests";

    private static TokenValidationParameters ValidationParameters(string? overrideIssuer = null, string? overrideAudience = null, byte[]? overrideKey = null) => new()
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(overrideKey ?? Encoding.UTF8.GetBytes(TestSecurityKey)),
        ValidateIssuer = true,
        ValidIssuer = overrideIssuer ?? TestIssuer,
        ValidateAudience = true,
        ValidAudience = overrideAudience ?? TestAudience,
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero,
    };

    private static AcutisJwtTokenGenerator CreateGenerator() =>
        new(Options.Create(new JWTSetting { SecurityKey = TestSecurityKey, Issuer = TestIssuer, Audience = TestAudience }));

    private static AcutisLoginUser ValidUser() => new() { UserId = 1, Email = "person@example.test", FullName = "Person Example" };

    private static (ClaimsPrincipal? principal, Exception? exception) TryValidate(string token, TokenValidationParameters parameters)
    {
        var handler = new JwtSecurityTokenHandler { MapInboundClaims = false }; // mirrors JwtBearerOptions.MapInboundClaims = false
        try
        {
            var principal = handler.ValidateToken(token, parameters, out _);
            return (principal, null);
        }
        catch (Exception ex)
        {
            return (null, ex);
        }
    }

    [Fact]
    public void ValidAcutisToken_IsAccepted()
    {
        string token = CreateGenerator().GenerateToken(ValidUser());

        var (principal, exception) = TryValidate(token, ValidationParameters());

        Assert.Null(exception);
        Assert.NotNull(principal);
        Assert.True(principal!.Identity?.IsAuthenticated);
    }

    [Fact]
    public void WrongIssuer_IsRejected()
    {
        string token = CreateGenerator().GenerateToken(ValidUser());

        var (principal, exception) = TryValidate(token, ValidationParameters(overrideIssuer: "some-other-issuer"));

        Assert.Null(principal);
        Assert.IsType<SecurityTokenInvalidIssuerException>(exception);
    }

    [Fact]
    public void WrongAudience_IsRejected()
    {
        string token = CreateGenerator().GenerateToken(ValidUser());

        var (principal, exception) = TryValidate(token, ValidationParameters(overrideAudience: "some-other-audience"));

        Assert.Null(principal);
        Assert.IsType<SecurityTokenInvalidAudienceException>(exception);
    }

    [Fact]
    public void ExpiredToken_IsRejected()
    {
        var handler = new JwtSecurityTokenHandler();
        var descriptor = new SecurityTokenDescriptor
        {
            Issuer = TestIssuer,
            Audience = TestAudience,
            NotBefore = DateTime.UtcNow.AddMinutes(-20),
            Expires = DateTime.UtcNow.AddMinutes(-10),
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(Encoding.UTF8.GetBytes(TestSecurityKey)), SecurityAlgorithms.HmacSha256),
        };
        string token = handler.WriteToken(handler.CreateToken(descriptor));

        var (principal, exception) = TryValidate(token, ValidationParameters());

        Assert.Null(principal);
        Assert.IsType<SecurityTokenExpiredException>(exception);
    }

    [Fact]
    public void InvalidSignature_IsRejected()
    {
        string token = CreateGenerator().GenerateToken(ValidUser());

        var (principal, exception) = TryValidate(token, ValidationParameters(overrideKey: Encoding.UTF8.GetBytes("a-completely-different-signing-key-32b!")));

        Assert.Null(principal);
        Assert.IsType<SecurityTokenSignatureKeyNotFoundException>(exception);
    }

    [Fact]
    public async Task MalformedEncryptedIdentityClaims_TokenIsValidButNoUserIdentityIsEstablished()
    {
        // A token whose signature/issuer/audience/lifetime are all genuinely valid, but whose
        // claim VALUES are not properly encrypted (simulating tampering or a client-forged claim
        // that still happens to be under a correctly-signed token, or corruption). The JWT layer
        // must accept it (that's what it validates); the identity-resolution layer must not.
        var handler = new JwtSecurityTokenHandler();
        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, "not-a-valid-encrypted-value!!"),
            new Claim(JwtRegisteredClaimNames.Email, "also-not-encrypted"),
            new Claim(JwtRegisteredClaimNames.Name, "still-not-encrypted"),
        };
        var descriptor = new SecurityTokenDescriptor
        {
            Issuer = TestIssuer,
            Audience = TestAudience,
            Subject = new ClaimsIdentity(claims),
            NotBefore = DateTime.UtcNow,
            Expires = DateTime.UtcNow.AddDays(1),
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(Encoding.UTF8.GetBytes(TestSecurityKey)), SecurityAlgorithms.HmacSha256),
        };
        string token = handler.WriteToken(handler.CreateToken(descriptor));

        // Layer 1: the JWT itself is accepted — signature/issuer/audience/lifetime are all fine.
        var (principal, exception) = TryValidate(token, ValidationParameters());
        Assert.Null(exception);
        Assert.NotNull(principal);

        // Layer 2: identity resolution (AuthController.Me -> IAcutisAuthenticationService) must
        // not fabricate a plausible identity from unreadable claims. CommonMethods.DecryptValue
        // fails safe to "0"/null for each claim, so the service must see userId<=0 and refuse.
        long? capturedUserId = null;
        var service = new FakeAcutisAuthenticationService
        {
            GetCurrentUserHandler = (userId, _, _) =>
            {
                capturedUserId = userId;
                return userId <= 0
                    ? new MSResultArgs<AcutisCurrentUserDto> { StatusCode = CFR.Common.ErrorCodes.BadRequest, StatusMessage = "No authenticated user context was found." }
                    : new MSResultArgs<AcutisCurrentUserDto> { StatusCode = CFR.Common.ErrorCodes.Success, ResultData = new AcutisCurrentUserDto { UserId = userId } };
            },
        };
        var controller = new AuthController(service, new FakeJwtTokenGenerator())
        {
            ControllerContext = new Microsoft.AspNetCore.Mvc.ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = principal! },
            },
        };

        var meResult = await controller.Me(CancellationToken.None);

        Assert.Equal(0, capturedUserId);
        var badRequest = Assert.IsType<BadRequestObjectResult>(meResult);
        Assert.Equal(CFR.Common.ErrorCodes.BadRequest, Assert.IsType<CFR.DBEngine.MSResultArgs<AcutisCurrentUserDto>>(badRequest.Value).StatusCode);
    }
}
