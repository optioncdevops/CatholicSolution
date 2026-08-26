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
            new AcutisChangePasswordRequest { CurrentPassword = "current-pw", NewPassword = "new-pw", ConfirmPassword = "new-pw" });

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
            new AcutisChangePasswordRequest { CurrentPassword = "wrong", NewPassword = "new-pw", ConfirmPassword = "new-pw" });

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
            new AcutisChangePasswordRequest { CurrentPassword = "correct", NewPassword = "new-pw", ConfirmPassword = "new-pw" });

        Assert.Equal(ErrorCodes.Failed, result.StatusCode);
        Assert.NotEqual(ErrorMessages.Success, result.StatusMessage);
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

    [Fact]
    public async Task ResetPasswordAsync_InvalidToken_HandledSafelyWithGenericFailure()
    {
        var tokenStore = new FakePasswordResetTokenStore
        {
            ValidationResult = new PasswordResetTokenValidationResult { IsValid = false, FailureReason = PasswordResetTokenFailureReason.Expired },
        };

        var result = await CreateService(tokenStore: tokenStore).ResetPasswordAsync(
            new AcutisResetPasswordRequest { Token = "bogus", NewPassword = "new-pw", ConfirmPassword = "new-pw" });

        Assert.Equal(ErrorCodes.Failed, result.StatusCode);
        Assert.Equal("This reset link is invalid or has expired.", result.StatusMessage);
    }

    [Fact]
    public async Task ResetPasswordAsync_MismatchedPasswords_ReturnsBadRequest()
    {
        var result = await CreateService().ResetPasswordAsync(
            new AcutisResetPasswordRequest { Token = "t", NewPassword = "a", ConfirmPassword = "b" });

        Assert.Equal(ErrorCodes.BadRequest, result.StatusCode);
    }
}
