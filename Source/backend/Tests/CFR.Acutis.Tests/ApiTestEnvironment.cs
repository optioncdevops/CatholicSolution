// Copyright (c) OptionC. All rights reserved.

using NUnit.Framework;

namespace CFR.Acutis.Tests
{
    /// <summary>
    /// Resolves configuration for the API-level negative tests entirely from environment
    /// variables - same fail-safe philosophy as
    /// Automation.Framework.EnvironmentSupport.TestEnvironmentContext (never guessed, an
    /// unset/unrecognized environment is treated as Live, mutating scenarios require an explicit
    /// opt-in), reimplemented here rather than referenced, so this project does not have to pull
    /// in Selenium/Reqnroll to depend on it - this is a plain HTTP test project, a different layer
    /// from Automation.Acutis, not a second test framework (still NUnit).
    /// </summary>
    public sealed class ApiTestEnvironment
    {
        public const string EnvironmentVariable = "CFR_TEST_ENVIRONMENT";
        public const string ApiBaseUrlVariable = "CFR_API_BASE_URL";
        public const string AdminTokenVariable = "CFR_TEST_ADMIN_TOKEN";
        public const string NonAdminTokenVariable = "CFR_TEST_NON_ADMIN_TOKEN";
        public const string RoleIdVariable = "CFR_TEST_ROLE_ID";
        public const string AssignedRoleIdVariable = "CFR_TEST_ASSIGNED_ROLE_ID";
        public const string UnknownRoleIdVariable = "CFR_TEST_UNKNOWN_ROLE_ID";

        // Reuses the same opt-in variables as the Selenium suite (Automation.Framework's
        // TestEnvironmentContext) rather than inventing a second pair - these calls are real
        // mutation attempts (Save/UpdateStatus/Delete), even though every one of them is expected
        // to be rejected (403/404/409); a bug in the rejection logic must not be able to mutate
        // Live just because this test project defines its own separate "allowed" switch.
        public const string AllowMutationsVariable = "CFR_AUTOMATION_ALLOW_MUTATIONS";
        public const string MutationConfirmationVariable = "CFR_AUTOMATION_MUTATION_CONFIRMATION";
        public const string RequiredStagingConfirmation = "STAGING";

        public CfrTestEnvironment Environment { get; }

        public bool MutationsAllowed { get; }

        public IReadOnlyList<string> MutationBlockedReasons { get; }

        private ApiTestEnvironment(CfrTestEnvironment environment, bool mutationsAllowed, IReadOnlyList<string> blockedReasons)
        {
            Environment = environment;
            MutationsAllowed = mutationsAllowed;
            MutationBlockedReasons = blockedReasons;
        }

        public static ApiTestEnvironment Resolve()
        {
            string? raw = System.Environment.GetEnvironmentVariable(EnvironmentVariable);
            CfrTestEnvironment environment = raw?.Trim().ToLowerInvariant() switch
            {
                "development" or "dev" => CfrTestEnvironment.Development,
                "pilot" => CfrTestEnvironment.Pilot,
                "staging" => CfrTestEnvironment.Staging,
                "live" or "production" or "prod" => CfrTestEnvironment.Live,
                _ => CfrTestEnvironment.Live, // fail safe: unset/unrecognized -> most locked-down
            };

            bool allowFlag = string.Equals(
                System.Environment.GetEnvironmentVariable(AllowMutationsVariable),
                "true",
                StringComparison.OrdinalIgnoreCase);
            string? confirmation = System.Environment.GetEnvironmentVariable(MutationConfirmationVariable);

            var reasons = new List<string>();
            bool mutationsAllowed;
            switch (environment)
            {
                case CfrTestEnvironment.Live:
                    mutationsAllowed = false;
                    reasons.Add("Live/Production never permits mutating API tests, under any configuration.");
                    break;
                case CfrTestEnvironment.Staging:
                    mutationsAllowed = allowFlag && string.Equals(confirmation, RequiredStagingConfirmation, StringComparison.Ordinal);
                    if (!mutationsAllowed)
                    {
                        reasons.Add($"Staging requires both {AllowMutationsVariable}=true and {MutationConfirmationVariable}={RequiredStagingConfirmation}.");
                    }

                    break;
                default: // Pilot, Development
                    mutationsAllowed = allowFlag;
                    if (!mutationsAllowed)
                    {
                        reasons.Add($"{environment} requires {AllowMutationsVariable}=true.");
                    }

                    break;
            }

            return new ApiTestEnvironment(environment, mutationsAllowed, reasons);
        }

        /// <summary>Ends the current test as Ignored (not Failed) when mutations are not permitted.</summary>
        /// <param name="description">what the caller was about to attempt, for the ignore message</param>
        public void RequireMutationsAllowedOrSkip(string description)
        {
            if (MutationsAllowed)
            {
                return;
            }

            Assert.Ignore($"{description}: skipped - {string.Join(" ", MutationBlockedReasons)}");
        }

        /// <summary>Reads a required environment variable, or ends the test as Ignored when it is missing.</summary>
        /// <param name="variableName">the environment variable to read</param>
        /// <returns>The variable's value.</returns>
        public static string RequireVariableOrSkip(string variableName)
        {
            string? value = System.Environment.GetEnvironmentVariable(variableName);
            if (string.IsNullOrWhiteSpace(value))
            {
                Assert.Ignore($"{variableName} is not set - this scenario cannot run without it.");
            }

            return value!;
        }

        /// <summary>Reads a required integer environment variable, or ends the test as Ignored when it is missing/invalid.</summary>
        /// <param name="variableName">the environment variable to read</param>
        /// <returns>The variable's value.</returns>
        public static int RequireIntVariableOrSkip(string variableName)
        {
            string raw = RequireVariableOrSkip(variableName);
            if (!int.TryParse(raw, out int value))
            {
                Assert.Ignore($"{variableName}='{raw}' is not a valid integer - this scenario cannot run.");
            }

            return value;
        }
    }

    public enum CfrTestEnvironment
    {
        Development,
        Pilot,
        Staging,
        Live,
    }
}
