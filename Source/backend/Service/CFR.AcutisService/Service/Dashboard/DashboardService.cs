// Copyright (c) OptionC. All rights reserved.

namespace CFR.AcutisService.Service.Dashboard
{
    /// <summary>
    /// Implements the Dashboard summary business logic.
    /// Repository Responsibility:
    /// - Invokes IDashboardRepository for the authoritative platform KPIs, entitlement-integrity
    ///   metrics, and trend events read.
    /// </summary>
    public class DashboardService(IDashboardRepository repository, ILogger<DashboardService> logger): IDashboardService
    {
        /// <summary>
        /// Maximum trend-events range this dashboard accepts, in days — generous enough to cover
        /// "This Year" plus a full custom range, without allowing an unbounded full-history scan.
        /// </summary>
        private const int MaximumRangeDays = 366;

        /// <summary>
        /// Integrity/KPI keys the Priority Alerts drill-down actually supports — the ones whose
        /// "Review" link previously landed on a generic, unfiltered list because no single URL
        /// filter could express their multi-table-join condition (org-status and request-status
        /// filters already cover the rest; see StoredProc.Dashboard.DashboardCrud ActionId 2).
        /// </summary>
        private static readonly HashSet<string> SupportedIntegrityIssueKeys = new(StringComparer.OrdinalIgnoreCase)
        {
            "activeOrganizationProductsWithoutMembers",
            "activeUserProductsWithoutActiveOrganizationProduct",
            "duplicateActiveUserProductMappings",
            "expiredLicensesWithActiveOrganizationProduct",
            "expiredLicenses",
        };

        #region GET Methods

        /// <summary>
        /// Retrieves the dashboard summary for the given date range.
        /// </summary>
        /// <remarks>
        /// Purpose: Fetch real, SQL-backed platform KPIs, entitlement-integrity metrics, and trend events.
        /// Request Flow: DashboardController -> DashboardService.GetDashboardSummaryAsync() -> IDashboardRepository.GetDashboardSummaryAsync().
        /// Validation Details: StartDate must be on or before EndDate; the range must not exceed 366 days.
        /// Business Logic: Wraps the composite result in MSResultArgs.
        /// Repository Interaction: Calls IDashboardRepository.GetDashboardSummaryAsync().
        /// Response Details: MSResultArgs containing DashboardSummaryOutput, or BadRequest for an invalid range.
        /// </remarks>
        /// <param name="startDate">Inclusive start of the trend-events range (UTC).</param>
        /// <param name="endDate">Inclusive end of the trend-events range (UTC).</param>
        /// <returns>MSResultArgs containing the dashboard summary.</returns>
        public async Task<MSResultArgs> GetDashboardSummaryAsync(DateTime startDate, DateTime endDate)
        {
            var result = new MSResultArgs();
            try
            {
                if (startDate > endDate)
                {
                    result.StatusCode = ErrorCodes.BadRequest;
                    result.StatusMessage = ErrorMessages.DashboardInvalidDateRange;
                    return result;
                }

                if ((endDate - startDate).TotalDays > MaximumRangeDays)
                {
                    result.StatusCode = ErrorCodes.BadRequest;
                    result.StatusMessage = ErrorMessages.DashboardDateRangeTooLarge;
                    return result;
                }

                var data = await repository.GetDashboardSummaryAsync(startDate, endDate);
                result.ResultData = data;
            }
            catch (Exception ex)
            {
                AppLogger.LogError(logger, ex, SerilogErrorMessages.AcutisLogMessages.FetchDashboardSummaryFailed);
                result.StatusCode = ErrorCodes.InternalServerError;
                result.StatusMessage = ErrorMessages.InternalServerError;
            }

            return result;
        }

        /// <summary>
        /// Retrieves the flagged records behind one entitlement-integrity check.
        /// </summary>
        /// <remarks>
        /// Purpose: Fetch the actual organizations/products/members behind a single integrity KPI.
        /// Request Flow: DashboardController -> DashboardService.GetIntegrityIssueDetailAsync() -> IDashboardRepository.GetIntegrityIssueDetailAsync().
        /// Validation Details: issueKey must be one of SupportedIntegrityIssueKeys.
        /// Business Logic: Wraps the flagged rows in MSResultArgs.
        /// Repository Interaction: Calls IDashboardRepository.GetIntegrityIssueDetailAsync().
        /// Response Details: MSResultArgs containing the flagged rows, or BadRequest for an unsupported key.
        /// </remarks>
        /// <param name="issueKey">One of the drill-down-supported integrity check keys.</param>
        /// <returns>MSResultArgs containing the flagged rows.</returns>
        public async Task<MSResultArgs> GetIntegrityIssueDetailAsync(string issueKey)
        {
            var result = new MSResultArgs();
            try
            {
                if (string.IsNullOrWhiteSpace(issueKey) || !SupportedIntegrityIssueKeys.Contains(issueKey))
                {
                    result.StatusCode = ErrorCodes.BadRequest;
                    result.StatusMessage = ErrorMessages.BadRequest;
                    return result;
                }

                result.ResultData = await repository.GetIntegrityIssueDetailAsync(issueKey);
            }
            catch (Exception ex)
            {
                AppLogger.LogError(logger, ex, SerilogErrorMessages.AcutisLogMessages.FetchDashboardSummaryFailed);
                result.StatusCode = ErrorCodes.InternalServerError;
                result.StatusMessage = ErrorMessages.InternalServerError;
            }

            return result;
        }

        #endregion GET Methods
    }
}
