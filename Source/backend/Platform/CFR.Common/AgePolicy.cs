// Copyright (c) OptionC. All rights reserved.

namespace CFR.Common
{
    /// <summary>
    /// Shared date-of-birth policy, enforced server-side wherever a user's DOB is accepted from a
    /// client. Mirrors frontend/CFR_Admin's client-side UsersValidator.ts dateOfBirth rule exactly
    /// — a client-only check can be bypassed by a direct API call. Follows the common US
    /// business-application convention: the account holder must be an adult (18+, the standard US
    /// age of majority) and the date must be realistic (no more than 120 years old).
    /// </summary>
    public static class AgePolicy
    {
        /// <summary>Minimum age, in years, a date of birth must represent.</summary>
        public const int MinimumAgeYears = 18;

        /// <summary>Maximum age, in years, a date of birth may realistically represent.</summary>
        public const int MaximumAgeYears = 120;

        /// <summary>
        /// True when the given date of birth represents an age between <see cref="MinimumAgeYears"/>
        /// and <see cref="MaximumAgeYears"/> (inclusive), as of today (UTC).
        /// </summary>
        /// <param name="dateOfBirth">The date of birth to check.</param>
        /// <returns>Whether the resulting age falls within the allowed range.</returns>
        public static bool IsWithinAllowedAgeRange(DateTime dateOfBirth)
        {
            DateTime today = DateTime.UtcNow.Date;
            DateTime dob = dateOfBirth.Date;

            int age = today.Year - dob.Year;
            if (dob.Date > today.AddYears(-age))
            {
                age--;
            }

            return age >= MinimumAgeYears && age <= MaximumAgeYears;
        }
    }
}
