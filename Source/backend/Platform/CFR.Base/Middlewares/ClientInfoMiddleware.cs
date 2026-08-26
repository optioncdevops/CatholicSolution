// Copyright (c) OptionC. All rights reserved.

using CFR.Common;
using CFR.CommonService;
using CFR.CommonService.Interfaces;

using Microsoft.Extensions.DependencyInjection;

using UAParser;

namespace CFR.Base.Middlewares
{
    public class ClientInfoMiddleware(RequestDelegate next)
    {
        private readonly RequestDelegate _next = next;

        public async Task Invoke(HttpContext context, IServiceProvider serviceProvider)
        {
            ArgumentNullException.ThrowIfNull(context);

            var user = context.User;

            // Skip processing if the user is not authenticated (no token)
            if (user.Identity?.IsAuthenticated != true)
            {
                await _next(context);
                return;
            }

            string userAgent = context.Request.Headers["User-Agent"].ToString();
            string correlationId = context.Request.Headers["X-Request-Id"].ToString();
            var parser = Parser.GetDefault();
            var clientInfo = parser.Parse(userAgent);

            // Resolve the scoped service within the request scope
            var currentUserService = serviceProvider.GetRequiredService<ICurrentUserService>();
            var allClaims = user.Claims.ToList();

            // Validate and extract user ID
            string? userIdClaim = user.FindFirstValue(ClaimTypes.NameIdentifier);
            long userId = 0;
            bool isValidUserId = false;

            if (!string.IsNullOrEmpty(userIdClaim))
            {
                isValidUserId = long.TryParse(CommonMethods.DecryptValue(userIdClaim), out userId);
            }
            else
            {
                string? ssoUserIdClaim = user.FindFirstValue(Constant.SessionField.UserId);
                if (!string.IsNullOrEmpty(ssoUserIdClaim))
                {
                    isValidUserId = long.TryParse(ssoUserIdClaim, out userId);
                }
            }

            if (!isValidUserId)
            {
                context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                await context.Response.WriteAsync("Unauthorized: Invalid User ID");
                return;
            }

            // Set user details in the current user service
            currentUserService.UserId = userId;
            if (long.TryParse(user.FindFirstValue(Constant.SessionField.SiteLoginID), out long siteLoginId) && siteLoginId > 0)
            {
                currentUserService.SiteLoginId = siteLoginId;
            }
            else
            {
                currentUserService.SiteLoginId = userId;
            }

            currentUserService.CreateBaseDTO.CreatedById = userId;
            currentUserService.ModifyBaseDTO.ModifiedById = userId;
            currentUserService.DeleteBaseDTO.ModifiedById = userId;
            currentUserService.ClientIPAddress = context.Connection.RemoteIpAddress?.ToString() ?? "Unknown";
            currentUserService.DeviceType = clientInfo.Device.Family ?? "Unknown";
            currentUserService.BrowserName = clientInfo.UA.Family ?? "Unknown";
            currentUserService.UserName = user.FindFirstValue(Constant.SessionField.UserName) ?? string.Empty;

            if (int.TryParse(user.FindFirstValue(Constant.SessionField.RoleId), out int roleIdValue))
            {
                currentUserService.RoleId = roleIdValue;
            }

            if (int.TryParse(user.FindFirstValue(Constant.SessionField.OrgId), out int orgIdValue))
            {
                currentUserService.OrgId = orgIdValue;
            }

            if (int.TryParse(user.FindFirstValue(Constant.SessionField.StateId), out int stateIdValue))
            {
                currentUserService.StateId = stateIdValue;
            }

            currentUserService.FirstName = user.FindFirstValue(Constant.SessionField.FirstName) ?? string.Empty;
            currentUserService.LastName = user.FindFirstValue(Constant.SessionField.LastName) ?? string.Empty;
            if (bool.TryParse(user.FindFirstValue(Constant.SessionField.IsVolunteer), out bool isVolunteerValue))
            {
                currentUserService.IsVolunteer = isVolunteerValue;
            }

            if (int.TryParse(user.FindFirstValue(Constant.SessionField.IsSignCompleted), out int isSignCompletedValue))
            {
                currentUserService.IsSignCompleted = isSignCompletedValue;
            }

            if (int.TryParse(user.FindFirstValue(Constant.SessionField.IsAdminSignCompleted), out int isAdminSignCompletedValue))
            {
                currentUserService.IsAdminSignCompleted = isAdminSignCompletedValue;
            }

            if (int.TryParse(user.FindFirstValue(Constant.SessionField.IsParent), out int isParentValue))
            {
                currentUserService.IsParent = isParentValue;
            }

            if (bool.TryParse(user.FindFirstValue(Constant.SessionField.IsDollarOneEnabled), out bool isDollarOneEnabledValue))
            {
                currentUserService.IsDollarOneEnabled = isDollarOneEnabledValue;
            }

            currentUserService.FuzeAccountId = user.FindFirstValue(Constant.SessionField.FuzeAccountId) ?? string.Empty;
            if (decimal.TryParse(user.FindFirstValue(Constant.SessionField.AchProcessingFee), out decimal achProcessingFeeValue))
            {
                currentUserService.AchProcessingFee = achProcessingFeeValue;
            }

            if (decimal.TryParse(user.FindFirstValue(Constant.SessionField.LimitExceed), out decimal limitExceedValue))
            {
                currentUserService.LimitExceed = limitExceedValue;
            }

            if (decimal.TryParse(user.FindFirstValue(Constant.SessionField.CC_PerTransaction), out decimal ccPerTransactionValue))
            {
                currentUserService.CC_PerTransaction = ccPerTransactionValue;
            }

            if (decimal.TryParse(user.FindFirstValue(Constant.SessionField.CreditCardSetupFee), out decimal creditCardSetupFeeValue))
            {
                currentUserService.CreditCardSetupFee = creditCardSetupFeeValue;
            }

            if (decimal.TryParse(user.FindFirstValue(Constant.SessionField.eCheckSetupFee), out decimal eCheckSetupFeeValue))
            {
                currentUserService.ECheckSetupFee = eCheckSetupFeeValue;
            }

            if (bool.TryParse(user.FindFirstValue(Constant.SessionField.OrgCCsetupservice), out bool orgCCsetupserviceValue))
            {
                currentUserService.OrgCCsetupservice = orgCCsetupserviceValue;
            }

            if (bool.TryParse(user.FindFirstValue(Constant.SessionField.IsAchEnable), out bool isAchEnableValue))
            {
                currentUserService.IsAchEnable = isAchEnableValue;
            }

            if (bool.TryParse(user.FindFirstValue(Constant.SessionField.IsMMAchEnabled), out bool isMMAchEnabledValue))
            {
                currentUserService.IsMMAchEnabled = isMMAchEnabledValue;
            }

            if (bool.TryParse(user.FindFirstValue(Constant.SessionField.IsCategoryEnabled), out bool isCategoryEnabledValue))
            {
                currentUserService.IsCategoryEnabled = isCategoryEnabledValue;
            }

            if (bool.TryParse(user.FindFirstValue(Constant.SessionField.IsEnableClassicAccess), out bool isEnableClassicAccessValue))
            {
                currentUserService.IsEnableClassicAccess = isEnableClassicAccessValue;
            }

            currentUserService.ISMMNewChanges = user.FindFirstValue(Constant.SessionField.ISMMNewChanges) ?? string.Empty;
            if (bool.TryParse(user.FindFirstValue(Constant.SessionField.IsViperUser), out bool isViperUserValue))
            {
                currentUserService.IsViperUser = isViperUserValue;
            }

            if (bool.TryParse(user.FindFirstValue(Constant.SessionField.IsSurveyCompleted), out bool isSurveyCompletedValue))
            {
                currentUserService.IsSurveyCompleted = isSurveyCompletedValue;
            }

            if (bool.TryParse(user.FindFirstValue(Constant.SessionField.IsChoiceSchool), out bool isChoiceSchoolValue))
            {
                currentUserService.IsChoiceSchool = isChoiceSchoolValue;
            }

            if (int.TryParse(user.FindFirstValue(Constant.SessionField.CurrentTermID), out int currentTermIDValue))
            {
                currentUserService.CurrentTermID = currentTermIDValue;
            }

            if (int.TryParse(user.FindFirstValue(Constant.SessionField.AssignmentCurrentTermID), out int assignmentCurrentTermIDValue))
            {
                currentUserService.AssignmentCurrentTermID = assignmentCurrentTermIDValue;
            }

            if (int.TryParse(user.FindFirstValue(Constant.SessionField.DioceseID), out int dioceseIDValue))
            {
                currentUserService.DioceseID = dioceseIDValue;
            }

            if (bool.TryParse(user.FindFirstValue(Constant.SessionField.IsDemoSchool), out bool isDemoSchoolValue))
            {
                currentUserService.IsDemoSchool = isDemoSchoolValue;
            }

            if (bool.TryParse(user.FindFirstValue(Constant.SessionField.ShowFamilyPrivateMessages), out bool showFamilyPrivateMessagesValue))
            {
                currentUserService.ShowFamilyPrivateMessages = showFamilyPrivateMessagesValue;
            }

            if (bool.TryParse(user.FindFirstValue(Constant.SessionField.EnableStudentAssignmentSubmissions), out bool enableStudentAssignmentSubmissionsValue))
            {
                currentUserService.EnableStudentAssignmentSubmissions = enableStudentAssignmentSubmissionsValue;
            }

            if (bool.TryParse(user.FindFirstValue(Constant.SessionField.IsVVEnabled), out bool isVVEnabledValue))
            {
                currentUserService.IsVVEnabled = isVVEnabledValue;
            }

            currentUserService.IsVVAccess = user.FindFirstValue(Constant.SessionField.IsVVAccess) ?? "False";
            currentUserService.IsVVSubscriptionactive = user.FindFirstValue(Constant.SessionField.IsVVSubscriptionactive) ?? "False";

            if (int.TryParse(user.FindFirstValue(Constant.SessionField.SchoolType), out int schoolTypeValue))
            {
                currentUserService.SchoolType = schoolTypeValue;
            }

            if (int.TryParse(user.FindFirstValue(Constant.SessionField.IsMMplatform), out int isMmPlatformValue))
            {
                currentUserService.IsMMplatform = isMmPlatformValue;
            }

            currentUserService.StaffRightsJson = user.FindFirstValue(Constant.SessionField.StaffRights) ?? "[]";

            await _next(context);
        }
    }

    public static class ClientInfoMiddlewareExtensions
    {
        public static IApplicationBuilder UseClientInfoMiddleware(this IApplicationBuilder app)
        {
            return app.UseMiddleware<ClientInfoMiddleware>();
        }
    }
}