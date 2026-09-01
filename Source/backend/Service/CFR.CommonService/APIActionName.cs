// Copyright (c) OptionC. All rights reserved.

namespace CFR.CommonService
{
    public static class CommonActionName
    {
        public static class Common_API
        {
            public const string getWeather = nameof(getWeather);
        }
    }

    public static class APIActionName
    {
        public static class Auth
        {
            public const string GetLogonPage = nameof(GetLogonPage);
            public const string Login = nameof(Login);
            public const string AutoLogin = nameof(AutoLogin);
            public const string Logout = nameof(Logout);
        }

        public static class API_Login
        {
            public const string userAuthenticateAsync = nameof(userAuthenticateAsync);
        }

        public static class API_Acutis
        {
            public static class AcutisAuthentication
            {
                public const string LoginAuthentication = nameof(LoginAuthentication);
                public const string ForgotPassword = nameof(ForgotPassword);
                public const string ResetPassword = nameof(ResetPassword);
            }
        }

        public static class API_Administration
        {
            public const string GetUsers = nameof(GetUsers);
            public const string GetUserById = nameof(GetUserById);
            public const string GetUserLookups = nameof(GetUserLookups);
            public const string SaveUser = nameof(SaveUser);
            public const string UpdateUserStatus = nameof(UpdateUserStatus);
            public const string DeleteUser = nameof(DeleteUser);
            public const string GetUserRoles = nameof(GetUserRoles);
            public const string GetUserRoleById = nameof(GetUserRoleById);
            public const string SaveUserRole = nameof(SaveUserRole);
            public const string UpdateUserRoleStatus = nameof(UpdateUserRoleStatus);
            public const string DeleteUserRole = nameof(DeleteUserRole);
            public const string GetEmailTemplates = nameof(GetEmailTemplates);
            public const string GetEmailTemplateById = nameof(GetEmailTemplateById);
            public const string SaveEmailTemplate = nameof(SaveEmailTemplate);
            public const string SendTestEmail = nameof(SendTestEmail);
            public const string GetAccessRequests = nameof(GetAccessRequests);
            public const string GetAccessRequestById = nameof(GetAccessRequestById);
            public const string SaveAccessRequest = nameof(SaveAccessRequest);
            public const string UpdateAccessRequestStatus = nameof(UpdateAccessRequestStatus);
            public const string GetProducts = nameof(GetProducts);
        }

        public static class API_Profile
        {
            public const string GetProfile = nameof(GetProfile);
            public const string UpdateProfile = nameof(UpdateProfile);
            public const string ChangePassword = nameof(ChangePassword);
        }
    }
}