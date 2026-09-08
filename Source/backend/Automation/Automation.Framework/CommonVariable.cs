// Copyright (c) OptionC. All rights reserved.

namespace Automation.Framework
{
    public static class CommonVariable
    {
        public static class DefaultValue
        {
            public const string Empty = "";
            public const string Select = "Select";
            public const string ScenarioId = nameof(ScenarioId);
            public const string ScreenShots = nameof(ScreenShots);
            public const string ScreenShotFormat = ".png";
        }

        public static class XPath_Button
        {
            public const string btnSave = nameof(btnSave);

            // Spelled out rather than named after the control id: a "New" suffix
            // reads as a versioned duplicate of btnSave (CA1711).
            public const string btnSaveAndNew = "btnSaveNew";

            public const string btnSaveEdit = nameof(btnSaveEdit);
            public const string btnCancel = nameof(btnCancel);
            public const string btnAdd = nameof(btnAdd);
            public const string btnUpdate = nameof(btnUpdate);
            public const string btnAddUser = nameof(btnAddUser);
            public const string btnEdit = nameof(btnEdit);
            public const string btnDelete = nameof(btnDelete);
            public const string Login = nameof(Login);
            public const string btnLogin = nameof(btnLogin);
            public const string btnLogout = nameof(btnLogout);
            public const string liSignOut = nameof(liSignOut);
        }
    }
}
