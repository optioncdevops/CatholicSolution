// Copyright (c) OptionC. All rights reserved.

using System.Text.Json.Serialization;

namespace CFR.AcutisInfrastructure.Models.Output
{
    /// <summary>
    /// Composite output DTO for the dashboard summary endpoint — combines the platform KPIs,
    /// entitlement-integrity metrics, and raw trend events read from
    /// StoredProc.Dashboard.DashboardCrud (ActionId 1) into the one shape the CFR Admin dashboard
    /// consumes, so the frontend makes a single authoritative call instead of aggregating several
    /// broad list endpoints itself.
    /// </summary>
    public class DashboardSummaryOutput
    {
        /// <summary>
        /// Gets or sets the platform KPIs (organizations, users, products, licenses, requests).
        /// </summary>
        [JsonPropertyName("kpis")]
        public DashboardKpiOutput Kpis { get; set; } = new();

        /// <summary>
        /// Gets or sets the entitlement-integrity metrics.
        /// </summary>
        [JsonPropertyName("integrity")]
        public DashboardIntegrityOutput Integrity { get; set; } = new();

        /// <summary>
        /// Gets or sets the raw trend events within the requested date range.
        /// </summary>
        [JsonPropertyName("trendEvents")]
        public List<DashboardTrendEventOutput> TrendEvents { get; set; } = [];
    }
}
