// Copyright (c) OptionC. All rights reserved.

namespace CFR.AcutisService.Interfaces.Dashboard
{
    /// <summary>
    /// Service contract for the Dashboard summary operation.
    /// Acts as the business-logic layer between DashboardController and IDashboardRepository.
    /// Responsibility:
    /// - Validates the requested date range and delegates to IDashboardRepository for the
    ///   authoritative platform KPIs, entitlement-integrity metrics, and trend events.
    /// </summary>
    public interface IDashboardService
    {
        #region GET Methods

        /// <summary>
        /// Retrieves the dashboard summary for the given date range.
        /// </summary>
        /// <remarks>
        /// Purpose: Fetch real, SQL-backed platform KPIs, entitlement-integrity metrics, and trend events.
        /// Request Flow: DashboardController -> IDashboardService.GetDashboardSummaryAsync() -> IDashboardRepository.GetDashboardSummaryAsync().
        /// Validation Details: StartDate must be on or before EndDate; the range must not exceed 366 days.
        /// Business Logic: Wraps the composite result in MSResultArgs.
        /// Repository Interaction: Calls IDashboardRepository.GetDashboardSummaryAsync().
        /// Response Details: MSResultArgs containing DashboardSummaryOutput, or BadRequest for an invalid range.
        /// </remarks>
        /// <param name="startDate">Inclusive start of the trend-events range (UTC).</param>
        /// <param name="endDate">Inclusive end of the trend-events range (UTC).</param>
        /// <returns>MSResultArgs containing the dashboard summary.</returns>
        Task<MSResultArgs> GetDashboardSummaryAsync(DateTime startDate, DateTime endDate);

        /// <summary>
        /// Retrieves the actual flagged records behind one entitlement-integrity check.
        /// </summary>
        /// <remarks>
        /// Purpose: Let the Dashboard's Priority Alerts panel show and link to the exact
        /// organizations/products/members behind a single integrity KPI, not just its count.
        /// Request Flow: DashboardController -> IDashboardService.GetIntegrityIssueDetailAsync() -> IDashboardRepository.GetIntegrityIssueDetailAsync().
        /// Validation Details: issueKey must be one of the drill-down-supported keys.
        /// Business Logic: Delegates to IDashboardRepository.GetIntegrityIssueDetailAsync().
        /// Repository Interaction: Calls IDashboardRepository.GetIntegrityIssueDetailAsync().
        /// Response Details: MSResultArgs containing the flagged rows, or BadRequest for an unsupported key.
        /// </remarks>
        /// <param name="issueKey">One of the drill-down-supported integrity check keys.</param>
        /// <returns>MSResultArgs containing the flagged rows.</returns>
        Task<MSResultArgs> GetIntegrityIssueDetailAsync(string issueKey);

        #endregion GET Methods
    }
}
