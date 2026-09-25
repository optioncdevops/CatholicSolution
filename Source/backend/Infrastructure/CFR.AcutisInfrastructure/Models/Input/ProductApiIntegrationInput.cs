using System.Text.Json.Serialization;

namespace CFR.AcutisInfrastructure.Models.Input
{
    public class ProductApiIntegrationInput
    {
        [JsonPropertyName("productEnvironmentId")]
        public int ProductEnvironmentId { get; set; }

        [JsonPropertyName("siteUrl")]
        public string? SiteUrl { get; set; }

        [JsonPropertyName("siteDescription")]
        public string? SiteDescription { get; set; }
    }
}
