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

        /// <summary>
        /// Stored procedure names for platform (App Hub) launch code create/exchange.
        /// </summary>
        public class PlatformLaunch
        {
            /// <summary>Platform launch-code create and exchange.</summary>
            public const string PlatformLaunchCrud = "[dbo].[Portal_PlatformLaunch]";
        }

        public class Administration
        {
            public const string EmailTemplatesCrud = "[dbo].[Acutis_EmailTemplates]";
        }

        public class Requests
        {
            public const string AccessRequestCrud = "[request].[AccessRequestManage]";
        }
    }
}
