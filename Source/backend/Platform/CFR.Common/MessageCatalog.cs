// Copyright (c) OptionC. All rights reserved.

namespace CFR.Common
{
    public enum APIHttpType
    {
        HttpGet = 1,
        HttpPost = 2,
        HttpDelete = 3,
        HttpPut = 4
    }

    public static class ErrorCodes
    {
        public const int Success = 200;
        public const int Created = 201;
        public const int Updated = 202;
        public const int Failed = 203;
        public const int NoRecordFound = 204;
        public const int Deleted = 205;
        public const int Exist = 206;
        public const int InValidToken = 207;
        public const int CustomMessage = 102;
        public const int BadRequest = 400;
        public const int InternalServerError = 500;
    }

    public static class ErrorMessages
    {
        public const string Success = "Success";
        public const string Error = "An error occurred.";
        public const string SaveFailed = "Save failed.";
        public const string UnknownError = "Unknown error.";
        public const string Undefined = "Undefined.";
        public const string NoRecordFound = "No record found.";
        public const string DeleteSuccess = "Deleted successfully.";
        public const string DeleteFailed = "Delete failed.";
        public const string InternalServerError = "An internal server error occurred.";
    }

    public static class SerilogErrorMessages
    {
        public static class AcutisLogMessages
        {
            public const string GetSteps = "Failed to get";
        }
    }
}
