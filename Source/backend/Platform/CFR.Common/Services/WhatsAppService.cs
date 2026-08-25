// Copyright (c) OptionC. All rights reserved.

using Newtonsoft.Json;

namespace CFR.Common.Services
{
    public class WhatsAppAttachment
    {
        public required string FilePath { get; set; }
        public required string FileName { get; set; }
    }

    public class WhatsAppUploadResponse
    {
        [JsonProperty("id")]
        public string Id { get; set; } = null!;
    }

    public class WhatsAppMessagePayload
    {
        [JsonProperty("messaging_product")]
        public string MessagingProduct { get; set; } = "whatsapp";

        [JsonProperty("to")]
        public string To { get; set; } = null!;

        [JsonProperty("type")]
        public string Type { get; set; } = null!;

        [JsonProperty("text")]
        public WhatsAppText? Text { get; set; }

        [JsonProperty("document")]
        public WhatsAppDocument? Document { get; set; }
    }

    public class WhatsAppText
    {
        [JsonProperty("body")]
        public string Body { get; set; } = null!;
    }

    public class WhatsAppDocument
    {
        [JsonProperty("id")]
        public string Id { get; set; } = null!;

        [JsonProperty("filename")]
        public string Filename { get; set; } = null!;
    }

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
        public async Task<bool> SendMessageAsync(string whatsAppNumber, string? message = null, List<WhatsAppAttachment>? attachments = null)
        {
            try
            {
                if (!string.IsNullOrWhiteSpace(message))
                {
                    var textPayload = new WhatsAppMessagePayload
                    {
                        To = whatsAppNumber,
                        Type = "text",
                        Text = new WhatsAppText { Body = message }
                    };

                    bool textSent = await SendPayloadAsync(textPayload);
                    if (!textSent)
                    {
                        return false;
                    }
                }

                if (attachments != null)
                {
                    foreach (var file in attachments)
                    {
                        byte[] fileBytes = await File.ReadAllBytesAsync(file.FilePath);

                        string? mediaId = await UploadMediaAsync(fileBytes, file.FileName, GetMimeType(Path.GetFileName(file.FilePath)));
                        if (string.IsNullOrEmpty(mediaId))
                        {
                            return false;
                        }

                        var docPayload = new WhatsAppMessagePayload
                        {
                            To = whatsAppNumber,
                            Type = "document",
                            Document = new WhatsAppDocument
                            {
                                Id = mediaId,
                                Filename = file.FileName
                            }
                        };

                        bool docSent = await SendPayloadAsync(docPayload);
                        if (!docSent)
                        {
                            return false;
                        }
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
            string url = $"https://graph.facebook.com/v21.0/{_phoneNumberId}/media";

            using var content = new MultipartFormDataContent();
            var fileContent = new ByteArrayContent(fileBytes);
            fileContent.Headers.ContentType = new MediaTypeHeaderValue(mimeType);

            content.Add(fileContent, "file", fileName);
            content.Add(new StringContent(mimeType), "type");
            content.Add(new StringContent("whatsapp"), "messaging_product");

            using var request = new HttpRequestMessage(HttpMethod.Post, url) { Content = content };
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _accessToken);

            var response = await _httpClient.SendAsync(request);
            if (!response.IsSuccessStatusCode)
            {
                return null;
            }

            string jsonResponse = await response.Content.ReadAsStringAsync();
            var uploadResponse = JsonConvert.DeserializeObject<WhatsAppUploadResponse>(jsonResponse);

            return uploadResponse?.Id;
        }

        private async Task<bool> SendPayloadAsync(WhatsAppMessagePayload payload)
        {
            string url = $"https://graph.facebook.com/v21.0/{_phoneNumberId}/messages";

            string json = JsonConvert.SerializeObject(payload);
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
