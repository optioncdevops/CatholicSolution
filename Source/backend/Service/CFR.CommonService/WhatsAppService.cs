// Copyright (c) OptionC. All rights reserved.

using Newtonsoft.Json;

using System.Net.Http.Headers;
using System.Text;

namespace CFR.CommonService
{
    public class WhatsAppAttachment
    {
        public string? FilePath { get; set; }
        public string? FileName { get; set; }
    }

#pragma warning disable

    public class WhatsAppUploadResponse
    {
        public string id { get; set; }
    }

    public class WhatsAppMessagePayload
    {
        public string messaging_product { get; set; } = "whatsapp";
        public string to { get; set; }
        public string type { get; set; }
        public WhatsAppText text { get; set; }
        public WhatsAppDocument document { get; set; }
    }

    public class WhatsAppText
    {
        public string body { get; set; }
    }

    public class WhatsAppDocument
    {
        public string id { get; set; }
        public string filename { get; set; }
    }

#pragma warning disable

    public interface IWhatsAppService
    {
        Task<bool> SendMessageAsync(string whatsAppNumber, string? message, List<WhatsAppAttachment>? attachments);
    }

    public class WhatsAppService(HttpClient httpClient, string accessToken, string phoneNumberId): IWhatsAppService
    {
        private readonly HttpClient _httpClient = httpClient;
        private readonly string _accessToken = accessToken;
        private readonly string _phoneNumberId = phoneNumberId;

        /// <summary>
        /// Sends WhatsApp text and multiple documents in one workflow.
        /// </summary>
        public async Task<bool> SendMessageAsync(string patientNumber, string? message = null, List<WhatsAppAttachment>? attachments = null)
        {
            try
            {
                // 1. Send text message if provided
                if (!string.IsNullOrWhiteSpace(message))
                {
                    var textPayload = new WhatsAppMessagePayload
                    {
                        to = patientNumber,
                        type = "text",
                        text = new WhatsAppText { body = message }
                    };

                    bool textSent = await SendPayloadAsync(textPayload);
                    if (!textSent) return false;
                }

                // 2. Upload & send each attachment
                if (attachments != null)
                {
                    foreach (var file in attachments)
                    {
                        var fileBytes = await File.ReadAllBytesAsync(file.FilePath);

                        var mediaId = await UploadMediaAsync(fileBytes, file.FileName, GetMimeType(Path.GetFileName(file.FilePath)));
                        if (string.IsNullOrEmpty(mediaId)) return false;

                        var docPayload = new WhatsAppMessagePayload
                        {
                            to = patientNumber,
                            type = "document",
                            document = new WhatsAppDocument
                            {
                                id = mediaId,
                                filename = file.FileName
                            }
                        };

                        bool docSent = await SendPayloadAsync(docPayload);
                        if (!docSent) return false;
                    }
                }

                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"WhatsApp send error: {ex.Message}");
                return false;
            }
        }

        private async Task<string?> UploadMediaAsync(byte[] fileBytes, string fileName, string mimeType)
        {
            var url = $"https://graph.facebook.com/v21.0/{_phoneNumberId}/media";

            using var content = new MultipartFormDataContent();
            var fileContent = new ByteArrayContent(fileBytes);
            fileContent.Headers.ContentType = new MediaTypeHeaderValue(mimeType);

            content.Add(fileContent, "file", fileName);
            content.Add(new StringContent(mimeType), "type");
            content.Add(new StringContent("whatsapp"), "messaging_product");

            using var request = new HttpRequestMessage(HttpMethod.Post, url) { Content = content };
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _accessToken);

            var response = await _httpClient.SendAsync(request);
            if (!response.IsSuccessStatusCode) return null;

            var jsonResponse = await response.Content.ReadAsStringAsync();
            var uploadResponse = JsonConvert.DeserializeObject<WhatsAppUploadResponse>(jsonResponse);

            return uploadResponse?.id;
        }

        private async Task<bool> SendPayloadAsync(WhatsAppMessagePayload payload)
        {
            var url = $"https://graph.facebook.com/v21.0/{_phoneNumberId}/messages";

            var json = JsonConvert.SerializeObject(payload);
            var request = new HttpRequestMessage(HttpMethod.Post, url)
            {
                Content = new StringContent(json, Encoding.UTF8, "application/json")
            };
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _accessToken);

            var response = await _httpClient.SendAsync(request);
            return response.IsSuccessStatusCode;
        }

        private static string GetMimeType(string fileName)
        {
            string ext = Path.GetExtension(fileName).ToLowerInvariant();
            return ext switch
            {
                ".txt" => "text/plain",
                ".pdf" => "application/pdf",
                ".doc" => "application/msword",
                ".docx" => "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                ".xls" => "application/vnd.ms-excel",
                ".xlsx" => "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                ".png" => "image/png",
                ".jpg" => "image/jpeg",
                ".jpeg" => "image/jpeg",
                ".gif" => "image/gif",
                ".csv" => "text/csv",
                _ => "application/octet-stream"
            };
        }
    }
}
