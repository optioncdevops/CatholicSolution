// Copyright (c) OptionC. All rights reserved.

namespace Automation.Framework.JsonTestData
{
    public class AcutisJsonDataObjects
    {
        public JsonLogin? Login { get; set; }

        public UserDetails? UserDetails { get; set; }

        public ProductData? Product { get; set; }
    }

    public class JsonLogin
    {
        public string? URL { get; set; }

        public string? UserName { get; set; }

        public string? Password { get; set; }
    }

    public class UserDetails
    {
        public string? FirstName { get; set; }

        public string? EditFirstName { get; set; }

        public string? LastName { get; set; }

        public string? EditLastName { get; set; }

        public string? UserName { get; set; }

        public string? EMail { get; set; }

        public string? Password { get; set; }

        /// <summary>The date of birth to enter, in the dd/MM/yyyy format the picker shows.</summary>
        public string? DateOfBirth { get; set; }

        public string? UserRole { get; set; }
    }

    public class ProductData
    {
        public string? SearchProductName { get; set; }

        public string? TargetProductName { get; set; }

        public string? FilterStatus { get; set; }

        public string? NewStatus { get; set; }

        public string? EditProductName { get; set; }

        public string? EditShortName { get; set; }

        public string? EditSubtitle { get; set; }

        public string? EditLicenseType { get; set; }

        public string? EditNavigationTarget { get; set; }

        public string? EditContactPerson { get; set; }

        public string? EditFeature { get; set; }

        public string? EditDescription { get; set; }

        public string? InvoiceTitle { get; set; }

        public List<string>? SubTabs { get; set; }
    }
}