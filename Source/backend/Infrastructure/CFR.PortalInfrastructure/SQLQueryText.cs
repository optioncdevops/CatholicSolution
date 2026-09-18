namespace CFR.PortalInfrastructure
{
    /// <summary>
    /// Static SQL query texts for direct Dapper queries that deliberately bypass stored procedures.
    /// </summary>
    public static class SQLQueryText
    {
        /// <summary>
        /// Inline SQL query texts for Access Request operations (AccessRequestRepository).
        /// </summary>
        public static class Requests
        {
            /// <summary>
            /// Fetches the diocese lookup list for the Diocese dropdown on the public Request Access page.
            /// </summary>
            public const string GetDiocesesList = @"
                SELECT
                    [DioceseId],
                    [DioceseName],
                    [Address],
                    [City],
                    [State]
                FROM [core].[Diocese]
                WHERE [IsDeleted] = 0
                ORDER BY [DioceseName];";

            /// <summary>
            /// Sets [request].[AccessRequest].[DioceseId] on a public request, as a low-risk follow-up
            /// UPDATE since the AccessRequestManage stored procedure has no @DioceseId parameter.
            /// </summary>
            public const string UpdateAccessRequestDioceseId = @"
                UPDATE [request].[AccessRequest]
                SET [DioceseId] = @DioceseId
                WHERE [AccessRequestId] = @AccessRequestId
                  AND [IsDeleted] = 0;";
        }
    }
}