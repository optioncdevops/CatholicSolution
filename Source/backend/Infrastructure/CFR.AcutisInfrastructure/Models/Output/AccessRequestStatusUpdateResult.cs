// Copyright (c) OptionC. All rights reserved.

namespace CFR.AcutisInfrastructure.Models.Output
{
    /// <summary>
    /// Result of [request].[AccessRequestManage] ActionId 2: the header identifier (@ReturnValue)
    /// plus which product line (@ResolvedAccessRequestProductId) was actually acted on - needed so
    /// the caller can look up SMS org-setup context for that exact product instead of guessing.
    /// </summary>
    public class AccessRequestStatusUpdateResult
    {
        /// <summary>
        /// Gets or sets the updated access request identifier, or a negative error code (see
        /// [request].[AccessRequestManage] ActionId 2's -93/-94/-95 sentinels).
        /// </summary>
        public int AccessRequestId { get; set; }

        /// <summary>
        /// Gets or sets the product line that was resolved/acted on, or null when the update failed
        /// before a line could be resolved.
        /// </summary>
        public int? AccessRequestProductId { get; set; }
    }
}
