// Copyright (c) OptionC. All rights reserved.

namespace CFR.AcutisService.Service.Products
{
    /// <summary>
    /// Implements Products business logic for list, get by id, save, update, and soft delete operations.
    /// Repository Responsibility:
    /// - Invokes IProductsRepository for database querying on Core.Product.
    /// </summary>
    public class ProductsService(IProductsRepository repository, IFileHandlerService fileHandler, ILogger<ProductsService> logger): IProductsService
    {
        #region GET Methods

        /// <summary>
        /// Retrieves all registered products from Core.Product.
        /// </summary>
        /// <remarks>
        /// Purpose: Fetch the products list from Core.Product.
        /// Request Flow: ProductsController -> ProductsService.GetProductsListAsync() -> IProductsRepository.GetProductsListAsync().
        /// Validation Details: Handles null/empty checks and error handling.
        /// Business Logic: Wraps the typed list in MSResultArgs.
        /// Repository Interaction: Calls IProductsRepository.GetProductsListAsync().
        /// Response Details: MSResultArgs containing List of ProductOutput.
        /// </remarks>
        /// <returns>MSResultArgs containing the products list.</returns>
        public async Task<MSResultArgs> GetProductsListAsync()
        {
            var result = new MSResultArgs();
            try
            {
                var data = await repository.GetProductsListAsync();
                result.ResultData = data ?? [];
            }
            catch (Exception ex)
            {
                AppLogger.LogError(logger, ex, SerilogErrorMessages.AcutisLogMessages.FetchProductsFailed);
                result.StatusCode = ErrorCodes.InternalServerError;
                result.StatusMessage = ErrorMessages.InternalServerError;
            }

            return result;
        }

        /// <summary>
        /// Retrieves one product by identifier from Core.Product.
        /// </summary>
        /// <remarks>
        /// Purpose: Fetch a single product by its primary key.
        /// Request Flow: ProductsController -> ProductsService.GetProductByIdAsync() -> IProductsRepository.GetProductByIdAsync().
        /// Validation Details: ProductId must be greater than zero.
        /// Business Logic: Wraps the typed record in MSResultArgs or returns NoRecordFound.
        /// Repository Interaction: Calls IProductsRepository.GetProductByIdAsync().
        /// Response Details: MSResultArgs containing ProductOutput or NoRecordFound.
        /// </remarks>
        /// <param name="productId">Product identifier.</param>
        /// <returns>MSResultArgs containing the product.</returns>
        public async Task<MSResultArgs> GetProductByIdAsync(int productId)
        {
            var result = new MSResultArgs();
            try
            {
                if (productId <= 0)
                {
                    result.StatusCode = ErrorCodes.BadRequest;
                    result.StatusMessage = ErrorMessages.BadRequest;
                    return result;
                }

                var data = await repository.GetProductByIdAsync(productId);
                if (data == null)
                {
                    result.StatusCode = ErrorCodes.NoRecordFound;
                    result.StatusMessage = ErrorMessages.NoRecordFound;
                    return result;
                }

                result.ResultData = data;
            }
            catch (Exception ex)
            {
                AppLogger.LogError(logger, ex, SerilogErrorMessages.AcutisLogMessages.FetchProductByIdFailed, productId);
                result.StatusCode = ErrorCodes.InternalServerError;
                result.StatusMessage = ErrorMessages.InternalServerError;
            }

            return result;
        }

        /// <summary>
        /// Retrieves license records for a specific product from lic.License and lic.OrganizationProduct.
        /// </summary>
        /// <remarks>
        /// Purpose: Fetch product license details for the Product Details License tab.
        /// Request Flow: ProductsController -> ProductsService.GetLicenseDetailsAsync() -> IProductsRepository.GetLicenseDetailsAsync().
        /// Validation Details: ProductId must be greater than zero.
        /// Business Logic: Wraps the typed license list in MSResultArgs.
        /// Repository Interaction: Calls IProductsRepository.GetLicenseDetailsAsync().
        /// Response Details: MSResultArgs containing List of ProductLicenseOutput.
        /// </remarks>
        /// <param name="productId">Product identifier.</param>
        /// <returns>MSResultArgs containing the product license records list.</returns>
        public async Task<MSResultArgs> GetLicenseDetailsAsync(int productId)
        {
            var result = new MSResultArgs();
            try
            {
                if (productId <= 0)
                {
                    result.StatusCode = ErrorCodes.BadRequest;
                    result.StatusMessage = ErrorMessages.BadRequest;
                    return result;
                }

                var data = await repository.GetLicenseDetailsAsync(productId);
                result.ResultData = data ?? [];
            }
            catch (Exception ex)
            {
                AppLogger.LogError(logger, ex, SerilogErrorMessages.AcutisLogMessages.FetchProductLicensesFailed, productId);
                result.StatusCode = ErrorCodes.InternalServerError;
                result.StatusMessage = ErrorMessages.InternalServerError;
            }

            return result;
        }

        /// <summary>
        /// Retrieves a single license by identifier from lic.License.
        /// </summary>
        /// <remarks>
        /// Purpose: Fetch a specific license for view or edit.
        /// Request Flow: ProductsController -> ProductsService.GetLicenseByIdAsync() -> IProductsRepository.GetLicenseByIdAsync().
        /// Validation Details: LicenseId must be greater than zero.
        /// Business Logic: Wraps the typed record in MSResultArgs or returns NoRecordFound.
        /// Repository Interaction: Calls IProductsRepository.GetLicenseByIdAsync().
        /// Response Details: MSResultArgs containing ProductLicenseOutput or NoRecordFound.
        /// </remarks>
        /// <param name="licenseId">License identifier.</param>
        /// <returns>MSResultArgs containing the license record.</returns>
        public async Task<MSResultArgs> GetLicenseByIdAsync(long licenseId)
        {
            var result = new MSResultArgs();
            try
            {
                if (licenseId <= 0)
                {
                    result.StatusCode = ErrorCodes.BadRequest;
                    result.StatusMessage = ErrorMessages.BadRequest;
                    return result;
                }

                var data = await repository.GetLicenseByIdAsync(licenseId);
                if (data == null)
                {
                    result.StatusCode = ErrorCodes.NoRecordFound;
                    result.StatusMessage = ErrorMessages.NoRecordFound;
                    return result;
                }

                result.ResultData = data;
            }
            catch (Exception ex)
            {
                AppLogger.LogError(logger, ex, SerilogErrorMessages.AcutisLogMessages.FetchLicenseByIdFailed, licenseId);
                result.StatusCode = ErrorCodes.InternalServerError;
                result.StatusMessage = ErrorMessages.InternalServerError;
            }

            return result;
        }

        /// <summary>
        /// Retrieves product customers from [core].[Organization] for a specific product.
        /// </summary>
        /// <remarks>
        /// Purpose: Fetch organization rows assigned to the product for the Customers tab.
        /// Request Flow: ProductsController -> ProductsService.GetProductCustomersAsync() -> IProductsRepository.GetProductCustomersAsync().
        /// Validation Details: ProductId must be greater than zero.
        /// Business Logic: Wraps the typed customer list in MSResultArgs.
        /// Repository Interaction: Calls IProductsRepository.GetProductCustomersAsync().
        /// Response Details: MSResultArgs containing List of ProductCustomerOutput.
        /// </remarks>
        /// <param name="productId">Product identifier.</param>
        /// <returns>MSResultArgs containing the product customer records list.</returns>
        public async Task<MSResultArgs> GetProductCustomersAsync(int productId)
        {
            var result = new MSResultArgs();
            try
            {
                if (productId <= 0)
                {
                    result.StatusCode = ErrorCodes.BadRequest;
                    result.StatusMessage = ErrorMessages.BadRequest;
                    return result;
                }

                var data = await repository.GetProductCustomersAsync(productId);
                result.ResultData = data ?? [];
            }
            catch (Exception ex)
            {
                AppLogger.LogError(logger, ex, SerilogErrorMessages.AcutisLogMessages.FetchOrganizationsFailed);
                result.StatusCode = ErrorCodes.InternalServerError;
                result.StatusMessage = ErrorMessages.InternalServerError;
            }

            return result;
        }

        /// <summary>
        /// Retrieves a product logo image from local storage.
        /// </summary>
        /// <remarks>
        /// Purpose: Stream a previously uploaded product logo so the admin UI can display it.
        /// Request Flow: ProductsController -> ProductsService.GetProductLogoAsync() -> IFileHandlerService.GetFile().
        /// Validation Details: fileName must be a jpg/jpeg/png name with no directory segments.
        /// Business Logic: Reads bytes via IFileHandlerService from AppSettings:ProductLogoPath.
        /// Repository Interaction: None (file storage only).
        /// Response Details: MSResultArgs containing the image byte array.
        /// </remarks>
        /// <param name="fileName">Stored logo file name.</param>
        /// <returns>MSResultArgs containing the image bytes.</returns>
        public async Task<MSResultArgs> GetProductLogoAsync(string fileName)
        {
            var result = new MSResultArgs();
            try
            {
                string safeName = Path.GetFileName(fileName ?? string.Empty);
                var extension = Path.GetExtension(safeName).ToLowerInvariant();
                if (string.IsNullOrWhiteSpace(safeName) || (extension != ".jpg" && extension != ".jpeg" && extension != ".png"))
                {
                    result.StatusCode = ErrorCodes.BadRequest;
                    result.StatusMessage = ErrorMessages.BadRequest;
                    return result;
                }

                byte[]? fileBytes = fileHandler.GetFile(GetProductLogoRelativePath(), safeName);
                if (fileBytes == null || fileBytes.Length == 0)
                {
                    result.StatusCode = ErrorCodes.NoRecordFound;
                    result.StatusMessage = ErrorMessages.NoRecordFound;
                    return result;
                }

                result.ResultData = fileBytes;
                await Task.CompletedTask;
            }
            catch (Exception ex)
            {
                AppLogger.LogError(logger, ex, SerilogErrorMessages.AcutisLogMessages.FetchProductLogoFailed);
                result.StatusCode = ErrorCodes.InternalServerError;
                result.StatusMessage = ErrorMessages.InternalServerError;
            }

            return result;
        }

        #endregion GET Methods

        #region POST Methods

        /// <summary>
        /// Validates and saves an uploaded product logo image (JPG or PNG, max 2MB).
        /// </summary>
        /// <remarks>
        /// Purpose: Store product logo under wwwroot/Acutis/Attachment/Products via IFileHandlerService.
        /// Request Flow: ProductsController -> ProductsService.UploadProductLogoAsync() -> IFileHandlerService.
        /// Validation Details: File is required, max 2 MB, extensions .jpg/.jpeg/.png only.
        /// Business Logic: Saves using AppStrings:GatewayRoot + AppSettings:ProductLogoPath.
        /// Repository Interaction: None (file storage only).
        /// Response Details: MSResultArgs containing relative URL path (/Acutis/Attachment/Products/{fileName}).
        /// </remarks>
        /// <param name="file">Uploaded image file from multipart form data.</param>
        /// <returns>MSResultArgs containing relative accessible URL path.</returns>
        public async Task<MSResultArgs> UploadProductLogoAsync(IFormFile file)
        {
            var result = new MSResultArgs();
            try
            {
                if (file == null || file.Length == 0)
                {
                    result.StatusCode = ErrorCodes.BadRequest;
                    result.StatusMessage = ErrorMessages.ProductLogoFileRequired;
                    return result;
                }

                const long maxFileSize = 2 * 1024 * 1024;
                if (file.Length > maxFileSize)
                {
                    result.StatusCode = ErrorCodes.BadRequest;
                    result.StatusMessage = ErrorMessages.ProductLogoFileTooLarge;
                    return result;
                }

                var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
                var allowedExtensions = new[] { ".jpg", ".jpeg", ".png" };
                if (!allowedExtensions.Contains(extension))
                {
                    result.StatusCode = ErrorCodes.BadRequest;
                    result.StatusMessage = ErrorMessages.ProductLogoInvalidType;
                    return result;
                }

                string relativeDirectory = GetProductLogoRelativePath();
                string rawName = Path.GetFileNameWithoutExtension(file.FileName);
                string safeName = string.Concat(rawName.Select(c => char.IsLetterOrDigit(c) || c == '_' || c == '-' ? c : '_')).Trim('_');
                if (string.IsNullOrWhiteSpace(safeName))
                {
                    safeName = "logo";
                }

                string uniquePrefix = $"{safeName}_{Guid.NewGuid().ToString("N")[..8]}";
                string savedPath = fileHandler.SaveUniqueFile(file, relativeDirectory, uniquePrefix);
                string fileName = Path.GetFileName(savedPath);
                result.ResultData = fileName;
                await Task.CompletedTask;
            }
            catch (Exception ex)
            {
                AppLogger.LogError(logger, ex, SerilogErrorMessages.AcutisLogMessages.UploadProductLogoFailed);
                result.StatusCode = ErrorCodes.InternalServerError;
                result.StatusMessage = ErrorMessages.InternalServerError;
            }

            return result;
        }

        /// <summary>
        /// Creates a new product license in lic.License and lic.OrganizationProduct.
        /// </summary>
        /// <remarks>
        /// Purpose: Create new license record.
        /// Request Flow: ProductsController -> ProductsService.CreateLicenseAsync() -> IProductsRepository.CreateLicenseAsync().
        /// Validation Details: OrgId and ProductId must be positive (or OrganizationProductId > 0).
        /// Business Logic: Inserts a new license unless an active or upcoming license already exists for the customer.
        /// Repository Interaction: Calls IProductsRepository.CreateLicenseAsync.
        /// Response Details: MSResultArgs containing the created LicenseId, or Conflict when a license already exists.
        /// </remarks>
        /// <param name="input">Input DTO containing new license details.</param>
        /// <returns>MSResultArgs containing the created LicenseId.</returns>
        public async Task<MSResultArgs> CreateLicenseAsync(ProductLicenseInput input)
        {
            var result = new MSResultArgs();
            try
            {
                if (input == null || (input.OrganizationProductId <= 0 && (input.OrgId <= 0 || input.ProductId <= 0)))
                {
                    result.StatusCode = ErrorCodes.BadRequest;
                    result.StatusMessage = ErrorMessages.BadRequest;
                    return result;
                }

                long createdId = await repository.CreateLicenseAsync(input);
                if (createdId == -95)
                {
                    result.StatusCode = ErrorCodes.BadRequest;
                    result.StatusMessage = "Invalid Organization or Product for license creation.";
                    return result;
                }

                if (createdId == -99)
                {
                    result.StatusCode = ErrorCodes.Conflict;
                    result.StatusMessage = ErrorMessages.ExistLicense;
                    return result;
                }

                if (createdId <= 0)
                {
                    result.StatusCode = ErrorCodes.Failed;
                    result.StatusMessage = ErrorMessages.Failed;
                    return result;
                }

                result.ResultData = createdId;
            }
            catch (Exception ex)
            {
                AppLogger.LogError(logger, ex, SerilogErrorMessages.AcutisLogMessages.CreateLicenseFailed);
                result.StatusCode = ErrorCodes.InternalServerError;
                result.StatusMessage = ErrorMessages.InternalServerError;
            }

            return result;
        }

        #endregion POST Methods

        #region PUT Methods

        /// <summary>
        /// Updates an existing product in Core.Product.
        /// </summary>
        /// <remarks>
        /// Purpose: Update editable product fields.
        /// Request Flow: ProductsController -> ProductsService.UpdateProductAsync() -> IProductsRepository.UpdateProductAsync().
        /// Validation Details: ProductId must be positive and ProductName cannot be empty.
        /// Business Logic: Validates product existence, checks for duplicate name, and updates record.
        /// Repository Interaction: Calls IProductsRepository.UpdateProductAsync.
        /// Response Details: MSResultArgs containing the updated ProductId.
        /// </remarks>
        /// <param name="input">Input DTO containing updated product details.</param>
        /// <returns>MSResultArgs containing the updated ProductId.</returns>
        public async Task<MSResultArgs> UpdateProductAsync(ProductInput input)
        {
            var result = new MSResultArgs();
            try
            {
                if (input == null || input.ProductId <= 0 || string.IsNullOrWhiteSpace(input.ProductName))
                {
                    result.StatusCode = ErrorCodes.BadRequest;
                    result.StatusMessage = ErrorMessages.BadRequest;
                    return result;
                }

                string? candidateLogo = !string.IsNullOrWhiteSpace(input.LogoName) ? input.LogoName : input.LogoUrl;
                string? cleanLogo = !string.IsNullOrWhiteSpace(candidateLogo)
                    ? Path.GetFileName(candidateLogo.Trim().Replace('\\', '/'))
                    : null;
                input.LogoName = cleanLogo;
                input.LogoUrl = cleanLogo;

                var existingProduct = await repository.GetProductByIdAsync(input.ProductId);
                if (existingProduct != null)
                {
                    input.SubCategoryName ??= existingProduct.SubCategoryName;
                    input.ProdDescription ??= existingProduct.ProdDescription;
                    input.ExternalPageUrl ??= existingProduct.ExternalPageUrl;
                    string? existingLogo = !string.IsNullOrWhiteSpace(existingProduct.LogoName) ? existingProduct.LogoName : existingProduct.LogoUrl;
                    if (cleanLogo == null && existingLogo != null)
                    {
                        input.LogoName = Path.GetFileName(existingLogo.Replace('\\', '/'));
                        input.LogoUrl = input.LogoName;
                    }
                    input.ContactPerson ??= existingProduct.ContactPerson;
                    if (input.DefaultAccessDays <= 0)
                    {
                        input.DefaultAccessDays = existingProduct.DefaultAccessDays > 0 ? existingProduct.DefaultAccessDays : 365;
                    }
                }

                int updatedId = await repository.UpdateProductAsync(input);
                if (updatedId == -95)
                {
                    result.StatusCode = ErrorCodes.NotFound;
                    result.StatusMessage = ErrorMessages.ProductNotFound;
                    return result;
                }

                if (updatedId == -99)
                {
                    result.StatusCode = ErrorCodes.Conflict;
                    result.StatusMessage = ErrorMessages.ExistProduct;
                    return result;
                }

                if (updatedId <= 0)
                {
                    result.StatusCode = ErrorCodes.Failed;
                    result.StatusMessage = ErrorMessages.Failed;
                    return result;
                }

                // Safely clean up previous logo file if it was replaced or removed
                string? prevLogo = existingProduct != null
                    ? (!string.IsNullOrWhiteSpace(existingProduct.LogoName) ? existingProduct.LogoName : existingProduct.LogoUrl)
                    : null;
                if (!string.IsNullOrWhiteSpace(prevLogo) && !string.Equals(Path.GetFileName(prevLogo), input.LogoName, StringComparison.OrdinalIgnoreCase))
                {
                    TryDeleteLocalFile(prevLogo);
                }

                result.ResultData = input.ProductId;
            }
            catch (Exception ex)
            {
                AppLogger.LogError(logger, ex, SerilogErrorMessages.AcutisLogMessages.UpdateProductFailed, input?.ProductId);
                result.StatusCode = ErrorCodes.InternalServerError;
                result.StatusMessage = ErrorMessages.InternalServerError;
            }

            return result;
        }

        /// <summary>
        /// Updates an existing license in lic.License and lic.OrganizationProduct.
        /// </summary>
        /// <remarks>
        /// Purpose: Update editable license fields and assignment status.
        /// Request Flow: ProductsController -> ProductsService.UpdateLicenseAsync() -> IProductsRepository.UpdateLicenseAsync().
        /// Validation Details: LicenseId must be greater than zero.
        /// Business Logic: Validates license existence and updates record.
        /// Repository Interaction: Calls IProductsRepository.UpdateLicenseAsync.
        /// Response Details: MSResultArgs containing the updated LicenseId.
        /// </remarks>
        /// <param name="input">Input DTO containing updated license details.</param>
        /// <returns>MSResultArgs containing the updated LicenseId.</returns>
        public async Task<MSResultArgs> UpdateLicenseAsync(ProductLicenseInput input)
        {
            var result = new MSResultArgs();
            try
            {
                if (input == null || input.LicenseId <= 0)
                {
                    result.StatusCode = ErrorCodes.BadRequest;
                    result.StatusMessage = ErrorMessages.BadRequest;
                    return result;
                }

                long updatedId = await repository.UpdateLicenseAsync(input);
                if (updatedId == -95)
                {
                    result.StatusCode = ErrorCodes.NotFound;
                    result.StatusMessage = "License not found.";
                    return result;
                }

                if (updatedId <= 0)
                {
                    result.StatusCode = ErrorCodes.Failed;
                    result.StatusMessage = ErrorMessages.Failed;
                    return result;
                }

                result.ResultData = input.LicenseId;
            }
            catch (Exception ex)
            {
                AppLogger.LogError(logger, ex, SerilogErrorMessages.AcutisLogMessages.UpdateLicenseFailed, input?.LicenseId);
                result.StatusCode = ErrorCodes.InternalServerError;
                result.StatusMessage = ErrorMessages.InternalServerError;
            }

            return result;
        }

        #endregion PUT Methods

        #region Private Helper Methods

        private static string GetProductLogoRelativePath()
        {
            return Path.Combine("Acutis", "Attachment", "Products");
        }

        private void TryDeleteLocalFile(string? relativeUrl)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(relativeUrl))
                {
                    return;
                }

                string fileName = Path.GetFileName(relativeUrl.Replace('\\', '/'));
                if (string.IsNullOrWhiteSpace(fileName))
                {
                    return;
                }

                _ = fileHandler.DeleteFile(Path.Combine(GetProductLogoRelativePath(), fileName));
            }
            catch (Exception ex)
            {
                AppLogger.LogError(logger, ex, SerilogErrorMessages.AcutisLogMessages.DeleteProductLogoFailed, relativeUrl);
            }
        }

        #endregion Private Helper Methods
    }
}
