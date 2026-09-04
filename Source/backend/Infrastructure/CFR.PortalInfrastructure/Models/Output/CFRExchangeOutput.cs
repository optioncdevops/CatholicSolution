// Copyright (c) OptionC. All rights reserved.

using System.Text.Json.Serialization;

namespace CFR.PortalInfrastructure.Models.Output
{
    /// <summary>
    /// Output DTO returned to a product backend after a successful code exchange.
    /// Contains only the signed identity token.
    /// </summary>
    public class CFRExchangeOutput
    {
        /// <summary>
        /// Gets or sets the short-lived signed CFR identity token.
        /// </summary>
        [JsonPropertyName("identityToken")]
        public string IdentityToken { get; set; } = string.Empty;
    }

    /// <summary>
    /// Row returned from stored procedure StoredProc.CFRLaunch.CFRLaunchCrud ActionId 3 after the code is consumed.
    /// </summary>
    public class CFRExchangeRow
    {
        /// <summary>
        /// Gets or sets the launch identifier.
        /// </summary>
        public int LaunchId { get; set; }

        /// <summary>
        /// Gets or sets the CFR member identifier.
        /// </summary>
        public int CFRUserId { get; set; }

        /// <summary>
        /// Gets or sets the member email address.
        /// </summary>
        public string EMail { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the product identifier.
        /// </summary>
        public int ProductId { get; set; }
    }
}
