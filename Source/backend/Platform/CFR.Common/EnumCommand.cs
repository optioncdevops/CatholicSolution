// Copyright (c) OptionC. All rights reserved.

namespace CFR.Common
{
    public class EnumCommand
    {
        public enum DataType
        {
            BigInt = 0,
            Boolean = 1,
            Byte = 2,
            CharValue = 3,
            Date = 4,
            DateTime = 5,
            smalldatetime = 6,
            DecimalValue = 7,
            DoubleValue = 8,
            Money = 9,
            IntValue = 10,
            Int16Value = 11,
            Int32Value = 12,
            Int64Value = 13,
            SByte = 14,
            SingleValue = 15,
            StringValue = 16,
            TimeSpan = 17,
            UInt16Value = 18,
            UInt32Value = 19,
            UInt64Value = 20,
            ByteArray = 21,
            Varchar = 22,
            nVarchar = 23,
            None = 24,
            Memo = 25,
            Blob = 26,
            Text = 27,
            Xml = 28,
            bit = 29,
            ntext = 30
        }

        public enum DefaultValues
        {
            Zero = 0,
            ONE = 1,
            TWO = 2,
            THREE = 3,
            FOUR = 4,
            FIVE = 5,
            SIX = 6,
            SEVEN = 7,
            EIGHT = 8,
            NINE = 9,
            TEN = 10,
            NEGATIVEONE = -1
        }
        public enum SQLType
        {
            SQLStatic,
            SQLDynamic,
            SQLStoredProcedure
        }

        #region DB Related

        public enum DBConnectionType
        {
            MasterDBConnection,
            ClusterDBConnection
        }

        #endregion DB Related

        public enum DataSource
        {
            DataSet,
            DataReader,
            DataTable,
            DataView,
            Scalar,
            ExecuteXmlReader
        }

        public enum RenderActionQuery
        {
            AllRecords = 0,
            SaveRecords = 1,
            DeleteRecords = 2,
            SelectById = 3,
        }

        public enum Login_MenuList
        {
            Home = 1,
            My_Classes = 2,
            User_Resources = 3,
            Administration = 4,
            Reports = 5,
            Support = 6,
            Catholic_Content = 7,
            Sign_Out = 8,
            Account_Balance_Statement = 115,
            Calendars = 116,
            Mass_Card_Requests = 14,
            Files = 118,
            Private_Messages = 119,
            Online_Training_Schedule = 120,
            ParentTeacher_Conferences = 121,
            My_Professional_Development = 122,
            Profile = 123,
            Schedule = 124,
            Settings = 125,
            Attendance = 23,
            Assignment = 24,
            Lesson_Plan = 25,
            School_Meals_Tab = 26,
            General_Settings = 27,
            ACR = 126,
            Directories = 29,
            Directories_Dashboard = 30,
            Students = 31,
            Staff = 32,
            Relatives = 33,
            Families = 34,
            Prospects = 35,
            Alumni = 36,
            Disabled_Users = 37,
            Register_New_User = 38,
            Groups = 39,
            Parishes = 40,
            Public_Schools = 41,
            Medical_Providers = 42,
            Student_Photo_Upload = 43,
            Daily_Nurse_Activities = 44,
            Admissions = 53,
            Class_Administration = 47,
            Add_New_Class = 54,
            Associate_Sections = 56,
            Attendance_Settings = 57,
            Copy_Classes_to_New_Term = 60,
            Course_Catalog = 62,
            Days_Off = 63,
            Emergency_Drills = 64,
            Master_Scheduler = 65,
            Term_Manager = 67,
            Term_Scheduling = 68,
            Update_Class_Capacities = 69,
            Communication = 48,
            Announcements = 70,
            Calendar_Administration = 46,
            File_Library = 71,
            Parent_Alerts = 72,
            eForms = 73,
            Conduct = 74,
            Fee_Management = 45,
            Grading = 49,
            Alpha_Scales = 75,
            Comment_Codes = 76,
            Grading_Scales = 77,
            Learner_Behaviors = 78,
            Learner_Behavior_Scales = 79,
            Skills = 80,
            Skill_Scales = 81,
            School_Meals = 50,
            GPA_Manager = 82,
            Permission_Administration = 83,
            Administrator_Permissions = 84,
            Class_Permissions = 85,
            Profile_Permissions = 86,
            Report_Permissions = 87,
            User_Permissions = 88,
            School_Settings = 89,
            Staff_Attendance = 90,
            Staff_Evaluations = 91,
            Data_Update_Tools = 52,
            Financial_Aid_Assessment_and_Request = 92,
            Report_Manager = 94,
            Report_Card_Manager = 95,
            Site_Map = 96,
            FAQs = 97,
            Resource_Library = 98,
            Online_Training_ScheduleView = 99,
            Online_Training_Videos = 100,
            Walkthroughs = 101,
            Implementation_Guide = 102,
            End_Of_Year_Guide = 103,
            Directories_Upload_Utility = 104,
            OptionC_Contact_Information = 105,
            Contact_OptionC = 106,
            Student_Transcripts = 108,
            Terra_Nova = 109,
            Diocese_Data_Request = 110,
            Learning_Management_System = 127,
            StaffeForms = 128,
            Community_Support = 113,
            School_Facility_Manager = 51,
            Google_Calendars = 114,
            Personal_Options = 129,
            Record_Conduct_Notice = 130,
            EdFi = 131,
            Create_New_Class_Sections = 132,
            OptionCCalendars = 133,
            Volunteer = 138
        }

        public enum ActionQuery
        {
            AllRecords = 0,
            InsertRecoreds = 1,
            SaveRecords = 2,
            DeleteRecords = 3,
        }

        public enum QueryRenderAction
        {
            ActiveForms = 1,
            StudentActiveForms = 2,
            AllDynamicFormsBySchoolId = 2,
            allArchiveForm = 16,
            DynamicFormsByFormId = 3,
            SesctionByFormId = 4,
            StaffRenderForm = 1,
            StaffRenderFormAction = 18,
            StudentRecordId = 1,
            ControlsByFormId = 5,
            DynamicEditDataByRecordId = 6,
            ActionId = 7,
            DynamicSectionBySectionId = 10,
            ParentActiveFormsActionId = 13,
            NextFormActionId = 14,
            TeplateActionId = 15,
            FilterStudentActionId = 1,
            FilterStaffActionId = 3,
            CopyStudentActionId = 2,
            ExportUserFormStatus = 17
        }

        public enum UserData
        {
            USERID,
            USERNAME,
            FIRSTNAME,
            LASTNAME,
            ORGANIZATIONID,
            PERMISSION,
            GRADELEVEL,
            SECTION,
            USERROLE,
            MIDDLENAME,
            TITLE,
            SUFFIX,
            DOB,
            GENDER,
            PASSWORD,
            ORGANIZATIONNAME,
            ORGANIZATIONSTATE,
            ORGANIZATIONDIOCESE,
            DIOID,
            STATEID,
        }

        public enum DefalutVlaue
        {
            defalut = 0,
            FlagId1 = 1,
            FlagId2 = 2
        }

        public enum QueryAddFormAction
        {
            TemplateActionId = 12,
            FormCategoryActionId = 13,
            FieldMoveRightActionId = 6,
            FieldMoveLeft = 5,
            CopyField = 4,
            DeleteDynamicField = 3,
            GetFieldMapping = 7,
            EditDynamicField = 9,
            SaveFieldActionId = 1,
            EditFieldActionId = 2,
            AddBetweenFieldActionId = 8,
            SectionMoveDown = 5,
            SectionMoveUp = 4,
            DeleteDynamicSection = 3,
            SaveDynamicSection = 1,
            EditDynamicSection = 2,
            GetSectionById = 10,
            AddDynamicSection = 10,
            AddFormSection = 1,
            SaveOnlineForms = 1,
            EditOnlineForms = 2,
            DeleteDynamicForm = 3,
            ArchiveForm = 6,
            SetActiveForm = 10,
            UnArchiveForm = 7,
            GetFormsData = 1,
            GetViperTemplates = 14,
            PublishUnPublishForm = 11,
            UpdateTemplateActionId = 5,
            AttachmentActionId = 8,
            FielUpdateActionId = 7,
            RequiredUpdateActionId = 7,
            TemplateCopyActionId = 1,
            CopyActionId = 2,
            ActiveForms = 1,
            AllDynamicFormsBySchoolId = 2,
            DynamicFormsByFormId = 3,
            SesctionByFormId = 4,
            ControlsByFormId = 5,
            DynamicEditDataByRecordId = 6,
            ActionId = 7,
            DynamicSectionBySectionId = 10,
            AtutoSaveActionId = 1,
            AtutoSaveBlankActionId = 9,

            // Legacy name used by OptionC.eFormss BlankFormController
            GetBlankFormsActionId = 3,
        }

        public enum QuerySupportAction
        {
            InputTypeId = 1,
            SchoolId = 2,
            FamilyRoleId = 3,
            LoadIndexActionId = 4
        }

        public enum Reports
        {
            MissingAttendance = 12,
            DelinquentBalances = 243
        }

        public enum Modules
        {
            Billing = 24
        }

        public static class Constants
        {
            public const string NoAccessPage = "~/home/no-access/";
            public const string ErrorPage = "~/error/";
            public const int SiteID = 3;    //family
        }

        public enum FamilySection
        {
            Lunch = 1,
            Billing = 2,
            PrivateMessages = 3,
            Discipline = 4,
            Alerts = 5,
            NurseVisits = 6,
            ReportCards = 7,

            // NOTE: kept for backward compatibility (some layouts still reference it).
            ReEnrollment = 8,

            AcademicInformation = 9,

            IntensionEnabled = 8,
            RegistrationEnabled = 10
        }

        public enum DiocesePermissions
        {
            General = 5000,                     // basic logon privilages - added to every user on logon

            //Group: Diocese Security
            Admin_ManagePermissions = 5001,     // manage user privilages

            Admin_AddUpdateDeleteUsers = 5007,  // manage users

            //Group: Diocese Administrative
            Admin_UpdateDioceseProfile = 5002,  // update diocese info

            Parish_AddUpdateDelete = 5003,      // update parish info

            Notifications = 5004,                       // create, update notifications
            Notifications_SendToDioceseUsers = 5005,    // send to diocese users

            Admin_ManageSchoolGroups = 5006,    // add, update school groups (catholic or religious ed)
            Admin_ManageTrainingEvents = 5013,  // manage training events
            Admin_ManageClergy = 5023,
            Admin_ManageFiles = 5024,
            Admin_AddDataRequest = 5025,
            Admin_ApproveDataRequest = 5026,

            // Group: Catholic School Super User -- all catholic school related privilages

            //Group: Catholic School Basic - sees the school list
            CatholicSchool_General = 5014,

            // Group: Catholic School Student/Parent Directory
            CatholicSchool_DirectoryStaff = 5008,

            CatholicSchool_DirectoryStudents = 5009,
            CatholicSchool_DirectoryParents = 5010,
            CatholicSchool_DirectoryAlumni = 5011,

            // Group: Catholic School Admin - sensitive catholic school stuff
            CatholicSchool_LoginToSchool = 5012,

            // Group: Catholic Schhol Reports - reports
            CatholicSchool_Reports = 5015,

            // permissions that make up the religious ed section of the site
            // Groups: Basic, Student/Parent Directory, Admin, Reports
            ReligiousEd_Schools = 5016,             // view religiuos ed schools

            ReligiousEd_DirectoryStaff = 5017,
            ReligiousEd_DirectoryStudents = 5018,
            ReligiousEd_DirectoryParents = 5019,
            ReligiousEd_DirectoryAlumni = 5020,
            ReligiousEd_LoginToSchool = 5021,       // login as administrator to the school
            ReligiousEd_Reports = 5022,             // run religious ed reports

            Scholarship_General = 5030,              // manage donors etc

            //AdHoc Report Permissions
            Admin_CreateAdHocReport = 5035,

            Admin_ViewAdHocReport = 5036,

            Admin_UpdateDioceseUserID = 5037,
            Admin_StudentSearch = 5038,

            // Enum  Diocese Permission

            AccessNonCustomer = 1110,
            UpdateNonCustomer = 1111,
            AccessCustomer = 1112,
            UpdateCustomer = 1113,
            Sales = 1114,
            AddComment = 1115,
            AccessInternalData = 1116
        }

        public enum FamilyPermissions
        {
            //All
            General = 6000,                     // basic logon privilages - added to every user on logon

            //Parents Only
            Communication_PrivateMessages = 6001,

            Communication_ManageAlerts = 6004,

            Office_Billing = 6002,
            Office_LunchOrder = 6003,
            Office_FamilyProfile = 6006,

            Faith_MassCardRequest = 6005,

            Student_NurseVisits = 6007,

            Office_TeacherConferences = 6008,

            Student_ReportCards = 6009,

            General_ChangePassword = 6010,

            Office_ReEnrollment = 6011,

            Student_Scholarship = 6012,
            CommuniCation_Academicinformation = 6013
        }

        public enum TicketingPermissions
        {
            Access = 1000,
            Update = 1001,
            Create = 1002
        }

        public enum SchoolPermissions
        {
            AccessNonCustomer = 1100,
            UpdateNonCustomer = 1101,
            AccessCustomer = 1102,
            UpdateCustomer = 1103,
            Sales = 1104,
            AddComment = 1105,
            AccessInternalData = 1106
        }

        public enum VolunteerAccess
        {
            Volunteer = 5,
        }

        public enum VolunteerTargetAccess
        {
            Volunteer = 11,
            DisabledUser = 5,
        }
    }
}
