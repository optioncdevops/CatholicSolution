// Copyright (c) OptionC. All rights reserved.

using System.Data;
using System.Security.Cryptography;
using System.Text;

using Microsoft.Data.SqlClient;

namespace Automation.Framework.DbSupport
{
    /// <summary>
    /// Seeds and cleans up rows in [auth].[PasswordResetToken] for the ForgotPassword/
    /// ResetPassword automation tests, standing in for the link a real email would carry.
    /// </summary>
    /// <remarks>
    /// Seeding goes through the exact same stored procedure
    /// ([dbo].[Acutis_PasswordReset_CRUD], ActionId 1) the live ForgotPassword endpoint calls -
    /// only the email step is skipped - so a seeded token is indistinguishable from a genuinely
    /// requested one to the rest of the application. Nothing here is called from, or shipped
    /// with, the real application; it exists only for this test project.
    /// </remarks>
    public static class PasswordResetTokenTestSupport
    {
        private const string PasswordResetCrud = "[dbo].[Acutis_PasswordReset_CRUD]";

        /// <summary>Generates a raw token in the same shape AcutisPasswordService issues.</summary>
        /// <returns>A 64 character hex string (32 random bytes).</returns>
        public static string GenerateRawToken()
        {
            return Convert.ToHexString(RandomNumberGenerator.GetBytes(32));
        }

        /// <summary>Hashes a raw token the same way AcutisPasswordService does before storing it.</summary>
        /// <param name="rawToken">the raw token to hash</param>
        /// <returns>The SHA-256 hash, as uppercase hex.</returns>
        private static string HashToken(string rawToken)
        {
            return Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(rawToken)));
        }

        /// <summary>
        /// Seeds a fresh password reset token for the given account with the given expiry, the
        /// same way AcutisPasswordService.RequestResetAsync does, minus the email. The account
        /// must already exist in [auth].[AcutisUser] and be active, unlocked, and not deleted,
        /// or the stored procedure inserts nothing and this throws.
        /// </summary>
        /// <param name="userEmail">the Acutis staff account's email address</param>
        /// <param name="expiresAtUtc">when the token should stop being valid, in UTC</param>
        /// <returns>The raw token to put in the Reset Password page's <c>?token=</c> query string.</returns>
        public static string SeedToken(string userEmail, DateTime expiresAtUtc)
        {
            string rawToken = GenerateRawToken();
            string tokenHash = HashToken(rawToken);

            using var connection = new SqlConnection(PasswordResetTestDatabase.ConnectionString);
            connection.Open();

            using var command = new SqlCommand(PasswordResetCrud, connection)
            {
                CommandType = CommandType.StoredProcedure,
            };
            command.Parameters.AddWithValue("@ActionId", 1);
            command.Parameters.AddWithValue("@Email", userEmail);
            command.Parameters.AddWithValue("@TokenHash", tokenHash);
            command.Parameters.AddWithValue("@ExpiresAtUtc", expiresAtUtc);
            var returnValue = command.Parameters.Add("@ReturnValue", SqlDbType.Int);
            returnValue.Direction = ParameterDirection.Output;

            command.ExecuteNonQuery();

            int result = returnValue.Value is int value ? value : 0;
            if (result <= 0)
            {
                throw new InvalidOperationException(
                    $"Could not seed a password reset token for '{userEmail}'. Confirm the account " +
                    "exists in [auth].[AcutisUser] in the target database and is active, unlocked, " +
                    "and not deleted.");
            }

            return rawToken;
        }

        /// <summary>Seeds a token that has already expired, for the expired-link test.</summary>
        /// <param name="userEmail">the Acutis staff account's email address</param>
        /// <returns>The raw (already expired) token.</returns>
        public static string SeedExpiredToken(string userEmail)
        {
            return SeedToken(userEmail, DateTime.UtcNow.AddMinutes(-5));
        }

        /// <summary>Seeds a fresh token and immediately marks it used, for the already-used-link test.</summary>
        /// <param name="userEmail">the Acutis staff account's email address</param>
        /// <returns>The raw (already used) token.</returns>
        public static string SeedUsedToken(string userEmail)
        {
            string rawToken = SeedToken(userEmail, DateTime.UtcNow.AddMinutes(15));
            MarkTokenUsed(rawToken);
            return rawToken;
        }

        /// <summary>
        /// Marks a previously seeded token as used, without touching the account's password -
        /// unlike actually completing a reset, this leaves the account's real credentials alone.
        /// </summary>
        /// <param name="rawToken">the raw token to mark used</param>
        public static void MarkTokenUsed(string rawToken)
        {
            string tokenHash = HashToken(rawToken);

            using var connection = new SqlConnection(PasswordResetTestDatabase.ConnectionString);
            connection.Open();

            using var command = new SqlCommand(
                "UPDATE [auth].[PasswordResetToken] SET [UsedAt] = SYSUTCDATETIME() " +
                "WHERE [TokenHash] = @TokenHash AND [UserScope] = 'staff' AND [UsedAt] IS NULL",
                connection);
            command.Parameters.AddWithValue("@TokenHash", tokenHash);
            command.ExecuteNonQuery();
        }

        /// <summary>
        /// Deletes every password reset token row for the given account. Test cleanup only -
        /// never called from anywhere in the real application.
        /// </summary>
        /// <param name="userEmail">the Acutis staff account's email address</param>
        public static void DeleteTokensForUser(string userEmail)
        {
            using var connection = new SqlConnection(PasswordResetTestDatabase.ConnectionString);
            connection.Open();

            using var command = new SqlCommand(
                "DELETE FROM [auth].[PasswordResetToken] WHERE [UserScope] = 'staff' AND [UserId] = " +
                "(SELECT [UserId] FROM [auth].[AcutisUser] WHERE [Email] = @Email)",
                connection);
            command.Parameters.AddWithValue("@Email", userEmail);
            command.ExecuteNonQuery();
        }

        /// <summary>
        /// Restores the test account's password to a known value, using the same
        /// dbo.EncryptUserPassword function Acutis_PasswordReset_CRUD itself calls - so a
        /// completed Reset Password test leaves the account exactly as the next run expects it.
        /// </summary>
        /// <param name="userEmail">the Acutis staff account's email address</param>
        /// <param name="password">the plain-text password to restore</param>
        public static void RestorePassword(string userEmail, string password)
        {
            using var connection = new SqlConnection(PasswordResetTestDatabase.ConnectionString);
            connection.Open();

            using var command = new SqlCommand(
                "UPDATE [auth].[AcutisUser] SET [Password] = dbo.EncryptUserPassword(@Password) " +
                "WHERE [Email] = @Email",
                connection);
            command.Parameters.AddWithValue("@Password", password);
            command.Parameters.AddWithValue("@Email", userEmail);
            command.ExecuteNonQuery();
        }
    }
}
