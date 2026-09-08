// Copyright (c) OptionC. All rights reserved.

using System.Text.Json.Serialization;

namespace CFR.AcutisInfrastructure.Models.Input
{
    /// <summary>
    /// Multipart form input for uploading the platform-wide email logo image (JPG or PNG).
    /// </summary>
    public class EmailLogoUploadInput
    {
        /// <summary>
        /// Gets or sets the uploaded logo image file from multipart/form-data.
        /// </summary>
        [JsonIgnore]
        public IFormFile? File { get; set; }
    }
}
