// Copyright (c) OptionC. All rights reserved.

using NUnit.Framework;

namespace Automation.Framework.EnvironmentSupport
{
    /// <summary>
    /// Resolves which CFR environment a test run targets, and the safety rules that apply to it,
    /// entirely from environment variables - never guessed, and never defaulted to the least-safe
    /// assumption. Every Forgot/Reset/Change Password step definition that could mutate real data
    /// (send a real email, write a real database row, change a real account's password) must ask
    /// this class first, via <see cref="RequireMutationsAllowedOrSkip"/> /
    /// <see cref="RequireDatabaseSeedingAllowedOrSkip"/>, and skip itself (not fail, not proceed)
    /// when this context says no.
    /// </summary>
    /// <remarks>
    /// Safety policy, by environment:
    /// <list type="bullet">
    /// <item><b>Live/Production</b>: mutations are never permitted, under any combination of
    /// environment variables. There is no override.</item>
    /// <item><b>Staging</b>: mutations require BOTH <c>CFR_AUTOMATION_ALLOW_MUTATIONS=true</c> AND
    /// <c>CFR_AUTOMATION_MUTATION_CONFIRMATION</c> set to the exact literal <c>STAGING</c> - a
    /// deliberate typed confirmation, since Staging may be closer to real/shared data than
    /// Development or Pilot.</item>
    /// <item><b>Pilot</b> and <b>Development</b>: mutations require
    /// <c>CFR_AUTOMATION_ALLOW_MUTATIONS=true</c>; no typed confirmation needed.</item>
    /// <item>Database seeding of password reset tokens (<c>CFR_AUTOMATION_MAILBOX_MODE=seed</c>)
    /// is only ever honored on Development, regardless of what the variable says elsewhere - the
    /// seeding helper opens a real SQL connection, and that must never be pointed at anything
    /// other than a local developer's own database.</item>
    /// <item>An unset or unrecognized <c>CFR_TEST_ENVIRONMENT</c> is treated as Live - the most
    /// locked-down environment - rather than defaulting to Development, so a misconfigured run
    /// fails safe instead of silently running mutating scenarios somewhere unintended.</item>
    /// </list>
    /// </remarks>
    public sealed class TestEnvironmentContext
    {
        public const string EnvironmentVariable = "CFR_TEST_ENVIRONMENT";
        public const string BaseUrlVariable = "CFR_AUTOMATION_BASE_URL";
        public const string UsernameVariable = "CFR_AUTOMATION_USERNAME";
        public const string PasswordVariable = "CFR_AUTOMATION_PASSWORD";
        public const string TestEmailVariable = "CFR_AUTOMATION_TEST_EMAIL";
        public const string NewPasswordVariable = "CFR_AUTOMATION_NEW_PASSWORD";
        public const string MailboxModeVariable = "CFR_AUTOMATION_MAILBOX_MODE";
        public const string AllowMutationsVariable = "CFR_AUTOMATION_ALLOW_MUTATIONS";
        public const string MutationConfirmationVariable = "CFR_AUTOMATION_MUTATION_CONFIRMATION";
        public const string RunIdVariable = "CFR_AUTOMATION_RUN_ID";

        private const string RequiredStagingConfirmation = "STAGING";

        private readonly string? _baseUrl;
        private readonly string? _username;
        private readonly string? _password;
        private readonly string? _testEmail;
        private readonly string? _newPassword;

        private TestEnvironmentContext(
            CfrTestEnvironment environment,
            string? rawEnvironmentValue,
            string? baseUrl,
            string? username,
            string? password,
            string? testEmail,
            string? newPassword,
            string mailboxMode,
            bool mutationsAllowed,
            IReadOnlyList<string> mutationBlockedReasons,
            string runId)
        {
            Environment = environment;
            RawEnvironmentValue = rawEnvironmentValue;
            _baseUrl = baseUrl;
            _username = username;
            _password = password;
            _testEmail = testEmail;
            _newPassword = newPassword;
            MailboxMode = mailboxMode;
            MutationsAllowed = mutationsAllowed;
            MutationBlockedReasons = mutationBlockedReasons;
            RunId = runId;
        }

        /// <summary>
        /// A short, unique-per-run token used to suffix the names of any records a mutating
        /// scenario creates (e.g. "Test Org {RunId}") - so records from different runs (including
        /// concurrent ones) never collide, and so a record found in the app can be traced back to
        /// the exact run that created it. Resolved from CFR_AUTOMATION_RUN_ID when set (e.g. a CI
        /// build number), otherwise a UTC-ticks timestamp - never blank, and never shared across
        /// two `Resolve()` calls in the same process by coincidence.
        /// </summary>
        public string RunId { get; }

        /// <summary>Which environment this run targets.</summary>
        public CfrTestEnvironment Environment { get; }

        /// <summary>The raw, unparsed value of CFR_TEST_ENVIRONMENT, for diagnostics.</summary>
        public string? RawEnvironmentValue { get; }

        /// <summary>"seed" (Development only) or "none".</summary>
        public string MailboxMode { get; }

        /// <summary>Whether this run is allowed to perform a real, data-changing action.</summary>
        public bool MutationsAllowed { get; }

        /// <summary>Why mutations are blocked, when they are - empty when they are allowed.</summary>
        public IReadOnlyList<string> MutationBlockedReasons { get; }

        /// <summary>Resolves the environment and its safety policy from environment variables.</summary>
        /// <returns>The resolved context.</returns>
        public static TestEnvironmentContext Resolve()
        {
            string? raw = System.Environment.GetEnvironmentVariable(EnvironmentVariable);
            CfrTestEnvironment environment = ParseEnvironment(raw);

            string? baseUrl = ReadVariable(BaseUrlVariable);
            string? username = ReadVariable(UsernameVariable);
            string? password = ReadVariable(PasswordVariable);
            string? testEmail = ReadVariable(TestEmailVariable);
            string? newPassword = ReadVariable(NewPasswordVariable);

            string requestedMailboxMode = ReadVariable(MailboxModeVariable)?.ToLowerInvariant()
                ?? (environment == CfrTestEnvironment.Development ? "seed" : "none");

            // Never seed a real database outside Development, no matter what the variable says -
            // the seeding helper opens a real SQL connection (see PasswordResetTestDatabase).
            string mailboxMode = requestedMailboxMode == "seed" && environment != CfrTestEnvironment.Development
                ? "none"
                : requestedMailboxMode;

            bool allowMutationsFlag = IsTruthy(ReadVariable(AllowMutationsVariable));
            string? mutationConfirmation = ReadVariable(MutationConfirmationVariable);

            var blockedReasons = new List<string>();
            bool mutationsAllowed;

            switch (environment)
            {
                case CfrTestEnvironment.Development:
                case CfrTestEnvironment.Pilot:
                    mutationsAllowed = allowMutationsFlag;
                    if (!allowMutationsFlag)
                    {
                        blockedReasons.Add($"{AllowMutationsVariable} is not 'true'");
                    }

                    break;

                case CfrTestEnvironment.Staging:
                    bool confirmed = string.Equals(mutationConfirmation, RequiredStagingConfirmation, StringComparison.Ordinal);
                    mutationsAllowed = allowMutationsFlag && confirmed;
                    if (!allowMutationsFlag)
                    {
                        blockedReasons.Add($"{AllowMutationsVariable} is not 'true'");
                    }

                    if (!confirmed)
                    {
                        blockedReasons.Add($"{MutationConfirmationVariable} must be exactly '{RequiredStagingConfirmation}' to run mutating scenarios on Staging");
                    }

                    break;

                case CfrTestEnvironment.Live:
                default:
                    // No override exists for Live, and an unrecognized environment is treated the
                    // same way (see ParseEnvironment) - both fail safe, never fail open.
                    mutationsAllowed = false;
                    blockedReasons.Add($"mutations are never permitted on {environment}");
                    break;
            }

            string runId = ReadVariable(RunIdVariable) ?? System.DateTime.UtcNow.Ticks.ToString();

            return new TestEnvironmentContext(
                environment,
                raw,
                baseUrl,
                username,
                password,
                testEmail,
                newPassword,
                mailboxMode,
                mutationsAllowed,
                blockedReasons,
                runId);
        }

        /// <summary>
        /// Resolves the frontend base URL to drive: CFR_AUTOMATION_BASE_URL, or - Development
        /// only - the given fallback (typically a value already in AcutisTestData.json).
        /// </summary>
        /// <param name="developmentFallback">the JSON test-data value to fall back to on Development</param>
        /// <returns>The base URL to use.</returns>
        public string ResolveBaseUrl(string? developmentFallback)
        {
            return Resolve(_baseUrl, developmentFallback, BaseUrlVariable);
        }

        /// <summary>
        /// Resolves the sign-in username: CFR_AUTOMATION_USERNAME, or - Development only - the
        /// given fallback.
        /// </summary>
        /// <param name="developmentFallback">the JSON test-data value to fall back to on Development</param>
        /// <returns>The username to sign in with.</returns>
        public string ResolveUsername(string? developmentFallback)
        {
            return Resolve(_username, developmentFallback, UsernameVariable);
        }

        /// <summary>
        /// Resolves the sign-in / current password: CFR_AUTOMATION_PASSWORD, or - Development
        /// only - the given fallback.
        /// </summary>
        /// <param name="developmentFallback">the JSON test-data value to fall back to on Development</param>
        /// <returns>The password to sign in with, and to restore to after a change/reset.</returns>
        public string ResolvePassword(string? developmentFallback)
        {
            return Resolve(_password, developmentFallback, PasswordVariable);
        }

        /// <summary>
        /// Resolves the account email Forgot/Reset Password scenarios act on:
        /// CFR_AUTOMATION_TEST_EMAIL, or - Development only - the given fallback.
        /// </summary>
        /// <param name="developmentFallback">the JSON test-data value to fall back to on Development</param>
        /// <returns>The email address to use.</returns>
        public string ResolveTestEmail(string? developmentFallback)
        {
            return Resolve(_testEmail, developmentFallback, TestEmailVariable);
        }

        /// <summary>
        /// Resolves the new password a mutating scenario changes an account to:
        /// CFR_AUTOMATION_NEW_PASSWORD, or - Development only - the given fallback.
        /// </summary>
        /// <param name="developmentFallback">the JSON test-data value to fall back to on Development</param>
        /// <returns>The new password to use.</returns>
        public string ResolveNewPassword(string? developmentFallback)
        {
            return Resolve(_newPassword, developmentFallback, NewPasswordVariable);
        }

        /// <summary>
        /// Ends the current scenario as Ignored (not Failed, not Passed) when mutations are not
        /// permitted for the current environment/configuration. Call this as the very first step
        /// of any scenario that would send a real email, write a real database row, or change a
        /// real account's password - before any such action is attempted, not after.
        /// </summary>
        /// <param name="scenarioDescription">what the scenario that would be skipped does, for the message</param>
        public void RequireMutationsAllowedOrSkip(string scenarioDescription)
        {
            if (MutationsAllowed)
            {
                return;
            }

            Assert.Ignore(
                $"Skipped '{scenarioDescription}' - mutations are not permitted in the '{Environment}' " +
                $"environment ({string.Join("; ", MutationBlockedReasons)}).");
        }

        /// <summary>
        /// Ends the current scenario as Ignored when database-seeded reset tokens are not
        /// available (anywhere but Development, or when CFR_AUTOMATION_MAILBOX_MODE isn't
        /// "seed"). Call this as the very first step of any scenario that seeds a token via
        /// PasswordResetTokenTestSupport.
        /// </summary>
        /// <param name="scenarioDescription">what the scenario that would be skipped does, for the message</param>
        public void RequireDatabaseSeedingAllowedOrSkip(string scenarioDescription)
        {
            if (MailboxMode == "seed")
            {
                return;
            }

            Assert.Ignore(
                $"Skipped '{scenarioDescription}' - database-seeded reset tokens are only available " +
                $"on Development with {MailboxModeVariable}=seed (current environment: '{Environment}', " +
                $"mailbox mode: '{MailboxMode}').");
        }

        private string Resolve(string? variableValue, string? developmentFallback, string variableName)
        {
            if (!string.IsNullOrWhiteSpace(variableValue))
            {
                return variableValue;
            }

            if (Environment == CfrTestEnvironment.Development && !string.IsNullOrWhiteSpace(developmentFallback))
            {
                return developmentFallback;
            }

            throw new InvalidOperationException(
                $"Set the '{variableName}' environment variable before running Forgot/Reset/Change " +
                $"Password scenarios against the '{Environment}' environment. There is no fallback " +
                "value for any environment other than Development, so a value is never guessed here.");
        }

        private static string? ReadVariable(string name)
        {
            string? value = System.Environment.GetEnvironmentVariable(name);
            return string.IsNullOrWhiteSpace(value) ? null : value.Trim();
        }

        private static bool IsTruthy(string? value)
        {
            return string.Equals(value, "true", StringComparison.OrdinalIgnoreCase) || value == "1";
        }

        private static CfrTestEnvironment ParseEnvironment(string? raw)
        {
            if (string.IsNullOrWhiteSpace(raw))
            {
                // Never assumed: an unset CFR_TEST_ENVIRONMENT is treated as the most
                // locked-down environment rather than defaulting to Development.
                return CfrTestEnvironment.Live;
            }

            return raw.Trim().ToLowerInvariant() switch
            {
                "development" or "dev" or "local" or "localdev" or "localdevelopment" => CfrTestEnvironment.Development,
                "pilot" => CfrTestEnvironment.Pilot,
                "staging" or "stage" => CfrTestEnvironment.Staging,
                "live" or "production" or "prod" => CfrTestEnvironment.Live,
                // An unrecognized value fails safe the same way an unset one does.
                _ => CfrTestEnvironment.Live,
            };
        }
    }
}
