// Copyright (c) OptionC. All rights reserved.

using System.Text.RegularExpressions;

namespace CFR.Common
{
    /// <summary>
    /// Shared password-strength policy, enforced server-side by every password-setting flow
    /// (Reset Password, Change Password). Mirrors frontend/CFR_Admin's client-side
    /// shared/auth/validators.ts passwordScore rule exactly — a client-only strength check can be
    /// bypassed by a direct API call, so the same 4-criteria/minimum-3 rule must also run here.
    /// </summary>
    public static class PasswordPolicy
    {
        /// <summary>
        /// Minimum character length a password must satisfy on its own, regardless of strength score.
        /// </summary>
        public const int MinimumLength = 8;

        /// <summary>
        /// Minimum number of strength criteria (out of 4) a password must satisfy.
        /// </summary>
        public const int MinimumScore = 3;

        /// <summary>
        /// Maximum character length a password may have. Matches the VARCHAR(50) parameter used
        /// by both the save and login stored procedures — anything longer would otherwise be
        /// silently truncated by SQL rather than rejected, so this must be checked and rejected
        /// explicitly before it ever reaches the database.
        /// </summary>
        public const int MaximumLength = 50;

        /// <summary>
        /// Scores a password against 4 criteria: length >= 8, mixed case, a digit, and a symbol.
        /// </summary>
        /// <param name="password">The password to score.</param>
        /// <returns>A count from 0 to 4 of how many criteria the password satisfies.</returns>
        public static int Score(string password)
        {
            if (string.IsNullOrEmpty(password))
            {
                return 0;
            }

            int score = 0;
            if (password.Length >= MinimumLength) score++;
            if (Regex.IsMatch(password, "[A-Z]") && Regex.IsMatch(password, "[a-z]")) score++;
            if (Regex.IsMatch(password, "[0-9]")) score++;
            if (Regex.IsMatch(password, @"[^A-Za-z0-9]")) score++;
            return score;
        }

        /// <summary>
        /// True when the password meets both the minimum length and the minimum strength score.
        /// </summary>
        /// <param name="password">The password to validate.</param>
        /// <returns>Whether the password is strong enough to accept.</returns>
        public static bool IsStrongEnough(string password) =>
            !string.IsNullOrEmpty(password) && password.Length >= MinimumLength && Score(password) >= MinimumScore;

        /// <summary>
        /// True when the password is longer than <see cref="MaximumLength"/> and would therefore
        /// be silently truncated by the database instead of stored/checked in full.
        /// </summary>
        /// <param name="password">The password to validate.</param>
        /// <returns>Whether the password exceeds the maximum accepted length.</returns>
        public static bool ExceedsMaximumLength(string password) =>
            !string.IsNullOrEmpty(password) && password.Length > MaximumLength;
    }
}
