// Copyright (c) OptionC. All rights reserved.

namespace CFR.AcutisService.Service.Administration
{
    /// <summary>
    /// Sample [placeholder] merge-tag values used only for the "Send Test" preview, keyed by template code.
    /// Real sends (e.g. AcutisPasswordService) build their own placeholder values from live data instead.
    /// </summary>
    public static class EmailTemplateSampleData
    {
        /// <summary>
        /// Returns sample placeholder values for the given template code, or an empty dictionary when the code is unrecognized.
        /// </summary>
        /// <param name="templateCode">Stable template code (e.g. "PasswordReset").</param>
        /// <returns>Sample merge-tag values for previewing the template.</returns>
        public static Dictionary<string, string> ForTemplateCode(string templateCode)
        {
            return templateCode switch
            {
                "PasswordReset" => new Dictionary<string, string>
                {
                    ["FirstName"] = "Jordan",
                    ["ResetLink"] = "https://example.org/reset-password?token=sample-token",
                    ["ExpiryMinutes"] = "30",
                },
                "Welcome" => new Dictionary<string, string>
                {
                    ["FirstName"] = "Jordan",
                },
                "AccessApproved" => new Dictionary<string, string>
                {
                    ["FirstName"] = "Jordan",
                    ["AppName"] = "Matt Money",
                },
                "AccessInfo" => new Dictionary<string, string>
                {
                    ["FirstName"] = "Jordan",
                    ["AppName"] = "Matt Money",
                    ["Note"] = "Please confirm your role at the organization before we can proceed.",
                },
                _ => [],
            };
        }
    }
}
