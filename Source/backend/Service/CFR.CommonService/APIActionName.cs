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
    }
}