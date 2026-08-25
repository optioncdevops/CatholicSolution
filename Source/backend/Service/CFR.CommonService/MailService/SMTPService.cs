// Copyright (c) OptionC. All rights reserved.

using System.Net;
using System.Net.Mail;
using System.Text;

namespace CFR.CommonService.MailService
{
    public class SMPTService
    {
        private static readonly ConfSettings _settings = new();

        static SMPTService()
        {
            _settings = LoadData();
        }

        /// <summary>
        /// To get the Value from json files
        /// </summary>
        /// <returns></returns>
        private static ConfSettings LoadData()
        {
            ConfSettingsService obj = new ConfSettingsService();
            return obj.Settings;
        }

        public static string FormatMailContent(string mailContent)
        {
            string sendMailContent = string.Empty;
            string applicationLogo = _settings?.SMTPMailConfig?.LogoUrl ?? "default-logo-url.png";  // Provide a default logo URL
            string contactUsMailId = _settings?.SMTPMailConfig?.ContactUsMailId ?? "noreply@example.com"; // Default email

            sendMailContent = @"<div style=""color: #000; font-family: Verdana, Arial, Helvetica, sans-serif; font-size: 13px; text-rendering: optimizelegibility; line-height: 1.629; background: linear-gradient(90deg, rgb(180, 208, 224) 0%, rgb(221, 238, 255) 100%); box-shadow: inset 0 0 20px #82b3cf;padding: 1rem 2rem;"">
                        <div style=""text-align:center""><img src=" + applicationLogo + @" alt=""Logo"" style=""max-width:200px;margin-bottom:1rem"" /></div>
                        <div style=""background-color:#fff;padding: 2rem;"">";

            sendMailContent += mailContent + @"</p><p style=""margin-top:2rem;border-top:solid 1px #808080""><span style=""text-transform: uppercase; font-family: Verdana, Arial, Helvetica, sans-serif; color: black; font-size: 10pt; "">DISCLAIMER</span><br /><span style=""color: black; line-height: 12.26px; font-family: Verdana, Arial, Helvetica, sans-serif; font-size: 8pt"">Please do not respond directly to this email. The originating email, " + contactUsMailId + ", is not monitored.<br /></span></p></div></div>";
            return sendMailContent;
        }

        /// <summary>
        /// This is to send mail with content given
        /// </summary>
        /// <param name="subject"></param>
        /// <param name="content"></param>
        /// <param name="toAddress"></param>
        /// <param name="displayName"></param>
        public static bool SendMail(string mailSubject, string mailContent, string toAddress, string cCAddress = "", string attachmentFile = "", string bCCAddress = "")
        {
            ConfSettings settings = LoadData();

            int retryCount = 0;
            bool isSuccess = false;
            string sendMailFlag = settings?.SMTPMailConfig?.SendMailFlag ?? string.Empty;
            if (sendMailFlag.Equals("1", StringComparison.Ordinal))
            {
                do
                {
                    string displayName = settings?.SMTPMailConfig?.DisplayName ?? string.Empty;
                    string username = settings?.SMTPMailConfig?.MUserName ?? string.Empty;
                    string password = settings?.SMTPMailConfig?.MPassword ?? string.Empty;
                    string smtpServer = settings?.SMTPMailConfig?.SMTPServer ?? string.Empty;
                    int smtpPort = Convert.ToInt32(settings?.SMTPMailConfig?.SMTPPort ?? "0");
                    string ssl = settings?.SMTPMailConfig?.IsSSLEnabled ?? string.Empty;
                    try
                    {
                        MailMessage mail = new MailMessage
                        {
                            From = new MailAddress(username, displayName),
                            Subject = mailSubject,
                            BodyEncoding = Encoding.UTF8,
                            IsBodyHtml = true,
                            Body = FormatMailContent(mailContent)
                        };

                        if (!string.IsNullOrEmpty(toAddress))
                        {
                            foreach (string address in toAddress.Split(';'))
                            {
                                mail.To.Add(address);
                            }
                        }

                        if (!string.IsNullOrEmpty(cCAddress))
                        {
                            foreach (string address in cCAddress.Split(';'))
                            {
                                mail.CC.Add(address);
                            }
                        }

                        if (!string.IsNullOrEmpty(bCCAddress))
                        {
                            foreach (string address in bCCAddress.Split(';'))
                            {
                                mail.Bcc.Add(address);
                            }
                        }

                        if (!string.IsNullOrEmpty(attachmentFile))
                        {
                            foreach (string file in attachmentFile.Split(','))
                            {
                                try
                                {
                                    mail.Attachments.Add(new Attachment(file));
                                }
                                catch (Exception)
                                {
                                }
                            }
                        }

                        SmtpClient smtpClient = new SmtpClient(smtpServer, smtpPort)
                        {
                            DeliveryMethod = SmtpDeliveryMethod.Network,
                            Credentials = new NetworkCredential(username, password),
                            EnableSsl = ssl == "1"
                        };

                        smtpClient.Send(mail);
                        isSuccess = true;
                    }
                    catch (Exception)
                    {
                        retryCount++;
                        if (retryCount >= 2)
                        {
                            break;
                        }
                    }
                }
                while (!isSuccess && retryCount < 2);
            }

            return isSuccess;
        }
    }
}
