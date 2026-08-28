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
            }
        }

        public static class API_Administration
        {
            public const string GetUsers = nameof(GetUsers);
            public const string GetUserById = nameof(GetUserById);
            public const string GetUserLookups = nameof(GetUserLookups);
            public const string SaveUser = nameof(SaveUser);
            public const string UpdateUserStatus = nameof(UpdateUserStatus);
        }
    }
}