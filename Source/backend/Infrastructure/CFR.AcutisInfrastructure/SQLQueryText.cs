// Copyright (c) OptionC. All rights reserved.

namespace CFR.AcutisInfrastructure
{
    /// <summary>
    /// Static SQL query texts for direct Dapper queries that deliberately bypass stored procedures.
    /// </summary>
    public static class SQLQueryText
    {
        /// <summary>
        /// Inline SQL query texts for Access Request / SMS org-setup operations (AccessRequestRepository).
        /// </summary>
        public static class Requests
        {
            /// <summary>
            /// Supplies the contact/org/product fields needed to call SMS's SetupNewOrganizationByCFR
            /// for one specific product line (@AccessRequestProductId) - not just "whichever line on
            /// this request happens to be first" (a request can have several product lines, see
            /// ActionId 7's multi-product public submit in 008_AccessRequest.sql).
            /// </summary>
            public const string GetOrgSetupContext = @"
                SELECT
                    CAST(ar.[OrgId] AS INT) AS [OrgId],
                    CAST(ar.[RequestedBy] AS INT) AS [CFRUserId],
                    ar.[RequesterFirstName] AS [FirstName],
                    ar.[RequesterLastName] AS [LastName],
                    ar.[ContactPhone] AS [Phone],
                    COALESCE(NULLIF(LTRIM(RTRIM(ar.[ContactEmail])), N''), u.[Email]) AS [Email],
                    ar.[OrganizationName] AS [OrganizationName],
                    ar.[Address] AS [Address],
                    ar.[City] AS [City],
                    ar.[State] AS [State],
                    ar.[Zip] AS [Zip],
                    ar.[DioceseId] AS [DioceseId],
                    p.[ProductName] AS [ProductName]
                FROM [request].[AccessRequest] ar
                LEFT JOIN [auth].[User] u ON u.[CFRUserId] = ar.[RequestedBy]
                INNER JOIN [request].[AccessRequestProduct] arp
                    ON arp.[AccessRequestId] = ar.[AccessRequestId]
                   AND arp.[AccessRequestProductId] = @AccessRequestProductId
                   AND arp.[IsDeleted] = 0
                LEFT JOIN [core].[Product] p ON p.[ProductId] = arp.[ProductId]
                WHERE ar.[AccessRequestId] = @AccessRequestId
                  AND ar.[IsDeleted] = 0;";

            /// <summary>
            /// Resolves CFROrgId/ProductId/org snapshot fields from the request's header + the
            /// specific product line (@AccessRequestProductId) that was just approved, for
            /// PersistOrgSetupResultAsync.
            /// </summary>
            public const string GetOrgSetupPersistContext = @"
                SELECT TOP (1)
                    CAST(ar.[OrgId] AS INT) AS [CFROrgId],
                    arp.[ProductId] AS [ProductId],
                    ar.[OrganizationName] AS [OrgName],
                    ar.[State] AS [OrgState],
                    ar.[ContactEmail] AS [ContactEmail],
                    ar.[ContactPhone] AS [ContactPhone],
                    ar.[RequesterFirstName] AS [FirstName],
                    ar.[RequesterLastName] AS [LastName]
                FROM [request].[AccessRequest] ar
                INNER JOIN [request].[AccessRequestProduct] arp
                    ON arp.[AccessRequestId] = ar.[AccessRequestId]
                   AND arp.[AccessRequestProductId] = @AccessRequestProductId
                   AND arp.[IsDeleted] = 0
                WHERE ar.[AccessRequestId] = @AccessRequestId
                  AND ar.[IsDeleted] = 0;";

            /// <summary>
            /// Inserts a new [core].[Organization] row from org fields staged on [request].[AccessRequest]
            /// at submission, returning the new OrgId.
            /// </summary>
            public const string InsertOrganization = @"
                INSERT INTO [core].[Organization]
                ([OrgName], [OrgState], [ContactEmail], [ContactPerson], [ContactPhone], [InsertedDate], [InsertedBy], [IsDeleted])
                VALUES
                (@OrgName, @OrgState, @ContactEmail, @ContactPerson, @ContactPhone, SYSUTCDATETIME(), @InsertedBy, 0);
                SELECT CAST(SCOPE_IDENTITY() AS INT);";

            /// <summary>
            /// Points [request].[AccessRequest].[OrgId] at the newly created [core].[Organization] row.
            /// </summary>
            public const string UpdateAccessRequestOrgId = @"
                UPDATE [request].[AccessRequest]
                SET [OrgId] = @OrgId
                WHERE [AccessRequestId] = @AccessRequestId;";

            /// <summary>
            /// Looks up an existing [lic].[OrganizationProduct] row for the org/product pair.
            /// </summary>
            public const string GetExistingOrganizationProduct = @"
                SELECT TOP (1) [OrganizationProductId], [IsDeleted]
                FROM [lic].[OrganizationProduct]
                WHERE [CFROrgId] = @CFROrgId AND [ProductId] = @ProductId;";

            /// <summary>
            /// Reactivates an existing [lic].[OrganizationProduct] row with the SMS-issued ProductOrgId.
            /// </summary>
            public const string UpdateOrganizationProduct = @"
                UPDATE [lic].[OrganizationProduct]
                SET [ProductOrgId] = @ProductOrgId,
                    [AssignStatus] = 1,
                    [CreatedDate] = SYSUTCDATETIME(),
                    [ActiveStartDate] = SYSUTCDATETIME(),
                    [ActiveEndDate] = '9999-12-31',
                    [IsDeleted] = 0
                WHERE [OrganizationProductId] = @OrganizationProductId;";

            /// <summary>
            /// Inserts a new [lic].[OrganizationProduct] row with the SMS-issued ProductOrgId.
            /// </summary>
            public const string InsertOrganizationProduct = @"
                INSERT INTO [lic].[OrganizationProduct]
                (
                    [CFROrgId], [ProductOrgId], [ProductId],
                    [OrgName], [OrgState], [ContactEmail], [ContactPerson], [ContactPhone],
                    [OrgStatus], [AssignStatus], [ActiveStartDate], [ActiveEndDate], [CreatedDate], [IsDeleted]
                )
                VALUES
                (
                    @CFROrgId, @ProductOrgId, @ProductId,
                    @OrgName, @OrgState, @ContactEmail, @ContactPerson, @ContactPhone,
                    1, 1, SYSUTCDATETIME(), '9999-12-31', SYSUTCDATETIME(), 0
                );";
        }
    }
}
