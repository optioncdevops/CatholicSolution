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
            public const string CFRLaunchCrud = "[dbo].[Portal_CFRLaunch_CRUD]";
        }

        public class Administration
        {
            public const string EmailTemplatesCrud = "[dbo].[Acutis_EmailTemplates_CRUD]";
        }

        public class Requests
        {
            public const string AccessRequestCrud = "[request].[AccessRequest_CRUD]";
        }
    }
}
