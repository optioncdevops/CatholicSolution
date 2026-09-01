// Copyright (c) OptionC. All rights reserved.

namespace CFR.AcutisService.Service.Organization
{
    /// <summary>
    /// Implements Organization business logic for list, get, and update.
    /// Repository Responsibility:
    /// - Invokes IOrganizationRepository for stored procedure execution.
    /// </summary>
    public class OrganizationService(
        IOrganizationRepository repository,
        ICurrentUserService currentUserService,
        ILogger<OrganizationService> logger): IOrganizationService
    {
        #region GET Methods

        /// <summary>
        /// Retrieves all organizations.
        /// </summary>
        /// <remarks>
        /// Purpose: Fetch the organization list.
        /// Request Flow: OrganizationController -> OrganizationService.GetOrganizationsListAsync() -> IOrganizationRepository.GetOrganizationsListAsync().
        /// Validation Details: Service checks for an empty or null result set.
        /// Business Logic: Wraps the typed list in MSResultArgs.
        /// Repository Interaction: Calls IOrganizationRepository.GetOrganizationsListAsync().
        /// Response Details: MSResultArgs containing List of OrganizationOutput, or NoRecordFound.
        /// </remarks>
        /// <returns>MSResultArgs containing the organization list.</returns>
        public async Task<MSResultArgs> GetOrganizationsListAsync()
        {
            var result = new MSResultArgs();
            try
            {
                var data = await repository.GetOrganizationsListAsync();
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
        /// Retrieves one organization by identifier.
        /// </summary>
        /// <remarks>
        /// Purpose: Fetch an organization for the edit form.
        /// Request Flow: OrganizationController -> OrganizationService.GetOrganizationByIdAsync() -> IOrganizationRepository.GetOrganizationByIdAsync().
        /// Validation Details: Identifier must be a positive integer.
        /// Business Logic: Wraps the typed record in MSResultArgs.
        /// Repository Interaction: Calls IOrganizationRepository.GetOrganizationByIdAsync().
        /// Response Details: MSResultArgs containing OrganizationOutput, or NoRecordFound.
        /// </remarks>
        /// <param name="orgId">Organization identifier.</param>
        /// <returns>MSResultArgs containing the organization.</returns>
        public async Task<MSResultArgs> GetOrganizationByIdAsync(long orgId)
        {
            var result = new MSResultArgs();
            try
            {
                if (orgId <= 0)
                {
                    result.StatusCode = ErrorCodes.BadRequest;
                    result.StatusMessage = ErrorMessages.BadRequest;
                    return result;
                }

                var data = await repository.GetOrganizationByIdAsync(orgId);
                if (data == null)
                {
                    result.StatusCode = ErrorCodes.NoRecordFound;
                    result.StatusMessage = ErrorMessages.OrganizationNotFound;
                    return result;
                }

                result.ResultData = data;
            }
            catch (Exception ex)
            {
                AppLogger.LogError(logger, ex, SerilogErrorMessages.AcutisLogMessages.FetchOrganizationByIdFailed, orgId);
                result.StatusCode = ErrorCodes.InternalServerError;
                result.StatusMessage = ErrorMessages.InternalServerError;
            }

            return result;
        }

        /// <summary>
        /// Retrieves the real users linked to an organization.
        /// </summary>
        /// <remarks>
        /// Purpose: Populate the Users section of the organization detail page.
        /// Request Flow: OrganizationController -> OrganizationService.GetOrganizationUsersAsync() -> IOrganizationRepository.GetOrganizationUsersAsync().
        /// Validation Details: Identifier must be a positive integer.
        /// Business Logic: Wraps the typed list in MSResultArgs.
        /// Repository Interaction: Calls IOrganizationRepository.GetOrganizationUsersAsync().
        /// Response Details: MSResultArgs containing List of OrganizationUserOutput, or NoRecordFound.
        /// </remarks>
        /// <param name="orgId">Organization identifier.</param>
        /// <returns>MSResultArgs containing the linked users.</returns>
        public async Task<MSResultArgs> GetOrganizationUsersAsync(long orgId)
        {
            var result = new MSResultArgs();
            try
            {
                if (orgId <= 0)
                {
                    result.StatusCode = ErrorCodes.BadRequest;
                    result.StatusMessage = ErrorMessages.BadRequest;
                    return result;
                }

                var data = await repository.GetOrganizationUsersAsync(orgId);
                result.ResultData = data ?? [];
            }
            catch (Exception ex)
            {
                AppLogger.LogError(logger, ex, SerilogErrorMessages.AcutisLogMessages.FetchOrganizationUsersFailed, orgId);
                result.StatusCode = ErrorCodes.InternalServerError;
                result.StatusMessage = ErrorMessages.InternalServerError;
            }

            return result;
        }

        /// <summary>
        /// Retrieves the real products assigned to an organization.
        /// </summary>
        /// <remarks>
        /// Purpose: Populate the Products section of the organization detail page.
        /// Request Flow: OrganizationController -> OrganizationService.GetOrganizationProductsAsync() -> IOrganizationRepository.GetOrganizationProductsAsync().
        /// Validation Details: Identifier must be a positive integer.
        /// Business Logic: Wraps the typed list in MSResultArgs.
        /// Repository Interaction: Calls IOrganizationRepository.GetOrganizationProductsAsync().
        /// Response Details: MSResultArgs containing List of OrganizationProductOutput, or NoRecordFound.
        /// </remarks>
        /// <param name="orgId">Organization identifier.</param>
        /// <returns>MSResultArgs containing the assigned products.</returns>
        public async Task<MSResultArgs> GetOrganizationProductsAsync(long orgId)
        {
            var result = new MSResultArgs();
            try
            {
                if (orgId <= 0)
                {
                    result.StatusCode = ErrorCodes.BadRequest;
                    result.StatusMessage = ErrorMessages.BadRequest;
                    return result;
                }

                var data = await repository.GetOrganizationProductsAsync(orgId);
                result.ResultData = data ?? [];
            }
            catch (Exception ex)
            {
                AppLogger.LogError(logger, ex, SerilogErrorMessages.AcutisLogMessages.FetchOrganizationProductsFailed, orgId);
                result.StatusCode = ErrorCodes.InternalServerError;
                result.StatusMessage = ErrorMessages.InternalServerError;
            }

            return result;
        }

        /// <summary>
        /// Retrieves the products not yet assigned to an organization.
        /// </summary>
        /// <remarks>
        /// Purpose: Populate the assign-product dropdown on the Products tab.
        /// Request Flow: OrganizationController -> OrganizationService.GetAssignableProductsAsync() -> IOrganizationRepository.GetAssignableProductsAsync().
        /// Validation Details: Identifier must be a positive integer.
        /// Business Logic: Wraps the typed list in MSResultArgs.
        /// Repository Interaction: Calls IOrganizationRepository.GetAssignableProductsAsync().
        /// Response Details: MSResultArgs containing List of ProductLookupOutput, or NoRecordFound.
        /// </remarks>
        /// <param name="orgId">Organization identifier.</param>
        /// <returns>MSResultArgs containing the assignable products.</returns>
        public async Task<MSResultArgs> GetAssignableProductsAsync(long orgId)
        {
            var result = new MSResultArgs();
            try
            {
                if (orgId <= 0)
                {
                    result.StatusCode = ErrorCodes.BadRequest;
                    result.StatusMessage = ErrorMessages.BadRequest;
                    return result;
                }

                var data = await repository.GetAssignableProductsAsync(orgId);
                result.ResultData = data ?? [];
            }
            catch (Exception ex)
            {
                AppLogger.LogError(logger, ex, SerilogErrorMessages.AcutisLogMessages.FetchAssignableProductsFailed, orgId);
                result.StatusCode = ErrorCodes.InternalServerError;
                result.StatusMessage = ErrorMessages.InternalServerError;
            }

            return result;
        }

        #endregion GET Methods

        #region POST Methods

        /// <summary>
        /// Creates a new organization.
        /// </summary>
        /// <remarks>
        /// Purpose: Add a new organization from the Add Organization page.
        /// Request Flow: OrganizationController -> OrganizationService.CreateOrganizationAsync() -> IOrganizationRepository.CreateOrganizationAsync().
        /// Validation Details: Input DTO is required; OrgName and OrgStatus must not be empty.
        /// Business Logic: Passes the signed-in user id as InsertedBy and wraps the scalar result.
        /// Repository Interaction: Calls IOrganizationRepository.CreateOrganizationAsync().
        /// Response Details: MSResultArgs containing the new organization identifier.
        /// </remarks>
        /// <param name="input">Input DTO containing the new organization's fields.</param>
        /// <returns>MSResultArgs containing the create status.</returns>
        public async Task<MSResultArgs> CreateOrganizationAsync(CreateOrganizationInput input)
        {
            var result = new MSResultArgs();
            try
            {
                if (input == null || string.IsNullOrWhiteSpace(input.OrgName) || string.IsNullOrWhiteSpace(input.OrgStatus))
                {
                    result.StatusCode = ErrorCodes.BadRequest;
                    result.StatusMessage = ErrorMessages.BadRequest;
                    return result;
                }

                int newId = await repository.CreateOrganizationAsync(input, currentUserService.UserId);
                result.StatusCode = ErrorCodes.Created;
                result.StatusMessage = ErrorMessages.OrganizationCreated;
                result.ResultData = newId;
            }
            catch (Exception ex)
            {
                AppLogger.LogError(logger, ex, SerilogErrorMessages.AcutisLogMessages.CreateOrganizationFailed);
                result.StatusCode = ErrorCodes.InternalServerError;
                result.StatusMessage = ErrorMessages.InternalServerError;
            }

            return result;
        }

        /// <summary>
        /// Assigns a product to an organization.
        /// </summary>
        /// <remarks>
        /// Purpose: Give an organization access to a product from the Products tab.
        /// Request Flow: OrganizationController -> OrganizationService.AssignOrganizationProductAsync() -> IOrganizationRepository.AssignOrganizationProductAsync().
        /// Validation Details: Input DTO is required; OrgId and ProductId must be positive.
        /// Business Logic: Passes the signed-in user id as UpdatedBy; -98 from the repository means already assigned.
        /// Repository Interaction: Calls IOrganizationRepository.AssignOrganizationProductAsync().
        /// Response Details: MSResultArgs containing the product identifier, or a conflict status when already assigned.
        /// </remarks>
        /// <param name="input">Input DTO containing the organization and product identifiers.</param>
        /// <returns>MSResultArgs containing the assign status.</returns>
        public async Task<MSResultArgs> AssignOrganizationProductAsync(AssignOrganizationProductInput input)
        {
            var result = new MSResultArgs();
            try
            {
                if (input == null || input.OrgId <= 0 || input.ProductId <= 0)
                {
                    result.StatusCode = ErrorCodes.BadRequest;
                    result.StatusMessage = ErrorMessages.BadRequest;
                    return result;
                }

                int productId = await repository.AssignOrganizationProductAsync(input, currentUserService.UserId);
                if (productId == -98)
                {
                    result.StatusCode = ErrorCodes.Conflict;
                    result.StatusMessage = ErrorMessages.ProductAlreadyAssigned;
                    return result;
                }

                result.StatusCode = ErrorCodes.Created;
                result.StatusMessage = ErrorMessages.ProductAssigned;
                result.ResultData = productId;
            }
            catch (Exception ex)
            {
                AppLogger.LogError(logger, ex, SerilogErrorMessages.AcutisLogMessages.AssignOrganizationProductFailed, input?.OrgId);
                result.StatusCode = ErrorCodes.InternalServerError;
                result.StatusMessage = ErrorMessages.InternalServerError;
            }

            return result;
        }

        #endregion POST Methods

        #region DELETE Methods

        /// <summary>
        /// Removes a product assignment from an organization.
        /// </summary>
        /// <remarks>
        /// Purpose: Revoke an organization's access to a product from the Products tab.
        /// Request Flow: OrganizationController -> OrganizationService.RemoveOrganizationProductAsync() -> IOrganizationRepository.RemoveOrganizationProductAsync().
        /// Validation Details: OrgId and ProductId must be positive.
        /// Business Logic: Passes the signed-in user id as UpdatedBy; -99 from the repository means not assigned.
        /// Repository Interaction: Calls IOrganizationRepository.RemoveOrganizationProductAsync().
        /// Response Details: MSResultArgs containing the product identifier, or NoRecordFound when not assigned.
        /// </remarks>
        /// <param name="orgId">Organization identifier.</param>
        /// <param name="productId">Product identifier to remove.</param>
        /// <returns>MSResultArgs containing the remove status.</returns>
        public async Task<MSResultArgs> RemoveOrganizationProductAsync(long orgId, int productId)
        {
            var result = new MSResultArgs();
            try
            {
                if (orgId <= 0 || productId <= 0)
                {
                    result.StatusCode = ErrorCodes.BadRequest;
                    result.StatusMessage = ErrorMessages.BadRequest;
                    return result;
                }

                int removedId = await repository.RemoveOrganizationProductAsync(orgId, productId, currentUserService.UserId);
                if (removedId == -99)
                {
                    result.StatusCode = ErrorCodes.NoRecordFound;
                    result.StatusMessage = ErrorMessages.ProductNotAssigned;
                    return result;
                }

                result.StatusMessage = ErrorMessages.ProductRemoved;
                result.ResultData = removedId;
            }
            catch (Exception ex)
            {
                AppLogger.LogError(logger, ex, SerilogErrorMessages.AcutisLogMessages.RemoveOrganizationProductFailed, orgId);
                result.StatusCode = ErrorCodes.InternalServerError;
                result.StatusMessage = ErrorMessages.InternalServerError;
            }

            return result;
        }

        #endregion DELETE Methods

        #region PUT Methods

        /// <summary>
        /// Updates an organization's name, status, and contact email.
        /// </summary>
        /// <remarks>
        /// Purpose: Save changes to an organization's core identity fields.
        /// Request Flow: OrganizationController -> OrganizationService.UpdateOrganizationAsync() -> IOrganizationRepository.UpdateOrganizationAsync().
        /// Validation Details: Input DTO is required; OrgName and OrgStatus must not be empty.
        /// Business Logic: Passes the signed-in user id as UpdatedBy and wraps the scalar result.
        /// Repository Interaction: Calls IOrganizationRepository.UpdateOrganizationAsync().
        /// Response Details: MSResultArgs containing the organization identifier, or NoRecordFound.
        /// </remarks>
        /// <param name="input">Input DTO containing the organization fields.</param>
        /// <returns>MSResultArgs containing the update status.</returns>
        public async Task<MSResultArgs> UpdateOrganizationAsync(UpdateOrganizationInput input)
        {
            var result = new MSResultArgs();
            try
            {
                if (input == null || input.OrgId <= 0 || string.IsNullOrWhiteSpace(input.OrgName) || string.IsNullOrWhiteSpace(input.OrgStatus))
                {
                    result.StatusCode = ErrorCodes.BadRequest;
                    result.StatusMessage = ErrorMessages.BadRequest;
                    return result;
                }

                int updatedId = await repository.UpdateOrganizationAsync(input, currentUserService.UserId);
                if (updatedId == -99)
                {
                    result.StatusCode = ErrorCodes.NoRecordFound;
                    result.StatusMessage = ErrorMessages.OrganizationNotFound;
                    return result;
                }

                result.StatusMessage = ErrorMessages.OrganizationUpdated;
                result.ResultData = updatedId;
            }
            catch (Exception ex)
            {
                AppLogger.LogError(logger, ex, SerilogErrorMessages.AcutisLogMessages.UpdateOrganizationFailed, input?.OrgId);
                result.StatusCode = ErrorCodes.InternalServerError;
                result.StatusMessage = ErrorMessages.InternalServerError;
            }

            return result;
        }

        #endregion PUT Methods
    }
}
