// Copyright (c) OptionC. All rights reserved.
namespace CFR.AcutisInfrastructure.Models.Output
{
    /// <summary>
    /// Output model representing one [core].[ProductEnvironment] row (joined to [core].[Product])
    /// for the Products page's Api Integration tab, scoped to the currently configured appsettings
    /// Environment.
    /// </summary>
    public class ProductApiIntegrationOutput
    {
        /// <summary>
        /// Gets or sets the environment/site name (e.g. Development, Pilot, Staging, Live), from [core].[ProductEnvironment].[EnvironmentName].
        /// A NULL EnvironmentName is the product's public website (not tied to an environment) and is reported here as "Website".
        /// </summary>
        [JsonPropertyName("site")]
        public string Site { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the site's base URL, from [core].[ProductEnvironment].[BaseUrl].
        /// </summary>
        [JsonPropertyName("siteUrl")]
        public string? SiteUrl { get; set; }

        /// <summary>
        /// Gets or sets the site description, from [core].[ProductEnvironment].[Description].
        /// </summary>
        [JsonPropertyName("siteDescription")]
        public string? SiteDescription { get; set; }
    }
}
