// Copyright (c) OptionC. All rights reserved.

namespace CFR.CommonService.MailService
{
    public class ConfSettings
    {
        public SMTPMailConfig? SMTPMailConfig { get; set; }
    }

    public class SettingConfiguration
    {
        public SMTPMailConfig SMTPMailConfig { get; set; } = null!;
        public ApplicationFilePath ApplicationFilePath { get; set; } = null!;
        public AppSettings AppSettings { get; set; } = null!;
    }

    public class AppSettings
    {
        public string DocBaseURL { get; set; } = null!;
        public string ExpTrainingSchedule { get; set; } = null!;
        public string AchFuzeTestingOrgId { get; set; } = null!;
        public string OptionCBaseURL { get; set; } = string.Empty;
        public string FamilyBaseURL { get; set; } = string.Empty;
        public string SSOOptionCBaseURL { get; set; } = string.Empty;
    }

    public class ApplicationFilePath
    {
        public string Doc_BasePath { get; set; } = null!;
        public string DirectoryUploadTemplate { get; set; } = null!;
        public string OldDocTicket { get; set; } = null!;
        public string OldSaintImagePath { get; set; } = null!;
        public string ExistingStaticFilePath { get; set; } = null!;
        public string StaticFilePath { get; set; } = null!;
    }

    public class SMTPMailConfig
    {
        public string SendMailFlag { get; set; } = null!;
        public string SMTPServer { get; set; } = null!;
        public string SMTPPort { get; set; } = null!;
        public string DisplayName { get; set; } = null!;
        public string MUserName { get; set; } = null!;
        public string MPassword { get; set; } = null!;
        public string IsSSLEnabled { get; set; } = null!;
        public string CCMailId { get; set; } = null!;
        public string LoginURL { get; set; } = null!;
        public string ContactUsMailId { get; set; } = null!;
        public string ReceiverMail { get; set; } = null!;
        public string DefaultToAddress { get; set; } = string.Empty;

        /// <summary>
        /// Absolute logo URL for HTML emails. When empty, falls back to
        /// <c>{LoginURL}/Images/mattmoney-logo.png</c> (legacy MailService).
        /// </summary>
        public string LogoUrl { get; set; } = string.Empty;
    }

    public class ConfSettingsService
    {
        public ConfSettings Settings = new();

        public ConfSettingsService()
        {
            Settings = LoadData();
        }

        /// <summary>
        /// To get the Value from json files
        /// </summary>
        /// <returns></returns>
        public ConfSettings LoadData()
        {
            var confSettings = new ConfSettings();
            try
            {
                string? settingsPath = ResolveSettingsFilePath();
                if (!string.IsNullOrWhiteSpace(settingsPath) && File.Exists(settingsPath))
                {
                    string jsonString = File.ReadAllText(settingsPath);
                    confSettings = JsonConvert.DeserializeObject<ConfSettings>(jsonString) ?? new ConfSettings();
                }
            }
            catch (Exception)
            {
                // Optionally log the exception
            }
            return confSettings;
        }

        private static string? ResolveSettingsFilePath()
        {
            string baseDirectory = AppDomain.CurrentDomain.BaseDirectory;
            string? directPath = Path.Combine(
                baseDirectory.Replace(@"\bin\Debug\net10.0", string.Empty, StringComparison.OrdinalIgnoreCase)
                    .Replace(@"\bin\Release\net10.0", string.Empty, StringComparison.OrdinalIgnoreCase),
                "_configurationSettings.json");
            if (File.Exists(directPath))
            {
                return directPath;
            }

            var directory = new DirectoryInfo(baseDirectory);
            while (directory != null)
            {
                string candidate = Path.Combine(directory.FullName, "_configurationSettings.json");
                if (File.Exists(candidate))
                {
                    return candidate;
                }

                directory = directory.Parent;
            }

            return null;
        }
    }
}