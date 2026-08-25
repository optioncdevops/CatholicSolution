// Copyright (c) OptionC. All rights reserved.

namespace CFR.CommonService
{
    public static class CommonActionName
    {
        public static class Common_API
        {
            public const string getWeather = nameof(getWeather);
        }
    }

    public static class APIActionName
    {
        public static class Auth
        {
            public const string GetLogonPage = nameof(GetLogonPage);
            public const string Login = nameof(Login);
            public const string AutoLogin = nameof(AutoLogin);
            public const string Logout = nameof(Logout);
        }

        public static class API_Login
        {
            public const string userAuthenticateAsync = nameof(userAuthenticateAsync);
        }

        public static class API_Role
        {
            public const string saveRoleAsync = nameof(saveRoleAsync);
            public const string updateRoleAsync = nameof(updateRoleAsync);
            public const string getRoleAsync = nameof(getRoleAsync);
            public const string getRolesbyIdAsync = nameof(getRolesbyIdAsync);
            public const string deleteRoleAsync = nameof(deleteRoleAsync);
            public const string updateRoleStatus = nameof(updateRoleStatus);
            public const string getRoleDropdownAsync = nameof(getRoleDropdownAsync);
        }

        public static class API_Category
        {
            public const string getCategoryAsync = nameof(getCategoryAsync);
            public const string getCategoryListAsync = nameof(getCategoryListAsync);
        }

        public static class API_User
        {
            public const string saveUserAsync = nameof(saveUserAsync);
            public const string updateUserAsync = nameof(updateUserAsync);
            public const string getUserAsync = nameof(getUserAsync);
            public const string getUserbyIdAsync = nameof(getUserbyIdAsync);
            public const string deleteUserAsync = nameof(deleteUserAsync);
        }

        public static class API_Employee
        {
            public const string saveEmployeeAsync = nameof(saveEmployeeAsync);
            public const string updateEmployeeAsync = nameof(updateEmployeeAsync);
            public const string getEmployeeAsync = nameof(getEmployeeAsync);
            public const string getEmployeebyIdAsync = nameof(getEmployeebyIdAsync);
            public const string deleteEmployeeAsync = nameof(deleteEmployeeAsync);
        }

        public static class API_AssetType
        {
            public const string saveAssetTypeAsync = nameof(saveAssetTypeAsync);
            public const string updateAssetTypeAsync = nameof(updateAssetTypeAsync);
            public const string getAssetTypeAsync = nameof(getAssetTypeAsync);
            public const string getAssetTypebyIdAsync = nameof(getAssetTypebyIdAsync);
            public const string deleteAssetTypeAsync = nameof(deleteAssetTypeAsync);
        }

        public static class API_Asset
        {
            public const string saveAssetAsync = nameof(saveAssetAsync);
            public const string updateAssetAsync = nameof(updateAssetAsync);
            public const string getAssetAsync = nameof(getAssetAsync);
            public const string getAssetbyIdAsync = nameof(getAssetbyIdAsync);
            public const string deleteAssetAsync = nameof(deleteAssetAsync);
            public const string getAssetDropdownsAsync = nameof(getAssetDropdownsAsync);
            public const string getAssignableAssetTypesAsync = nameof(getAssignableAssetTypesAsync);
            public const string getAvailableAssetsByTypeAsync = nameof(getAvailableAssetsByTypeAsync);
        }

        public static class API_AssetRequest
        {
            public const string saveAssetRequestAsync = nameof(saveAssetRequestAsync);
            public const string updateAssetRequestAsync = nameof(updateAssetRequestAsync);
            public const string getAssetRequestAsync = nameof(getAssetRequestAsync);
            public const string getAssetRequestbyIdAsync = nameof(getAssetRequestbyIdAsync);
            public const string deleteAssetRequestAsync = nameof(deleteAssetRequestAsync);
            public const string issueInventoryAsync = nameof(issueInventoryAsync);
            public const string issueAssetAsync = nameof(issueAssetAsync);
            public const string getAvailableAssetsAsync = nameof(getAvailableAssetsAsync);

            // Approval Workflow
            public const string unitHeadApproveAsync = nameof(unitHeadApproveAsync);

            public const string adminApproveAsync = nameof(adminApproveAsync);
            public const string rejectRequestAsync = nameof(rejectRequestAsync);

            // Asset History
            public const string getAssetHistoriesAsync = nameof(getAssetHistoriesAsync);
        }

        public static class API_Dashboard
        {
            public const string getDashboardStatsAsync = nameof(getDashboardStatsAsync);
        }

        public static class API_UserRight
        {
            public const string getModulesAsync = nameof(getModulesAsync);
            public const string getUserRightsAsync = nameof(getUserRightsAsync);
            public const string saveUserRightsAsync = nameof(saveUserRightsAsync);
            public const string getRoleRightsAsync = nameof(getRoleRightsAsync);
            public const string saveRoleRightsAsync = nameof(saveRoleRightsAsync);
        }

        public static class API_Module
        {
            public const string saveModuleAsync = nameof(saveModuleAsync);
            public const string updateModuleAsync = nameof(updateModuleAsync);
            public const string getModuleAsync = nameof(getModuleAsync);
            public const string getModulebyIdAsync = nameof(getModulebyIdAsync);
            public const string deleteModuleAsync = nameof(deleteModuleAsync);
            public const string getNavigationByRoleAsync = nameof(getNavigationByRoleAsync);
        }

        public static class API_Unit
        {
            public const string getUnitAsync = nameof(getUnitAsync);
        }

        public static class API_AssetStatus
        {
            public const string getAssetStatusAsync = nameof(getAssetStatusAsync);
        }

        public static class API_Ram
        {
            public const string getRamSizesAsync = nameof(getRamSizesAsync);
        }

        public static class API_Storage
        {
            public const string getStorageCapacitiesAsync = nameof(getStorageCapacitiesAsync);
        }

        public static class API_AssetAssignment
        {
            public const string saveAssetAssignmentAsync = nameof(saveAssetAssignmentAsync);
            public const string updateAssetAssignmentAsync = nameof(updateAssetAssignmentAsync);
            public const string getAssetAssignmentsAsync = nameof(getAssetAssignmentsAsync);
            public const string getAssetAssignmentByIdAsync = nameof(getAssetAssignmentByIdAsync);
            public const string deleteAssetAssignmentAsync = nameof(deleteAssetAssignmentAsync);
            public const string getAssignmentsByInventoryIdAsync = nameof(getAssignmentsByInventoryIdAsync);
            public const string transferInventoryAsync = nameof(transferInventoryAsync);
            public const string transferAssetAsync = nameof(transferAssetAsync);
        }

        public static class API_InternetConnection
        {
            public const string getConnectionsDropdown = nameof(getConnectionsDropdown);
            public const string getProvidersDropdown = nameof(getProvidersDropdown);
            public const string getPlansByProviderDropdown = nameof(getPlansByProviderDropdown);
            public const string getConnectionSummary = nameof(getConnectionSummary);
            public const string getPaginatedConnections = nameof(getPaginatedConnections);
            public const string getConnectionById = nameof(getConnectionById);
            public const string createConnection = nameof(createConnection);
            public const string updateConnection = nameof(updateConnection);
            public const string activateConnection = nameof(activateConnection);
            public const string deactivateConnection = nameof(deactivateConnection);
            public const string transferOwnership = nameof(transferOwnership);
            public const string changePlan = nameof(changePlan);
            public const string deleteConnection = nameof(deleteConnection);
            public const string getActiveConnectionSummary = nameof(getActiveConnectionSummary);
            public const string getPaginatedActiveConnections = nameof(getPaginatedActiveConnections);
            public const string getActiveConnectionDetails = nameof(getActiveConnectionDetails);
            public const string reactivateConnection = nameof(reactivateConnection);
            public const string changeLocation = nameof(changeLocation);
        }

        public static class API_InternetProvider
        {
            public const string getPaginatedProviders = nameof(getPaginatedProviders);
            public const string getAllProviders = nameof(getAllProviders);
            public const string getProviderById = nameof(getProviderById);
            public const string createProvider = nameof(createProvider);
            public const string updateProvider = nameof(updateProvider);
            public const string deleteProvider = nameof(deleteProvider);
            public const string getPaginatedPlans = nameof(getPaginatedPlans);
            public const string getPlansByProvider = nameof(getPlansByProvider);
            public const string getPlanById = nameof(getPlanById);
            public const string createPlan = nameof(createPlan);
            public const string updatePlan = nameof(updatePlan);
            public const string deletePlan = nameof(deletePlan);
        }

        public static class API_InternetRecharge
        {
            public const string getPaginatedRecharges = nameof(getPaginatedRecharges);
            public const string getRechargeById = nameof(getRechargeById);
            public const string getRechargesByConnection = nameof(getRechargesByConnection);
            public const string getRechargeSummary = nameof(getRechargeSummary);
            public const string createRecharge = nameof(createRecharge);
            public const string updateRecharge = nameof(updateRecharge);
            public const string deleteRecharge = nameof(deleteRecharge);
            public const string downloadReceipt = nameof(downloadReceipt);
            public const string getUpcomingRechargeWorklist = nameof(getUpcomingRechargeWorklist);
            public const string getUpcomingRechargeKpi = nameof(getUpcomingRechargeKpi);
        }

        public static class API_InternetReminder
        {
            public const string getPaginatedReminderSettings = nameof(getPaginatedReminderSettings);
            public const string getReminderSettingById = nameof(getReminderSettingById);
            public const string createReminderSetting = nameof(createReminderSetting);
            public const string updateReminderSetting = nameof(updateReminderSetting);
            public const string activateReminderSetting = nameof(activateReminderSetting);
            public const string deactivateReminderSetting = nameof(deactivateReminderSetting);
            public const string deleteReminderSetting = nameof(deleteReminderSetting);
            public const string getPaginatedNotificationLogs = nameof(getPaginatedNotificationLogs);
            public const string getNotificationLogById = nameof(getNotificationLogById);
            public const string processDueReminders = nameof(processDueReminders);
            public const string retryFailedNotification = nameof(retryFailedNotification);
            public const string testSmtpConnection = nameof(testSmtpConnection);
            public const string resetFailedNotifications = nameof(resetFailedNotifications);
        }

        public static class API_UnitHead
        {
            public const string getPaginatedUnitHeads = nameof(getPaginatedUnitHeads);
            public const string getUnitHeadSummary = nameof(getUnitHeadSummary);
            public const string getUnitHeadById = nameof(getUnitHeadById);
            public const string getUnitHeadHistory = nameof(getUnitHeadHistory);
            public const string validateUnitHeadForSubmission = nameof(validateUnitHeadForSubmission);
            public const string saveUnitHead = nameof(saveUnitHead);
            public const string deleteUnitHead = nameof(deleteUnitHead);
            public const string getUnitsDropdown = nameof(getUnitsDropdown);
            public const string getEmployeesDropdown = nameof(getEmployeesDropdown);
        }

        public static class API_ITAssignment
        {
            public const string getUnassignedRequests = nameof(getUnassignedRequests);
            public const string getAssignedRequests = nameof(getAssignedRequests);
            public const string getInProgressRequests = nameof(getInProgressRequests);
            public const string getCompletedRequests = nameof(getCompletedRequests);
            public const string getCancelledRequests = nameof(getCancelledRequests);
            public const string getReopenedRequests = nameof(getReopenedRequests);
            public const string getWorkQueue = nameof(getWorkQueue);
            public const string getITMembers = nameof(getITMembers);
            public const string getRequestById = nameof(getRequestById);
            public const string assignITMember = nameof(assignITMember);
            public const string reassignITMember = nameof(reassignITMember);
            public const string unassignITMember = nameof(unassignITMember);
            public const string startWork = nameof(startWork);
            public const string completeRequest = nameof(completeRequest);
            public const string cancelRequest = nameof(cancelRequest);
            public const string reopenRequest = nameof(reopenRequest);
            public const string getAssignmentHistory = nameof(getAssignmentHistory);
            public const string getSummaryMetrics = nameof(getSummaryMetrics);
        }

        public static class API_AssignmentNotification
        {
            public const string getNotificationTemplates = nameof(getNotificationTemplates);
            public const string getNotificationLogs = nameof(getNotificationLogs);
            public const string getNotificationLogById = nameof(getNotificationLogById);
        }

        public static class API_Maintenance
        {
            public const string getMaintenanceRequestsAsync = nameof(getMaintenanceRequestsAsync);
            public const string getMaintenanceRequestByIdAsync = nameof(getMaintenanceRequestByIdAsync);
            public const string createMaintenanceRequestAsync = nameof(createMaintenanceRequestAsync);
            public const string deleteMaintenanceRequestAsync = nameof(deleteMaintenanceRequestAsync);
            public const string processUnitHeadDecisionAsync = nameof(processUnitHeadDecisionAsync);
            public const string processAdminAssignmentAsync = nameof(processAdminAssignmentAsync);
            public const string processTechWorkAsync = nameof(processTechWorkAsync);
            public const string processRequesterVerificationAsync = nameof(processRequesterVerificationAsync);
            public const string getMaintenanceCategoriesAsync = nameof(getMaintenanceCategoriesAsync);
            public const string getSupportTeamsAsync = nameof(getSupportTeamsAsync);
            public const string getSupportTeamByIdAsync = nameof(getSupportTeamByIdAsync);
            public const string createSupportTeamAsync = nameof(createSupportTeamAsync);
            public const string updateSupportTeamAsync = nameof(updateSupportTeamAsync);
            public const string deleteSupportTeamAsync = nameof(deleteSupportTeamAsync);
            public const string saveSupportTeamMemberAsync = nameof(saveSupportTeamMemberAsync);
            public const string deleteSupportTeamMemberAsync = nameof(deleteSupportTeamMemberAsync);
            public const string getSupportTeamDropdownsAsync = nameof(getSupportTeamDropdownsAsync);
            public const string getDashboardMetricsAsync = nameof(getDashboardMetricsAsync);
        }

        public static class API_SupportTeamMember
        {
            public const string getITTeamMembers = nameof(getITTeamMembers);
            public const string getMaintenanceTeamMembers = nameof(getMaintenanceTeamMembers);
            public const string saveSupportTeamMember = nameof(saveSupportTeamMember);
            public const string deleteSupportTeamMember = nameof(deleteSupportTeamMember);
            public const string getSupportTeamDropdowns = nameof(getSupportTeamDropdowns);
        }

        public static class API_EquipmentCategory
        {
            public const string getCategories = nameof(getCategories);
            public const string getResponsibleDropdown = nameof(getResponsibleDropdown);
            public const string createCategory = nameof(createCategory);
            public const string updateCategory = nameof(updateCategory);
            public const string toggleUnitHeadApproval = nameof(toggleUnitHeadApproval);
            public const string deleteCategory = nameof(deleteCategory);
        }

        public static class API_AssetNotification
        {
            public const string getNotificationsAsync = nameof(getNotificationsAsync);
            public const string getNotificationByIdAsync = nameof(getNotificationByIdAsync);
            public const string markAsReadAsync = nameof(markAsReadAsync);
            public const string markAsActionedAsync = nameof(markAsActionedAsync);
            public const string retryEmailAsync = nameof(retryEmailAsync);
            public const string getUnreadCountAsync = nameof(getUnreadCountAsync);
        }
    }
}
