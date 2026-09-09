// Copyright (c) OptionC. All rights reserved.

using Newtonsoft.Json.Linq;

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
        /// File name of the uploaded platform email logo image (JPG/PNG, via the Email Settings
        /// page's Upload Logo control — see EmailSettingsController.UploadEmailLogo), resolved to
        /// a full image URL at send time by SMTPMailService.GetLogoImageUrl. The literal value
        /// "none" renders a text-only brand mark instead of an image. When empty, falls back to
        /// <c>{LoginURL}/Images/mattmoney-logo.png</c> (legacy MailService default).
        /// </summary>
        public string LogoUrl { get; set; } = string.Empty;

        /// <summary>
        /// Base URL of this CFR.Acutis API itself (e.g. "https://localhost:5051" in local
        /// development, or the public gateway/API domain in a deployed environment) — used to
        /// build the uploaded email logo's absolute image URL. Deliberately separate from
        /// <see cref="LoginURL"/>, which is the admin/portal front-end's URL and is not
        /// necessarily the same host that serves this API's GetEmailLogo action; conflating the
        /// two produced broken logo images whenever the two hosts differ (e.g. local dev). Falls
        /// back to <see cref="LoginURL"/> when blank, for backward compatibility.
        /// </summary>
        public string ApiBaseUrl { get; set; } = string.Empty;

        /// <summary>
        /// Platform-wide accent color (hex, e.g. "#1d4ed8") substituted for the [AccentColor]
        /// merge tag in every email template. Standardized here instead of per-template so every
        /// outgoing email shares one brand color — falls back to "#1d4ed8" when blank.
        /// </summary>
        public string AccentColor { get; set; } = string.Empty;

        /// <summary>
        /// Platform-wide email body font family. Falls back to "Verdana, Arial, Helvetica, sans-serif" when blank.
        /// </summary>
        public string FontFamily { get; set; } = string.Empty;

        /// <summary>
        /// Platform-wide email body base font size in px. Falls back to 13 when unset/zero.
        /// </summary>
        public int BaseFontSize { get; set; }
    }

    public interface IConfSettingsService
    {
        ConfSettings Settings { get; }
        ConfSettings LoadData();
        void SaveData(ConfSettings settings);
    }

    public class ConfSettingsService : IConfSettingsService
    {
        public ConfSettings Settings { get; private set; } = new();

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

        /// <summary>
        /// The local-development-only ApiBaseUrl override (see <see cref="ResolveDevelopmentApiBaseUrlOverride"/>),
        /// resolved once and reused — the same handful of files get re-read on every call otherwise
        /// (this runs on every outgoing email and every Email Settings page load).
        /// </summary>
        private static readonly Lazy<string?> DevelopmentApiBaseUrlOverride = new(ResolveDevelopmentApiBaseUrlOverrideCore);

        /// <summary>
        /// _configurationSettings.json is a single flat file with no per-environment layering, so
        /// whatever ApiBaseUrl was last saved through the Email Settings page keeps applying
        /// everywhere it's copied — this previously let a dev-only "https://localhost:5050/acutis"
        /// value slip into a real production email, and later the reverse (a hardcoded production
        /// domain left over on a local dev box, breaking the local logo preview). Deliberately NOT
        /// applied inside <see cref="LoadData"/> — that would leak into <c>EmailSettingsOutput.ApiBaseUrl</c>,
        /// the Email Settings page's editable field, which then fails its own "not a localhost
        /// address" validation on every Save while running locally. Instead, callers that build an
        /// actual image URL (SMTPMailService's outgoing-email and admin-preview logo links) ask for
        /// this override directly and prefer it over the persisted value; the persisted/admin-edited
        /// value itself is never touched. Returns null (no override) for any environment other than
        /// Development, so a real deployment always uses whatever the admin saved.
        /// </summary>
        public static string? ResolveDevelopmentApiBaseUrlOverride() => DevelopmentApiBaseUrlOverride.Value;

        private static string? ResolveDevelopmentApiBaseUrlOverrideCore()
        {
            try
            {
                string? microserviceDirectory = Path.GetDirectoryName(ResolveSettingsFilePath());
                if (string.IsNullOrWhiteSpace(microserviceDirectory))
                {
                    return null;
                }

                string baseSettingsFile = Path.Combine(microserviceDirectory, "appsettings.json");
                if (!File.Exists(baseSettingsFile))
                {
                    return null;
                }

                string environment = JObject.Parse(File.ReadAllText(baseSettingsFile))["Environment"]?.ToString() ?? string.Empty;
                if (!string.Equals(environment, "Development", StringComparison.OrdinalIgnoreCase))
                {
                    return null;
                }

                string envSettingsFile = Path.Combine(microserviceDirectory, $"appsettings.{environment}.json");
                if (!File.Exists(envSettingsFile))
                {
                    return null;
                }

                return JObject.Parse(File.ReadAllText(envSettingsFile))["EmailSettings"]?["ApiBaseUrl"]?.ToString();
            }
            catch (Exception)
            {
                return null;
            }
        }

        /// <summary>
        /// Writes the settings back to the same _configurationSettings.json file LoadData reads
        /// from (falls back to a file directly beside the running assembly when no existing file
        /// is found anywhere up the directory tree, so a first save always has somewhere to land).
        /// This is the only file-level settings writer in the codebase — used by the admin Email
        /// Settings page so SMTP/branding config lives in this file, not a database table.
        /// </summary>
        public void SaveData(ConfSettings settings)
        {
            string settingsPath = ResolveSettingsFilePath()
                ?? Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "_configurationSettings.json");
            string json = JsonConvert.SerializeObject(settings, Formatting.Indented);
            File.WriteAllText(settingsPath, json);
            Settings = settings;
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