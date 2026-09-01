// Copyright (c) OptionC. All rights reserved.

namespace CFR.AcutisInfrastructure.Repositorys.Administration
{
    /// <summary>
    /// Dapper implementation of IProductsRepository for the Administration module.
    /// Infrastructure Responsibility:
    /// - Uses IDapperHandler to execute stored procedures and map results to ProductOutput.
    /// </summary>
    public class ProductsRepository(IDapperHandler dapperHandler): IProductsRepository
    {
        #region GET Methods

        /// <summary>
        /// Fetches hub product rows using StoredProc.Administration.ProductsCrud.
        /// </summary>
        /// <remarks>
        /// Purpose: Retrieve App Hub products from the database.
        /// Request Flow: IProductsService -> ProductsRepository.GetProductsListAsync() -> Database.
        /// Validation Details: RequesterEmail parameter mapping.
        /// Business Logic: Splits FeatureNames into Features.
        /// Repository Interaction: Executes StoredProc.Administration.ProductsCrud with ActionId 4.
        /// Response Details: Returns a list of ProductOutput records.
        /// </remarks>
        /// <param name="requesterEmail">Member email used to decide Your Apps vs Available Apps.</param>
        /// <returns>A list of hub product output records.</returns>
        public async Task<List<ProductOutput>> GetProductsListAsync(string? requesterEmail)
        {
            var parameters = new DynamicParameters();
            parameters.Add(DBParameterName.ProductParams.ActionId, 4, DbType.Int32);
            parameters.Add(DBParameterName.ProductParams.RequesterEmail, string.IsNullOrWhiteSpace(requesterEmail) ? null : requesterEmail.Trim(), DbType.String);
            var result = await dapperHandler.QueryAsync<ProductOutput>(StoredProc.Administration.ProductsCrud, parameters, CommandType.StoredProcedure);
            var list = result.ToList();
            foreach (var product in list)
            {
                product.Features = string.IsNullOrWhiteSpace(product.FeatureNames)
                    ? []
                    : product.FeatureNames.Split('|', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries).ToList();
            }

            return list;
        }

        #endregion GET Methods
    }
}
