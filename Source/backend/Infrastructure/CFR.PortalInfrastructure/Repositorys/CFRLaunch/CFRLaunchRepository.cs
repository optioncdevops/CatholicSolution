// Copyright (c) OptionC. All rights reserved.

namespace CFR.PortalInfrastructure.Repositorys.CFRLaunch
{
    /// <summary>
    /// Dapper implementation of ICFRLaunchRepository for product SSO launch.
    /// Infrastructure Responsibility:
    /// - Uses IDapperHandler to execute stored procedures and map results to SSO DTOs.
    /// - Stamps InsertedBy from ICurrentUserService.UserId on launch create.
    /// </summary>
    public class CFRLaunchRepository(IDapperHandler dapperHandler, ICurrentUserService currentUserService): ICFRLaunchRepository
    {
        #region GET Methods

        /// <summary>
        /// Fetches assigned product rows using StoredProc.CFRLaunch.CFRLaunchCrud.
        /// </summary>
        /// <remarks>
        /// Purpose: Retrieve products assigned to the authenticated member.
        /// Request Flow: ICFRLaunchService -> CFRLaunchRepository.GetAssignedProductsAsync() -> Database.
        /// Validation Details: CFRUserId parameter mapping.
        /// Business Logic: Maps stored procedure rows to AssignedProductOutput.
        /// Repository Interaction: Executes StoredProc.CFRLaunch.CFRLaunchCrud with ActionId 1.
        /// Response Details: Returns a list of AssignedProductOutput records.
        /// </remarks>
        /// <param name="environmentName">[core].[ProductEnvironment].EnvironmentName for the login environment.</param>
        /// <returns>Hub product rows.</returns>
        public async Task<List<AssignedProductOutput>> GetAssignedProductsAsync(string environmentName)
        {
            var parameters = new DynamicParameters();
            parameters.Add(DBParameterName.CFRLaunchParams.ActionId, 1, DbType.Int32);
            parameters.Add(DBParameterName.CFRLaunchParams.CFRUserId, currentUserService.CFRUserId, DbType.Guid);
            parameters.Add(DBParameterName.CFRLaunchParams.EnvironmentName, environmentName, DbType.String);
            var result = await dapperHandler.QueryAsync<AssignedProductOutput>(StoredProc.CFRLaunch.CFRLaunchCrud, parameters, CommandType.StoredProcedure);
            return result.ToList();
        }

        #endregion GET Methods

        #region POST Methods

        /// <summary>
        /// Creates a launch authorization row using StoredProc.CFRLaunch.CFRLaunchCrud.
        /// </summary>
        /// <remarks>
        /// Purpose: Store the authorization-code hash for a user and product.
        /// Request Flow: ICFRLaunchService -> CFRLaunchRepository.CreateLaunchAsync() -> Database.
        /// Validation Details: Parameter names match stored procedure arguments.
        /// Business Logic: Binds CodeHash and InsertedBy, then executes the insert stored procedure.
        /// Repository Interaction: Executes StoredProc.CFRLaunch.CFRLaunchCrud with ActionId 2.
        /// Response Details: Returns the create row and scalar return value.
        /// </remarks>
        /// <param name="productId">Product to launch.</param>
        /// <param name="codeHash">SHA-256 hex hash of the raw authorization code.</param>
        /// <param name="environmentName">[core].[ProductEnvironment].EnvironmentName for the login environment.</param>
        /// <returns>Create result and return value.</returns>
        public async Task<(int ReturnValue, CFRLaunchCreateRow? Row)> CreateLaunchAsync(int productId, string codeHash, string environmentName)
        {
            var parameters = new DynamicParameters();
            parameters.Add(DBParameterName.CFRLaunchParams.ActionId, 2, DbType.Int32);
            parameters.Add(DBParameterName.CFRLaunchParams.CFRUserId, currentUserService.CFRUserId, DbType.Guid);
            parameters.Add(DBParameterName.CFRLaunchParams.ProductId, productId, DbType.Int32);
            parameters.Add(DBParameterName.CFRLaunchParams.CodeHash, codeHash, DbType.AnsiStringFixedLength, size: 64);
            // NOTE: InsertedBy is a bigint audit column that, pre-migration, reused the same int
            // CFRUserId value. There is no longer a bigint-shaped identity to stamp here now that
            // the member identity is a GUID (currentUserService.UserId is unset for Portal sessions)
            // -- flagged for a follow-up decision rather than stamping a meaningless 0.
            parameters.Add(DBParameterName.CFRLaunchParams.InsertedBy, currentUserService.UserId, DbType.Int64);
            parameters.Add(DBParameterName.CFRLaunchParams.EnvironmentName, environmentName, DbType.String);
            parameters.Add(DBParameterName.CFRLaunchParams.ReturnValue, dbType: DbType.Int32, direction: ParameterDirection.Output);
            var result = await dapperHandler.QueryAsync<CFRLaunchCreateRow>(StoredProc.CFRLaunch.CFRLaunchCrud, parameters, CommandType.StoredProcedure);
            return (parameters.Get<int>(DBParameterName.CFRLaunchParams.ReturnValue), result.FirstOrDefault());
        }

        /// <summary>
        /// Consumes an authorization code using StoredProc.CFRLaunch.CFRLaunchCrud.
        /// </summary>
        /// <remarks>
        /// Purpose: Validate and mark a launch code as used.
        /// Request Flow: ICFRLaunchService -> CFRLaunchRepository.ExchangeCodeAsync() -> Database.
        /// Validation Details: CodeHash and ProductId parameter mapping.
        /// Business Logic: Binds the hash and product, then executes the consume stored procedure.
        /// Repository Interaction: Executes StoredProc.CFRLaunch.CFRLaunchCrud with ActionId 3.
        /// Response Details: Returns the identity row and scalar return value.
        /// </remarks>
        /// <param name="productId">Product that is exchanging the code.</param>
        /// <param name="codeHash">SHA-256 hex hash of the raw authorization code.</param>
        /// <returns>Exchange result and return value.</returns>
        public async Task<(int ReturnValue, CFRExchangeRow? Row)> ExchangeCodeAsync(int productId, string codeHash)
        {
            var parameters = new DynamicParameters();
            parameters.Add(DBParameterName.CFRLaunchParams.ActionId, 3, DbType.Int32);
            parameters.Add(DBParameterName.CFRLaunchParams.ProductId, productId, DbType.Int32);
            parameters.Add(DBParameterName.CFRLaunchParams.CodeHash, codeHash, DbType.AnsiStringFixedLength, size: 64);
            parameters.Add(DBParameterName.CFRLaunchParams.ReturnValue, dbType: DbType.Int32, direction: ParameterDirection.Output);
            var result = await dapperHandler.QueryAsync<CFRExchangeRow>(StoredProc.CFRLaunch.CFRLaunchCrud, parameters, CommandType.StoredProcedure);
            return (parameters.Get<int>(DBParameterName.CFRLaunchParams.ReturnValue), result.FirstOrDefault());
        }

        #endregion POST Methods
    }
}
