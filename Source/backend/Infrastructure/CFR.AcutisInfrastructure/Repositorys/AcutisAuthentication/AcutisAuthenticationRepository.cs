// Copyright (c) OptionC. All rights reserved.

namespace CFR.AcutisInfrastructure.Repositorys.AcutisAuthentication
{
    /// <summary>
    /// Dapper implementation of IAcutisAuthenticationRepository for Acutis login.
    /// Infrastructure Responsibility:
    /// - Uses IDapperHandler to execute stored procedures and map results to AcutisLoginQueryResult.
    /// </summary>
    public class AcutisAuthenticationRepository(IDapperHandler dapperHandler): IAcutisAuthenticationRepository
    {
        #region POST Methods

        /// <summary>
        /// Validates login credentials using StoredProc.AcutisAuth.DoLogin.
        /// </summary>
        /// <remarks>
        /// Purpose: Authenticate credentials.
        /// Request Flow: IAcutisAuthenticationService -> AcutisAuthenticationRepository.AuthenticateAsync() -> Database.
        /// Validation Details: Maps UserName to the Email parameter.
        /// Business Logic: Reads two result sets and maps module rights into a menu tree.
        /// Repository Interaction: Executes StoredProc.AcutisAuth.DoLogin.
        /// Response Details: Returns user profile mapping with permissions list.
        /// </remarks>
        /// <param name="request">Credential request model.</param>
        /// <returns>Authenticating query result details.</returns>
        public async Task<AcutisLoginQueryResult> AuthenticateAsync(AcutisAuthenticationInput request)
        {
            ArgumentNullException.ThrowIfNull(request);
            var parameters = new DynamicParameters();
            parameters.Add(DBParameterName.AcutisAuthParams.Email, request.UserName?.Trim(), DbType.String);
            parameters.Add(DBParameterName.AcutisAuthParams.Password, request.Password, DbType.String);
            using var grid = await dapperHandler.QueryMultipleAsync(StoredProc.AcutisAuth.DoLogin, parameters, CommandType.StoredProcedure);
            var user = await grid.ReadFirstOrDefaultAsync<AcutisLoginUserResult>();
            var rights = (await grid.ReadAsync<AcutisLoginModuleRightRow>()).AsList();
            return new AcutisLoginQueryResult
            {
                User = user,
                ModuleRights = rights,
                MenuItems = MapModuleRightsToMenu(rights)
            };
        }

        #endregion POST Methods

        #region Private Helper Methods

        /// <summary>
        /// Maps flat module rights to structured parent-child navigation menus.
        /// </summary>
        /// <param name="rights">Raw permission rows.</param>
        /// <returns>Structured menu hierarchy list.</returns>
        public static List<MenuItems> MapModuleRightsToMenu(List<AcutisLoginModuleRightRow> rights)
        {
            if (rights == null || rights.Count == 0)
            {
                return [];
            }

            var allowedRights = rights.Where(x => x.UserRight > 0 && x.IsHideMenu == 0).OrderBy(x => x.DisplayOrder).ToList();
            var allowedAllRights = rights.Where(x => x.UserRight > 0).OrderBy(x => x.DisplayOrder).ToList();

            return [.. allowedRights
                .Where(x => x.ParentId == 0 && x.LevelId == 1)
                .Select(parent => new MenuItems
                {
                    Title = parent.DisplayName,
                    Icon = ToPascalIcon(parent.Icon),
                    SessionKey = parent.ModuleName,
                    Path = parent.RoutingUrl,
                    Activity = [.. allowedAllRights
                        .Where(child => child.ParentId == parent.FeatureID && child.LevelId == 5)
                        .Select(child => new SubMenuItems
                        {
                            Label = child.DisplayName,
                            Icon = ToPascalIcon(child.Icon),
                            SessionKey = child.ModuleName,
                            Path = child.RoutingUrl
                        })],
                    Links = [.. allowedRights
                        .Where(child => child.ParentId == parent.FeatureID && child.LevelId == 2)
                        .Select(child => new SubMenuItems
                        {
                            Label = child.DisplayName,
                            Icon = ToPascalIcon(child.Icon),
                            SessionKey = child.ModuleName,
                            Path = child.RoutingUrl
                        })],
                    Btnlinks = [.. allowedAllRights
                        .Where(child => child.ParentId == parent.FeatureID && child.LevelId == 2)
                        .Select(child => new SubMenuItems
                        {
                            Label = child.DisplayName,
                            Icon = ToPascalIcon(child.Icon),
                            SessionKey = child.ModuleName,
                            Path = child.RoutingUrl,
                            Tablinks = [.. allowedAllRights
                                .Where(tabs => tabs.ParentId == child.FeatureID && tabs.LevelId == 4)
                                .Select(tabs => new SubMenuTabItems
                                {
                                    Label = tabs.DisplayName,
                                    Icon = ToPascalIcon(tabs.Icon),
                                    SessionKey = tabs.ModuleName,
                                    Path = tabs.RoutingUrl
                                })]
                        })]
                })];
        }

        /// <summary>
        /// Converts kebab-case lucide names from auth.ModuleFeatures.MenuIcon to PascalCase.
        /// </summary>
        private static string ToPascalIcon(string? icon)
        {
            if (string.IsNullOrWhiteSpace(icon))
            {
                return string.Empty;
            }

            return string.Concat(icon.Split('-', StringSplitOptions.RemoveEmptyEntries).Select(part => char.ToUpperInvariant(part[0]) + part[1..]));
        }

        #endregion Private Helper Methods
    }
}
