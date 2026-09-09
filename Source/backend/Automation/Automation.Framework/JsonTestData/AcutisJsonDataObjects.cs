// Copyright (c) OptionC. All rights reserved.

namespace Automation.Framework.JsonTestData
{
    public class AcutisJsonDataObjects
    {
        public JsonLogin? Login { get; set; }

        public UserDetails? UserDetails { get; set; }
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
}