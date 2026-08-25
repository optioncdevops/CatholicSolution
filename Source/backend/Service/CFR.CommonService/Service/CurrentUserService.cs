// Copyright (c) OptionC. All rights reserved.

using CFR.CommonService.Interfaces;

namespace CFR.CommonService.Service
{
    /// <summary>
    /// Provides a service for accessing the current user's information.
    /// </summary>
    public class CurrentUserService: ICurrentUserService
    {
        public long UserId { get; set; }
        public long SiteLoginId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public Guid CorrelationId { get; set; }
        public int RoleId { get; set; }
        public bool CanSeeAll { get; set; }
        public string ClientIPAddress { get; set; } = "Unknown";
        public string DeviceType { get; set; } = "Unknown";
        public string BrowserName { get; set; } = "Unknown";
        public int OrgId { get; set; }
        public int StateId { get; set; }
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public bool IsVolunteer { get; set; }
        public int IsSignCompleted { get; set; }
        public int IsAdminSignCompleted { get; set; }
        public int IsParent { get; set; }
        public bool IsDollarOneEnabled { get; set; }
        public string FuzeAccountId { get; set; } = string.Empty;
        public decimal AchProcessingFee { get; set; }
        public decimal LimitExceed { get; set; }
        public decimal CC_PerTransaction { get; set; }
        public decimal CreditCardSetupFee { get; set; }
        public decimal ECheckSetupFee { get; set; }
        public bool OrgCCsetupservice { get; set; }
        public bool IsAchEnable { get; set; }
        public bool IsMMAchEnabled { get; set; }
        public bool IsCategoryEnabled { get; set; }
        public bool IsEnableClassicAccess { get; set; }
        public string ISMMNewChanges { get; set; } = string.Empty;
        public bool IsViperUser { get; set; }
        public bool IsSurveyCompleted { get; set; }
        public bool IsChoiceSchool { get; set; }
        public int CurrentTermID { get; set; }
        public int AssignmentCurrentTermID { get; set; }
        public int DioceseID { get; set; }
        public bool IsDemoSchool { get; set; }
        public bool ShowFamilyPrivateMessages { get; set; }
        public bool EnableStudentAssignmentSubmissions { get; set; }
        public bool IsVVEnabled { get; set; }
        public string IsVVAccess { get; set; } = "False";
        public string IsVVSubscriptionactive { get; set; } = "False";
        public int SchoolType { get; set; }
        public int IsMMplatform { get; set; }
        public string StaffRightsJson { get; set; } = "[]";
        public CreateBaseDTO CreateBaseDTO { get; set; } = new();
        public ModifyBaseDTO ModifyBaseDTO { get; set; } = new();
        public DeleteBaseDTO DeleteBaseDTO { get; set; } = new();
    }
}
