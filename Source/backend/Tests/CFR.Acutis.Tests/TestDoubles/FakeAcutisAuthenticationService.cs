// Copyright (c) OptionC. All rights reserved.

using CFR.AcutisInfrastructure.Models.Input;
using CFR.AcutisInfrastructure.Models.Output;
using CFR.AcutisService.Interfaces.AcutisAuthentication;
using CFR.Common;
using CFR.DBEngine;

namespace CFR.Acutis.Tests.TestDoubles;

/// <summary>
/// In-memory test double for <see cref="IAcutisAuthenticationService"/>, for testing
/// <c>AuthController</c> in isolation from the real service's orchestration logic (which has its
/// own dedicated tests in <c>AcutisAuthenticationServiceTests</c>). Every method is
/// individually configurable; unconfigured calls return a safe, generic-failure default rather
/// than throwing, so a test only needs to set up the one call path it cares about.
/// </summary>
public class FakeAcutisAuthenticationService : IAcutisAuthenticationService
{
    public Func<AcutisLoginRequest, MSResultArgs<AcutisLoginResult>>? LoginHandler { get; set; }

    public Func<long, string?, string?, MSResultArgs<AcutisCurrentUserDto>>? GetCurrentUserHandler { get; set; }

    public Func<long, MSResultArgs>? LogoutHandler { get; set; }

    public Func<long, string, AcutisChangePasswordRequest, MSResultArgs>? ChangePasswordHandler { get; set; }

    public Func<AcutisForgotPasswordRequest, MSResultArgs>? ForgotPasswordHandler { get; set; }

    public Func<AcutisResetPasswordRequest, MSResultArgs>? ResetPasswordHandler { get; set; }

    public Func<long, MSResultArgs<List<AcutisMenuGroup>>>? GetMenusHandler { get; set; }

    public Task<MSResultArgs<AcutisLoginResult>> LoginAsync(AcutisLoginRequest request, CancellationToken cancellationToken = default)
    {
        return Task.FromResult(LoginHandler?.Invoke(request) ?? new MSResultArgs<AcutisLoginResult> { StatusCode = ErrorCodes.Failed, StatusMessage = ErrorMessages.Error });
    }

    public Task<MSResultArgs> LogoutAsync(long userId, CancellationToken cancellationToken = default)
    {
        return Task.FromResult(LogoutHandler?.Invoke(userId) ?? new MSResultArgs { StatusCode = ErrorCodes.Success, StatusMessage = ErrorMessages.Success });
    }

    public Task<MSResultArgs<AcutisCurrentUserDto>> GetCurrentUserAsync(long userId, string? email, string? fullName, CancellationToken cancellationToken = default)
    {
        return Task.FromResult(GetCurrentUserHandler?.Invoke(userId, email, fullName)
            ?? new MSResultArgs<AcutisCurrentUserDto> { StatusCode = ErrorCodes.BadRequest, StatusMessage = "No authenticated user context was found." });
    }

    public Task<MSResultArgs> ChangePasswordAsync(long userId, string userName, AcutisChangePasswordRequest request, CancellationToken cancellationToken = default)
    {
        return Task.FromResult(ChangePasswordHandler?.Invoke(userId, userName, request) ?? new MSResultArgs { StatusCode = ErrorCodes.Failed, StatusMessage = ErrorMessages.Error });
    }

    public Task<MSResultArgs> ForgotPasswordAsync(AcutisForgotPasswordRequest request, CancellationToken cancellationToken = default)
    {
        return Task.FromResult(ForgotPasswordHandler?.Invoke(request) ?? new MSResultArgs { StatusCode = ErrorCodes.Success, StatusMessage = "If an account exists for that email, a reset link has been sent." });
    }

    public Task<MSResultArgs> ResetPasswordAsync(AcutisResetPasswordRequest request, CancellationToken cancellationToken = default)
    {
        return Task.FromResult(ResetPasswordHandler?.Invoke(request) ?? new MSResultArgs { StatusCode = ErrorCodes.Failed, StatusMessage = "This reset link is invalid or has expired." });
    }

    public Task<MSResultArgs<List<AcutisMenuGroup>>> GetMenusAsync(long userId, CancellationToken cancellationToken = default)
    {
        return Task.FromResult(GetMenusHandler?.Invoke(userId) ?? new MSResultArgs<List<AcutisMenuGroup>> { StatusCode = ErrorCodes.Success, ResultData = [] });
    }
}
