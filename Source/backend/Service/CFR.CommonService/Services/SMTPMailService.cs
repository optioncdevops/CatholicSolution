// Copyright (c) OptionC. All rights reserved.

using CFR.Common;
using CFR.CommonService.MailService;
using System.Net;
using System.Net.Mail;
using System.Net.Security;
using System.Net.Sockets;

namespace CFR.CommonService.Services
{
    public interface ISMTPMailService
    {
        /// <summary>
        /// Sends an email, wrapping <paramref name="mailContent"/> in the shared branded shell.
        /// </summary>
        /// <param name="templateLogoUrl">Per-template logo image URL override; null uses the microservice-level default.</param>
        /// <param name="fontFamily">Per-template CSS font-family override; null uses the built-in default.</param>
        /// <param name="baseFontSize">Per-template base body font size (pixels) override; null uses the built-in default.</param>
        Task<bool> SendMailAsync(string mailSubject, string mailContent, string toAddress, string cCAddress = "", string attachmentFile = "", string bCCAddress = "", string? templateLogoUrl = null, string? fontFamily = null, int? baseFontSize = null);

        /// <summary>
        /// Verifies SMTP connectivity and authentication (server, port, SSL/TLS, credentials)
        /// without sending a real email - a raw SMTP handshake (EHLO/STARTTLS/AUTH LOGIN/QUIT)
        /// against the given configuration.
        /// </summary>
        /// <param name="config">The SMTP configuration to test - typically the currently-saved
        /// one, with the password swapped in by the caller when the Email Settings form's own
        /// password field was left blank (never sent as empty just because the UI field is).</param>
        /// <returns>Whether the test succeeded, and a message safe to show the caller (never the password or a raw stack trace).</returns>
        Task<(bool Success, string Message)> TestConnectionAsync(SMTPMailConfig config);
    }

    public class SMTPMailService(ILogger<SMTPMailService> logger) : ISMTPMailService
    {
        private static ConfSettings LoadData()
        {
            var obj = new ConfSettingsService();
            return obj.Settings;
        }

        /// <summary>
        /// Resolves <see cref="SMTPMailConfig.LogoUrl"/> (an uploaded image file name, saved via
        /// EmailSettingsController.UploadEmailLogo) into the absolute URL that streams it back
        /// through EmailSettingsController.GetEmailLogo, using <see cref="SMTPMailConfig.ApiBaseUrl"/>
        /// as the host — this API's own base URL, NOT <see cref="SMTPMailConfig.LoginURL"/> (the
        /// admin/portal front-end's URL). Those two hosts differ in local development (e.g.
        /// "https://localhost:5051" for the API vs. a deployed portal domain for LoginURL), and
        /// using LoginURL there produced a broken image. Falls back to LoginURL when ApiBaseUrl is
        /// blank, for environments where the two happen to be the same host. Returns null when no
        /// logo is uploaded, the sentinel is <c>"none"</c>, or no host is configured.
        /// </summary>
        private static string? BuildLogoImageUrl(SMTPMailConfig? config)
        {
            string? fileName = config?.LogoUrl?.Trim();
            if (string.IsNullOrWhiteSpace(fileName) || string.Equals(fileName, "none", StringComparison.OrdinalIgnoreCase))
            {
                return null;
            }

            // A real, publicly-reachable ApiBaseUrl already saved via the Email Settings page
            // always wins — that's a value an admin deliberately confirmed works, e.g.
            // "https://cfrapi.allnewoptionc.com" on the live server. The appsettings.{Environment}.json
            // override (ConfSettingsService.ResolveEnvironmentApiBaseUrlOverride) only kicks in when
            // there's nothing better to use: the persisted value is blank, OR itself a
            // localhost/loopback address. This deliberately does NOT trust the override outright,
            // because detecting "which environment is this" from the server's own appsettings.json
            // is unreliable — a deployed server's appsettings.json can still say "Development" if
            // its real environment is only set some other way, and blindly trusting that previously
            // leaked a localhost image link into a real production email even after the override
            // logic itself was fixed. Preferring a known-good persisted non-loopback value first
            // makes that class of bug impossible regardless of how "Environment" ends up resolving
            // on any given server.
            string? persistedApiBaseUrl = !string.IsNullOrWhiteSpace(config?.ApiBaseUrl) ? config.ApiBaseUrl.Trim().TrimEnd('/') : null;
            string? apiBaseUrl = (persistedApiBaseUrl != null && !IsLoopbackHost(persistedApiBaseUrl))
                ? persistedApiBaseUrl
                : ConfSettingsService.ResolveEnvironmentApiBaseUrlOverride()?.Trim().TrimEnd('/') ?? persistedApiBaseUrl;
            if (string.IsNullOrWhiteSpace(apiBaseUrl))
            {
                apiBaseUrl = config?.LoginURL?.Trim().TrimEnd('/');
            }
            if (string.IsNullOrWhiteSpace(apiBaseUrl))
            {
                return null;
            }

            return $"{apiBaseUrl}/api/v1/EmailSettings/GetEmailLogo?fileName={Uri.EscapeDataString(fileName)}";
        }

        /// <summary>
        /// The platform-wide uploaded email logo's absolute image URL (Email Settings page,
        /// file-backed), or null when none is uploaded. Used by the Email Settings page to preview
        /// the current logo.
        /// </summary>
        public static string? GetLogoImageUrl(SMTPMailConfig? config) => BuildLogoImageUrl(config);

        /// <summary>
        /// The platform-wide uploaded email logo's absolute image URL (Email Settings page,
        /// file-backed), or null when none is uploaded.
        /// </summary>
        public static string? GetLogoImageUrl()
        {
            var settings = LoadData();
            return BuildLogoImageUrl(settings?.SMTPMailConfig);
        }

        /// <summary>
        /// Legacy <c>MailService.FormatMailContent</c> logo:
        /// <c>LoginURL + "/Images/mattmoney-logo.png"</c>, or the uploaded platform logo resolved
        /// via <see cref="BuildLogoImageUrl"/>. A <c>LogoUrl</c> of <c>"none"</c> opts a microservice
        /// out of that legacy image fallback entirely (e.g. CFR Acutis, which has no hosted image
        /// for its own brand mark) instead of silently showing another product's logo —
        /// <see cref="GetLogoMarkup"/> renders a text-based brand header for that case rather than
        /// no header at all.
        /// </summary>
        private static string GetMailLogoUrl(SMTPMailConfig? config)
        {
            if (string.Equals(config?.LogoUrl?.Trim(), "none", StringComparison.OrdinalIgnoreCase))
            {
                return string.Empty;
            }

            string? uploadedLogo = BuildLogoImageUrl(config);
            if (!string.IsNullOrWhiteSpace(uploadedLogo))
            {
                return uploadedLogo;
            }

            string? loginUrl = config?.LoginURL?.Trim().TrimEnd('/');
            if (string.IsNullOrWhiteSpace(loginUrl))
            {
                return string.Empty;
            }

            return $"{loginUrl}/Images/mattmoney-logo.png";
        }

        /// <summary>
        /// Builds the header markup shown above the email body. Priority: an explicit per-template
        /// <paramref name="templateLogoUrl"/> (set via the Email Templates editor) wins over the
        /// microservice-level config; when neither resolves to an image, a styled text brand mark
        /// is shown if <see cref="SMTPMailConfig.LogoUrl"/> is explicitly <c>"none"</c> (no hosted
        /// image exists for this product), or nothing at all when branding simply isn't configured
        /// (preserves the original legacy behavior for other consumers of this shared method).
        /// </summary>
        /// <summary>
        /// True when <paramref name="url"/> points at a host only the machine sending the email
        /// can reach (localhost/loopback) — e.g. an admin saved "https://localhost:5050/acutis"
        /// into <see cref="SMTPMailConfig.ApiBaseUrl"/> from the Email Settings page. Embedding
        /// such a URL as an &lt;img src&gt; in a real outgoing email produces a permanently broken
        /// image for every recipient, since their mail client can never reach the sender's own
        /// dev machine. Not an exhaustive private-IP check — just the loopback cases that
        /// actually cause this failure.
        /// </summary>
        private static bool IsLoopbackHost(string url)
        {
            if (!Uri.TryCreate(url, UriKind.Absolute, out var uri))
            {
                return false;
            }

            return uri.IsLoopback || uri.Host.Equals("localhost", StringComparison.OrdinalIgnoreCase);
        }

        private static string GetLogoMarkup(SMTPMailConfig? config, string? templateLogoUrl)
        {
            string applicationLogo = !string.IsNullOrWhiteSpace(templateLogoUrl) ? templateLogoUrl.Trim() : GetMailLogoUrl(config);
            if (IsLoopbackHost(applicationLogo))
            {
                // A loopback logo URL can never load for a real recipient — degrade the same way
                // "no image configured" already does, instead of shipping a guaranteed-dead <img>.
                applicationLogo = string.Empty;
            }

            string displayName = string.IsNullOrWhiteSpace(config?.DisplayName) ? "Logo" : config.DisplayName.Trim();

            if (!string.IsNullOrWhiteSpace(applicationLogo))
            {
                return $@"<div style=""text-align:center""><img src=""{applicationLogo}"" alt=""{displayName}"" width=""100%"" height=""auto"" style=""max-width:16rem;margin-bottom:1rem"" /></div>";
            }

            if (string.Equals(config?.LogoUrl?.Trim(), "none", StringComparison.OrdinalIgnoreCase))
            {
                return $@"<div style=""text-align:center;margin-bottom:1rem""><span style=""font-family:Georgia,'Times New Roman',serif;font-size:22px;font-weight:700;color:#12264c;letter-spacing:0.02em;"">{displayName}</span></div>";
            }

            return string.Empty;
        }

        /// <param name="templateLogoUrl">Per-template logo image URL override; null uses the microservice-level default.</param>
        /// <param name="fontFamily">Per-template CSS font-family override for the outer shell; null uses the built-in default.</param>
        /// <param name="baseFontSize">Per-template base body font size (pixels) for the outer shell; null uses the built-in default.</param>
        public static string FormatMailContent(string mailContent, string? templateLogoUrl = null, string? fontFamily = null, int? baseFontSize = null)
        {
            var settings = LoadData();
            string logoMarkup = GetLogoMarkup(settings?.SMTPMailConfig, templateLogoUrl);
            // Branding is platform-wide now (Email Settings page, file-backed), not per-template —
            // the caller-supplied overrides only remain for backward compatibility with any
            // consumer that still passes one; everyone else falls through to the shared config.
            string resolvedFontFamily = !string.IsNullOrWhiteSpace(fontFamily)
                ? fontFamily
                : !string.IsNullOrWhiteSpace(settings?.SMTPMailConfig?.FontFamily)
                    ? settings.SMTPMailConfig.FontFamily
                    : "Verdana, Arial, Helvetica, sans-serif";
            int resolvedFontSize = baseFontSize is > 0
                ? baseFontSize.Value
                : settings?.SMTPMailConfig?.BaseFontSize is > 0
                    ? settings.SMTPMailConfig.BaseFontSize
                    : 13;

            return $@"
            <div style=""color: #000; font-family: {resolvedFontFamily}; font-size: {resolvedFontSize}px; text-rendering: optimizelegibility; line-height: 1.629; background: linear-gradient(90deg, rgb(180, 208, 224) 0%, rgb(221, 238, 255) 100%); box-shadow: inset 0 0 20px #82b3cf;padding: 1rem 2rem 2rem;"">
                {logoMarkup}
                <div style=""background-color:#fff;padding: 2rem;"">{mailContent}</p>
                <p style=""margin-top:2rem;border-top:solid 1px #808080"">
                    <span style=""text-transform: uppercase; font-family: Verdana, Arial, Helvetica, sans-serif; color: black; font-size: 10pt; "">DISCLAIMER</span><br />
                    <span style=""color: black; line-height: 12.26px; font-family: Verdana, Arial, Helvetica, sans-serif; font-size: 8pt"">
                        Please do not respond directly to this email. The originating email, {settings?.SMTPMailConfig?.ContactUsMailId}, is not monitored.
                    </span>
                </p>
                </div>
            </div>";
        }

        /// <summary>
        /// The platform-wide [AccentColor] merge-tag value (Email Settings page, file-backed) —
        /// every template shares this single brand color instead of setting its own.
        /// </summary>
        public static string GetAccentColor()
        {
            var settings = LoadData();
            return !string.IsNullOrWhiteSpace(settings?.SMTPMailConfig?.AccentColor) ? settings.SMTPMailConfig.AccentColor : "#1d4ed8";
        }

        /// <summary>
        /// Substitutes [Token] merge tags in an HTML email template. Every value is HTML-encoded
        /// before substitution — these values (requester name, organization name, reviewer notes,
        /// etc.) come from user input, and the template itself is sent as raw HTML, so an
        /// unescaped value would let stored HTML/script be injected into an email admins and
        /// requesters open directly.
        /// </summary>
        public static string FormatMailContent(string template, Dictionary<string, string> placeholders)
        {
            ArgumentNullException.ThrowIfNull(placeholders);
            if (string.IsNullOrEmpty(template))
            {
                throw new ArgumentException("Template cannot be null or empty.");
            }
            foreach (var placeholder in placeholders)
            {
                template = template.Replace($"[{placeholder.Key}]", WebUtility.HtmlEncode(placeholder.Value) ?? string.Empty);
            }
            return template;
        }

        public async Task<bool> SendMailAsync(string mailSubject, string mailContent, string toAddress, string cCAddress = "", string attachmentFile = "", string bCCAddress = "", string? templateLogoUrl = null, string? fontFamily = null, int? baseFontSize = null)
        {
            var settings = LoadData();

            int retryCount = 0;
            bool isSuccess = false;
            string sendMailFlag = settings.SMTPMailConfig?.SendMailFlag ?? string.Empty;

            if (sendMailFlag.Equals("1", StringComparison.Ordinal))
            {
                do
                {
                    string displayName = settings?.SMTPMailConfig?.DisplayName ?? string.Empty;
                    string username = settings?.SMTPMailConfig?.MUserName ?? string.Empty;
                    string password = settings?.SMTPMailConfig?.MPassword ?? string.Empty;
                    string smtpServer = settings?.SMTPMailConfig?.SMTPServer ?? string.Empty;
                    int smtpPort = Convert.ToInt32(settings?.SMTPMailConfig?.SMTPPort ?? "0");
                    // Legacy OptionCMM: IsSSLEnabled "0" = external/Gmail (STARTTLS), "1" = intranet (no SSL).
                    string sslFlag = settings?.SMTPMailConfig?.IsSSLEnabled ?? string.Empty;
                    bool enableSsl = sslFlag == "0"
                        || smtpServer.Contains("gmail", StringComparison.OrdinalIgnoreCase)
                        || smtpPort == 587;

                    try
                    {
                        using var mail = new MailMessage { From = new MailAddress(username, displayName), Subject = mailSubject, BodyEncoding = Encoding.UTF8, IsBodyHtml = true, Body = FormatMailContent(mailContent, templateLogoUrl, fontFamily, baseFontSize) };
                        if (!string.IsNullOrEmpty(toAddress))
                        {
                            foreach (string address in toAddress.Split(';'))
                            {
                                mail.To.Add(address.Trim());
                            }
                        }

                        if (!string.IsNullOrEmpty(cCAddress))
                        {
                            foreach (string address in cCAddress.Split(';'))
                            {
                                mail.CC.Add(address.Trim());
                            }
                        }

                        if (!string.IsNullOrEmpty(bCCAddress))
                        {
                            foreach (string address in bCCAddress.Split(';'))
                            {
                                mail.Bcc.Add(address.Trim());
                            }
                        }

                        if (!string.IsNullOrEmpty(attachmentFile))
                        {
                            foreach (string file in attachmentFile.Split(','))
                            {
                                try
                                {
                                    mail.Attachments.Add(new Attachment(file.Trim()));
                                }
                                catch (Exception)
                                {
                                    // Log the attachment failure
                                }
                            }
                        }
                        //ServicePointManager.SecurityProtocol = SecurityProtocolType.Tls12;
                        mail.BodyEncoding = Encoding.GetEncoding("utf-8");
                        mail.IsBodyHtml = true;

                        //using var smtpClient = new SmtpClient(smtpServer, smtpPort)
                        //{
                        //    DeliveryMethod = SmtpDeliveryMethod.Network,
                        //    Credentials = new NetworkCredential(username, password),
                        //    EnableSsl = enableSsl
                        //};

                        using var client = new SmtpClient(smtpServer, smtpPort);
                        client.Credentials = new NetworkCredential(username, password);
                        client.EnableSsl = enableSsl;
                        client.DeliveryMethod = SmtpDeliveryMethod.Network;
                        client.UseDefaultCredentials = false;
                        if (smtpServer.Contains("office365", StringComparison.OrdinalIgnoreCase))
                        {
                            client.TargetName = "STARTTLS/smtp.office365.com";
                        }

                        await client.SendMailAsync(mail);
                        isSuccess = true;
                    }
                    catch (Exception ex)
                    {
                        AppLogger.LogError(logger, ex, SerilogErrorMessages.MailLogMessages.SendMailAttemptFailed, retryCount + 1, toAddress, smtpServer);
                        retryCount++;
                        if (retryCount >= 2)
                        {
                            break;
                        }

                        await Task.Delay(1000);
                    }
                } while (!isSuccess && retryCount < 2);
            }
            else
            {
                AppLogger.LogWarning(logger, null, SerilogErrorMessages.MailLogMessages.SendMailDisabled, toAddress);
            }

            return isSuccess;
        }

        /// <inheritdoc />
        public async Task<(bool Success, string Message)> TestConnectionAsync(SMTPMailConfig config)
        {
            ArgumentNullException.ThrowIfNull(config);

            string smtpServer = config.SMTPServer ?? string.Empty;
            int smtpPort = int.TryParse(config.SMTPPort, out int parsedPort) ? parsedPort : 0;
            string username = config.MUserName ?? string.Empty;
            string password = config.MPassword ?? string.Empty;
            // Same enableSsl/STARTTLS heuristic SendMailAsync itself uses, so a successful test
            // reflects the exact same connection settings a real send would use.
            string sslFlag = config.IsSSLEnabled ?? string.Empty;
            bool enableSsl = sslFlag == "0"
                || smtpServer.Contains("gmail", StringComparison.OrdinalIgnoreCase)
                || smtpPort == 587;
            bool implicitSsl = smtpPort == 465;

            if (string.IsNullOrWhiteSpace(smtpServer) || smtpPort is <= 0 or > 65535)
            {
                return (false, "SMTP server and a valid port (1-65535) are required.");
            }

            TcpClient? tcpClient = null;
            Stream? stream = null;
            try
            {
                tcpClient = new TcpClient();
                var connectTask = tcpClient.ConnectAsync(smtpServer, smtpPort);
                if (await Task.WhenAny(connectTask, Task.Delay(TimeSpan.FromSeconds(10))) != connectTask)
                {
                    return (false, "SMTP connection failed. Please verify server, port, credentials, and SSL/TLS settings.");
                }

                await connectTask;
                stream = tcpClient.GetStream();

                if (implicitSsl)
                {
                    stream = await UpgradeToTlsAsync(stream, smtpServer);
                }

                var (reader, writer) = CreateSmtpReaderWriter(stream);

                string? greeting = await reader.ReadLineAsync();
                if (greeting == null || !greeting.StartsWith("220", StringComparison.Ordinal))
                {
                    return (false, "SMTP server did not respond with a valid greeting.");
                }

                string? ehloResponse = await SendCommandAsync(writer, reader, $"EHLO {Dns.GetHostName()}");
                if (ehloResponse == null || !ehloResponse.StartsWith("250", StringComparison.Ordinal))
                {
                    return (false, "SMTP server rejected the EHLO greeting.");
                }

                if (enableSsl && !implicitSsl)
                {
                    string? startTlsResponse = await SendCommandAsync(writer, reader, "STARTTLS");
                    if (startTlsResponse == null || !startTlsResponse.StartsWith("220", StringComparison.Ordinal))
                    {
                        return (false, "SMTP server does not support STARTTLS on this port.");
                    }

                    stream = await UpgradeToTlsAsync(stream, smtpServer);
                    (reader, writer) = CreateSmtpReaderWriter(stream);

                    ehloResponse = await SendCommandAsync(writer, reader, $"EHLO {Dns.GetHostName()}");
                    if (ehloResponse == null || !ehloResponse.StartsWith("250", StringComparison.Ordinal))
                    {
                        return (false, "SMTP server rejected the EHLO greeting after STARTTLS.");
                    }
                }

                if (!string.IsNullOrWhiteSpace(username))
                {
                    string? authPrompt = await SendCommandAsync(writer, reader, "AUTH LOGIN");
                    if (authPrompt == null || !authPrompt.StartsWith("334", StringComparison.Ordinal))
                    {
                        return (false, "SMTP server does not support AUTH LOGIN.");
                    }

                    authPrompt = await SendCommandAsync(writer, reader, Convert.ToBase64String(Encoding.UTF8.GetBytes(username)));
                    if (authPrompt == null || !authPrompt.StartsWith("334", StringComparison.Ordinal))
                    {
                        return (false, "SMTP connection failed. Please verify server, port, credentials, and SSL/TLS settings.");
                    }

                    string? authResult = await SendCommandAsync(writer, reader, Convert.ToBase64String(Encoding.UTF8.GetBytes(password)));
                    if (authResult == null || !authResult.StartsWith("235", StringComparison.Ordinal))
                    {
                        return (false, "SMTP connection failed. Please verify server, port, credentials, and SSL/TLS settings.");
                    }
                }

                await writer.WriteLineAsync("QUIT");
                return (true, "SMTP connection successful.");
            }
            catch (Exception)
            {
                // Deliberately no exception details (message/stack trace) surfaced to the caller -
                // could otherwise leak internal host/network information. Callers with their own
                // logger should log the exception themselves before discarding it here.
                return (false, "SMTP connection failed. Please verify server, port, credentials, and SSL/TLS settings.");
            }
            finally
            {
                stream?.Dispose();
                tcpClient?.Dispose();
            }
        }

        private static async Task<SslStream> UpgradeToTlsAsync(Stream stream, string smtpServer)
        {
            var sslStream = new SslStream(stream, leaveInnerStreamOpen: false);
            await sslStream.AuthenticateAsClientAsync(smtpServer);
            return sslStream;
        }

        private static (StreamReader Reader, StreamWriter Writer) CreateSmtpReaderWriter(Stream stream)
        {
            var reader = new StreamReader(stream, Encoding.ASCII, false, 1024, leaveOpen: true);
            var writer = new StreamWriter(stream, Encoding.ASCII, leaveOpen: true) { AutoFlush = true, NewLine = "\r\n" };
            return (reader, writer);
        }

        /// <summary>Sends one SMTP command line and reads back its (possibly multi-line) response.</summary>
        private static async Task<string?> SendCommandAsync(StreamWriter writer, StreamReader reader, string command)
        {
            await writer.WriteLineAsync(command);
            string? line = await reader.ReadLineAsync();
            // Multi-line SMTP responses use "250-..." for every line except the last, which uses
            // "250 ..." (a space, not a hyphen, in the 4th character) - keep reading until that.
            while (line != null && line.Length > 3 && line[3] == '-')
            {
                line = await reader.ReadLineAsync();
            }

            return line;
        }
    }
}