using Microsoft.AspNetCore.Mvc;
using StackExchange.Redis;

namespace CFR.Acutis.Controllers.Administration
{
    /// <summary>
    /// API controller for specifically managing individual User Rights and environment-based menu visibility.
    /// Handles granular access control for users.
    /// </summary>
    [Authorize]
    [ApiExplorerSettings(GroupName = SwaggerModuleDoc.CFRAcutisAdministration)]
    public class UserRightsController(IUserRightsService service) : BaseController
    {
        #region Public Methods

        [HttpGet]
        [ActionName(API_Administration.GetUserRights)]
        public async Task<IActionResult> GetRightByRoleIdAsync([FromQuery] int roleId, [FromQuery] int moduleId)
        {
            var result = await service.GetRightByRoleIdAsync(roleId, moduleId);
            return ApiResultArgs(result, APIHttpType.HttpGet);
        }

        /// <summary>
        /// Persists the access matrix for a specific user.
        /// </summary>
        [HttpPost]
        [ActionName(API_Administration.SaveUserRights)]
        public async Task<IActionResult> SaveUserRightsByUserId([FromQuery] int roleId, [FromQuery] string featureId = "", [FromQuery] string accessRights = "")
        {
            var result = await service.SaveUserRightsAsync(roleId, featureId, accessRights);
            return ApiResultArgs(result, APIHttpType.HttpPost);
        }

        #endregion Public Methods
    }
}