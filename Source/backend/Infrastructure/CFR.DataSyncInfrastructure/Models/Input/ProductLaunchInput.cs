// Copyright (c) OptionC. All rights reserved.

namespace CFR.DataSyncInfrastructure.Models.Input
{
    /// <summary>
    /// Request body for launching a CFR-linked user into another product, already signed in.
    /// </summary>
    public class ProductLaunchInput
    {
        /// <summary>Gets or sets the email address of the CFR-linked user.</summary>
        public string Email { get; set; } = string.Empty;

        /// <summary>Gets or sets the product to launch.</summary>
        public int ProductId { get; set; }
    }
}
