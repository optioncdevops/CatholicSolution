// Copyright (c) OptionC. All rights reserved.

using CFR.Common;
using CFR.DBEngine;

namespace CFR.Base
{
    public static class ResultArgsHandler
    {
        /// <summary>
        /// Sets the result arguments based on the HTTP type for non-generic MSResultArgs.
        /// </summary>
        public static void SetResultArgs(MSResultArgs resultArgs, APIHttpType type)
        {
            ArgumentNullException.ThrowIfNull(resultArgs);

            if (resultArgs.StatusCode != 0)
            {
                resultArgs.StatusMessage ??= ErrorMessages.SaveFailed;
                return;
            }

            switch (type)
            {
                case APIHttpType.HttpPost:
                    HandleHttpPost(resultArgs);
                    break;

                case APIHttpType.HttpGet:
                    HandleHttpGet(resultArgs);
                    break;

                case APIHttpType.HttpDelete:
                    HandleHttpDelete(resultArgs);
                    break;

                case APIHttpType.HttpPut:
                    HandleHttpPut(resultArgs);
                    break;

                default:
                    resultArgs.StatusCode = ErrorCodes.Failed;
                    resultArgs.StatusMessage = ErrorMessages.UnknownError;
                    break;
            }
        }

        /// <summary>
        /// Sets the result arguments based on the HTTP type for generic MSResultArgs.
        /// </summary>
        public static void SetResultArgs<T>(MSResultArgs<T> resultArgs, APIHttpType type)
        {
            ArgumentNullException.ThrowIfNull(resultArgs);

            if (resultArgs.StatusCode != 0)
            {
                resultArgs.StatusMessage ??= ErrorMessages.Undefined;
                return;
            }

            switch (type)
            {
                case APIHttpType.HttpPost:
                    HandleHttpPost(resultArgs);
                    break;

                case APIHttpType.HttpGet:
                    HandleHttpGet(resultArgs);
                    break;

                case APIHttpType.HttpDelete:
                    HandleHttpDelete(resultArgs);
                    break;

                case APIHttpType.HttpPut:
                    HandleHttpPut(resultArgs);
                    break;

                default:
                    resultArgs.StatusCode = ErrorCodes.Failed;
                    resultArgs.StatusMessage = ErrorMessages.UnknownError;
                    break;
            }
        }

        private static void HandleHttpPost(MSResultArgs resultArgs)
        {
            if (resultArgs.ResultData != null && int.TryParse(resultArgs.ResultData.ToString(), out int result) && result > 0)
            {
                resultArgs.StatusCode = ErrorCodes.Created;
                resultArgs.StatusMessage ??= ErrorMessages.Success;
            }
            else
            {
                resultArgs.StatusCode = ErrorCodes.Failed;
                resultArgs.StatusMessage ??= ErrorMessages.SaveFailed;
            }
        }

        private static void HandleHttpGet(MSResultArgs resultArgs)
        {
            if (resultArgs.ResultData != null)
            {
                resultArgs.StatusCode = ErrorCodes.Success;
                resultArgs.StatusMessage ??= ErrorMessages.Success;
            }
            else
            {
                resultArgs.StatusCode = ErrorCodes.NoRecordFound;
                resultArgs.StatusMessage ??= ErrorMessages.NoRecordFound;
            }
        }

        private static void HandleHttpDelete(MSResultArgs resultArgs)
        {
            if (resultArgs.ResultData != null && int.TryParse(resultArgs.ResultData.ToString(), out int result) && result > 0)
            {
                resultArgs.StatusCode = ErrorCodes.Success;
                resultArgs.StatusMessage ??= ErrorMessages.DeleteSuccess;
            }
            else
            {
                resultArgs.StatusCode = ErrorCodes.Failed;
                resultArgs.StatusMessage ??= ErrorMessages.DeleteFailed;
            }
        }

        private static void HandleHttpPut(MSResultArgs resultArgs)
        {
            if (resultArgs.ResultData != null)
            {
                resultArgs.StatusCode = ErrorCodes.Success;
                resultArgs.StatusMessage ??= ErrorMessages.Success;
            }
            else
            {
                resultArgs.StatusCode = ErrorCodes.Failed;
                resultArgs.StatusMessage ??= ErrorMessages.SaveFailed;
            }
        }

        private static void HandleHttpPost<T>(MSResultArgs<T> resultArgs)
        {
            if (resultArgs.ResultData != null && int.TryParse(resultArgs.ResultData.ToString(), out int result) && result > 0)
            {
                resultArgs.StatusCode = ErrorCodes.Created;
                resultArgs.StatusMessage ??= ErrorMessages.Success;
            }
            else
            {
                resultArgs.StatusCode = ErrorCodes.Failed;
                resultArgs.StatusMessage ??= ErrorMessages.SaveFailed;
            }
        }

        private static void HandleHttpGet<T>(MSResultArgs<T> resultArgs)
        {
            if (resultArgs.ResultData != null)
            {
                resultArgs.StatusCode = ErrorCodes.Success;
                resultArgs.StatusMessage ??= ErrorMessages.Success;
            }
            else
            {
                resultArgs.StatusCode = ErrorCodes.NoRecordFound;
                resultArgs.StatusMessage ??= ErrorMessages.NoRecordFound;
            }
        }

        private static void HandleHttpDelete<T>(MSResultArgs<T> resultArgs)
        {
            if (resultArgs.ResultData != null && int.TryParse(resultArgs.ResultData.ToString(), out int result) && result > 0)
            {
                resultArgs.StatusCode = ErrorCodes.Success;
                resultArgs.StatusMessage ??= ErrorMessages.DeleteSuccess;
            }
            else
            {
                resultArgs.StatusCode = ErrorCodes.Failed;
                resultArgs.StatusMessage ??= ErrorMessages.DeleteFailed;
            }
        }

        private static void HandleHttpPut<T>(MSResultArgs<T> resultArgs)
        {
            if (resultArgs.ResultData != null)
            {
                resultArgs.StatusCode = ErrorCodes.Success;
                resultArgs.StatusMessage ??= ErrorMessages.Success;
            }
            else
            {
                resultArgs.StatusCode = ErrorCodes.Failed;
                resultArgs.StatusMessage ??= ErrorMessages.SaveFailed;
            }
        }
    }
}
