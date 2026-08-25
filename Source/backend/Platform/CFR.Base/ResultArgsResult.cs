// Copyright (c) OptionC. All rights reserved.

using CFR.Common;

namespace CFR.Base
{
    public static class ResultArgsHandler
    {
        /// <summary>
        /// Sets the result arguments based on the HTTP type for non-generic ResultArgs.
        /// </summary>
        /// <param name="resultArgs">The ResultArgs object to update.</param>
        /// <param name="type">The HTTP type (e.g., POST, GET, DELETE, PUT).</param>
        public static void SetResultArgs(ResultArgs resultArgs, APIHttpType type)
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
        /// Sets the result arguments based on the HTTP type for generic ResultArgs.
        /// </summary>
        /// <typeparam name="T">The type of the result data.</typeparam>
        /// <param name="resultArgs">The ResultArgs object to update.</param>
        /// <param name="type">The HTTP type (e.g., POST, GET, DELETE, PUT).</param>
        public static void SetResultArgs<T>(ResultArgs<T> resultArgs, APIHttpType type)
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

        /// <summary>
        /// Handles HTTP POST logic for non-generic ResultArgs.
        /// </summary>
        /// <param name="resultArgs">The ResultArgs object to update.</param>
        private static void HandleHttpPost(ResultArgs resultArgs)
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

        /// <summary>
        /// Handles HTTP GET logic for non-generic ResultArgs.
        /// </summary>
        /// <param name="resultArgs">The ResultArgs object to update.</param>
        private static void HandleHttpGet(ResultArgs resultArgs)
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

        /// <summary>
        /// Handles HTTP DELETE logic for non-generic ResultArgs.
        /// </summary>
        /// <param name="resultArgs">The ResultArgs object to update.</param>
        private static void HandleHttpDelete(ResultArgs resultArgs)
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

        /// <summary>
        /// Handles HTTP PUT logic for non-generic ResultArgs.
        /// </summary>
        /// <param name="resultArgs">The ResultArgs object to update.</param>
        private static void HandleHttpPut(ResultArgs resultArgs)
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

        /// <summary>
        /// Handles HTTP POST logic for generic ResultArgs.
        /// </summary>
        /// <typeparam name="T">The type of the result data.</typeparam>
        /// <param name="resultArgs">The ResultArgs object to update.</param>
        private static void HandleHttpPost<T>(ResultArgs<T> resultArgs)
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

        /// <summary>
        /// Handles HTTP GET logic for generic ResultArgs.
        /// </summary>
        /// <typeparam name="T">The type of the result data.</typeparam>
        /// <param name="resultArgs">The ResultArgs object to update.</param>
        private static void HandleHttpGet<T>(ResultArgs<T> resultArgs)
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

        /// <summary>
        /// Handles HTTP DELETE logic for generic ResultArgs.
        /// </summary>
        /// <typeparam name="T">The type of the result data.</typeparam>
        /// <param name="resultArgs">The ResultArgs object to update.</param>
        private static void HandleHttpDelete<T>(ResultArgs<T> resultArgs)
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

        /// <summary>
        /// Handles HTTP PUT logic for generic ResultArgs.
        /// </summary>
        /// <typeparam name="T">The type of the result data.</typeparam>
        /// <param name="resultArgs">The ResultArgs object to update.</param>
        private static void HandleHttpPut<T>(ResultArgs<T> resultArgs)
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
