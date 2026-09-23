// Copyright (c) OptionC. All rights reserved.

namespace CFR.DataSyncInfrastructure.Models.Output
{
    /// <summary>
    /// Row shape returned by [dbo].[Portal_CFRLaunch] ActionId 4 on success - mirrors
    /// CFR.PortalInfrastructure's own CFRLaunchCreateRow (same SELECT), duplicated here because
    /// CFR.DataSyncInfrastructure cannot reference CFR.PortalInfrastructure's project.
    /// </summary>
    public class ProductLaunchCreateRow
    {
        /// <summary>Gets or sets the launch transaction identifier.</summary>
        public int LaunchId { get; set; }

        /// <summary>Gets or sets the product identifier.</summary>
        public int ProductId { get; set; }

        /// <summary>Gets or sets the product name.</summary>
        public string? ProductName { get; set; }

        /// <summary>Gets or sets the [core].[ProductEnvironment] BaseUrl for the login environment.</summary>
        public string? BaseUrl { get; set; }

        /// <summary>Gets or sets the UTC expiry for the authorization code.</summary>
        public DateTime ExpiresAt { get; set; }
    }
}
