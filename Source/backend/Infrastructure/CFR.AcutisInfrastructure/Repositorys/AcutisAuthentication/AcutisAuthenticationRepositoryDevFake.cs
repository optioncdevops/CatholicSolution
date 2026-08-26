// Copyright (c) OptionC. All rights reserved.

using CFR.AcutisInfrastructure.Interfaces.AcutisAuthentication;
using CFR.AcutisInfrastructure.Models.Output;

namespace CFR.AcutisInfrastructure.Repositorys.AcutisAuthentication;

/// <summary>
/// DEVELOPMENT-ONLY fake implementation of <see cref="IAcutisAuthenticationRepository"/>.
///
/// This class makes NO database call of any kind — no <c>IDapperHandler</c> usage, no connection
/// string, no live-database access. It exists solely so <c>CFR.Acutis</c>'s DI container has a
/// concrete type to resolve and so the service layer above it is exercisable/unit-testable before
/// a real repository exists.
///
/// It must be replaced with a real, Dapper-backed implementation once — and only once —
/// <c>NewViper.DoLogin</c> (or the target database's equivalent) and a working connection string
/// are confirmed to exist, per docs/acutis-auth-spec/database-contract.md. Real login does NOT
/// work against production data through this class, under any configuration.
/// </summary>
public class AcutisAuthenticationRepositoryDevFake : IAcutisAuthenticationRepository
{
    /// <summary>The only credentials this fake ever accepts — for local wiring verification only.</summary>
    private const string DevUserName = "dev.acutis@example.test";
    private const string DevPassword = "DevOnly!NotARealPassword";
    private const long DevUserId = 1;

    private static readonly List<AcutisModuleRightRow> DevModuleRights =
    [
        new()
        {
            DisplayName = "Dashboard",
            ModuleName = "Dashboard",
            UserRight = 1,
            RoleId = 1,
            FeatureID = 100,
            LevelId = 1,
            ParentId = 0,
            IsHideMenu = 0,
            DisplayOrder = 1,
            Icon = string.Empty,
            RoutingUrl = "/dashboard",
        },
    ];

    public Task<AcutisCredentialCheckResult> AuthenticateAsync(string userName, string password, CancellationToken cancellationToken = default)
    {
        bool matches = string.Equals(userName, DevUserName, StringComparison.OrdinalIgnoreCase)
            && string.Equals(password, DevPassword, StringComparison.Ordinal);

        if (!matches)
        {
            return Task.FromResult(new AcutisCredentialCheckResult
            {
                Succeeded = false,
                FailureReason = AcutisAuthFailureReason.InvalidCredentials,
            });
        }

        var user = new AcutisLoginUser
        {
            UserId = DevUserId,
            Email = DevUserName,
            FirstName = "Dev",
            LastName = "Fake",
            FullName = "Dev Fake",
        };

        return Task.FromResult(new AcutisCredentialCheckResult
        {
            Succeeded = true,
            User = user,
            ModuleRights = DevModuleRights,
        });
    }

    public Task<List<AcutisModuleRightRow>> GetModuleRightsAsync(long userId, CancellationToken cancellationToken = default)
    {
        return Task.FromResult(userId == DevUserId ? DevModuleRights : []);
    }

    public Task<ForgotPasswordLookupResult> FindAccountByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        bool found = string.Equals(email, DevUserName, StringComparison.OrdinalIgnoreCase);

        return Task.FromResult(new ForgotPasswordLookupResult
        {
            AccountFound = found,
            UserId = found ? DevUserId : null,
            Email = found ? DevUserName : null,
        });
    }

    public Task<AcutisPasswordChangeOutcome> SetPasswordAsync(long userId, string newPassword, CancellationToken cancellationToken = default)
    {
        // Confirmed blocker (docs/acutis-auth-spec/database-contract.md) — no backing database
        // object exists for this write. Fails closed, never a false success.
        return Task.FromResult(new AcutisPasswordChangeOutcome
        {
            VerifiedCurrentPassword = false,
            Completed = false,
            FailureReason = PasswordOperationFailureReason.NotSupported,
        });
    }
}
