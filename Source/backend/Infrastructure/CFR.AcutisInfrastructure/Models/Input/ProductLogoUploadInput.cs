// Copyright (c) OptionC. All rights reserved.

using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace CFR.AcutisInfrastructure.Models.Input
{
    /// <summary>
    /// Input DTO used to update a product logo image.
    /// Bound from multipart/form-data on PUT /api/v1/Products/UpdateProductLogo.
    /// </summary>
    public class ProductLogoUploadInput
    {
        /// <summary>
        /// Gets or sets the product identifier.
        /// </summary>
        [Required]
        public int ProductId { get; set; }

        /// <summary>
        /// Gets or sets the logo image file (JPG, JPEG, or PNG, max 2MB).
        /// </summary>
        [Required]
        public IFormFile? File { get; set; }
    }
}
