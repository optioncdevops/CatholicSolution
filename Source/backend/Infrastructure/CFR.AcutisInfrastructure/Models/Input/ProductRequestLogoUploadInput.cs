// Copyright (c) OptionC. All rights reserved.

using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace CFR.AcutisInfrastructure.Models.Input
{
    /// <summary>
    /// Input DTO used to upload a proposed product's logo image ahead of a public "Suggest a
    /// product" submission. Bound from multipart/form-data on
    /// POST /api/v1/ProductRequest/UploadProductRequestLogo.
    /// </summary>
    public class ProductRequestLogoUploadInput
    {
        /// <summary>
        /// Gets or sets the logo image file (JPG, JPEG, or PNG, max 2MB).
        /// </summary>
        [Required]
        public IFormFile? File { get; set; }
    }
}
