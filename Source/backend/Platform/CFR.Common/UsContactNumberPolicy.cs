// Copyright (c) OptionC. All rights reserved.

namespace CFR.Common
{
    /// <summary>
    /// Shared US contact-number format check, enforced server-side by every module that accepts a
    /// contact number — a client-only mask/pattern check (e.g. frontend/CFR_Admin's
    /// inputValidation.ts) can be bypassed by a direct API call, so the same 10-digit rule must
    /// also run here.
    /// </summary>
    public static class UsContactNumberPolicy
    {
        /// <summary>
        /// Number of significant digits a US contact number must have, excluding an optional
        /// leading country code digit ("1").
        /// </summary>
        public const int DigitLength = 10;

        /// <summary>
        /// True when the contact number, once non-digit characters are stripped and an optional
        /// leading US country code ("1") is dropped, has exactly <see cref="DigitLength"/> digits.
        /// </summary>
        /// <param name="contactNumber">The contact number to validate.</param>
        /// <returns>Whether the contact number matches the expected US format.</returns>
        public static bool IsValid(string contactNumber)
        {
            if (string.IsNullOrWhiteSpace(contactNumber))
            {
                return false;
            }

            string digits = new string(contactNumber.Where(char.IsDigit).ToArray());
            if (digits.Length == DigitLength + 1 && digits.StartsWith('1'))
            {
                digits = digits[1..];
            }

            return digits.Length == DigitLength;
        }
    }
}
