// Copyright (c) OptionC. All rights reserved.

using Newtonsoft.Json;

namespace CFR.Common
{

    public class UserContextData
    {
        public IEnumerable<UserDetails> UserDetails { get; set; } = new List<UserDetails>();
        public IEnumerable<OrgDetails> OrgDetails { get; set; } = new List<OrgDetails>();
        public IEnumerable<UserPermissions> UserPermissions { get; set; } = new List<UserPermissions>();
        /// <summary>Login SP Tables[2] — staff module rights (ModuleName / AccessRight).</summary>
        public List<StaffRightRow> StaffRights { get; set; } = [];
        public int SsoUserId { get; set; }
    }

    /// <summary>Legacy staff rights row from login Tables[2] / System_getStaffPermissions.</summary>
    public class StaffRightRow
    {
        public long FeatureID { get; set; }
        public int ParentId { get; set; }
        public string ModuleName { get; set; } = string.Empty;
        /// <summary>0 = R/W (or Access), 1 = Read Only, 2 = Deny.</summary>
        public int AccessRight { get; set; }
        public int IsMainMenu { get; set; }
        public string RoutingUrl { get; set; } = string.Empty;
    }

    /// <summary>OptionCMM layout-filtered navigation node.</summary>
    public class MattMoneyNavItem
    {
        public string Label { get; set; } = string.Empty;
        public string ModuleKey { get; set; } = string.Empty;
        public string Path { get; set; } = string.Empty;
        public List<MattMoneyNavItem> Children { get; set; } = [];
    }

    public class MattMoneyNavigationResult
    {
        /// <summary>Admin | MMAdmin | Parent | NUser</summary>
        public string LayoutKey { get; set; } = string.Empty;

        /// <summary>Legacy post-login redirect path.</summary>
        public string LandingPage { get; set; } = string.Empty;

        public List<MattMoneyNavItem> Items { get; set; } = [];

        /// <summary>Legacy Fee Management page sub-bar (Actions / View / MattMoney / …).</summary>
        public List<MattMoneyNavItem> FeeSubNav { get; set; } = [];
    }
    public class UserPermissions
    {
        public int? Reports { get; set; }
        public int? Profiles { get; set; }
        public int? Schedules { get; set; }
        public int? MedInfo { get; set; }
        public int? UserApproval { get; set; }
        public int? Calendars { get; set; }
        public int? Discipline { get; set; }
        public int? Permissions { get; set; }
        public int? LunchAdmin { get; set; }
        public int? Tuition { get; set; }
        public int? Homepage { get; set; }
        public int? StaffInfo { get; set; }
        public int? Communication { get; set; }
        public int? ReviewLessons { get; set; }
        public int? ReportCards { get; set; }
        public int? Alerts { get; set; }
        public int? StaffAttendance { get; set; }
        public int? ManageAttendance { get; set; }
        public int? AdHocCreator { get; set; }
        public int? Enterprise { get; set; }
        public int? Professional { get; set; }
        public int? Relatives { get; set; }
        public int? Alumni { get; set; }
        public int? StudentProfilePermission { get; set; }
        public int? StaffProfilePermission { get; set; }
        public int? RelatiesProfilePermission { get; set; }
        public int? AlumniProfilePermission { get; set; }
        public string? FamilySubmenuPermission { get; set; }
        public int? DisabledUsers { get; set; }
        public int? StudentInfoReport { get; set; }
        public int? MealReportAccess { get; set; }
        public int? FeeReportAccess { get; set; }
    }
    public class UserDetails
    {
        public bool? IsAchEnable { get; set; }
        public int? ParentPaymentType { get; set; }
        public bool? IsMMAchEnabled { get; set; }
        public int? UserID { get; set; }
        public int? SiteLoginID { get; set; }
        public string? UserName { get; set; }
        public string? Password { get; set; }
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? FullName { get; set; }
        public int? SchoolSettingId { get; set; }
        public string? SchoolName { get; set; }
        public int? OrganizationID { get; set; }
        public string? OrganizationName { get; set; }
        public int? RoleId { get; set; }
        public string? UserRole { get; set; }
        public int? Permission { get; set; }
        public int? IsParent { get; set; }
        public string? OrganizationState { get; set; }
        public string? OrganizationDiocese { get; set; }
        public int? StateId { get; set; }
        public int? DioceseId { get; set; }
        public bool? AllowTaskOnlineSubmissions { get; set; }
        public bool? IsDollarOneEnabled { get; set; }
        public string? FuzeAccountId { get; set; }
        public bool? IsChoiceSchool { get; set; }
        public int? AdminTimeout { get; set; }
        public int? StaffTimeout { get; set; }
        public int? MaxSickDaysAccumulated { get; set; }
        public bool? ChangeAttendanceSettings { get; set; }
        public bool? IsLockedOut { get; set; }
        public bool? IsFeeAccess { get; set; }
        public bool? ReceivePrivateMessages { get; set; }
        public bool? UpdateProfile { get; set; }
        public int? IsSignCompleted { get; set; }
        public int? IsAdminSignCompleted { get; set; }
        public decimal? LimitExceed { get; set; }
        public decimal? ACH_ProcessingFee { get; set; }
        public decimal? CCPerTransaction { get; set; }
        public decimal? CreditCardSetupFee { get; set; }
        [JsonProperty("eCheckSetupFee")]
        public decimal? ECheckSetupFee { get; set; }
        public bool? EnableeCheckSetupFee { get; set; }
        public bool? OrgCCsetupservice { get; set; }
        public bool? SignInAccess { get; set; }
        public bool? IsCategoryEnabled { get; set; }
        public bool? MMUtility { get; set; }
        public int? HallowStatus { get; set; }
        public bool? IsHallowEnabled { get; set; }
        public bool? IsEnableClassicAccess { get; set; }
        public int? IsSubscribed { get; set; }
        public bool? IsVolunteer { get; set; }
        public bool? IsVolunteerAdmin { get; set; }
        public bool? UseSimpleLunch { get; set; }
        public string? IsSurveyEnabled { get; set; }
        public string? ISMMNewChanges { get; set; }
        public bool? IsSurveyCompleted { get; set; }
        public bool? IsViperUser { get; set; } = false;
        public int? SchoolType { get; set; }
        public int? IsMMplatform { get; set; }
    }
    public class OrgDetails
    {
        public string? OrganizationName { get; set; }
        public string? OrgState { get; set; }
        public int? UsesLunchMenu { get; set; }
        public bool? TrackTardyMinutes { get; set; }
        public int? CurrentTermID { get; set; }
        public string? CurrentTermName { get; set; }
        public DateTime? CurrentTermStartDate { get; set; }
        public DateTime? CurrentTermEndDate { get; set; }
        public int? DioceseID { get; set; }
        public string? TZOffset { get; set; }
        public bool? ObserveDST { get; set; }
        public bool? AllowNewRegistration { get; set; }
        public bool? AllowProfileUpdate { get; set; }
        public bool? IsDemoSchool { get; set; }
        public bool? ShowFamilyPrivateMessages { get; set; }
        public bool? EnableStudentAssignmentSubmissions { get; set; }
        public int? IsLms { get; set; }
        public string? MMInstruction { get; set; }
        public bool? IsEnableClassicAccess { get; set; }
        public bool? IsActivateSponsor { get; set; }
        public bool? IsDioceseSchool { get; set; }
        public bool? IsEnabledSaintShoppe { get; set; }
        public bool? IsEnabled { get; set; }
        public bool? IsGetStarted { get; set; }
        public bool? ServiceFeePlan { get; set; }
        public decimal? Fee { get; set; }
        public bool? IsAlreadyPaid { get; set; }
        public bool? VVWizardStepCompleted { get; set; }
        public string? IsVVAdminAccess { get; set; }
        public string? IsVVStaffAccess { get; set; }
        public string? IsVVSubscriptionactive { get; set; }
    }
}
