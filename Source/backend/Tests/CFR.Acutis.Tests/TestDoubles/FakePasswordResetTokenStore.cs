// Copyright (c) OptionC. All rights reserved.

using CFR.AcutisInfrastructure.Models.Output;
using CFR.AcutisService.Interfaces.PasswordReset;

namespace CFR.Acutis.Tests.TestDoubles;

/// <summary>In-memory test double for <see cref="IPasswordResetTokenStore"/> — configurable validation result, no real storage.</summary>
public class FakePasswordResetTokenStore : IPasswordResetTokenStore
{
    public string TokenToIssue { get; set; } = "fake-issued-token";

    public PasswordResetTokenValidationResult ValidationResult { get; set; } =
        new() { IsValid = false, FailureReason = PasswordResetTokenFailureReason.NotFound };

    public Task<string> IssueResetTokenAsync(long userId, TimeSpan validity, CancellationToken cancellationToken = default)
    {
        return Task.FromResult(TokenToIssue);
    }

    public Task<PasswordResetTokenValidationResult> ValidateAndConsumeTokenAsync(string token, CancellationToken cancellationToken = default)
    {
        return Task.FromResult(ValidationResult);
    }
}
