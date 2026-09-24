// Copyright (c) OptionC. All rights reserved.

namespace CFR.DataSyncInfrastructure.Models.Output
{
    /// <summary>
    /// GetUserProducts response payload: the CFR-linked user's products, plus a one-time App Hub
    /// platform-launch code minted in the same call so the App Switcher widget's "All apps in
    /// App Hub" link can carry it without a second round trip.
    /// </summary>
    public class UserProductsResult
    {
        /// <summary>Gets or sets the CFR-linked user's active products.</summary>
        [JsonPropertyName("products")]
        public IEnumerable<UserProductListItemOutput> Products { get; set; } = [];

        /// <summary>
        /// Gets or sets the one-time code (raw, never stored) for CFR.Portal's
        /// PlatformLaunch/ExchangeToken. Null when the code could not be created.
        /// </summary>
        [JsonPropertyName("platformLaunchCode")]
        public string? PlatformLaunchCode { get; set; }
    }
}
