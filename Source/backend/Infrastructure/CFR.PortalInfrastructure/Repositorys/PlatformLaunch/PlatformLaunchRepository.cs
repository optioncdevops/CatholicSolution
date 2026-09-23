// Copyright (c) OptionC. All rights reserved.

namespace CFR.PortalInfrastructure.Repositorys.PlatformLaunch
{
    /// <summary>
    /// Dapper implementation of IPlatformLaunchRepository for App Hub platform-launch codes.
    /// Infrastructure Responsibility:
    /// - Uses IDapperHandler to execute StoredProc.PlatformLaunch.PlatformLaunchCrud and map its
    ///   result to PortalLoginUserResult. Takes no ICurrentUserService dependency - the caller is
    ///   a trusted API client acting on behalf of an already-identified email, not a signed-in
    ///   Portal user.
    /// </summary>
    public class PlatformLaunchRepository(IDapperHandler dapperHandler): IPlatformLaunchRepository
    {
        #region POST Methods

        /// <inheritdoc />
        public async Task<int> CreateLaunchAsync(string email, string codeHash, string insertedBy)
        {
            var parameters = new DynamicParameters();
            parameters.Add(DBParameterName.PlatformLaunchParams.ActionId, 1, DbType.Int32);
            parameters.Add(DBParameterName.PlatformLaunchParams.Email, email, DbType.String);
            parameters.Add(DBParameterName.PlatformLaunchParams.CodeHash, codeHash, DbType.AnsiStringFixedLength, size: 64);
            parameters.Add(DBParameterName.PlatformLaunchParams.InsertedBy, insertedBy, DbType.String);
            parameters.Add(DBParameterName.PlatformLaunchParams.ReturnValue, dbType: DbType.Int32, direction: ParameterDirection.Output);
            await dapperHandler.ExecuteAsync(StoredProc.PlatformLaunch.PlatformLaunchCrud, parameters, CommandType.StoredProcedure);
            return parameters.Get<int>(DBParameterName.PlatformLaunchParams.ReturnValue);
        }

        /// <inheritdoc />
        public async Task<(int ReturnValue, PortalLoginUserResult? User)> ExchangeCodeAsync(string codeHash)
        {
            var parameters = new DynamicParameters();
            parameters.Add(DBParameterName.PlatformLaunchParams.ActionId, 2, DbType.Int32);
            parameters.Add(DBParameterName.PlatformLaunchParams.CodeHash, codeHash, DbType.AnsiStringFixedLength, size: 64);
            parameters.Add(DBParameterName.PlatformLaunchParams.ReturnValue, dbType: DbType.Int32, direction: ParameterDirection.Output);
            var result = await dapperHandler.QueryAsync<PortalLoginUserResult>(StoredProc.PlatformLaunch.PlatformLaunchCrud, parameters, CommandType.StoredProcedure);
            return (parameters.Get<int>(DBParameterName.PlatformLaunchParams.ReturnValue), result.FirstOrDefault());
        }

        #endregion POST Methods
    }
}
