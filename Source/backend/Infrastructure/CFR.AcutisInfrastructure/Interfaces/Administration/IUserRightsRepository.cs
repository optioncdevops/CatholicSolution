using System;
using System.Collections.Generic;
using System.Text;

namespace CFR.AcutisInfrastructure.Interfaces.Administration
{
    /// <summary>
    /// Interface for data repository handling user granular rights and menu flag configs.
    /// </summary>
    public interface IUserRightsRepository
    {
        #region GET Operations

        Task<dynamic> GetRightByRoleIdAsync(int roleId, int moduleId);

        #endregion GET Operations

        #region WRITE Operations

        Task<bool> SaveUserRightsAsync(int roleId, string featureId, string accessRights);

        #endregion WRITE Operations
    }
}