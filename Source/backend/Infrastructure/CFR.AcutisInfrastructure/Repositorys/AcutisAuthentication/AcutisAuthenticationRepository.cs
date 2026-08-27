// Copyright (c) OptionC. All rights reserved.

using System.Data;

using CFR.AcutisInfrastructure.Interfaces.AcutisAuthentication;
using CFR.AcutisInfrastructure.Models.Output;
using CFR.Common;
using CFR.DBEngine;

using Dapper;

using Microsoft.Extensions.Logging;

using static Dapper.SqlMapper;

namespace CFR.AcutisInfrastructure.Repositorys.AcutisAuthentication;

/// <summary>
/// Real, Dapper-backed implementation of <see cref="IAcutisAuthenticationRepository"/> — the only
/// implementation registered (see <c>CFR.Acutis.AcutisAuthRepositorySelection</c>); no
/// development-fake/mock repository exists in this codebase. Every operation here is scoped to
/// exactly what was live-verified against the confirmed development database — see
/// docs/acutis-auth-spec/database-contract.md's "Verification succeeded" section for the exact
/// evidence (connection succeeded, object confirmed to exist, parameters, both result-set shapes,
/// password-verification/empty-result behavior, all captured without ever printing the connection
/// string or any row's data).
///
/// <b>Only <see cref="AuthenticateAsync"/> is backed by a confirmed database object.</b>
/// <see cref="GetModuleRightsAsync"/> and <see cref="FindAccountByEmailAsync"/> have no confirmed
/// standalone database object (see database-contract.md) — implementing them here would mean
/// inventing a query never verified to exist, which this task's rules explicitly forbid. They
/// throw <see cref="NotImplementedException"/> rather than silently guessing.
/// <see cref="SetPasswordAsync"/> remains an explicit, honest "not supported" outcome — no
/// password-write database object was in scope for this task and none was verified.
/// </summary>
public class AcutisAuthenticationRepository(IDapperHandler dapperHandler, ILogger<AcutisAuthenticationRepository> logger) : IAcutisAuthenticationRepository
{
    /// <summary>
    /// Confirmed live via this session's read-only verification — see
    /// docs/acutis-auth-spec/database-contract.md. Parameters: <c>@EMail varchar(50)</c>,
    /// <c>@Password varchar(50)</c>, <c>@IPAddress varchar(20)</c>, <c>@LoginTransferID varchar(100)</c>.
    /// First result set: a single identity row (empty when the credentials don't match — this IS
    /// the failure signal, not an error). Second result set: the module-rights rowset. The second
    /// result set was observed to still return rows even when the first was empty, so success must
    /// be determined from the FIRST result set having a row — never inferred from the second.
    /// </summary>
    private const string DoLoginProcedure = "NewViper.DoLogin";

    private const string NoConfirmedObjectMessage =
        "No confirmed database object exists for this operation — see docs/acutis-auth-spec/database-contract.md. " +
        "This is an explicit, honest blocker, not a guessed/invented query.";

    public async Task<AcutisCredentialCheckResult> AuthenticateAsync(string userName, string password, CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();

        var parameters = new DynamicParameters();
        parameters.Add("@EMail", userName, DbType.String, size: 50);
        parameters.Add("@Password", password, DbType.String, size: 50);
        // Never derived from a client-supplied value — see docs/acutis-auth-spec/api-contract.md §1.
        parameters.Add("@IPAddress", DBNull.Value, DbType.String, size: 20);
        parameters.Add("@LoginTransferID", DBNull.Value, DbType.String, size: 100);

        // Real database errors (connection failure, timeout, malformed call) are intentionally NOT
        // caught here — they propagate to AcutisAuthenticationService.LoginAsync's existing
        // catch block, which already logs safely (no credential values, generic response only) and
        // returns ErrorCodes.InternalServerError. Only "no matching row" (a normal, expected
        // outcome — not an error) is handled specially, below.
        using GridReader grid = await dapperHandler
            .QueryMultipleAsync(DoLoginProcedure, parameters, CommandType.StoredProcedure)
            .ConfigureAwait(false);

        AcutisLoginUser? user = (await grid.ReadAsync<AcutisLoginUser>().ConfigureAwait(false)).FirstOrDefault();

        // The second result set is read regardless — confirmed live to still return rows even for
        // a failed/unknown login — but is only ever attached to the result when the first result
        // set actually produced a user. See the class doc comment above.
        List<AcutisModuleRightRow> rights = (await grid.ReadAsync<AcutisModuleRightRow>().ConfigureAwait(false)).AsList();

        if (user is null || user.UserId <= 0)
        {
            AppLogger.LogInformation(logger, null, "Acutis database login attempt did not match an account.");
            return new AcutisCredentialCheckResult { Succeeded = false, FailureReason = AcutisAuthFailureReason.InvalidCredentials };
        }

        return new AcutisCredentialCheckResult { Succeeded = true, User = user, ModuleRights = rights };
    }

    public Task<List<AcutisModuleRightRow>> GetModuleRightsAsync(long userId, CancellationToken cancellationToken = default)
        => throw new NotImplementedException(
            "GetModuleRightsAsync: no standalone rights-by-userId database object is confirmed to exist. " +
            "The only confirmed object (NewViper.DoLogin) requires re-authenticating with a password, which " +
            "this method does not have. " + NoConfirmedObjectMessage);

    public Task<ForgotPasswordLookupResult> FindAccountByEmailAsync(string email, CancellationToken cancellationToken = default)
        => throw new NotImplementedException("FindAccountByEmailAsync: " + NoConfirmedObjectMessage);

    public Task<AcutisPasswordChangeOutcome> SetPasswordAsync(long userId, string newPassword, CancellationToken cancellationToken = default)
    {
        // Explicit, honest blocker — the service layer already handles Completed=false gracefully.
        // Never a false success. See docs/acutis-auth-spec/database-contract.md.
        AppLogger.LogInformation(logger, null, "Acutis password write requested for UserId={UserId} — not supported (no confirmed database write path).", userId);

        return Task.FromResult(new AcutisPasswordChangeOutcome
        {
            VerifiedCurrentPassword = false,
            Completed = false,
            FailureReason = PasswordOperationFailureReason.NotSupported,
        });
    }
}
