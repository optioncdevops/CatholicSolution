// Copyright (c) OptionC. All rights reserved.

namespace CFR.Acutis.Controllers.Dashboard
{
    /// <summary>
    /// API controller for the CFR Admin dashboard summary.
    /// Handles the single authoritative read of platform KPIs, entitlement-integrity metrics, and
    /// trend events — replaces the frontend aggregating several broad list endpoints itself.
    /// Service Responsibility:
    /// - IDashboardService validates the date range and returns MSResultArgs.
    /// </summary>
    [ApiExplorerSettings(GroupName = SwaggerModuleDoc.CFRAcutisDashboard)]
    public class DashboardController(IDashboardService service): BaseController
    {
        #region GET Methods

        /// <summary>
        /// Retrieves the dashboard summary for the given date range.
        /// </summary>
        /// <remarks>
        /// Purpose: Fetch real, SQL-backed platform KPIs, entitlement-integrity metrics, and trend events.
        /// Request Flow: Client API GET -> DashboardController.GetDashboardSummary() -> IDashboardService.GetDashboardSummaryAsync() -> Database.
        /// Validation Details: Handled inside the service layer (start/end order, maximum range).
        /// Business Logic: None at the controller level; delegates to the service layer.
        /// Service Interaction: Calls IDashboardService.GetDashboardSummaryAsync().
        /// Response Details: Standard API result enclosing DashboardSummaryOutput with status 200, 400, or 500.
        /// </remarks>
        /// <param name="startDate">Inclusive start of the trend-events range (UTC).</param>
        /// <param name="endDate">Inclusive end of the trend-events range (UTC).</param>
        /// <returns>A consistent API response containing the dashboard summary.</returns>
        /// <response code="200">Successfully fetched the dashboard summary.</response>
        /// <response code="400">The requested date range is invalid or too large.</response>
        /// <response code="500">Internal server error occurred.</response>
        [HttpGet]
        [ActionName(API_Dashboard.GetDashboardSummary)]
        public async Task<IActionResult> GetDashboardSummary(DateTime startDate, DateTime endDate)
        {
            return ApiResultArgs(await service.GetDashboardSummaryAsync(startDate, endDate), APIHttpType.HttpGet);
        }

        /// <summary>
        /// Retrieves the actual flagged records behind one entitlement-integrity check.
        /// </summary>
        /// <remarks>
        /// Purpose: Let the Dashboard's Priority Alerts panel show and link to the exact
        /// organizations/products/members behind a single integrity KPI, not just its count.
        /// Request Flow: Client API GET -> DashboardController.GetIntegrityIssueDetail() -> IDashboardService.GetIntegrityIssueDetailAsync() -> Database.
        /// Validation Details: Handled inside the service layer (issueKey must be a supported drill-down key).
        /// Business Logic: None at the controller level; delegates to the service layer.
        /// Service Interaction: Calls IDashboardService.GetIntegrityIssueDetailAsync().
        /// Response Details: Standard API result enclosing a list of DashboardIntegrityIssueRowOutput with status 200, 400, or 500.
        /// </remarks>
        /// <param name="issueKey">One of the drill-down-supported integrity check keys.</param>
        /// <returns>A consistent API response containing the flagged rows.</returns>
        /// <response code="200">Successfully fetched the flagged rows.</response>
        /// <response code="400">The requested issueKey isn't a supported drill-down.</response>
        /// <response code="500">Internal server error occurred.</response>
        [HttpGet]
        [ActionName(API_Dashboard.GetIntegrityIssueDetail)]
        public async Task<IActionResult> GetIntegrityIssueDetail(string issueKey)
        {
            return ApiResultArgs(await service.GetIntegrityIssueDetailAsync(issueKey), APIHttpType.HttpGet);
        }

        #endregion GET Methods
    }
}
