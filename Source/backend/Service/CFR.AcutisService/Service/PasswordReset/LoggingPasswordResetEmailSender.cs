// Copyright (c) OptionC. All rights reserved.

using CFR.AcutisService.Interfaces.PasswordReset;

using Microsoft.Extensions.Logging;

namespace CFR.AcutisService.Service.PasswordReset;

/// <summary>
/// DEVELOPMENT-ONLY implementation of <see cref="IPasswordResetEmailSender"/>. Does NOT send a
/// real email — it only logs, at Information level, that a send was requested (never the reset
/// link or token itself, per docs/acutis-auth-spec/security-model.md's no-logging-of-tokens rule).
/// A production implementation should wrap the existing SMTP services in <c>CFR.CommonService</c>
/// (<c>ISMTPMailService</c>) instead of this class.
/// </summary>
public class LoggingPasswordResetEmailSender(ILogger<LoggingPasswordResetEmailSender> logger) : IPasswordResetEmailSender
{
    public Task SendPasswordResetEmailAsync(string toEmail, string resetLink, CancellationToken cancellationToken = default)
    {
        logger.LogInformation("Password reset email requested for {Email} (development sender — no email actually sent).", toEmail);
        return Task.CompletedTask;
    }
}
