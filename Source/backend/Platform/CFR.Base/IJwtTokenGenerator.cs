// Copyright (c) OptionC. All rights reserved.

using System.IdentityModel.Tokens.Jwt;
using System.Security.Cryptography;

using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

using CFR.Common;

using Newtonsoft.Json;

namespace CFR.Base
{
    public interface IJwtTokenGenerator
    {
        //string GenerateToken(LoginUserResult userDetail);
        string GenerateToken(UserContextData userDetail);

        string GenerateRefreshToken();
    }

    public class JwtTokenGenerator(IOptions<JWTSetting> jwtSetting): IJwtTokenGenerator
    {
        public string GenerateToken(UserContextData userDetail)
        {
            ArgumentNullException.ThrowIfNull(userDetail);

            if (string.IsNullOrEmpty(jwtSetting.Value.SecurityKey))
            {
                throw new InvalidOperationException("JWT SecurityKey is not configured.");
            }

            var tokenhandler = new JwtSecurityTokenHandler();
            byte[] tokenkey = Encoding.UTF8.GetBytes(jwtSetting.Value.SecurityKey);

            var userDetails = userDetail.UserDetails.FirstOrDefault();
            var orgDetails = userDetail.OrgDetails.FirstOrDefault();

            if (userDetails == null || orgDetails == null)
            {
                return string.Empty;
            }

            string isVVAccess = "False";
            if (userDetails.Permission == 9)
            {
                isVVAccess = orgDetails.IsVVAdminAccess ?? "False";
            }
            else if (userDetails.Permission == 4 && userDetails.IsVolunteerAdmin == true)
            {
                isVVAccess = orgDetails.IsVVStaffAccess ?? "False";
            }

            int siteLoginId = userDetails.SiteLoginID > 0 ? userDetails.SiteLoginID.Value : userDetails.UserID ?? 0;

            var claimsDict = new Dictionary<string, object>
            {
                { Constant.SessionField.OrgId, userDetails.OrganizationID ?? 0 },
                { Constant.SessionField.UserId, userDetails.UserID ?? 0 },
                { Constant.SessionField.SiteLoginID, siteLoginId },
                { Constant.SessionField.UserName, userDetails.UserName ?? string.Empty },
                { Constant.SessionField.RoleId, userDetails.RoleId ?? 0 },
                { Constant.SessionField.StateId, userDetails.StateId ?? 0 },
                { Constant.SessionField.FirstName, userDetails.FirstName ?? string.Empty },
                { Constant.SessionField.LastName, userDetails.LastName ?? string.Empty },
                { Constant.SessionField.IsVolunteer, userDetails.IsVolunteer ?? false },
                { Constant.SessionField.IsSignCompleted, userDetails.IsSignCompleted ?? 0 },
                { Constant.SessionField.IsAdminSignCompleted, userDetails.IsAdminSignCompleted ?? 0 },
                { Constant.SessionField.IsParent, userDetails.IsParent ?? 0 },
                { Constant.SessionField.IsDollarOneEnabled, userDetails.IsDollarOneEnabled ?? false },
                { Constant.SessionField.FuzeAccountId, userDetails.FuzeAccountId ?? string.Empty },
                { Constant.SessionField.AchProcessingFee, userDetails.ACH_ProcessingFee ?? 0m },
                { Constant.SessionField.LimitExceed, userDetails.LimitExceed ?? 0m },
                { Constant.SessionField.CC_PerTransaction, userDetails.CCPerTransaction ?? 0m },
                { Constant.SessionField.CreditCardSetupFee, userDetails.CreditCardSetupFee ?? 0m },
                { Constant.SessionField.eCheckSetupFee, userDetails.ECheckSetupFee ?? 0m },
                { Constant.SessionField.OrgCCsetupservice, userDetails.OrgCCsetupservice ?? false },
                { Constant.SessionField.IsAchEnable, userDetails.IsAchEnable ?? false },
                { Constant.SessionField.IsMMAchEnabled, userDetails.IsMMAchEnabled ?? false },
                { Constant.SessionField.IsCategoryEnabled, userDetails.IsCategoryEnabled ?? false },
                { Constant.SessionField.IsEnableClassicAccess, userDetails.IsEnableClassicAccess ?? false },
                { Constant.SessionField.ISMMNewChanges, userDetails.ISMMNewChanges ?? string.Empty },
                { Constant.SessionField.IsViperUser, userDetails.IsViperUser ?? false },
                { Constant.SessionField.IsSurveyCompleted, userDetails.IsSurveyCompleted ?? false },
                { Constant.SessionField.IsChoiceSchool, userDetails.IsChoiceSchool ?? false },
                { Constant.SessionField.CurrentTermID, orgDetails.CurrentTermID ?? 0 },
                { Constant.SessionField.AssignmentCurrentTermID, orgDetails.CurrentTermID ?? 0 },
                { Constant.SessionField.DioceseID, orgDetails.DioceseID ?? 0 },
                { Constant.SessionField.IsDemoSchool, orgDetails.IsDemoSchool ?? false },
                { Constant.SessionField.ShowFamilyPrivateMessages, orgDetails.ShowFamilyPrivateMessages ?? false },
                { Constant.SessionField.EnableStudentAssignmentSubmissions, orgDetails.EnableStudentAssignmentSubmissions ?? false },
                { Constant.SessionField.IsVVEnabled, orgDetails.IsEnabled ?? false },
                { Constant.SessionField.IsVVAccess, isVVAccess },
                { Constant.SessionField.IsVVSubscriptionactive, orgDetails.IsVVSubscriptionactive ?? "False" },
                { Constant.SessionField.SchoolType, userDetails.SchoolType ?? 0 },
                { Constant.SessionField.IsMMplatform, userDetails.IsMMplatform ?? 0 },
                { Constant.SessionField.StaffRights, JsonConvert.SerializeObject(userDetail.StaffRights ?? []) }
            };

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Audience = jwtSetting.Value.Audience,
                Issuer = jwtSetting.Value.Issuer,
                Claims = claimsDict,
                Expires = DateTime.UtcNow.AddDays(1),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(tokenkey), SecurityAlgorithms.HmacSha256)
            };
            var token = tokenhandler.CreateToken(tokenDescriptor);
            return tokenhandler.WriteToken(token);
        }

        public string GenerateRefreshToken()
        {
            return Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));
        }

    }

}
