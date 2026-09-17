// Copyright (c) OptionC. All rights reserved.

using System.Text.RegularExpressions;

namespace CFR.Common
{
    /// <summary>
    /// Shared email-format validation, enforced server-side wherever an email address is accepted
    /// from a client. Mirrors frontend/CFR_Admin's client-side UsersValidator.ts eMail pattern
    /// exactly — a client-only format check can be bypassed by a direct API call.
    /// </summary>
    public static class EmailValidator
    {
        private static readonly Regex Pattern = new(@"^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$", RegexOptions.IgnoreCase | RegexOptions.Compiled);

        /// <summary>
        /// True when the value is a non-empty string matching a standard email address shape.
        /// </summary>
        /// <param name="email">The email address to validate.</param>
        /// <returns>Whether the email address is well-formed.</returns>
        public static bool IsValidFormat(string email) =>
            !string.IsNullOrWhiteSpace(email) && Pattern.IsMatch(email);
    }
}
