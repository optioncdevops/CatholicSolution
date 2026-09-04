// Copyright (c) OptionC. All rights reserved.

using System.ComponentModel;

namespace CFR.Common
{
    /// <summary>
    /// A static class containing various enumeration types used throughout the application.
    /// </summary>
    public static class EnumVariables
    {
        public enum NAStatus
        {
            [Description("Dietation Assigned")]
            Assigned = 1,

            [Description("Natural Assessment Pending")]
            Pending = 2,

            [Description("Natural Assessment Not Required")]
            NotRequired = 3,

            [Description("Natural Assessment Done")]
            Done = 4,

            [Description("Discharged")]
            Discharged = 5
        }

        public enum AppointmentCancellationScope
        {
            [Description("Whole Day")]
            WholeDay = 1,

            [Description("Time Range")]
            TimeRange = 2,

            [Description("Slot Wise")]
            SlotWise = 3,

            [Description("Recurring")]
            Recurring = 4
        }
        public abstract class DefaultValues
        {
            public const string Zero = "0";
            public const string NegativeOne = "-1";
            public const string ONE = "1";
            public const string TWO = "2";
            public const string THREE = "3";
            public const string FOUR = "4";
            public const string FIVE = "5";
            public const string SIX = "6";
            public const string SEVEN = "7";
            public const string EIGHT = "8";
            public const string NINE = "9";
            public const string TEN = "10";
            public const string TWENTYSEVEN = "27";
            public const string NINETYNINE = "-99";
            public const string PNINETYNINE = "99";
            public const string NINETYEIGHT = "-98";

            public const string MAXLENGTH = "maxlength";
            public const string IMAGESIZE = "1500X400_";
            public const string TILE = @"~\";
            public const string REVIEWER = "1";
            public const string APPROVER = "2";
            public const string INPROGRESS = "1";
            public const string REVIEW = "2";
            public const string INDEXIMAGESIZE = "400X400_";

            public const string TRUE = "True";
            public const string FALSE = "False";
            public const int PAGEINDEX = 12;
            public const string PASSWORD = "";

            public const string ERROR = "ERROR";

            public const string CONTACTPROFILEIMAGESIZE = "120X120_";

            public const int Conflict = -99;
        }

        public enum ServiceType
        {
            [Description("LMS")]
            LMS = 1,
            [Description("MattMoney")]
            MattMoney = 2,
            [Description("Parent Alert")]
            ParentAlert = 3,
            [Description("Stripe")]
            Stripe = 4
        }

        public enum ServicesSchoolCategory
        {
            [Description("Active Customers")]
            Active = 1,
            [Description("Former Customers")]
            Former = 4
        }

        public abstract class NotificationType
        {
            public const string SchoolBulletin = "O";
            public const string SystemMessage = "S";
            public const string Notification = "N";
            public const string NewsLetter = "L";
        }

        /// <summary>
        /// Action identifiers for [dbo].[Acutis_Products_CRUD].
        /// </summary>
        public enum ProductAction
        {
            [Description("Fetch active products list")]
            GetList = 1,

            [Description("Fetch product details by identifier")]
            GetById = 2,

            [Description("Update product details")]
            Update = 3,

            [Description("Check if product name exists")]
            CheckNameExists = 4,

            [Description("Fetch licenses for a product")]
            GetLicenses = 5,

            [Description("Fetch license details by identifier")]
            GetLicenseById = 6,

            [Description("Create a new license")]
            CreateLicense = 7,

            [Description("Update an existing license")]
            UpdateLicense = 8,

            [Description("Fetch customers linked to a product")]
            GetCustomers = 9,

            [Description("Fetch per-product organization assignment counts")]
            GetAssignmentSummary = 10
        }


    }
}
