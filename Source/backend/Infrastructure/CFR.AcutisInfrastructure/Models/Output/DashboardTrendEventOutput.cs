// Copyright (c) OptionC. All rights reserved.

using System.Text.Json.Serialization;

namespace CFR.AcutisInfrastructure.Models.Output
{
    /// <summary>
    /// Output DTO mapped from stored procedure StoredProc.Dashboard.DashboardCrud (ActionId 1,
    /// result set 3). One row per real event timestamp within the requested date range — never a
    /// pre-aggregated bucket — so the frontend's existing bucketing utilities (daily/weekly/
    /// monthly) can group them the same way they already group client-loaded data, except the
    /// events themselves are now scoped server-side to the selected range.
    /// </summary>
    public class DashboardTrendEventOutput
    {
        /// <summary>
        /// Gets or sets the event kind: OrgCreated, RequestSubmitted, RequestApproved,
        /// RequestRejected, LicenseCreated, or OrgProductAssignmentCreated.
        /// </summary>
        [JsonPropertyName("eventType")]
        public string EventType { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the event's timestamp (UTC).
        /// </summary>
        [JsonPropertyName("eventDate")]
        public DateTime EventDate { get; set; }
    }
}
