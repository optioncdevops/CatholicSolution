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
            public const string GetHubProducts = nameof(GetHubProducts);
            public const string GetProducts = nameof(GetProducts);
        }

        public static class API_Profile
        {
            public const string GetProfile = nameof(GetProfile);
            public const string UpdateProfile = nameof(UpdateProfile);
            public const string ChangePassword = nameof(ChangePassword);
        }

        public static class API_Organization
        {
            public const string GetOrganizations = nameof(GetOrganizations);
            public const string GetOrganizationById = nameof(GetOrganizationById);
            public const string CreateOrganization = nameof(CreateOrganization);
            public const string UpdateOrganization = nameof(UpdateOrganization);
            public const string GetOrganizationUsers = nameof(GetOrganizationUsers);
            public const string GetOrganizationUserDetail = nameof(GetOrganizationUserDetail);
            public const string GetOrganizationProducts = nameof(GetOrganizationProducts);
            public const string GetAssignableProducts = nameof(GetAssignableProducts);
            public const string AssignOrganizationProduct = nameof(AssignOrganizationProduct);
            public const string RemoveOrganizationProduct = nameof(RemoveOrganizationProduct);
            public const string GetOrganizationLicenses = nameof(GetOrganizationLicenses);
            public const string UnlinkOrganizationUser = nameof(UnlinkOrganizationUser);
        }

        public static class API_Product
        {
            public const string GetProducts = nameof(GetProducts);
            public const string GetProductById = nameof(GetProductById);
            public const string GetLicenseDetails = nameof(GetLicenseDetails);
            public const string GetLicenseById = nameof(GetLicenseById);
            public const string CreateLicense = nameof(CreateLicense);
            public const string UpdateLicense = nameof(UpdateLicense);
            public const string UploadProductLogo = nameof(UploadProductLogo);
            public const string UpdateProduct = nameof(UpdateProduct);
            public const string GetProductLogo = nameof(GetProductLogo);
            public const string GetProductCustomers = nameof(GetProductCustomers);
        }
    }
}