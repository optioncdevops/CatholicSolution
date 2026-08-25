// Copyright (c) OptionC. All rights reserved.

using System.Net;
using System.Net.Mail;

using CFR.Common.MailService;

namespace CFR.Common.Services
{
    public interface ISMTPMailService
    {
        Task<bool> SendMailAsync(string mailSubject, string mailContent, string toAddress, string cCAddress = "", string attachmentFile = "", string bCCAddress = "");
    }

    public class SMTPMailService: ISMTPMailService
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
        /// Legacy <c>MailService.FormatMailContent</c> logo:
        /// <c>LoginURL + "/Images/mattmoney-logo.png"</c>, or explicit <see cref="SMTPMailConfig.LogoUrl"/>.
        /// </summary>
        private static string GetMailLogoUrl(SMTPMailConfig? config)
        {
            if (!string.IsNullOrWhiteSpace(config?.LogoUrl))
            {
                return config.LogoUrl.Trim();
            }

            string? loginUrl = config?.LoginURL?.Trim().TrimEnd('/');
            if (string.IsNullOrWhiteSpace(loginUrl))
            {
                return string.Empty;
            }

            return $"{loginUrl}/Images/mattmoney-logo.png";
        }

        public static string FormatMailContent(string mailContent)
        {
            var settings = LoadData();
            string applicationLogo = GetMailLogoUrl(settings?.SMTPMailConfig);
            string logoMarkup = string.IsNullOrWhiteSpace(applicationLogo)
                ? string.Empty
                : $@"<div style=""text-align:center""><img src=""{applicationLogo}"" alt=""MattMoney"" width=""100%"" height=""auto"" style=""max-width:16rem;margin-bottom:1rem"" /></div>";

            return $@"
            <div style=""color: #000; font-family: Verdana, Arial, Helvetica, sans-serif; font-size: 13px; text-rendering: optimizelegibility; line-height: 1.629; background: linear-gradient(90deg, rgb(180, 208, 224) 0%, rgb(221, 238, 255) 100%); box-shadow: inset 0 0 20px #82b3cf;padding: 1rem 2rem 2rem;"">
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

        public static string FormatMailContent(string template, Dictionary<string, string> placeholders)
        {
            ArgumentNullException.ThrowIfNull(placeholders);
            if (string.IsNullOrEmpty(template))
            {
                throw new ArgumentException("Template cannot be null or empty.");
            }
            foreach (var placeholder in placeholders)
            {
                template = template.Replace($"[{placeholder.Key}]", placeholder.Value ?? string.Empty);
            }
            return template;
        }

        public async Task<bool> SendMailAsync(string mailSubject, string mailContent, string toAddress, string cCAddress = "", string attachmentFile = "", string bCCAddress = "")
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
                        using var mail = new MailMessage { From = new MailAddress(username, displayName), Subject = mailSubject, BodyEncoding = Encoding.UTF8, IsBodyHtml = true, Body = FormatMailContent(mailContent) };
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
