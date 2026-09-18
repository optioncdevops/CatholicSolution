// Copyright (c) OptionC. All rights reserved.

using System.Text.Json.Serialization;

namespace CFR.AcutisInfrastructure.Models.Output
{
    /// <summary>
    /// One row from core.Diocese, for the admin Organization module's Diocese dropdown/column.
    /// </summary>
    public class DioceseOutput
    {
        [JsonPropertyName("dioceseId")]
        public int DioceseId { get; set; }

        [JsonPropertyName("dioceseName")]
        public string DioceseName { get; set; } = string.Empty;

        [JsonPropertyName("address")]
        public string? Address { get; set; }

        [JsonPropertyName("city")]
        public string? City { get; set; }

        [JsonPropertyName("state")]
        public string? State { get; set; }
    }
}
