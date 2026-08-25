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

        public static class AuditTableName
        {
            public const string Acutis = "acutis";
            public const string SSO = "sso";
            public const string SMS = "sms";
            public const string Reports = "reports";
            public const string Admission = "admission";
            public const string Family = "family";
            public const string Billing = "billing";
            public const string EForm = "eform";
            public const string Auth = "auth";
            public const string Component = "component";
            public const string Diocese = "diocese";
            public const string Fee = "fee";
            public const string MyMessage = "mymessage";
        }

        public static class ImportSheetName
        {
            public const string TrainingSessions = "TrainingSessions";
            public const string DynamicFields = "Dynamic Fields";
            public const string StaticFields = "Static Fields";
            public const string Families = "Families";
            public const string Students = "Students";
            public const string Staff = "Staff";
            public const string Parents = "Parents";
            public const string Alumni = "Alumni";
            public const string ExistingFamilies = "ExistingFamilies";
            public const string PhiladelphiaStaff = "Staff";
            public const string PhiladelphiaStudent = "Student";
            public const string PhiladelphiaParent = "Parent";
        }

        public static class Formater
        {
            public const string PhoneFormat = "[^0-9a-zA-Z]+";
        }

        public static class ImportTargetTable
        {
            public const string FamilyGroup = "DataImport.FamilyGroup";
            public const string Student = "DataImport.Student";
            public const string Staff = "DataImport.Staff";
            public const string Parent = "DataImport.Parent";
            public const string Alumni = "DataImport.Alumni";
            public const string ExistingFamily = "DataImport.ExistingFamily";
            public const string PhiladelphiaStaff = "DataImport.PhiladelphiaStaff";
            public const string PhiladelphiaStudent = "DataImport.PhiladelphiaStudent";
            public const string PhiladelphiaParent = "DataImport.PhiladelphiaParent";
        }

        public static class ExcelConnectionStrings
        {
            public const string Excel12XmlHdrNo = "Provider=Microsoft.ACE.OLEDB.12.0;Data Source={0};Extended Properties=\"Excel 12.0 Xml;HDR=NO\"";
            public const string Excel8Imex1 = "Provider=Microsoft.ACE.OLEDB.12.0;Data Source={0};Extended Properties=\"Excel 8.0;IMEX=1\"";
        }

        public static class FilePaths
        {
            public const string Documentation = "Documentation";
            public const string ImportTemplate = "ImportTemplate";
            public const string Temp = "Temp";
            public const string ImportPath = "Attachment/DataImport/AcutisTemplate";
            public const string FamilyUploadTemplatePath = "Attachment/Walkthroughs/FamilyUploadTemplate";
            public const string TemplatePrefix = "Template_{0}.xlsx";
            public const string PhiladelphiaStaff = "Philadelphia_Staff_{0}_{1}.xlsx";
            public const string PhiladelphiaStudent = "Philadelphia_Student_{0}_{1}.xlsx";
            public const string PhiladelphiaParent = "Philadelphia_Parent_{0}_{1}.xlsx";
            public const string DynamicFormAttachment = "Attachment/DynamicForm";
        }

        public static class ExcelSettings
        {
            public const string ProtectionPassword = "PMbyOptionC#2026";
            public const string DateTimeFormat = "yyyyMMdd_HHmmss";
        }

        public static class PhiladelphiaSettings
        {
            public static readonly string[] CompositeSuffixes = [
                "Reading Composite",
                "Language Composite",
                "Math Composite",
                "Social Studies Composite",
                "Science Composite",
                "Total Battery",
                "CSI"
            ];

            public static readonly string[] Grades = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th"];
        }

        public static class ResultDataKeys
        {
            public const string Records = "records";
            public const string PreviewRecords = "PreviewRecords";
            public const string Dropdowns = "Dropdowns";
        }

        public static class ErrorMessage
        {
            public const string NoFileProvided = "No file provided.";
            public const string NoImportDataProvided = "No import data provided.";
        }

        public static class Payment
        {
            public const string InsightTag = "T0250201-0010000-00000000";
            public const string TrueString = "True";
            public const string NoTokenSf = "notokensf";
            public const string Void = "Void";
            public const string Refund = "Refund";
            public const string CurrencyFormat = "n2";
            public const string DateFormat = "MM/dd/yyyy";

            public static class Columns
            {
                public const string Name = "Name";
                public const string Amount = "Amount";
                public const string RefundLimit = "RefundLimit";
                public const string AccountHolderName = "AccountHolderName";
                public const string PaymentMethod = "PaymentMethod";
                public const string FuzeAccountId = "FuzeAccountId";
                public const string TokenSfWithUnderscore = "Token_SF";
                public const string TokenSf = "TokenSF";
                public const string TransactionDate = "TransactionDate";
                public const string UserName = "UserName";
                public const string Category = "Category";
                public const string TransRefIdWithCaps = "TransRefID";
                public const string TransRefId = "TransRefId";
                public const string Token = "Token";
                public const string FuzeIdWithCaps = "FuzeID";
                public const string FuzeId = "FuzeId";
                public const string UserId = "UserId";
                public const string UserIdWithCaps = "UserID";
                public const string CategoryId = "CategoryId";
                public const string CategoryIdWithCaps = "CategoryID";
                public const string TransactionId = "TransactionId";
                public const string TransactionIdWithCaps = "TransactionID";
                public const string TransactionStatus = "TransactionStatus";
                public const string SchoolYearId = "SchoolYearId";
                public const string SchoolYearIdWithCaps = "SchoolYearID";
                public const string ReferenceId = "ReferenceId";
                public const string ReferenceIdWithCaps = "ReferenceID";
                public const string PaymentAmount = "PaymentAmount";
                public const string Note = "Note";
                public const string Id = "Id";
                public const string IdWithCaps = "ID";
            }
        }

        public static class AdmissionMessage
        {
            public const string SessionExpired = "Session expired.";
            public const string InvalidAccount = "Your current account is not valid. Please create a new one with valid information submitted and try again.";
            public const string ApplicationFeePaid = "The Application Fee for this student is already paid for this year.";
            public const string AccountExists = "Account already exists.";
            public const string SaveFailed = "Save failed.";
            public const string UnableToSaveSchoolAccount = "Unable to save school payment account.";
            public const string TimeoutError = "Unable to process your payment request due to transaction timeout. Please try again.";
            public const string LedgerInitFailed = "Failed to initialize payment ledger.";
            public const string LedgerUpdateFailed = "Payment processed but ledger update failed.";
            public const string ApplicationFeeAlreadyPaid = "The Application Fee for {0} is already paid for this year.";
            public const string ApplicationFeeProcessing = "The Application Fee for {0} is already in processing status.";
            public const string MattMoneySetupFailed = "MattMoney account setup of the school has failed. Please contact your school administrator.";
            public const string TechnicalFailure = "Account creation failed due to technical failure. Please re-enter the account information.";
            public const string ValidationFailed = "Credit Card validation failed. Please check your information and try again.";
            public const string UnableToSaveProcessingFee = "Unable to save processing fee payment details.";

            public const string CardHolderRequired = "Card holder name is required.";
            public const string AmexDigitLength = "Amex card number must be 15 digits.";
            public const string CardDigitLength = "Card number must be 16 digits.";
            public const string CardNumberMismatch = "Card numbers do not match.";
            public const string InvalidExpirationDate = "Invalid expiration date.";
        }

        public static class CommonValues
        {
            public const string CopySuffix = "_Copy";
        }

        public static class SwaggerModuleDoc
        {
            public const string OptionCBGateway = "CFR.Gateway";
            /// <summary>
            /// Acutis Potal
            /// </summary>

            public const string OptionCAcutisDocs = "Acutis.Administration,Acutis.Organization,Acutis.Reports,Acutis.MattMoney";
            public const string AcutisAdministration = "Acutis.Administration";
            public const string AcutisOrganization = "Acutis.Organization";
            public const string AcutisMattMoney = "Acutis.MattMoney";
            public const string AdminMattMoney = "Admin.MattMoney";
            public const string FeeMattMoney = "Fee.MattMoney";
            public const string PaymentGateway = "Payment.Gateway";
            public const string AcutisReports = "Acutis.Reports";

            public const string OptionCAdmissionDocs = "Admission.Registration,Admission.Admission";
            public const string AdmissionRegistration = "Admission.Registration";
            public const string AdmissionAdmission = "Admission.Admission";

            /// <summary>
            /// Family Potal
            /// </summary>
            public const string OptionCFamily = "OptionC.Member";

            public const string OptionCFamilyDocs = "CFR.Member";
            public const string FamilyOffice = "CFR.Member";

            /// <summary>
            /// MyMessage Portal
            /// </summary>
            public const string OptionCMyMessage = "OptionC.MyMessage";

            public const string OptionCMyMessageDocs = "Reference.PrivateMessage,Reference.FileLibrary,Reference.Announcements,Reference.Conferences,Reference.Conduct,Reference.CatholicContent,Reference.SecureMessage,Reference.Support";
            public const string MyMessagePrivateMessage = "Reference.PrivateMessage";
            public const string FileLibrary = "Reference.FileLibrary";
            public const string ReferenceAnnouncements = "Reference.Announcements";
            public const string ReferenceConferences = "Reference.Conferences";
            public const string ReferenceCatholicContent = "Reference.CatholicContent";
            public const string Conduct = "Reference.Conduct";
            public const string ReferenceSecureMessage = "Reference.SecureMessage";
            public const string ReferenceSupport = "Reference.Support";

            /// <summary>
            /// OptionC Admission Potal
            /// </summary>
            public const string OptionCAdmission = "OptionC.Admission";

            public const string AdmissionStudent = "Admission.Student";

            /// <summary>
            /// OptionC  SMS Potal
            /// </summary>
            public const string OptionCSMS = "OptionC.SMS";

            public const string OptionCSMSDocs = "SMS.MyClass,SMS.Calendar,SMS.Users,SMS.Admission,SMS.Dashboard,SMS.SchoolMeal,SMS.GPAManager,SMS.Directories,SMS.AccountBalance,SMS.Portal";
            public const string SMSPortal = "SMS.Portal";
            public const string SMSMyClass = "SMS.MyClass";
            public const string SMSReportCard = "SMS.ReportCard";
            public const string SMSCalendar = "SMS.Calendar";
            public const string SMSUsers = "SMS.Users";
            public const string SMSAdmissions = "SMS.Admission";
            public const string SMSDashboard = "SMS.Dashboard";
            public const string SMSAccountBalance = "SMS.AccountBalance";
            public const string SMSSchoolMeal = "SMS.SchoolMeal";
            public const string SMSDirectories = "SMS.Directories";
            public const string SMSGPAManager = "SMS.GPAManager";

            /// <summary>
            /// OptionC  Reports Portal
            /// </summary>
            public const string OptionCReports = "OptionC.Reports";

            public const string OptionCReportsDocs = "Reports.Manager,Reports.ActiveReports,Reports.ReportCard";
            public const string ReportsManager = "Reports.Manager";
            public const string ActiveReports = "Reports.ActiveReports";
            public const string ReportsReportCard = "Reports.ReportCard";

            /// <summary>
            /// OptionC  SSO Potal
            /// </summary>
            public const string OptionCSSO = "OptionC.SSO";

            public const string OptionCSSODocs = "SSO.SSO";

            /// <summary>
            /// OptionC  Component
            /// </summary>
            public const string OptionCComponent = "OptionC.Component";

            public const string OptionCComponentDocs = "Component.DataUpdate,Component.StaffEvaluations,Component.StaffAttendance,Component.ProfessionalDevelopment,Component.SchoolSettings,Component.AdminPermissions,Component.ClassPermissions,Component.ProfilePermissions,Component.ReportPermissions,Component.UserPermissions,Component.BuildingFacilityManager,Component.StaffSettings,Component.PersonalOptions,Component.ACR,Component.EdFi,Component.TerraNova";
            public const string ComponentDataUpdate = "Component.DataUpdate";
            public const string ComponentStaffEvaluations = "Component.StaffEvaluations";
            public const string ComponentStaffAttendance = "Component.StaffAttendance";
            public const string ComponentProfessionalDevelopment = "Component.ProfessionalDevelopment";
            public const string ComponentSchoolSettings = "Component.SchoolSettings";
            public const string ComponentAdminPermissions = "Component.AdminPermissions";
            public const string ComponentClassPermissions = "Component.ClassPermissions";
            public const string ComponentProfilePermissions = "Component.ProfilePermissions";
            public const string ComponentReportPermissions = "Component.ReportPermissions";
            public const string ComponentUserPermissions = "Component.UserPermissions";
            public const string ComponentBuildingFacilityManager = "Component.BuildingFacilityManager";
            public const string ComponentStaffSettings = "Component.StaffSettings";
            public const string ComponentPersonalOptions = "Component.PersonalOptions";

            public const string ComponentACR = "Component.ACR";
            public const string ComponentEdFi = "Component.EdFi";
            public const string ComponentSecureMessage = "Component.SecureMessage";
            public const string ComponentTerraNova = "Component.TerraNova";
            public const string ComponentStudentTranscripts = "Component.StudentTranscripts";

            /// <summary>Swagger document group for school-side Diocese Data Request List.</summary>
            public const string ComponentDioceseDataRequest = "Component.DioceseDataRequest";

            /// <summary>Swagger document group for Vincent Volunteer Management.</summary>
            public const string ComponentVolunteerManagement = "Component.VolunteerManagement";

            /// <summary>
            /// OptionC  Fee
            /// </summary>
            public const string OptionCFee = "OptionC.Fee";

            public const string OptionCFeeDocs = "OptionC.Fee";

            /// <summary>
            /// OptionC  Diocese
            /// </summary>
            public const string OptionCDiocese = "OptionC.Diocese";

            public const string OptionCDioceseDocs = "OptionC.Diocese";

            /// <summary>
            /// OptionC  eForm
            /// </summary>
            public const string OptionCeForm = "OptionC.eForms";

            public const string OptionCeFormDocs = "OptionC.eForms";
        }

        /// <summary>Legacy <c>IsPasswordupdate</c> flag for <c>UpdateCloginEmailandPassword</c>.</summary>
        public static class SsoPasswordUpdateFlags
        {
            /// <summary>FlagId 2 → @IsPasswordupdate=0: Save preferred email address.</summary>
            public const int SavePreferredEmail = 0;

            /// <summary>FlagId 1 → @IsPasswordupdate=1: Save new password after email conversion.</summary>
            public const int SavePassword = 1;

            /// <summary>FlagId 3 → @IsPasswordupdate=3: Validate password-request link (check expiry).</summary>
            public const int ValidateLink = 3;

            /// <summary>FlagId 4 → @IsPasswordupdate=4: Send password reset email.</summary>
            public const int SendResetEmail = 4;
        }

        public static class ImportColumnNames
        {
            #region Common

            public const string SchoolId = "SchoolID";
            public const string SchoolIdentifier = "SchoolIdentifier";
            public const string LastName = "LastName";
            public const string FirstName = "FirstName";
            public const string MiddleName = "MiddleName";
            public const string Group = "Group";
            public const string Phone = "Phone";
            public const string FamilyGroup = "FamilyGroup";
            public const string UserName = "UserName";
            public const string Password = "Password";
            public const string Gender = "Gender";
            public const string DOB = "DOB";
            public const string ReligionCode = "ReligionCode";
            public const string EthnicityCode = "EthnicityCode";
            public const string Hispanic = "Hispanic";
            public const string HomePhone = "HomePhone";
            public const string UnlistedPhone = "UnlistedPhone";
            public const string Email = "Email";
            public const string Street1 = "Street1";
            public const string Street2 = "Street2";
            public const string City = "City";
            public const string State = "State";
            public const string Zip = "Zip";
            public const string FamilyId = "FamilyID";
            public const string Name = "Name";

            #endregion Common

            #region Student

            public const string GradeLevel = "GradeLevel";
            public const string Section = "Section";
            public const string Oldest = "Oldest";
            public const string Youngest = "Youngest";
            public const string Prefix = "Prefix";
            public const string Relationship = "Relationship";
            public const string CellPhone = "CellPhone";
            public const string WorkPhone = "WorkPhone";
            public const string WorkPhoneExtension = "WorkPhoneExtension";
            public const string HomeEmail = "HomeEmail";
            public const string WorkEmail = "WorkEmail";
            public const string GraduationYear = "GraduationYear";

            #endregion Student

            #region TrainingSchedule

            public const string StartDate = "StartDate";
            public const string Duration = "Duration";
            public const string EndDate = "EndDate";
            public const string Description = "Description";
            public const string URL = "URL";
            public const string MeetingID = "MeetingID";
            public const string StateID = "StateID";
            public const string DioID = "DioID";
            public const string OrgID = "OrgID";
            public const string MinimumPermission = "MinimumPermission";
            public const string TrainerID = "TrainerID";
            public const string GuideID = "GuideID";
            public const string TrainingMilestoneID = "TrainingMilestoneID";

            #endregion TrainingSchedule

            #region Philadelphia

            public static class Philadelphia
            {
                public const string InternalID = "InternalID";
                public const string DistrictID = "DistrictID";
                public const string FirstName = "FirstName";
                public const string Gender = "Gender";
                public const string Phone = "Phone";
                public const string LastName = "LastName";
                public const string MiddleName = "MiddleName";
                public const string Address = "Address";
                public const string City = "City";
                public const string State = "State";
                public const string Zip = "Zip";
                public const string HomePhone = "HomePhone";
                public const string WorkPhone = "WorkPhone";
                public const string CellPhone = "CellPhone";
                public const string Email = "Email";
                public const string Title = "Title";
                public const string Race = "Race";
                public const string Ethnicity = "Ethnicity";
                public const string Religion = "Religion";
                public const string EmploymentStatus = "EmploymentStatus";
                public const string ProfessionalStaff = "ProfessionalStaff";
                public const string PACertification = "PACertification";
                public const string StateofCertification = "StateofCertification";
                public const string Active = "Active";
                public const string DOB = "DOB";
                public const string Grade = "Grade";
                public const string EntryDate = "EntryDate";
                public const string Parish = "Parish";
                public const string BirthDay = "BirthDay";
                public const string BirthMonth = "BirthMonth";
                public const string BirthYear = "BirthYear";
                public const string ChurchName = "ChurchName";
                public const string County = "County";
                public const string ProgramIEPorIUER = "ProgramIEPorIUER";
                public const string Title1Qualified = "Title1Qualified";
                public const string SubsidizedTransportation = "SubsidizedTransportation";
                public const string FreeReducedBreakfast = "FreeReducedBreakfast";
                public const string FreeReducedLunch = "FreeReducedLunch";
                public const string BaptismLocation = "BaptismLocation";
                public const string BaptismCity = "BaptismCity";
                public const string BaptismState = "BaptismState";
                public const string BaptismDate = "BaptismDate";
                public const string ConfirmationLocation = "ConfirmationLocation";
                public const string ConfirmationCity = "ConfirmationCity";
                public const string ConfirmationState = "ConfirmationState";
                public const string ConfirmationDate = "ConfirmationDate";
                public const string EucharistLocation = "EucharistLocation";
                public const string EucharistCity = "EucharistCity";
                public const string EucharistState = "EucharistState";
                public const string EucharistDate = "EucharistDate";
                public const string PenanceLocation = "PenanceLocation";
                public const string PenanceCity = "PenanceCity";
                public const string PenanceState = "PenanceState";
                public const string PenanceDate = "PenanceDate";
                public const string PublicSchoolDistrict = "PublicSchoolDistrict";
                public const string ParentFirstName = "ParentFirstName";
                public const string ParentLastName = "ParentLastName";
                public const string StudentFirstName = "StudentFirstName";
                public const string StudentLastName = "StudentLastName";
                public const string StudentID = "StudentID";
                public const string AlternateAddress = "AlternateAddress";
                public const string Relationship = "Relationship";
                public const string Employer = "Employer";
            }

            #endregion Philadelphia
        }

        public static class ImportSourceColumns
        {
            #region Common

            public const string SchoolId = "SchoolID";
            public const string LastName = "Last Name *";
            public const string FirstName = "First Name *";
            public const string MiddleName = "Middle Name";
            public const string FamilyGroup = "Family Group *";
            public const string UserName = "UserName";
            public const string Password = "Password";
            public const string Gender = "Gender * (M/F)";
            public const string DOB = "Date of Birth * (mm/dd/yyyy)";
            public const string SchoolIdentifier = "School Issued ID";
            public const string ReligionCode = "Religion Code";
            public const string EthnicityCode = "Ethnicity Code";
            public const string Hispanic = "Hispanic (y/n)";
            public const string HomePhone = "Family Home Phone * (numbers only)";
            public const string UnlistedPhone = "Family Home Phone Is Unlisted (y/n)";
            public const string Email = "Family E-Mail";
            public const string Street1 = "Street Address *";
            public const string Street2 = "Street Address (line 2)";
            public const string City = "City";
            public const string State = "State (e.g. NY)";
            public const string Zip = "Zip";
            public const string FamilyId = "FamilyID";
            public const string Phone = "Phone";
            public const string Group = "Group";
            public const string Prefix = "Prefix";
            public const string Relationship = "Relationship *";
            public const string RelationshipShort = "Relationship";
            public const string CellPhone = "Cell Phone (numbers only)";
            public const string WorkPhone = "Work Phone (numbers only)";
            public const string WorkPhoneExtension = "Work Phone Extension (numbers only)";
            public const string HomeEmail = "Home E-Mail";
            public const string WorkEmail = "Work E-Mail";
            public const string GraduationYear = "Graduation Year *";
            public const string Oldest = "Oldest (y/n)";
            public const string Youngest = "Youngest (y/n)";
            public const string GradeLevel = "Grade Level *";
            public const string Section = "Section";
            public const string EmailUserName = "Email UserName";
            public const string EmailUserNameWithStar = "Email UserName *";
            public const string FamilyIDInSource = "FamilyID";
            public const string NameInSource = "FamilyGroup";

            #endregion Common

            #region TrainingSchedule

            public const string Name = "Name";
            public const string StartDate = "StartDate";
            public const string Duration = "Duration (Minutes)";
            public const string Description = "Description";
            public const string URL = "URL";
            public const string MeetingID = "MeetingID";
            public const string TrainingScheduleState = "State";
            public const string Diocese = "Diocese";
            public const string OrgID = "OrgID";
            public const string MinimumPermission = "MinimumPermission";
            public const string Trainer = "Trainer";
            public const string Guide = "Guide";
            public const string TrainingMilestone = "TrainingMilestone";

            #endregion TrainingSchedule

            #region Philadelphia

            public static class Philadelphia
            {
                public const string StaffID = "Staff_ID";
                public const string FirstName = "First Name";
                public const string LastName = "Last Name";
                public const string MiddleName = "Middle Name";
                public const string Address = "Addr";
                public const string City = "City";
                public const string State = "State";
                public const string Zip = "Zip";
                public const string Phone = "Phone";
                public const string WorkPhone = "Work Phone";
                public const string CellPhone = "Cell Phone";
                public const string Email = "Email";
                public const string Title = "Title";
                public const string Race = "Race";
                public const string Ethnicity = "Ethnicity";
                public const string Religion = "Religion";
                public const string EmploymentStatus = "Employment Status";
                public const string ProfessionalStaff = "Professional Staff";
                public const string PACertification = "PA Certification";
                public const string StateofCertification = "State of Certification";
                public const string Active = "Active";

                public const string StudentID = "Student_ID";
                public const string DistrictID = "Client_Student_ID";
                public const string BirthDate = "Birth Date";
                public const string Gender = "Gender";
                public const string Grade = "Grade";
                public const string StudentEmail = "Student Email";
                public const string EntryDate = "Entry Date";
                public const string Parish = "Parish";
                public const string BirthDay = "Birth Day";
                public const string BirthMonth = "Birth Month";
                public const string BirthYear = "Birth Year";
                public const string ChurchName = "Church Name";
                public const string County = "County";
                public const string ProgramIEPorIUER = "Program IEP or IU-ER";
                public const string Title1Qualified = "Title 1 Qualified";
                public const string SubsidizedTransportation = "Subsidized Transportation";
                public const string FreeReducedBreakfast = "Free and Reduced Breakfast";
                public const string FreeReducedLunch = "Free and Reduced Lunch";
                public const string BaptismChurch = "Baptism Church";
                public const string BaptismCity = "Baptism City";
                public const string BaptismState = "Baptism State";
                public const string BaptismDate = "Baptism Date";
                public const string ConfirmationChurch = "Confirmation Church";
                public const string ConfirmationCity = "Confirmation City";
                public const string ConfirmationState = "Confirmation State";
                public const string ConfirmationDate = "Confirmation Date";
                public const string EucharistChurch = "First Eucharist Church";
                public const string EucharistCity = "First Eucharist City";
                public const string EucharistState = "First Eucharist State";
                public const string EucharistDate = "First Eucharist Date";
                public const string PenanceChurch = "First Penance Church";
                public const string PenanceCity = "First Penance City";
                public const string PenanceState = "First Penance State";
                public const string PenanceDate = "First Penance Date";
                public const string PublicSchoolDistrict = "SCHOOL-DIST";
                public const string ParentFirstName = "Parent First Name";
                public const string ParentLastName = "Parent Last Name";
                public const string Relationship = "Relationship";

                public const string ParentID = "Parent_ID";
                public const string ParentAddress = "Address";
                public const string EmployerPhone = "Employer_Phone";
                public const string MobilePhone = "Mobile_Phone";
                public const string Employer = "Employer";
                public const string AlternateAddress = "Address_1";
                public const string ClientStudentID = "Client Student ID";
                public const string StudentFirstName = "Student First Name";
                public const string StudentLastName = "Student Last Name";
            }

            #endregion Philadelphia
        }

        public static class SMTPText
        {
            public const string ViperChangePassword = "This is your new password for Viper LogIn";
            public const string MassCardRequest = "Mass Card Request";

            public const string SecureMessageContent = "Thank you for your message. While most messages are handled in less time, Please allow one business day for a reply<br/><br/>" +
                                                       "Thank you,<br/>The OptionC Team:<br/><br/>" +
                                                       "------------------------------------------------------------------------<br/>" +
                                                       "YOUR REQUEST DETAILS:<br/><br/>" +
                                                       "Sent By: {0} {1}<br/>" +
                                                       "School: OrgId {2}<br/>" +
                                                       "Telephone: {3}<br/>" +
                                                       "Sent To: {4}<br/><br/>" +
                                                       "MESSAGE DETAILS<br/>" +
                                                       "{5}<br/>" +
                                                       "------------------------------------------------------------------------<br/>";

            public const string DefaultSupportEmail = "support@optionc.com";
            public const string SalesEmail = "sales@optionc.com";
            public const string BillingEmail = "billing@optionc.com";
            public const string TrainingEmail = "training@optionc.com";

            public const string CustomerServiceName = "Customer Service";
            public const string BillingInquiriesName = "Billing Inquiries (Invoicing Only)";
            public const string CustomerReferralsName = "Customer Referrals / Sales Information";
        }

        public static class NotificationText
        {
            public const string PurchaseOrderNotification = "Purchase Order No {0} is awaiting your authorization.";
            public const string PORejctedNotification = "Purchase order {0} was rejected by the {1}. Kindly review and address the issue.";
            public const string POCancelledNotification = "Purchase order {0} was cancelled by the Purchase Head. Kindly review and address the issue.";
            public const string POPreviousApproverNotification = "The purchase order {0} has been approved by your supervisor and is now ready for dispatch to the vendor. Please approach your supervisor for further details if required.";
            public const string PurchaseRequisitionNotification = "Purchase Requisition No {0} is awaiting your authorization.";
        }

        public static class NotificationTitle
        {
            public const string PurchaseOrder = "Purchase Order";
            public const string WorkOrder = "Work Order";
            public const string BlocklistVendor = "Blocklist Vendor";
            public const string CapitalRequest = "Capital Request";
            public const string PurchaseRequisition = "Purchase Requisition";
            public const string OrderExpiryAlert = "Order Expiry Alert";
            public const string RefreshOrder = "Midnight Refreshment Order";
            public const string ItemExpiryAlert = "Item Expiry Alert";
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

        public static class DioceseSessionField
        {
            public const string LiDioceses = "liDioceses";
            public const string LiDioceseInfo = "liDioceseInfo";
            public const string LiActiveDiocese = "LiActiveDiocese";
            public const string LiNonActiveDiocese = "liNonActiveDiocese";
            public const string LiAvailableDiocese = "liAvailableDiocese";
            public const string LiFormerCustomers = "liFormerCustomers";
            public const string DioceseCategory = "DioceseCategory";
            public const string DioceseMenuActivePage = "DioceseMenuActivePage";
            public const string NewDioID = "NewDioID";
            public const string NewDioName = "NewDioName";
            public const string NewDioceseList = "NewDioceseList";
            public const string LiDioceseProductInformation = "liDioceseProductInformation";
            public const string LiDioceseSchoolList = "liDioceseSchoolList";
            public const string LiDioceseComments = "liDioceseComments";
            public const string LiDioceseTickets = "liDioceseTickets";
            public const string LiDioParishList = "liDioParishList";
        }

        public static class DioceseMenuPage
        {
            public const string ContactUser = "ContactUser";
            public const string Accountmanager = "Accountmanager";
            public const string DioceseInfo = "DioceseInfo";
            public const string ProductInformation = "ProductInformation";
            public const string SchoolList = "SchoolList";
            public const string Comments = "Comments";
            public const string Tickets = "Tickets";
            public const string DioceseUsersDetails = "DioceseUsersDetails";
            public const string GetDioParishList = "GetDioParishList";
        }

        public static class DioceseXmlNode
        {
            public const string SelectOption = "SelectOption";
            public const string Value = "Value";
            public const string Display = "Display";
            public const string DioName = "DioName";
            public const string DioState = "DioState";

            public const string Comment = "Comment";
            public const string CommentID = "ID";
            public const string CommentText = "Text";
            public const string EnteredBy = "AddedBy";
            public const string EnteredDate = "AddedOn";
            public const string CommentType = "CommentType";
            public const string CommentTypes = "CommentTypes";

            public const string DioceseDetailsPage = "DioceseDetailsPage";
            public const string Diocese = "Diocese";
            public const string ID = "ID";
            public const string DioceseID = "DioceseID";
            public const string Name = "Name";
            public const string IsCustomer = "IsCustomer";
            public const string MaxSickDaysAccumulated = "MaxSickDaysAccumulated";
            public const string DioceseCategory = "DioceseCategory";
            public const string IsCLREnabled = "IsCLREnabled";
            public const string IsDioceseClosed = "IsDioceseClosed";
            public const string SalesConsultantID = "SalesConsultantID";
            public const string SalesConsultant = "SalesConsultant";
            public const string Website = "Website";
            public const string Phone = "Phone";
            public const string Fax = "Fax";

            public const string MailingAddress = "MailingAddress";
            public const string Street1 = "Street1";
            public const string City = "City";
            public const string State = "State";
            public const string ZIP = "ZIP";

            public const string Products = "Products";
            public const string SMSProvider = "SMSProvider";

            public const string DioceseStaff = "DioceseStaff";
            public const string Gender = "Gender";
            public const string Prefix = "Prefix";
            public const string Suffix = "Suffix";
            public const string FirstName = "FirstName";
            public const string LastName = "LastName";
            public const string Title = "Title";
            public const string StaffTitle = "Title";
            public const string Department = "Department";
            public const string IsLoginDisabled = "IsLoginDisabled";
            public const string WorkPhone = "WorkPhone";
            public const string WorkPhoneExtension = "WorkPhoneExtension";
            public const string MobilePhone = "MobilePhone";
            public const string WorkEmailAddress = "WorkEmailAddress";
            public const string HomeEmailAddress = "HomeEmailAddress";

            public const string Tickets = "Tickets";
            public const string Ticket = "Ticket";
            public const string TicketTitle = "Title";
            public const string TicketDescription = "Description";
            public const string TicketStatus = "Status";
            public const string InsertedDateTime = "InsertedDateTime";
            public const string SubmittedBy = "SubmittedBy";

            public const string XmlData = "XmlData";
            public const string RawXml = "rawXml";
            public const string XmlPrefix = "XML_";
        }

        /// <summary>Common session keys used by Viper / Acutis flows.</summary>
        public static class ViperSessionField
        {
            public const string UserId = "UserId";
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

        public static class ViperClaim
        {
            public const string ViperUserID = "ViperUserID";
        }

        public static class ViperURLRouting
        {
            public static class Reports
            {
                public const string SurveyReport = "/survey-report";
                public const string PriorityReport = "/priority-report";
                public const string EdFiData = "/ed-fi-data";
            }

            public static class Diocese
            {
                public const string GridViewColumnHide = "grid-view-column-hide";
            }
        }

        public static class PriorityReportFields
        {
            public const string ID = "ID";
            public const string Fullname = "Fullname";
            public const string SchoolName = "School Name";
            public const string OrgId = "Org Id";
            public const string Diocese = "Diocese";
            public const string SurveyCompletedDate = "SurveyCompletedDate";
            public const string ProductName = "ProductName";
            public const string CustomTitle = "CustomTitle";
            public const string CustomDescription = "CustomDescription";
        }

        /// <summary>Viper ticketing query statuses, export defaults, and SP result column labels.</summary>
        public static class Ticket
        {
            public static class QueryStatus
            {
                public const string Dashboard = "Dashboard";
                public const string Statistic = "statistic";
                public const string TicketStatistic = "TicketStatistic";
                public const string My = "my";
            }

            public static class Export
            {
                public const int DefaultLookbackDays = 30;
                public const string OrganizationFileName = "Organization_Ticket_Counts.xlsx";
                public const string MemberFileName = "Member_Ticket_Counts.xlsx";
            }

            public static class Folder
            {
                public const string SupportTickets = "SupportTickets";
                public const string MessageAttachments = "MessageAttachments";
            }

            /// <summary>Column names returned by <c>NewViper.GetUsersTicketsCount</c>.</summary>
            public static class UsersTicketsCountColumn
            {
                public const string Id = "Id";
                public const string UserName = "UserName";
                public const string Open = "Open";
                public const string Completed = "Completed";
                public const string WaitingForFeedback = "Waiting for Feedback";
                public const string InProgress = "In Progress";
                public const string DeniedNotFeasible = "Denied - Not Feasible";
                public const string ContactCustomer = "Contact Customer";
                public const string ClosedResolved = "Closed - Resolved";
                public const string EnhancementSuggestion = "Enhancement Suggestion";
                public const string ThankYou = "Thank You";
            }

            public static class StatusType
            {
                public const string Open = "Open";
            }

            public static class PriorityType
            {
                public const string Normal = "Normal";
            }
        }

        public static class MyMessageDbParameters
        {
            public const string UserID = "UserID";
            public const string IsParentSite = "IsParentSite";
            public const string Type = "Type";
            public const string PageNumber = "PageNumber";
            public const string StartDate = "StartDate";
            public const string EndDate = "EndDate";
            public const string IsDeleted = "IsDeleted";
            public const string IsSentFrom = "IsSentFrom";
            public const string ToUserID = "ToUserID";
            public const string MessageID = "MessageID";
            public const string FromUserID = "FromUserID";
            public const string Subject = "Subject";
            public const string MessageText = "MessageText";
            public const string ToUsers = "ToUsers";
            public const string MessageType = "MessageType";
            public const string ThreadID = "ThreadID";
            public const string Undo = "Undo";
            public const string SortColumn = "SortColumn";
            public const string SortType = "SortType";
            public const string Skip = "Skip";
            public const string NextRecord = "NextRecord";
            public const string SearchValue = "searchValue";
        }

        /// <summary>
        /// Organization type identifiers used by Diocese Organization stored procedures.
        /// </summary>
        public static class DioceseOrganizationTypeIds
        {
            public const int CatholicSchool = 1;

            public const int ReligiousEdSchool = 2;
        }

        public static class DioceseSupportModules
        {
            public const string ContactUsMailId = "support@optionc.com";
            public const string Email = "Email";
            public const string Telephone = "Telephone";
            public const string Two = "2";
            public const string One = "1";
        }
    }
}
