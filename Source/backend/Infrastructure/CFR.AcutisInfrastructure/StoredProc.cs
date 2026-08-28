// Copyright (c) OptionC. All rights reserved.

namespace CFR.AcutisInfrastructure
{
    /// <summary>
    /// Stored procedure name constants for the Acutis microservice.
    /// </summary>
    public class StoredProc
    {
        /// <summary>
        /// Stored procedure names for Acutis authentication.
        /// </summary>
        public class AcutisAuth
        {
            /// <summary>
            /// Authenticates an Acutis user and returns the user row plus module rights.
            /// </summary>
            public const string DoLogin = "[dbo].[Acutis_DoLogin]";
        }

        /// <summary>
        /// Stored procedure names for Administration features.
        /// </summary>
        public class Administration
        {
            /// <summary>
            /// Users list, get, save, status, and lookup operations.
            /// </summary>
            public const string UsersCrud = "[dbo].[Acutis_Users_CRUD]";

            /// <summary>
            /// User roles list, get, save, status, and delete operations.
            /// </summary>
            public const string UserRolesCrud = "[dbo].[Acutis_UserRoles_CRUD]";
        }
    }
}
