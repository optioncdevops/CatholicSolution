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

        /// <summary>
        /// Full name of the admin who last saved these settings (SaveEmailSettings only - logo
        /// upload/remove don't touch this). Never the SMTP password or any other secret.
        /// </summary>
        public string? LastUpdatedByName { get; set; }

        /// <summary>UTC timestamp of the last SaveEmailSettings call.</summary>
        public DateTime? LastUpdatedDate { get; set; }
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

        private const string SettingsFileName = "_configurationSettings.json";
        private const string SharedSettingsPathKey = "SharedSettingsPath";
        private const int ReadAttempts = 3;

        /// <summary>
        /// Loads the email settings every outgoing email and the Email Settings page use. Reads the
        /// shared, platform-wide file when one is configured and exists (see
        /// <see cref="ResolveSharedSettingsPathCore"/>), otherwise this microservice's own file.
        /// </summary>
        public ConfSettings LoadData()
        {
            string? settingsPath = ResolveReadableSettingsFilePath();
            if (string.IsNullOrWhiteSpace(settingsPath))
            {
                return new ConfSettings();
            }

            for (int attempt = 1; attempt <= ReadAttempts; attempt++)
            {
                try
                {
                    string jsonString = File.ReadAllText(settingsPath);
                    return JsonConvert.DeserializeObject<ConfSettings>(jsonString) ?? new ConfSettings();
                }
                catch (IOException) when (attempt < ReadAttempts)
                {
                    // The shared file can be mid-replace by another microservice's save; SaveData
                    // swaps it in atomically, so a short retry reads the complete old or new file.
                    Thread.Sleep(50 * attempt);
                }
                catch (Exception)
                {
                    break;
                }
            }

            return new ConfSettings();
        }

        /// <summary>
        /// The environment-configured ApiBaseUrl override (see <see cref="ResolveEnvironmentApiBaseUrlOverride"/>),
        /// resolved once and reused — the same handful of files get re-read on every call otherwise
        /// (this runs on every outgoing email and every Email Settings page load).
        /// </summary>
        private static readonly Lazy<string?> EnvironmentApiBaseUrlOverride = new(ResolveEnvironmentApiBaseUrlOverrideCore);

        /// <summary>
        /// _configurationSettings.json is a single flat file with no per-environment layering, so
        /// whatever ApiBaseUrl was last saved through the Email Settings page keeps applying
        /// everywhere it's copied — this previously let a dev-only "https://localhost:5050/acutis"
        /// value slip into a real production email, and later the reverse (a hardcoded production
        /// domain left over on a local dev box, breaking the local logo preview). Fixed by making
        /// each environment's own appsettings.{Environment}.json "EmailSettings:ApiBaseUrl" (when
        /// present) the effective value for that environment — set it there once per environment
        /// (Development, Live, Staging, Pilot each have their own file already) and it applies
        /// automatically, with no risk of one environment's value leaking into another's deployment.
        /// Deliberately NOT applied inside <see cref="LoadData"/> — that would also feed
        /// <c>EmailSettingsOutput.ApiBaseUrl</c>, the Email Settings page's editable field, and a
        /// Development value there fails that field's own "not a localhost address" validation on
        /// every Save. Instead, callers that build an actual image URL (SMTPMailService's
        /// outgoing-email and admin-preview logo links) ask for this override directly and prefer it
        /// over the persisted value; the persisted/admin-edited value itself is never touched, and is
        /// still what's shown/saved on the Email Settings page. When appsettings.{Environment}.json
        /// declares no "EmailSettings:ApiBaseUrl" for the current environment, returns null and the
        /// persisted value is used, unchanged.
        /// </summary>
        public static string? ResolveEnvironmentApiBaseUrlOverride() => EnvironmentApiBaseUrlOverride.Value;

        private static string? ResolveEnvironmentApiBaseUrlOverrideCore()
        {
            try
            {
                string? contentRoot = ResolveContentRoot();
                if (string.IsNullOrWhiteSpace(contentRoot))
                {
                    return null;
                }

                string? environment = ResolveEnvironmentName(contentRoot);
                if (string.IsNullOrWhiteSpace(environment))
                {
                    return null;
                }

                return ReadEmailSetting(contentRoot, $"appsettings.{environment}.json", "ApiBaseUrl");
            }
            catch (Exception)
            {
                return null;
            }
        }

        /// <summary>
        /// Resolved once per process — startup configuration, not something that changes at runtime.
        /// </summary>
        private static readonly Lazy<string?> SharedSettingsPath = new(ResolveSharedSettingsPathCore);

        /// <summary>
        /// Email Settings are platform-wide (CFR, CFR Admin, and any other microservice that sends
        /// email share one SMTP account and one brand), but each microservice used to carry its own
        /// _configurationSettings.json, so a save on the CFR Admin page only reached CFR.Acutis and
        /// every other service kept sending with a stale copy. Setting
        /// <c>EmailSettings:SharedSettingsPath</c> points every service at one file instead.
        /// Standard .NET precedence: the <c>EmailSettings__SharedSettingsPath</c> environment
        /// variable, then appsettings.{Environment}.json, then appsettings.json. A relative path
        /// resolves against the microservice's content root; %VARIABLES% are expanded. Returns null
        /// when not configured, which keeps the original per-microservice file behavior unchanged.
        /// </summary>
        private static string? ResolveSharedSettingsPathCore()
        {
            try
            {
                string? contentRoot = ResolveContentRoot();
                string? configured = Environment.GetEnvironmentVariable($"EmailSettings__{SharedSettingsPathKey}");
                if (string.IsNullOrWhiteSpace(configured) && contentRoot != null)
                {
                    string? environment = ResolveEnvironmentName(contentRoot);
                    string? fromEnvironmentFile = environment != null ? ReadEmailSetting(contentRoot, $"appsettings.{environment}.json", SharedSettingsPathKey) : null;
                    configured = !string.IsNullOrWhiteSpace(fromEnvironmentFile)
                        ? fromEnvironmentFile
                        : ReadEmailSetting(contentRoot, "appsettings.json", SharedSettingsPathKey);
                }

                if (string.IsNullOrWhiteSpace(configured))
                {
                    return null;
                }

                string expanded = Environment.ExpandEnvironmentVariables(configured.Trim());
                return Path.GetFullPath(Path.IsPathRooted(expanded)
                    ? expanded
                    : Path.Combine(contentRoot ?? AppDomain.CurrentDomain.BaseDirectory, expanded));
            }
            catch (Exception)
            {
                return null;
            }
        }

        /// <summary>
        /// Writes the settings to the shared file when one is configured, otherwise to this
        /// microservice's own _configurationSettings.json (or a new one beside the running assembly
        /// when none exists yet). Written to a temp file and swapped in, so a microservice reading
        /// the shared file mid-save never sees a half-written file.
        /// </summary>
        public void SaveData(ConfSettings settings)
        {
            string settingsPath = SharedSettingsPath.Value
                ?? ResolveLocalSettingsFilePath()
                ?? Path.Combine(AppDomain.CurrentDomain.BaseDirectory, SettingsFileName);
            string? directory = Path.GetDirectoryName(settingsPath);
            if (!string.IsNullOrWhiteSpace(directory))
            {
                Directory.CreateDirectory(directory);
            }

            string tempPath = $"{settingsPath}.{Guid.NewGuid():N}.tmp";
            try
            {
                File.WriteAllText(tempPath, JsonConvert.SerializeObject(settings, Formatting.Indented));
                File.Move(tempPath, settingsPath, overwrite: true);
            }
            finally
            {
                if (File.Exists(tempPath))
                {
                    File.Delete(tempPath);
                }
            }

            Settings = settings;
        }

        /// <summary>
        /// The shared file when configured and already created; otherwise this microservice's own
        /// file, so a service keeps working from its existing settings until the first save from the
        /// Email Settings page creates the shared file.
        /// </summary>
        private static string? ResolveReadableSettingsFilePath()
        {
            string? shared = SharedSettingsPath.Value;
            return shared != null && File.Exists(shared) ? shared : ResolveLocalSettingsFilePath();
        }

        private static string? ResolveLocalSettingsFilePath()
        {
            string baseDirectory = AppDomain.CurrentDomain.BaseDirectory;
            string directPath = Path.Combine(StripBuildOutputFolder(baseDirectory), SettingsFileName);
            if (File.Exists(directPath))
            {
                return directPath;
            }

            var directory = new DirectoryInfo(baseDirectory);
            while (directory != null)
            {
                string candidate = Path.Combine(directory.FullName, SettingsFileName);
                if (File.Exists(candidate))
                {
                    return candidate;
                }

                directory = directory.Parent;
            }

            return null;
        }

        /// <summary>
        /// The microservice's own folder (the one holding its appsettings*.json) — the project folder
        /// when running from bin\Debug|Release, the site root when published. Resolved independently
        /// of where the settings file lives, since that file may now be the shared one elsewhere.
        /// </summary>
        private static string? ResolveContentRoot()
        {
            string baseDirectory = AppDomain.CurrentDomain.BaseDirectory;
            string stripped = StripBuildOutputFolder(baseDirectory);
            if (File.Exists(Path.Combine(stripped, "appsettings.json")))
            {
                return stripped;
            }

            var directory = new DirectoryInfo(baseDirectory);
            while (directory != null)
            {
                if (File.Exists(Path.Combine(directory.FullName, "appsettings.json")))
                {
                    return directory.FullName;
                }

                directory = directory.Parent;
            }

            return Path.GetDirectoryName(ResolveLocalSettingsFilePath());
        }

        private static string StripBuildOutputFolder(string path) =>
            path.Replace(@"\bin\Debug\net10.0", string.Empty, StringComparison.OrdinalIgnoreCase)
                .Replace(@"\bin\Release\net10.0", string.Empty, StringComparison.OrdinalIgnoreCase);

        /// <summary>
        /// Mirrors ConfigurationLoader.LoadConfiguration()'s own precedence exactly: read
        /// "Environment" from appsettings.json, then let an "Environment" environment variable
        /// override it (that loader appends .AddEnvironmentVariables() after the json file, so the
        /// env var wins) — a deployed server can and often does override the environment this way
        /// rather than shipping a different appsettings.json per environment, so skipping this check
        /// reads the wrong environment's file on such a server (e.g. resolving "Development" on a
        /// Live box that overrides only via env var, which previously leaked a localhost logo URL
        /// into real production emails).
        /// </summary>
        private static string? ResolveEnvironmentName(string contentRoot)
        {
            string? environment = Environment.GetEnvironmentVariable("Environment");
            string baseSettingsFile = Path.Combine(contentRoot, "appsettings.json");
            if (string.IsNullOrWhiteSpace(environment) && File.Exists(baseSettingsFile))
            {
                environment = JObject.Parse(File.ReadAllText(baseSettingsFile))["Environment"]?.ToString();
            }

            return string.IsNullOrWhiteSpace(environment) ? null : environment;
        }

        private static string? ReadEmailSetting(string contentRoot, string fileName, string key)
        {
            string path = Path.Combine(contentRoot, fileName);
            if (!File.Exists(path))
            {
                return null;
            }

            return JObject.Parse(File.ReadAllText(path))["EmailSettings"]?[key]?.ToString();
        }
    }
}