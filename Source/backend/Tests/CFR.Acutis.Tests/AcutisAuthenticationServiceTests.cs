// Copyright (c) OptionC. All rights reserved.

using CFR.Acutis.Tests.TestDoubles;
using CFR.AcutisInfrastructure.Models.Input;
using CFR.AcutisInfrastructure.Models.Output;
using CFR.AcutisService.Service.AcutisAuthentication;
using CFR.Common;

using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging.Abstractions;

using Xunit;

namespace CFR.Acutis.Tests;

/// <summary>
/// All dependencies are in-memory fakes (TestDoubles/) — no database, no network, no real
/// configuration/secrets. <see cref="IConfiguration"/> is an empty in-memory builder, exercising
/// exactly the same "missing optional config" path the real service already handles gracefully.
/// </summary>
public class AcutisAuthenticationServiceTests
{
    private static IConfiguration EmptyConfiguration => new ConfigurationBuilder().Build();

    private static AcutisAuthenticationService CreateService(
        FakeAcutisAuthenticationRepository? repository = null,
        FakePasswordResetTokenStore? tokenStore = null,
        FakePasswordResetEmailSender? emailSender = null)
    {
        return new AcutisAuthenticationService(
            repository ?? new FakeAcutisAuthenticationRepository(),
            tokenStore ?? new FakePasswordResetTokenStore(),
            emailSender ?? new FakePasswordResetEmailSender(),
            EmptyConfiguration,
            NullLogger<AcutisAuthenticationService>.Instance);
    }

    // --- Login ---

    [Fact]
    public async Task LoginAsync_ValidCredentials_ReturnsSuccessAndUser()
    {
        var repo = new FakeAcutisAuthenticationRepository
        {
            AuthenticateHandler = (_, _) => new AcutisCredentialCheckResult
            {
                Succeeded = true,
                User = new AcutisLoginUser { UserId = 1, Email = "dev@example.test", FullName = "Dev User" },
                ModuleRights = [],
            },
        };

        var result = await CreateService(repo).LoginAsync(new AcutisLoginRequest { UserName = "dev@example.test", Password = "correct" });

        Assert.Equal(ErrorCodes.Success, result.StatusCode);
        Assert.NotNull(result.ResultData);
        Assert.Equal("dev@example.test", result.ResultData!.User.Email);
    }

    [Fact]
    public async Task LoginAsync_InvalidCredentials_ReturnsGenericError()
    {
        var repo = new FakeAcutisAuthenticationRepository
        {
            AuthenticateHandler = (_, _) => new AcutisCredentialCheckResult { Succeeded = false, FailureReason = AcutisAuthFailureReason.InvalidCredentials },
        };

        var result = await CreateService(repo).LoginAsync(new AcutisLoginRequest { UserName = "someone", Password = "wrong" });

        Assert.Equal(ErrorCodes.Failed, result.StatusCode);
        Assert.Equal("Invalid username or password.", result.StatusMessage);
        Assert.Null(result.ResultData);
    }

    [Fact]
    public async Task LoginAsync_EmptyUserResult_ReturnsFailure()
    {
        // Succeeded=true but User=null — a malformed/empty repository result must not be treated as success.
        var repo = new FakeAcutisAuthenticationRepository
        {
            AuthenticateHandler = (_, _) => new AcutisCredentialCheckResult { Succeeded = true, User = null },
        };

        var result = await CreateService(repo).LoginAsync(new AcutisLoginRequest { UserName = "someone", Password = "x" });

        Assert.Equal(ErrorCodes.Failed, result.StatusCode);
        Assert.Null(result.ResultData);
    }

    [Fact]
    public async Task LoginAsync_NullOrEmptyRequestFields_ReturnsBadRequest()
    {
        var result1 = await CreateService().LoginAsync(new AcutisLoginRequest { UserName = "", Password = "x" });
        var result2 = await CreateService().LoginAsync(new AcutisLoginRequest { UserName = "x", Password = "" });

        Assert.Equal(ErrorCodes.BadRequest, result1.StatusCode);
        Assert.Equal(ErrorCodes.BadRequest, result2.StatusCode);
    }

    [Fact]
    public async Task LoginAsync_RepositoryThrows_HandledSafelyAsInternalServerError()
    {
        var repo = new FakeAcutisAuthenticationRepository { ThrowOnAuthenticate = new InvalidOperationException("simulated connection failure") };

        var result = await CreateService(repo).LoginAsync(new AcutisLoginRequest { UserName = "someone", Password = "x" });

        Assert.Equal(ErrorCodes.InternalServerError, result.StatusCode);
        Assert.Equal(ErrorMessages.InternalServerError, result.StatusMessage);
        // The generic message must not leak the real exception text.
        Assert.DoesNotContain("simulated connection failure", result.StatusMessage);
    }

    // --- Current user ---

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    public async Task GetCurrentUserAsync_MissingOrInvalidUserId_ReturnsBadRequest(long invalidUserId)
    {
        var result = await CreateService().GetCurrentUserAsync(invalidUserId, "a@b.test", "A B");

        Assert.Equal(ErrorCodes.BadRequest, result.StatusCode);
        Assert.Null(result.ResultData);
    }

    [Fact]
    public async Task GetCurrentUserAsync_ValidUserId_ReturnsIdentity()
    {
        var result = await CreateService().GetCurrentUserAsync(7, "a@b.test", "A B");

        Assert.Equal(ErrorCodes.Success, result.StatusCode);
        Assert.Equal(7, result.ResultData!.UserId);
        Assert.Equal("a@b.test", result.ResultData.Email);
    }

    // --- Change password ---

    [Fact]
    public async Task ChangePasswordAsync_VerificationDelegatesToRepositoryWithUserNameAndCurrentPassword()
    {
        string? capturedUserName = null;
        string? capturedPassword = null;
        var repo = new FakeAcutisAuthenticationRepository
        {
            AuthenticateHandler = (userName, password) =>
            {
                capturedUserName = userName;
                capturedPassword = password;
                return new AcutisCredentialCheckResult { Succeeded = true, User = new AcutisLoginUser { UserId = 1 } };
            },
        };

        await CreateService(repo).ChangePasswordAsync(
            1,
            "dev@example.test",
            new AcutisChangePasswordRequest { CurrentPassword = "current-pw", NewPassword = "NewPassword1", ConfirmPassword = "NewPassword1" });

        Assert.Equal(1, repo.AuthenticateCallCount);
        Assert.Equal("dev@example.test", capturedUserName);
        Assert.Equal("current-pw", capturedPassword);
    }

    [Fact]
    public async Task ChangePasswordAsync_IncorrectCurrentPassword_ReturnsGenericFailure()
    {
        var repo = new FakeAcutisAuthenticationRepository
        {
            AuthenticateHandler = (_, _) => new AcutisCredentialCheckResult { Succeeded = false, FailureReason = AcutisAuthFailureReason.InvalidCredentials },
        };

        var result = await CreateService(repo).ChangePasswordAsync(
            1, "dev@example.test",
            new AcutisChangePasswordRequest { CurrentPassword = "wrong", NewPassword = "NewPassword1", ConfirmPassword = "NewPassword1" });

        Assert.Equal(ErrorCodes.Failed, result.StatusCode);
        Assert.Equal("Current password is incorrect.", result.StatusMessage);
    }

    [Fact]
    public async Task ChangePasswordAsync_MismatchedNewAndConfirmPassword_ReturnsBadRequest()
    {
        var result = await CreateService().ChangePasswordAsync(
            1, "dev@example.test",
            new AcutisChangePasswordRequest { CurrentPassword = "x", NewPassword = "a", ConfirmPassword = "b" });

        Assert.Equal(ErrorCodes.BadRequest, result.StatusCode);
    }

    [Fact]
    public async Task ChangePasswordAsync_VerifiedButWriteNotSupported_NeverReportsFalseSuccess()
    {
        var repo = new FakeAcutisAuthenticationRepository
        {
            AuthenticateHandler = (_, _) => new AcutisCredentialCheckResult { Succeeded = true, User = new AcutisLoginUser { UserId = 1 } },
            SetPasswordHandler = (_, _) => new AcutisPasswordChangeOutcome { Completed = false, FailureReason = PasswordOperationFailureReason.NotSupported },
        };

        var result = await CreateService(repo).ChangePasswordAsync(
            1, "dev@example.test",
            new AcutisChangePasswordRequest { CurrentPassword = "correct", NewPassword = "NewPassword1", ConfirmPassword = "NewPassword1" });

        Assert.Equal(ErrorCodes.Failed, result.StatusCode);
        Assert.NotEqual(ErrorMessages.Success, result.StatusMessage);
    }

    [Fact]
    public async Task ChangePasswordAsync_NewPasswordSameAsCurrent_ReturnsBadRequest_NeverCallsRepository()
    {
        var repo = new FakeAcutisAuthenticationRepository();

        var result = await CreateService(repo).ChangePasswordAsync(
            1, "dev@example.test",
            new AcutisChangePasswordRequest { CurrentPassword = "SamePassword1", NewPassword = "SamePassword1", ConfirmPassword = "SamePassword1" });

        Assert.Equal(ErrorCodes.BadRequest, result.StatusCode);
        Assert.Equal("New password must be different from the current password.", result.StatusMessage);
        Assert.Equal(0, repo.AuthenticateCallCount);
    }

    [Fact]
    public async Task ChangePasswordAsync_NewPasswordFailsPolicy_ReturnsBadRequestWithPolicyMessage_NeverCallsRepository()
    {
        var repo = new FakeAcutisAuthenticationRepository();

        var result = await CreateService(repo).ChangePasswordAsync(
            1, "dev@example.test",
            new AcutisChangePasswordRequest { CurrentPassword = "CurrentPw1", NewPassword = "short", ConfirmPassword = "short" });

        Assert.Equal(ErrorCodes.BadRequest, result.StatusCode);
        Assert.Equal(AcutisAuthValidation.PasswordPolicyDescription, result.StatusMessage);
        Assert.Equal(0, repo.AuthenticateCallCount);
    }

    // --- Forgot password ---

    [Fact]
    public async Task ForgotPasswordAsync_AccountFoundOrNotFound_ReturnsIdenticalGenericResponse()
    {
        var foundRepo = new FakeAcutisAuthenticationRepository
        {
            FindAccountByEmailHandler = _ => new ForgotPasswordLookupResult { AccountFound = true, UserId = 1, Email = "dev@example.test" },
        };
        var notFoundRepo = new FakeAcutisAuthenticationRepository
        {
            FindAccountByEmailHandler = _ => new ForgotPasswordLookupResult { AccountFound = false },
        };

        var foundResult = await CreateService(foundRepo).ForgotPasswordAsync(new AcutisForgotPasswordRequest { Email = "dev@example.test" });
        var notFoundResult = await CreateService(notFoundRepo).ForgotPasswordAsync(new AcutisForgotPasswordRequest { Email = "nobody@example.test" });

        Assert.Equal(foundResult.StatusCode, notFoundResult.StatusCode);
        Assert.Equal(foundResult.StatusMessage, notFoundResult.StatusMessage);
        Assert.Equal(ErrorCodes.Success, foundResult.StatusCode);
    }

    [Fact]
    public async Task ForgotPasswordAsync_AccountFound_IssuesTokenAndSendsEmail()
    {
        var repo = new FakeAcutisAuthenticationRepository
        {
            FindAccountByEmailHandler = _ => new ForgotPasswordLookupResult { AccountFound = true, UserId = 1, Email = "dev@example.test" },
        };
        var emailSender = new FakePasswordResetEmailSender();

        await CreateService(repo, emailSender: emailSender).ForgotPasswordAsync(new AcutisForgotPasswordRequest { Email = "dev@example.test" });

        Assert.Equal(1, emailSender.SendCallCount);
        Assert.Equal("dev@example.test", emailSender.LastEmail);
    }

    [Fact]
    public async Task ForgotPasswordAsync_AccountNotFound_DoesNotSendEmail()
    {
        var repo = new FakeAcutisAuthenticationRepository { FindAccountByEmailHandler = _ => new ForgotPasswordLookupResult { AccountFound = false } };
        var emailSender = new FakePasswordResetEmailSender();

        await CreateService(repo, emailSender: emailSender).ForgotPasswordAsync(new AcutisForgotPasswordRequest { Email = "nobody@example.test" });

        Assert.Equal(0, emailSender.SendCallCount);
    }

    // --- Reset password ---

    [Theory]
    [InlineData(PasswordResetTokenFailureReason.NotFound)]
    [InlineData(PasswordResetTokenFailureReason.Expired)]
    [InlineData(PasswordResetTokenFailureReason.AlreadyUsed)]
    public async Task ResetPasswordAsync_InvalidToken_HandledSafelyWithGenericFailure(PasswordResetTokenFailureReason reason)
    {
        // Token is plausible-length (>=16 chars) so this reaches the token store, exercising
        // NotFound/Expired/AlreadyUsed — never distinguished to the caller, per
        // docs/acutis-auth-spec/validation-standard.md.
        var tokenStore = new FakePasswordResetTokenStore
        {
            ValidationResult = new PasswordResetTokenValidationResult { IsValid = false, FailureReason = reason },
        };

        var result = await CreateService(tokenStore: tokenStore).ResetPasswordAsync(
            new AcutisResetPasswordRequest { Token = "a-plausible-length-token-value", NewPassword = "NewPassword1", ConfirmPassword = "NewPassword1" });

        Assert.Equal(ErrorCodes.Failed, result.StatusCode);
        Assert.Equal("This reset link is invalid or has expired.", result.StatusMessage);
    }

    [Fact]
    public async Task ResetPasswordAsync_ImplausibleToken_NeverReachesTokenStore_SameGenericFailure()
    {
        var tokenStore = new FakePasswordResetTokenStore();

        var result = await CreateService(tokenStore: tokenStore).ResetPasswordAsync(
            new AcutisResetPasswordRequest { Token = "too-short", NewPassword = "NewPassword1", ConfirmPassword = "NewPassword1" });

        Assert.Equal(0, tokenStore.ValidateAndConsumeCallCount);
        Assert.Equal(ErrorCodes.Failed, result.StatusCode);
        Assert.Equal("This reset link is invalid or has expired.", result.StatusMessage);
    }

    [Fact]
    public async Task ResetPasswordAsync_MismatchedPasswords_ReturnsBadRequest()
    {
        var result = await CreateService().ResetPasswordAsync(
            new AcutisResetPasswordRequest { Token = "a-plausible-length-token-value", NewPassword = "a", ConfirmPassword = "b" });

        Assert.Equal(ErrorCodes.BadRequest, result.StatusCode);
    }

    [Fact]
    public async Task ResetPasswordAsync_PasswordFailsPolicy_ReturnsBadRequestWithPolicyMessage()
    {
        var result = await CreateService().ResetPasswordAsync(
            new AcutisResetPasswordRequest { Token = "a-plausible-length-token-value", NewPassword = "short", ConfirmPassword = "short" });

        Assert.Equal(ErrorCodes.BadRequest, result.StatusCode);
        Assert.Equal(AcutisAuthValidation.PasswordPolicyDescription, result.StatusMessage);
    }

    // --- Null request / whitespace fields (non-HTTP-caller boundary) ---

    [Fact]
    public async Task ForgotPasswordAsync_NullRequest_ReturnsBadRequest()
    {
        var result = await CreateService().ForgotPasswordAsync(null!);

        Assert.Equal(ErrorCodes.BadRequest, result.StatusCode);
    }

    [Fact]
    public async Task ResetPasswordAsync_NullRequest_ReturnsBadRequest()
    {
        var result = await CreateService().ResetPasswordAsync(null!);

        Assert.Equal(ErrorCodes.BadRequest, result.StatusCode);
    }

    [Fact]
    public async Task ChangePasswordAsync_NullRequest_ReturnsBadRequest()
    {
        var result = await CreateService().ChangePasswordAsync(1, "dev@example.test", null!);

        Assert.Equal(ErrorCodes.BadRequest, result.StatusCode);
    }

    [Fact]
    public async Task LoginAsync_WhitespaceOnlyFields_TreatedAsMissing_ReturnsBadRequest()
    {
        var result = await CreateService().LoginAsync(new AcutisLoginRequest { UserName = "   ", Password = "   " });

        Assert.Equal(ErrorCodes.BadRequest, result.StatusCode);
    }

    [Fact]
    public async Task ChangePasswordAsync_WhitespaceOnlyFields_TreatedAsMissing_ReturnsBadRequest()
    {
        var result = await CreateService().ChangePasswordAsync(
            1, "dev@example.test",
            new AcutisChangePasswordRequest { CurrentPassword = "  ", NewPassword = "  ", ConfirmPassword = "  " });

        Assert.Equal(ErrorCodes.BadRequest, result.StatusCode);
    }

    // --- Trimming (email/username only — never passwords) ---

    [Fact]
    public async Task LoginAsync_UserNameWithSurroundingWhitespace_TrimmedBeforeRepositoryCall()
    {
        string? capturedUserName = null;
        string? capturedPassword = null;
        var repo = new FakeAcutisAuthenticationRepository
        {
            AuthenticateHandler = (userName, password) =>
            {
                capturedUserName = userName;
                capturedPassword = password;
                return new AcutisCredentialCheckResult { Succeeded = true, User = new AcutisLoginUser { UserId = 1 } };
            },
        };

        await CreateService(repo).LoginAsync(new AcutisLoginRequest { UserName = "  dev@example.test  ", Password = "  keep-me  " });

        Assert.Equal("dev@example.test", capturedUserName);
        // Password must never be trimmed — the surrounding whitespace is preserved exactly.
        Assert.Equal("  keep-me  ", capturedPassword);
    }

    [Fact]
    public async Task ForgotPasswordAsync_EmailWithSurroundingWhitespace_TrimmedBeforeLookup()
    {
        string? capturedEmail = null;
        var repo = new FakeAcutisAuthenticationRepository
        {
            FindAccountByEmailHandler = email =>
            {
                capturedEmail = email;
                return new ForgotPasswordLookupResult { AccountFound = false };
            },
        };

        await CreateService(repo).ForgotPasswordAsync(new AcutisForgotPasswordRequest { Email = "  dev@example.test  " });

        Assert.Equal("dev@example.test", capturedEmail);
    }

    // --- No sensitive values leak into responses ---

    [Fact]
    public async Task ChangePasswordAsync_AnyFailureResponse_NeverContainsSubmittedPasswordValues()
    {
        const string currentPassword = "TotallySecretCurrent1";
        const string newPassword = "TotallySecretNewOne1";
        var repo = new FakeAcutisAuthenticationRepository
        {
            AuthenticateHandler = (_, _) => new AcutisCredentialCheckResult { Succeeded = false, FailureReason = AcutisAuthFailureReason.InvalidCredentials },
        };

        var result = await CreateService(repo).ChangePasswordAsync(
            1, "dev@example.test",
            new AcutisChangePasswordRequest { CurrentPassword = currentPassword, NewPassword = newPassword, ConfirmPassword = newPassword });

        Assert.DoesNotContain(currentPassword, result.StatusMessage);
        Assert.DoesNotContain(newPassword, result.StatusMessage);
    }

    [Fact]
    public async Task ResetPasswordAsync_AnyFailureResponse_NeverContainsSubmittedTokenOrPasswordValues()
    {
        const string token = "a-plausible-length-token-value";
        const string newPassword = "TotallySecretResetOne1";
        var tokenStore = new FakePasswordResetTokenStore
        {
            ValidationResult = new PasswordResetTokenValidationResult { IsValid = false, FailureReason = PasswordResetTokenFailureReason.NotFound },
        };

        var result = await CreateService(tokenStore: tokenStore).ResetPasswordAsync(
            new AcutisResetPasswordRequest { Token = token, NewPassword = newPassword, ConfirmPassword = newPassword });

        Assert.DoesNotContain(token, result.StatusMessage);
        Assert.DoesNotContain(newPassword, result.StatusMessage);
    }
}
