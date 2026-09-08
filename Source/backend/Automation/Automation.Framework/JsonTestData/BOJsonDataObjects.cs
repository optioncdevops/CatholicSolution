// Copyright (c) OptionC. All rights reserved.

namespace Automation.Framework.JsonTestData
{
    public class BOJsonDataObjects
    {
        public BOJsonLogin? Login { get; set; }
    }

    public class BOJsonLogin
    {
        public string? URL { get; set; }

        public string? UserName { get; set; }

        public string? Password { get; set; }
    }
}
