// Copyright (c) OptionC. All rights reserved.

namespace CFR.PortalInfrastructure.Models.Input
{
    /// <summary>
    /// Request body for exchanging a one-time platform-launch code for a Portal session.
    /// </summary>
    public class PlatformLaunchExchangeInput
    {
        /// <summary>Gets or sets the raw one-time authorization code.</summary>
        public string Code { get; set; } = string.Empty;
    }
}
