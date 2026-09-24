// Copyright (c) OptionC. All rights reserved.

namespace CFR.Common
{
    public static class Constant
    {
        public static class InputType
        {
            public const string ApplicationJson = "application/json";
            public const string Text = "Text";
        }

        public static class ApiRouteConstants
        {
            //public const string APIController = "api/[controller]/[action]";
            public const string APIController1 = "api/v{version:apiVersion}/[controller]/[action]";

            public const string APIController = "api/v1/[controller]/[action]";
            public const string AllowOrigin = "AllowOrigin";
            public const string VersionV1 = "1";
            public const string VersionV2 = "2";
        }

        public static class DBConectionName
        {
            /// <summary>Primary app connection (Dapper / EF). SSO host: <c>optionccom_sso</c>.</summary>
            public const string ConnString = "ConnString";

            /// <summary>SSO database (<c>optionccom_sso</c>) — canonical SPs for user detail, LaunchPad, login transfer.</summary>
            public const string OptionCConnString = "OptionCConnString";

            /// <summary>Main OptionC database (<c>optionccom</c>) — cross-db references from SSO SPs; optional direct use.</summary>
            public const string OptionCComConnString = "OptionCComConnString";

            public const string AuditLogDB = "AuditLogDB";
        }

        public static class JWTTypes
        {
            public const string CanSeeAll = "CanSeeAll";
            public const string DepartmentId = "DepartmentId";
            public const string LocationId = "LocationId";
        }

        public static class SwaggerModuleDoc
        {
            public const string OptionCBGateway = "CFR.Gateway";
            /// <summary>
            /// Acutis Portal
            /// </summary>

            public const string CFRAcutisDocs = "CFRAcutis.Authentication,CFRAcutis.Administration,CFRAcutis.Organization,CFRAcutis.Product,CFRAcutis.Dashboard";
            public const string CFRAcutis = "CFRAcutis";
            public const string CFRAcutisAuthentication = "CFRAcutis.Authentication";
            public const string CFRAcutisAdministration = "CFRAcutis.Administration";
            public const string CFRAcutisOrganization = "CFRAcutis.Organization";
            public const string CFRAcutisProduct = "CFRAcutis.Product";
            public const string CFRAcutisDashboard = "CFRAcutis.Dashboard";

            /// <summary>
            /// Portal
            /// </summary>
            public const string CFRPortal = "CFRPortal";
            public const string PortalAuthentication = "Portal.Authentication";
            public const string PortalCFRLaunch = "Portal.CFRLaunch";
            public const string PortalPlatformLaunch = "Portal.PlatformLaunch";
            public const string PortalAdministration = "Portal.Administration";
            public const string PortalDocs = "Portal.Authentication,Portal.CFRLaunch,Portal.PlatformLaunch,Portal.Administration";

            /// <summary>
            /// CFR.DataSync — central User/Organization sync API for downstream products.
            /// </summary>
            public const string CFRSync = "CFRSync";
            public const string SyncUserSync = "Sync.UserSync";
            public const string SyncDocs = "Sync.UserSync";
        }

        public static class SwaggerDocs
        {
            public const string TestDescription = @"The {0} API enable applications to read and write  data stored in an {0} through a secure REST interface. <hr> Note: Consumers of {0} API information should sanitize all data for display and storage. The {0} provides reasonable safeguards against cross-site scripting attacks and other malicious content, but the platform does not and cannot guarantee that the data it contains is free of all potentially harmful content. <hr>";
            public const string Description = @"The {0} API enables applications to securely read and write data through a RESTful interface. <hr> Note: Consumers of the {0} API should ensure that all data is properly sanitized before display and storage. While the {0} API includes safeguards against cross-site scripting (XSS) and other malicious content, it cannot guarantee that all data is free from potentially harmful content. Therefore, it is crucial to implement additional security measures in your application. <hr>";
            public const string Contact_Us = "us";
            public const string Version = "v1";
            public const string Contact_Email = "dev@boscosofttech.com";
            public const string SwaggerDefault = "string";
        }

        public static class JWTDocs
        {
            public const string Description = "JWT Authorization header using the Bearer scheme";
            public const string Bearer = "Bearer";
            public const string Authorization = "Authorization";
            public const string JWT = "JWT";
            public const string Scheme = "Bearer";
        }

        public static class Common
        {
            public const string asc = nameof(asc);
            public const short Five = 5;
            public const short Four = 4;
            public const short Two = 2;
            public const short One = 1;
            public const short Six = 6;
            public const short Three = 3;
            public const short Eight = 8;
            public const short Seven = 7;
            public const short Nine = 9;
            public const short Zero = 0;
            public const short Ten = 10;
            public const short Eleven = 11;
            public const short Twelve = 12;
            public const short Twenty = 20;
            public const string ReportSettings = nameof(ReportSettings);
            public const string StringOne = "01";
            public const string StringTwo = "02";
            public const string StringThree = "03";
        }

        public static class SessionField
        {
            public const string OrgId = "OrgId";
            public const string UserId = "UserId";
            public const string SiteLoginID = "SiteLoginID";
            public const string UserName = "UserName";
            public const string RoleId = "RoleId";
            public const string StateId = "StateId";
            public const string FirstName = "FirstName";
            public const string LastName = "LastName";
            public const string IsVolunteer = "IsVolunteer";
            public const string IsSignCompleted = "IsSignCompleted";
            public const string IsAdminSignCompleted = "IsAdminSignCompleted";
            public const string IsParent = "IsParent";
            public const string IsDollarOneEnabled = "IsDollarOneEnabled";
            public const string FuzeAccountId = "FuzeAccountId";
            public const string AchProcessingFee = "AchProcessingFee";
            public const string LimitExceed = "LimitExceed";
            public const string CC_PerTransaction = "CC_PerTransaction";
            public const string CreditCardSetupFee = "CreditCardSetupFee";
            public const string eCheckSetupFee = "eCheckSetupFee";
            public const string OrgCCsetupservice = "OrgCCsetupservice";
            public const string IsAchEnable = "IsAchEnable";
            public const string IsMMAchEnabled = "IsMMAchEnabled";
            public const string IsCategoryEnabled = "IsCategoryEnabled";
            public const string IsEnableClassicAccess = "IsEnableClassicAccess";
            public const string ISMMNewChanges = "ISMMNewChanges";
            public const string IsViperUser = "IsViperUser";
            public const string IsSurveyCompleted = "IsSurveyCompleted";
            public const string IsChoiceSchool = "IsChoiceSchool";
            public const string CurrentTermID = "CurrentTermID";
            public const string AssignmentCurrentTermID = "AssignmentCurrentTermID";
            public const string DioceseID = "DioceseID";
            public const string IsDemoSchool = "IsDemoSchool";
            public const string ShowFamilyPrivateMessages = "ShowFamilyPrivateMessages";
            public const string EnableStudentAssignmentSubmissions = "EnableStudentAssignmentSubmissions";
            public const string IsVVEnabled = "IsVVEnabled";
            public const string IsVVAccess = "IsVVAccess";
            public const string IsVVSubscriptionactive = "IsVVSubscriptionactive";
            public const string SchoolType = "SchoolType";
            public const string IsMMplatform = "IsMMplatform";
            public const string StaffRights = "StaffRights";
        }
    }
}