// Copyright (c) OptionC. All rights reserved.

using Automation.Framework.EnvironmentSupport;

namespace Automation.Framework.DbSupport
{
    /// <summary>
    /// Resolves the SQL Server connection string the ForgotPassword/ResetPassword automation
    /// tests use to seed and clean up rows in [auth].[PasswordResetToken] directly. The raw
    /// reset token is only ever emailed by the real application - never returned by any API,
    /// never logged - so there is no other way to drive the Reset Password page to a genuinely
    /// valid link without reading a real mailbox.
    /// </summary>
    public static class PasswordResetTestDatabase
    {
        /// <summary>
        /// Set this environment variable to the same connection string CFR.Acutis's own
        /// appsettings.Development.json uses (ConnectionStrings:ConnString) before running the
        /// ForgotPassword or ResetPassword automation tests. Deliberately not read from any
        /// test-data file or other source-controlled config, so it is never committed.
        /// </summary>
        public const string ConnectionStringEnvironmentVariable = "CFR_ACUTIS_AUTOMATION_DB_CONNECTION_STRING";

        /// <summary>
        /// Resolves the connection string - refusing outright when CFR_TEST_ENVIRONMENT resolves
        /// to anything other than Development. This is a second, independent guard behind the
        /// step-definition-level check in TestEnvironmentContext.RequireDatabaseSeedingAllowedOrSkip
        /// - even a future caller that forgets that check still cannot open a real SQL connection
        /// from this helper against anything but a local developer's own database.
        /// </summary>
        public static string ConnectionString
        {
            get
            {
                var environment = TestEnvironmentContext.Resolve();
                if (environment.Environment != CfrTestEnvironment.Development)
                {
                    throw new InvalidOperationException(
                        "Password reset token seeding is only ever permitted against a Development " +
                        $"database, never '{environment.Environment}'. This is a hard guard, independent " +
                        "of any other check, and has no override.");
                }

                return System.Environment.GetEnvironmentVariable(ConnectionStringEnvironmentVariable)
                    ?? throw new InvalidOperationException(
                        $"Set the '{ConnectionStringEnvironmentVariable}' environment variable to the CFR " +
                        "Acutis development database's connection string before running the ForgotPassword " +
                        "or ResetPassword automation tests.");
            }
        }
    }
}
