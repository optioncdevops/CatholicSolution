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

        #endregion GET Methods
    }
}
