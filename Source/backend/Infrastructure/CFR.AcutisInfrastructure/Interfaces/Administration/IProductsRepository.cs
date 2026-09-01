// Copyright (c) OptionC. All rights reserved.

namespace CFR.AcutisInfrastructure.Interfaces.Administration
{
    /// <summary>
    /// Repository interface for Product database operations used by App Hub.
    /// Repository Responsibility:
    /// - Declares SELECT operations against SQL Server via Dapper stored procedures.
    /// </summary>
    public interface IProductsRepository
    {
        #region GET Methods

        /// <summary>
        /// Retrieves hub products for a member email.
        /// </summary>
        /// <remarks>
        /// Purpose: Load the App Hub product cards from core.Product.
        /// Request Flow: IProductsService -> IProductsRepository.GetProductsListAsync() -> SQL Database.
        /// Validation Details: RequesterEmail parameter mapping.
        /// Business Logic: Directly retrieves rows without manipulation.
        /// Repository Interaction: Executes StoredProc.Administration.ProductsCrud with ActionId 4.
        /// Response Details: Returns a list of ProductOutput records.
        /// </remarks>
        /// <param name="requesterEmail">Member email used to decide Your Apps vs Available Apps.</param>
        /// <returns>A list of hub product output records.</returns>
        Task<List<ProductOutput>> GetProductsListAsync(string? requesterEmail);

        #endregion GET Methods
    }
}
