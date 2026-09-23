// Copyright (c) OptionC. All rights reserved.

namespace CFR.AcutisInfrastructure.Models.Input
{
    /// <summary>
    /// Input DTO used to set which Acutis user receives "new product suggestion" notification
    /// emails. Bound from the controller request body on POST SaveProductRequestNotifyUser.
    /// </summary>
    public class ProductRequestNotifyUserInput
    {
        /// <summary>
        /// Gets or sets the [auth].[AcutisUser].[UserId] to notify, or null to clear the setting
        /// (falls back to the Platform Admin role).
        /// </summary>
        [JsonPropertyName("productRequestNotifyUserId")]
        public long? ProductRequestNotifyUserId { get; set; }
    }
}
