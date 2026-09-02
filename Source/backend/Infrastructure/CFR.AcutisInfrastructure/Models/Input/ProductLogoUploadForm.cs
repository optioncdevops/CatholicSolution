// Copyright (c) OptionC. All rights reserved.

using Microsoft.AspNetCore.Http;

namespace CFR.AcutisInfrastructure.Models.Input
{
    /// <summary>
    /// Multipart form payload for uploading a product logo image.
    /// </summary>
    /// <remarks>
    /// Purpose: Bind the logo file from multipart/form-data for UploadProductLogo.
    /// Request Flow: Client multipart POST -> ProductsController.UploadProductLogo -> IProductsService.UploadProductLogoAsync.
    /// Validation Details: File is required; type and size are validated in the service.
    /// Business Logic: None; transport wrapper for IFormFile.
    /// Response Details: Not returned; used only as request input.
    /// </remarks>
    public sealed class ProductLogoUploadForm
    {
        /// <summary>
        /// Gets or sets the logo image (JPG or PNG, max 2 MB).
        /// </summary>
        public IFormFile File { get; set; } = null!;
    }
}
