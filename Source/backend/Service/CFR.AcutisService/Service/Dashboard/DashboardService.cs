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

        #endregion GET Methods
    }
}
