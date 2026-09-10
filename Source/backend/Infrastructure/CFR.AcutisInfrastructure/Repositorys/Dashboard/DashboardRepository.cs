// Copyright (c) OptionC. All rights reserved.

namespace CFR.AcutisInfrastructure.Repositorys.Dashboard
{
    /// <summary>
    /// Dapper implementation of IDashboardRepository.
    /// Infrastructure Responsibility:
    /// - Uses IDapperHandler to execute StoredProc.Dashboard.DashboardCrud and map its three
    ///   result sets (KPIs, integrity metrics, trend events) into DashboardSummaryOutput.
    /// </summary>
    public class DashboardRepository(IDapperHandler dapperHandler): IDashboardRepository
    {
        #region GET Methods

        /// <summary>
        /// Fetches the dashboard summary using StoredProc.Dashboard.DashboardCrud.
        /// </summary>
        /// <remarks>
        /// Purpose: Retrieve platform KPIs, entitlement-integrity metrics, and trend events in one call.
        /// Request Flow: IDashboardService -> DashboardRepository.GetDashboardSummaryAsync() -> Database.
        /// Validation Details: StartDate/EndDate parameter mapping only.
        /// Business Logic: Reads three result sets in order (KPIs row, integrity row, trend event rows).
        /// Repository Interaction: Executes StoredProc.Dashboard.DashboardCrud with ActionId 1.
        /// Response Details: Returns a composite DashboardSummaryOutput.
        /// </remarks>
        /// <param name="startDate">Inclusive start of the trend-events range (UTC).</param>
        /// <param name="endDate">Inclusive end of the trend-events range (UTC).</param>
        /// <returns>The dashboard summary.</returns>
        public async Task<DashboardSummaryOutput> GetDashboardSummaryAsync(DateTime startDate, DateTime endDate)
        {
            var parameters = new DynamicParameters();
            parameters.Add(DBParameterName.DashboardParams.ActionId, 1, DbType.Int32);
            parameters.Add(DBParameterName.DashboardParams.StartDate, startDate, DbType.DateTime2);
            parameters.Add(DBParameterName.DashboardParams.EndDate, endDate, DbType.DateTime2);
            using var grid = await dapperHandler.QueryMultipleAsync(StoredProc.Dashboard.DashboardCrud, parameters, CommandType.StoredProcedure);
            var kpis = (await grid.ReadAsync<DashboardKpiOutput>()).FirstOrDefault() ?? new DashboardKpiOutput();
            var integrity = (await grid.ReadAsync<DashboardIntegrityOutput>()).FirstOrDefault() ?? new DashboardIntegrityOutput();
            var trendEvents = (await grid.ReadAsync<DashboardTrendEventOutput>()).AsList();
            return new DashboardSummaryOutput { Kpis = kpis, Integrity = integrity, TrendEvents = trendEvents };
        }

        /// <summary>
        /// Fetches the flagged rows behind one entitlement-integrity count using
        /// StoredProc.Dashboard.DashboardCrud (ActionId 2).
        /// </summary>
        /// <remarks>
        /// Purpose: Retrieve the exact organizations/products/members behind a single integrity KPI.
        /// Request Flow: IDashboardService -> DashboardRepository.GetIntegrityIssueDetailAsync() -> Database.
        /// Validation Details: issueKey mapping only.
        /// Business Logic: Executes StoredProc.Dashboard.DashboardCrud with ActionId 2 and @IssueKey.
        /// Repository Interaction: Executes StoredProc.Dashboard.DashboardCrud.
        /// Response Details: Returns the matching rows, or an empty list for an unrecognized key.
        /// </remarks>
        /// <param name="issueKey">One of DashboardIntegrityApiItem's field names.</param>
        /// <returns>The flagged rows for that issue.</returns>
        public async Task<List<DashboardIntegrityIssueRowOutput>> GetIntegrityIssueDetailAsync(string issueKey)
        {
            var parameters = new DynamicParameters();
            parameters.Add(DBParameterName.DashboardParams.ActionId, 2, DbType.Int32);
            parameters.Add(DBParameterName.DashboardParams.IssueKey, issueKey, DbType.String);
            var rows = await dapperHandler.QueryAsync<DashboardIntegrityIssueRowOutput>(StoredProc.Dashboard.DashboardCrud, parameters, CommandType.StoredProcedure);
            return rows.AsList();
        }

        #endregion GET Methods
    }
}
