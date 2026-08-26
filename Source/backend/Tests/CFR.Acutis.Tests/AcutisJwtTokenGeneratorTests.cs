// Copyright (c) OptionC. All rights reserved.

using System.IdentityModel.Tokens.Jwt;

using CFR.Acutis;
using CFR.AcutisInfrastructure.Models.Output;
using CFR.Base;
using CFR.CommonService;

using Microsoft.Extensions.Options;

using Xunit;

namespace CFR.Acutis.Tests;

/// <summary>
/// Tests use a test-only, hardcoded signing key — not a real secret, never used against a real
/// deployment, and never printed. No network/database access.
/// </summary>
public class AcutisJwtTokenGeneratorTests
{
    private const string TestSecurityKey = "unit-test-only-signing-key-not-a-real-secret-32bytes!";
    private const string TestIssuer = "cfr-acutis-tests";
    private const string TestAudience = "cfr-client-tests";

    private static AcutisJwtTokenGenerator CreateGenerator(string? securityKey = TestSecurityKey)
    {
        var settings = new JWTSetting
        {
            SecurityKey = securityKey,
            Issuer = TestIssuer,
            Audience = TestAudience,
        };
        return new AcutisJwtTokenGenerator(Options.Create(settings));
    }

    private static AcutisLoginUser CreateUser() => new()
    {
        UserId = 42,
        Email = "person@example.test",
        FirstName = "Ann",
        LastName = "Example",
        FullName = "Ann Example",
    };

    [Fact]
    public void GenerateToken_ProducesASignedThreePartJwt()
    {
        string token = CreateGenerator().GenerateToken(CreateUser());

        Assert.False(string.IsNullOrWhiteSpace(token));
        Assert.Equal(3, token.Split('.').Length);
        Assert.True(new JwtSecurityTokenHandler().CanReadToken(token));
    }

    [Fact]
    public void GenerateToken_ContainsOnlySubEmailAndNameClaims()
    {
        string token = CreateGenerator().GenerateToken(CreateUser());
        var jwt = new JwtSecurityTokenHandler().ReadJwtToken(token);

        var claimTypes = jwt.Claims.Select(c => c.Type).ToHashSet();

        Assert.Contains(JwtRegisteredClaimNames.Sub, claimTypes);
        Assert.Contains(JwtRegisteredClaimNames.Email, claimTypes);
        Assert.Contains(JwtRegisteredClaimNames.Name, claimTypes);

        // Every claim not registered by the JWT spec itself (iss/aud/exp/nbf/iat are added by the
        // token descriptor, not by our claim list) must be one of the three approved thin claims.
        string[] allowed = [JwtRegisteredClaimNames.Sub, JwtRegisteredClaimNames.Email, JwtRegisteredClaimNames.Name];
        string[] frameworkAdded = [JwtRegisteredClaimNames.Iss, JwtRegisteredClaimNames.Aud, JwtRegisteredClaimNames.Exp, JwtRegisteredClaimNames.Nbf, JwtRegisteredClaimNames.Iat];
        foreach (var claim in jwt.Claims)
        {
            Assert.True(allowed.Contains(claim.Type) || frameworkAdded.Contains(claim.Type),
                $"Unexpected claim type present on the Acutis JWT: {claim.Type}");
        }
    }

    [Fact]
    public void GenerateToken_ClaimsAreEncryptedUsingTheApprovedConvention()
    {
        var user = CreateUser();
        string token = CreateGenerator().GenerateToken(user);
        var jwt = new JwtSecurityTokenHandler().ReadJwtToken(token);

        string rawEmailClaim = jwt.Claims.Single(c => c.Type == JwtRegisteredClaimNames.Email).Value;
        string rawSubClaim = jwt.Claims.Single(c => c.Type == JwtRegisteredClaimNames.Sub).Value;
        string rawNameClaim = jwt.Claims.Single(c => c.Type == JwtRegisteredClaimNames.Name).Value;

        // The raw claim values must not be the plaintext identity — they must be encrypted.
        Assert.NotEqual(user.Email, rawEmailClaim);
        Assert.NotEqual(user.UserId.ToString(), rawSubClaim);
        Assert.NotEqual(user.FullName, rawNameClaim);

        // And must round-trip through the same decrypt convention AuthController uses.
        Assert.Equal(user.Email, CommonMethods.DecryptValue(rawEmailClaim));
        Assert.Equal(user.UserId.ToString(), CommonMethods.DecryptValue(rawSubClaim));
        Assert.Equal(user.FullName, CommonMethods.DecryptValue(rawNameClaim));
    }

    [Fact]
    public void GenerateToken_SetsConfiguredIssuerAndAudience()
    {
        string token = CreateGenerator().GenerateToken(CreateUser());
        var jwt = new JwtSecurityTokenHandler().ReadJwtToken(token);

        Assert.Equal(TestIssuer, jwt.Issuer);
        Assert.Contains(TestAudience, jwt.Audiences);
    }

    [Fact]
    public void GenerateToken_ExpiryIsApproximatelyOneDayFromNow()
    {
        var before = DateTime.UtcNow;
        string token = CreateGenerator().GenerateToken(CreateUser());
        var after = DateTime.UtcNow;

        var jwt = new JwtSecurityTokenHandler().ReadJwtToken(token);

        Assert.InRange(jwt.ValidTo, before.AddDays(1).AddMinutes(-2), after.AddDays(1).AddMinutes(2));
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void GenerateToken_MissingSecurityKey_FailsSafelyWithInvalidOperationException(string? missingKey)
    {
        var generator = CreateGenerator(missingKey);

        Assert.Throws<InvalidOperationException>(() => generator.GenerateToken(CreateUser()));
    }

    [Fact]
    public void GenerateToken_NullUser_Throws()
    {
        Assert.Throws<ArgumentNullException>(() => CreateGenerator().GenerateToken(null!));
    }

    [Fact]
    public void GenerateToken_NeverContainsRoleOrPermissionOrMenuOrPasswordData()
    {
        string token = CreateGenerator().GenerateToken(CreateUser());
        var jwt = new JwtSecurityTokenHandler().ReadJwtToken(token);

        // Raw (undecrypted) claim values are opaque ciphertext, but the claim TYPES themselves
        // must never include anything role/permission/menu/password-shaped, and the decrypted
        // values (already checked above) are exactly UserId/Email/FullName — nothing else was
        // ever passed into the token descriptor for this generator to leak.
        string[] forbiddenNames = ["role", "permission", "menu", "password", "moduleright", "right"];
        foreach (var claim in jwt.Claims)
        {
            string lowered = claim.Type.ToLowerInvariant();
            Assert.DoesNotContain(forbiddenNames, forbidden => lowered.Contains(forbidden));
        }
    }
}
