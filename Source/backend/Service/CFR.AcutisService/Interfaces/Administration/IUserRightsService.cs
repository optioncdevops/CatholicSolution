using System;
using System.Collections.Generic;
using System.Text;

namespace CFR.AcutisService.Interfaces.Administration
{
    /// <summary>
    /// Interface for User Rights management and environment flag configuration.
    /// </summary>
    public interface IUserRightsService
    {
        #region GET Operations

        Task<MSResultArgs> GetRightByRoleIdAsync(int roleId, int moduleId);

        #endregion GET Operations

        #region WRITE Operations

        Task<MSResultArgs> SaveUserRightsAsync(int roleId, string featureId, string accessRights);

        #endregion WRITE Operations
    }
}