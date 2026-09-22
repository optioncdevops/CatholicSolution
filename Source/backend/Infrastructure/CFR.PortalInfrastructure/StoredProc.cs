// Copyright (c) OptionC. All rights reserved.

namespace CFR.PortalInfrastructure
{
    /// <summary>
    /// Stored procedure name constants for the Portal microservice.
    /// </summary>
    public class StoredProc
    {
        /// <summary>
        /// Stored procedure names for Portal authentication.
        /// </summary>
        public class PortalAuth
        {
            /// <summary>
            /// Authenticates a CFR member against [auth].[User].
            /// </summary>
            public const string DoLogin = "[dbo].[Portal_DoLogin]";
        }

        /// <summary>
        /// Stored procedure names for product CFR launch.
        /// </summary>
        public class CFRLaunch
        {
            /// <summary>
            /// Assigned products, launch-code create, and code exchange.
            /// </summary>
            public const string CFRLaunchCrud = "[dbo].[Portal_CFRLaunch]";
        }

        public class Administration
        {
            public const string EmailTemplatesCrud = "[dbo].[Acutis_EmailTemplates]";
        }

        public class Requests
        {
            public const string AccessRequestCrud = "[request].[AccessRequestManage]";

            /// <summary>
            /// Public "Suggest a product" save + notification-recipient lookup, physically defined
            /// in CFR.AcutisInfrastructure's Scripts folder (022_Acutis_ProductRequest_StoredProcedure.sql,
            /// tables in 021_Acutis_ProductRequest_Tables.sql) - same cross-service reuse convention
            /// AccessRequestCrud already uses.
            /// ActionId 1=save (public submit), 6=notification recipients.
            /// </summary>
            public const string ProductRequestCrud = "[dbo].[Acutis_ProductRequest]";
        }
    }
}
