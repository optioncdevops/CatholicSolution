using System;
using System.Collections.Generic;
using System.Text;

namespace CFR.AcutisService.Service.Administration
{
    /// <summary>
    /// Implements granular user right logic and environment flag switching.
    /// </summary>
    public class UserRightsService(IUserRightsRepository repository, ILogger<UserRightsService> logger) : IUserRightsService
    {
        #region Public Methods

        public async Task<MSResultArgs> GetRightByRoleIdAsync(Int32 userId, Int32 moduleId)
        {
            var result = new MSResultArgs();
            try
            {
                var data = await repository.GetRightByRoleIdAsync(userId, moduleId);
                result.StatusCode = ErrorCodes.Success;
                result.StatusMessage = ErrorMessages.Success;
                result.ResultData = data;
            }
            catch (Exception ex)
            {
                AppLogger.LogError(logger, ex, SerilogErrorMessages.AcutisLogMessages.FetchUserRightsFailed);
                result.StatusCode = ErrorCodes.InternalServerError;
                result.StatusMessage = ErrorMessages.InternalServerError;
            }
            return result;
        }

        public async Task<MSResultArgs> SaveUserRightsAsync(int userId, string featureId, string accessRights)
        {
            var result = new MSResultArgs();
            try
            {
                ArgumentNullException.ThrowIfNull(accessRights);
                string ar = accessRights == "On" ? accessRights.Replace("On", "1") : accessRights.Replace("undefined", "0");
                bool success = await repository.SaveUserRightsAsync(userId, featureId, ar);
                result.StatusCode = success ? ErrorCodes.Success : ErrorCodes.InternalServerError;
                result.StatusMessage = success ? ErrorMessages.Success : ErrorMessages.InternalServerError;
                result.ResultData = success;
            }
            catch (Exception ex)
            {
                AppLogger.LogError(logger, ex, SerilogErrorMessages.AcutisLogMessages.SaveUserRightsFailed);
                result.StatusCode = ErrorCodes.InternalServerError;
                result.StatusMessage = ErrorMessages.InternalServerError;
            }
            return result;
        }

        #endregion Public Methods
    }
}