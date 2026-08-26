// Copyright (c) OptionC. All rights reserved.

namespace CFR.AcutisService.Interfaces.PasswordReset;

/// <summary>
/// Interface-ready design for reset-link delivery (see docs/acutis-auth-spec/security-model.md).
/// A production implementation should wrap the existing <c>CFR.CommonService</c> SMTP services —
/// not reinvented here, only the seam is defined by this task.
/// </summary>
public interface IPasswordResetEmailSender
{
    Task SendPasswordResetEmailAsync(string toEmail, string resetLink, CancellationToken cancellationToken = default);
}
