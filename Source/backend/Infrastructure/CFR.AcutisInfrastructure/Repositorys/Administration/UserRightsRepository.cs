using System;
using System.Collections.Generic;
using System.Text;

namespace CFR.AcutisInfrastructure.Repositorys.Administration
{
    /// <summary>
    /// Implementation of IUserRightsRepository using Dapper handler for SQL Server.
    /// Manages both menu visibility flags and granular user feature rights.
    /// </summary>
    public class UserRightsRepository(IDapperHandler dapperHandler) : IUserRightsRepository
    {
        #region Public Methods

        public async Task<dynamic> GetRightByRoleIdAsync(int roleId, int moduleId)
        {
            var parameters = new DynamicParameters();
            parameters.Add(DBParameterName.UserRightParams.RoleId, roleId, DbType.Int32);
            parameters.Add(DBParameterName.UserRightParams.ModuleId, moduleId, DbType.Int32);

            using var multi = await dapperHandler.QueryMultipleAsync("GetUserRights", parameters, CommandType.StoredProcedure);

            var table1 = (await multi.ReadAsync<dynamic>()).ToList();
            var table2 = (await multi.ReadAsync<dynamic>()).ToList();
            var table3 = (await multi.ReadAsync<dynamic>()).ToList();

            return new
            {
                Roles = table1,
                Modules = table2,
                UserRights = table3
            };
        }

        public async Task<bool> SaveUserRightsAsync(int roleId, string featureIds, string accessRights)
        {
            var parameters = new DynamicParameters();
            parameters.Add(DBParameterName.UserRightParams.RoleId, roleId, DbType.Int32);
            parameters.Add(DBParameterName.UserRightParams.ParentId, 0, DbType.Int32);
            parameters.Add(DBParameterName.UserRightParams.AccessRights, accessRights, DbType.String);
            parameters.Add(DBParameterName.UserRightParams.FeatureIds, featureIds, DbType.String);

            int affected = await dapperHandler.ExecuteAsync("SaveUserRights", parameters, CommandType.StoredProcedure);

            return affected > 0;
        }

        #endregion Public Methods
    }
}