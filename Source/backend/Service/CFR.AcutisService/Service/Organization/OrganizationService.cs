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

        #endregion GET Methods

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
