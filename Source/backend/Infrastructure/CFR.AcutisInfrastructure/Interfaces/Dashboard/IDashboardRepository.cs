// Copyright (c) OptionC. All rights reserved.

namespace CFR.AcutisInfrastructure.Interfaces.Dashboard
{
    /// <summary>
    /// Repository interface for the Dashboard summary database operations.
    /// Repository Responsibility:
    /// - Declares the single authoritative read against StoredProc.Dashboard.DashboardCrud that
    ///   returns platform KPIs, entitlement-integrity metrics, and trend events together.
    /// </summary>
    public interface IDashboardRepository
    {
        #region GET Methods

        /// <summary>
        /// Retrieves the dashboard summary for the given date range.
        /// </summary>
        /// <remarks>
        /// Purpose: Fetch real, SQL-backed platform KPIs, entitlement-integrity metrics, and
        /// trend events for the CFR Admin dashboard.
        /// Request Flow: IDashboardService -> DashboardRepository.GetDashboardSummaryAsync() -> SQL Database.
        /// Validation Details: StartDate/EndDate parameter mapping only — range validity is checked in the service.
        /// Business Logic: Reads three result sets (KPIs, integrity, trend events) into one composite DTO.
        /// Repository Interaction: Executes StoredProc.Dashboard.DashboardCrud with ActionId 1.
        /// Response Details: Returns a DashboardSummaryOutput record.
        /// </remarks>
        /// <param name="startDate">Inclusive start of the trend-events range (UTC).</param>
        /// <param name="endDate">Inclusive end of the trend-events range (UTC).</param>
        /// <returns>The dashboard summary.</returns>
        Task<DashboardSummaryOutput> GetDashboardSummaryAsync(DateTime startDate, DateTime endDate);

        /// <summary>
        /// Retrieves the actual flagged records behind one entitlement-integrity count.
        /// </summary>
        /// <remarks>
        /// Purpose: Let the Dashboard's Priority Alerts panel show and link to the exact
        /// organizations/products/members behind a single integrity KPI, not just its count.
        /// Request Flow: IDashboardService -> DashboardRepository.GetIntegrityIssueDetailAsync() -> SQL Database.
        /// Validation Details: issueKey mapping only — an unrecognized key is handled inside the stored procedure.
        /// Business Logic: Reads one result set for the given issue key.
        /// Repository Interaction: Executes StoredProc.Dashboard.DashboardCrud with ActionId 2.
        /// Response Details: Returns the matching rows, or an empty list for an unrecognized key.
        /// </remarks>
        /// <param name="issueKey">One of DashboardIntegrityApiItem's field names.</param>
        /// <returns>The flagged rows for that issue.</returns>
        Task<List<DashboardIntegrityIssueRowOutput>> GetIntegrityIssueDetailAsync(string issueKey);

        #endregion GET Methods
    }
}
