// Copyright (c) OptionC. All rights reserved.

using CFR.AcutisService.Interfaces.PasswordReset;

namespace CFR.Acutis.Tests.TestDoubles;

/// <summary>In-memory test double for <see cref="IPasswordResetEmailSender"/> — records calls, sends nothing.</summary>
public class FakePasswordResetEmailSender : IPasswordResetEmailSender
{
    public int SendCallCount { get; private set; }

    public string? LastEmail { get; private set; }

    public Task SendPasswordResetEmailAsync(string toEmail, string resetLink, CancellationToken cancellationToken = default)
    {
        SendCallCount++;
        LastEmail = toEmail;
        return Task.CompletedTask;
    }
}
