// Copyright (c) OptionC. All rights reserved.

using System.Text.Json.Serialization;

namespace CFR.PortalInfrastructure.Models.Output
{
    /// <summary>
    /// Output DTO returned after creating a one-time product launch.
    /// </summary>
    public class CFRLaunchOutput
    {
        /// <summary>
        /// Gets or sets the product identifier.
        /// </summary>
        [JsonPropertyName("productId")]
        public int ProductId { get; set; }

        /// <summary>
        /// Gets or sets the launch URL including the one-time authorization code.
        /// </summary>
        [JsonPropertyName("launchUrl")]
        public string LaunchUrl { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the UTC expiry of the authorization code.
        /// </summary>
        [JsonPropertyName("expiresAt")]
        public DateTime ExpiresAt { get; set; }
    }

    /// <summary>
    /// Row returned from stored procedure StoredProc.CFRLaunch.CFRLaunchCrud ActionId 2.
    /// </summary>
    public class CFRLaunchCreateRow
    {
        /// <summary>
        /// Gets or sets the launch identifier.
        /// </summary>
        public int LaunchId { get; set; }

        /// <summary>
        /// Gets or sets the product identifier.
        /// </summary>
        public int ProductId { get; set; }

        /// <summary>
        /// Gets or sets the product name.
        /// </summary>
        public string ProductName { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the launch base URL from [core].[ProductEnvironment] for the login environment.
        /// </summary>
        public string BaseUrl { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the UTC expiry computed by SQL from SYSUTCDATETIME().
        /// </summary>
        public DateTime ExpiresAt { get; set; }
    }
}
