// Copyright (c) OptionC. All rights reserved.

using System.Text.Json.Serialization;

namespace CFR.AcutisInfrastructure.Models.Output
{
    /// <summary>
    /// Login response wrapper mapped from stored procedure StoredProc.AcutisAuth.DoLogin.
    /// Holds the authenticated user, module rights, and hierarchical menu.
    /// </summary>
    public class AcutisLoginQueryResult
    {
        /// <summary>
        /// Gets or sets the authenticated user profile.
        /// </summary>
        [JsonPropertyName("user")]
        public AcutisLoginUserResult? User { get; set; }

        /// <summary>
        /// Gets or sets the module rights granted to the user.
        /// </summary>
        [JsonPropertyName("moduleRights")]
        public List<AcutisLoginModuleRightRow> ModuleRights { get; set; } = [];

        /// <summary>
        /// Gets or sets the hierarchical navigation menu.
        /// </summary>
        [JsonPropertyName("menuItems")]
        public List<MenuItems> MenuItems { get; set; } = [];
    }

    /// <summary>
    /// Output DTO mapped from stored procedure StoredProc.AcutisAuth.DoLogin result set 1.
    /// Holds one authenticated Acutis user row returned to the service and controller.
    /// </summary>
    public class AcutisLoginUserResult
    {
        /// <summary>
        /// Gets or sets the user identifier.
        /// </summary>
        [JsonPropertyName("userId")]
        public int UserId { get; set; }

        /// <summary>
        /// Gets or sets the access level.
        /// </summary>
        [JsonPropertyName("accessLevel")]
        public int AccessLevel { get; set; }

        /// <summary>
        /// Gets or sets the role identifier.
        /// </summary>
        [JsonPropertyName("roleId")]
        public int RoleId { get; set; }

        /// <summary>
        /// Gets or sets the email address.
        /// </summary>
        [JsonPropertyName("eMail")]
        public string? EMail { get; set; }

        /// <summary>
        /// Gets or sets the first name.
        /// </summary>
        [JsonPropertyName("firstName")]
        public string? FirstName { get; set; }

        /// <summary>
        /// Gets or sets the last name.
        /// </summary>
        [JsonPropertyName("lastName")]
        public string? LastName { get; set; }

        /// <summary>
        /// Gets or sets the full name.
        /// </summary>
        [JsonPropertyName("fullName")]
        public string? FullName { get; set; }

        /// <summary>
        /// Gets or sets the organization identifier.
        /// </summary>
        [JsonPropertyName("organizationId")]
        public int OrganizationId { get; set; }

        /// <summary>
        /// Gets or sets the user status.
        /// </summary>
        [JsonPropertyName("status")]
        public string? Status { get; set; }

        /// <summary>
        /// Gets or sets the role landing URL.
        /// </summary>
        [JsonPropertyName("landingURL")]
        public string? LandingURL { get; set; }

        /// <summary>
        /// Gets or sets the last active timestamp.
        /// </summary>
        [JsonPropertyName("lastActiveAt")]
        public DateTime? LastActiveAt { get; set; }

        /// <summary>
        /// Gets or sets the JWT issued after a successful login.
        /// </summary>
        [JsonPropertyName("token")]
        public string Token { get; set; } = string.Empty;
    }

    /// <summary>
    /// Output DTO mapped from stored procedure StoredProc.AcutisAuth.DoLogin result set 2.
    /// Holds one module-right row used to build the navigation menu.
    /// </summary>
    public class AcutisLoginModuleRightRow
    {
        /// <summary>
        /// Gets or sets the display name.
        /// </summary>
        [JsonPropertyName("displayName")]
        public string DisplayName { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the module session key.
        /// </summary>
        [JsonPropertyName("moduleName")]
        public string ModuleName { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the user right flag (0 = none, 1 = allow).
        /// </summary>
        [JsonPropertyName("userRight")]
        public int UserRight { get; set; }

        /// <summary>
        /// Gets or sets the role identifier.
        /// </summary>
        [JsonPropertyName("roleId")]
        public int RoleId { get; set; }

        /// <summary>
        /// Gets or sets the feature identifier.
        /// </summary>
        [JsonPropertyName("featureID")]
        public int FeatureID { get; set; }

        /// <summary>
        /// Gets or sets the menu level (1 = top, 2 = child).
        /// </summary>
        [JsonPropertyName("levelId")]
        public int LevelId { get; set; }

        /// <summary>
        /// Gets or sets the parent feature identifier.
        /// </summary>
        [JsonPropertyName("parentId")]
        public int ParentId { get; set; }

        /// <summary>
        /// Gets or sets whether the item is hidden from the visible menu.
        /// </summary>
        [JsonPropertyName("isHideMenu")]
        public int IsHideMenu { get; set; }

        /// <summary>
        /// Gets or sets the display order.
        /// </summary>
        [JsonPropertyName("displayOrder")]
        public int DisplayOrder { get; set; }

        /// <summary>
        /// Gets or sets the lucide icon name.
        /// </summary>
        [JsonPropertyName("icon")]
        public string Icon { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the frontend route.
        /// </summary>
        [JsonPropertyName("routingUrl")]
        public string RoutingUrl { get; set; } = string.Empty;
    }

    /// <summary>
    /// Hierarchical top-level navigation item built from module rights.
    /// </summary>
    public class MenuItems
    {
        /// <summary>
        /// Gets or sets the menu title.
        /// </summary>
        [JsonPropertyName("title")]
        public string Title { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the lucide icon name.
        /// </summary>
        [JsonPropertyName("icon")]
        public string Icon { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the session key (module name).
        /// </summary>
        [JsonPropertyName("sessionKey")]
        public string SessionKey { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the frontend path.
        /// </summary>
        [JsonPropertyName("path")]
        public string Path { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets visible child links.
        /// </summary>
        [JsonPropertyName("links")]
        public SubMenuItems[] Links { get; set; } = [];

        /// <summary>
        /// Gets or sets button links including hidden children.
        /// </summary>
        [JsonPropertyName("btnlinks")]
        public SubMenuItems[] Btnlinks { get; set; } = [];

        /// <summary>
        /// Gets or sets activity children.
        /// </summary>
        [JsonPropertyName("activity")]
        public SubMenuItems[] Activity { get; set; } = [];
    }

    /// <summary>
    /// Child navigation item under a top-level menu.
    /// </summary>
    public class SubMenuItems
    {
        /// <summary>
        /// Gets or sets the link label.
        /// </summary>
        [JsonPropertyName("label")]
        public string Label { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the lucide icon name.
        /// </summary>
        [JsonPropertyName("icon")]
        public string Icon { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the session key.
        /// </summary>
        [JsonPropertyName("sessionKey")]
        public string SessionKey { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the frontend path.
        /// </summary>
        [JsonPropertyName("path")]
        public string Path { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets tab links.
        /// </summary>
        [JsonPropertyName("tablinks")]
        public SubMenuTabItems[] Tablinks { get; set; } = [];

        /// <summary>
        /// Gets or sets activity children.
        /// </summary>
        [JsonPropertyName("activity")]
        public SubMenuTabItems[] Activity { get; set; } = [];
    }

    /// <summary>
    /// Tab-level navigation item.
    /// </summary>
    public class SubMenuTabItems
    {
        /// <summary>
        /// Gets or sets the tab label.
        /// </summary>
        [JsonPropertyName("label")]
        public string Label { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the lucide icon name.
        /// </summary>
        [JsonPropertyName("icon")]
        public string Icon { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the session key.
        /// </summary>
        [JsonPropertyName("sessionKey")]
        public string SessionKey { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the frontend path.
        /// </summary>
        [JsonPropertyName("path")]
        public string Path { get; set; } = string.Empty;
    }
}
