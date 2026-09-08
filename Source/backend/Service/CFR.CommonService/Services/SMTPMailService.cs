// Copyright (c) OptionC. All rights reserved.

using CFR.CommonService.MailService;
using System.Net;
using System.Net.Mail;

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
    }

    public class SMTPMailService : ISMTPMailService
    {
        public SMTPMailService()
        {
        }

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

            string? apiBaseUrl = !string.IsNullOrWhiteSpace(config?.ApiBaseUrl)
                ? config.ApiBaseUrl.Trim().TrimEnd('/')
                : config?.LoginURL?.Trim().TrimEnd('/');
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
        private static string GetLogoMarkup(SMTPMailConfig? config, string? templateLogoUrl)
        {
            string applicationLogo = !string.IsNullOrWhiteSpace(templateLogoUrl) ? templateLogoUrl.Trim() : GetMailLogoUrl(config);
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
                    catch (Exception)
                    {
                        retryCount++;
                        if (retryCount >= 2)
                        {
                            break;
                        }

                        await Task.Delay(1000);
                    }
                } while (!isSuccess && retryCount < 2);
            }

            return isSuccess;
        }
    }
}