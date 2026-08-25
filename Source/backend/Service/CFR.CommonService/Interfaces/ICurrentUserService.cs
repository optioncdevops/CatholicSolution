// Copyright (c) OptionC. All rights reserved.

namespace CFR.CommonService.Interfaces
{
    /// <summary>
    /// Defines the interface for the current user service.
    /// </summary>
    public interface ICurrentUserService
    {
        long UserId { get; set; }
        long SiteLoginId { get; set; }
        string UserName { get; set; }
        int RoleId { get; set; }
        string ClientIPAddress { get; set; }
        Guid CorrelationId { get; set; }
        string DeviceType { get; set; }
        string BrowserName { get; set; }
        bool CanSeeAll { get; set; }
        int OrgId { get; set; }
        int StateId { get; set; }
        string FirstName { get; set; }
        string LastName { get; set; }
        bool IsVolunteer { get; set; }
        int IsSignCompleted { get; set; }
        int IsAdminSignCompleted { get; set; }
        int IsParent { get; set; }
        bool IsDollarOneEnabled { get; set; }
        string FuzeAccountId { get; set; }
        decimal AchProcessingFee { get; set; }
        decimal LimitExceed { get; set; }
        decimal CC_PerTransaction { get; set; }
        decimal CreditCardSetupFee { get; set; }
        decimal ECheckSetupFee { get; set; }
        bool OrgCCsetupservice { get; set; }
        bool IsAchEnable { get; set; }
        bool IsMMAchEnabled { get; set; }
        bool IsCategoryEnabled { get; set; }
        bool IsEnableClassicAccess { get; set; }
        string ISMMNewChanges { get; set; }
        bool IsViperUser { get; set; }
        bool IsSurveyCompleted { get; set; }
        bool IsChoiceSchool { get; set; }
        int CurrentTermID { get; set; }
        int AssignmentCurrentTermID { get; set; }
        int DioceseID { get; set; }
        bool IsDemoSchool { get; set; }
        bool ShowFamilyPrivateMessages { get; set; }
        bool EnableStudentAssignmentSubmissions { get; set; }
        bool IsVVEnabled { get; set; }
        string IsVVAccess { get; set; }
        string IsVVSubscriptionactive { get; set; }
        int SchoolType { get; set; }
        int IsMMplatform { get; set; }
        /// <summary>JSON array of <see cref="CFR.Common.StaffRightRow"/> from login Tables[2].</summary>
        string StaffRightsJson { get; set; }
        CreateBaseDTO CreateBaseDTO { get; set; }
        ModifyBaseDTO ModifyBaseDTO { get; set; }
        DeleteBaseDTO DeleteBaseDTO { get; set; }
    }

    public class CreateBaseDTO
    {
        public long CreatedById { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public bool IsActive { get; set; }
    }

    public class ModifyBaseDTO
    {
        public long ModifiedById { get; set; }
        public DateTime ModifiedAt { get; set; } = DateTime.UtcNow;
    }

    public class DeleteBaseDTO
    {
        public long ModifiedById { get; set; }
        public DateTime ModifiedAt { get; set; } = DateTime.UtcNow;
        public bool IsDeleted { get; set; } = true;
    }

}
