using NUnit.Framework;
using Reqnroll;

namespace Automation.Acutis.StepDefinitions
{
    [Binding]
    public class TestAllProcessSteps
    {
        private readonly UserRightsStepDefinitions _userRightsSteps;
        private readonly UserRolesStepDefinitions _userRolesSteps;
        private readonly UserDetailStepDefinitions _userDetailSteps;
        private readonly AdminAccessRequestsStepDefinitions _adminAccessRequestsSteps;
        private readonly OrganizationSteps _organizationSteps;
        private readonly ProductStepDefinitions _productSteps;
        private readonly EmailSettingsStepDefinitions _emailSettingsSteps;
        private readonly EmailTemplatesStepDefinitions _emailTemplatesSteps;
        private readonly MenuAccessStepDefinitions _menuAccessSteps;

        public TestAllProcessSteps(
            UserRightsStepDefinitions userRightsSteps,
            UserRolesStepDefinitions userRolesSteps,
            UserDetailStepDefinitions userDetailSteps,
            AdminAccessRequestsStepDefinitions adminAccessRequestsSteps,
            OrganizationSteps organizationSteps,
            ProductStepDefinitions productSteps,
            EmailSettingsStepDefinitions emailSettingsSteps,
            EmailTemplatesStepDefinitions emailTemplatesSteps,
            MenuAccessStepDefinitions menuAccessSteps)
        {
            _userRightsSteps = userRightsSteps;
            _userRolesSteps = userRolesSteps;
            _userDetailSteps = userDetailSteps;
            _adminAccessRequestsSteps = adminAccessRequestsSteps;
            _organizationSteps = organizationSteps;
            _productSteps = productSteps;
            _emailSettingsSteps = emailSettingsSteps;
            _emailTemplatesSteps = emailTemplatesSteps;
            _menuAccessSteps = menuAccessSteps;
        }

        [Then(@"Execute all automation processes end-to-end")]
        public void ThenExecuteAllAutomationProcessesEndToEnd()
        {
            // Fixed run order (matches TestAllProcess.feature's own step order):
            // 1. Login happens in whatever calls this step; 2-10 run here in order.

            // 2. MenuAccess (menu rights)
            _menuAccessSteps.RunMenuAccessProcess();

            // 3. Product
            _productSteps.RunProductProcess();

            // 4. OrganizationManagement - safe (non-mutating) checks only. The mutating
            // lifecycle/product-toggle scenarios have their own environment-aware login and
            // mutation gate (Assert.Ignore, which would abort this entire master scenario if
            // called from here without one) - they run independently via Organization.feature.
            _organizationSteps.RunOrganizationSafeChecks();
            _organizationSteps.RunOrganizationAddValidationChecks();

            // 5. UserDetail
            _userDetailSteps.RunUserDetailProcess();

            // 6. AdminAccessRequests
            _adminAccessRequestsSteps.RunAdminAccessRequestsProcess();

            // 7. UserRoles
            _userRolesSteps.RunUserRolesProcess();

            // 8. UserRights
            _userRightsSteps.RunUserRightsProcess();

            // 9. EmailTemplates
            _emailTemplatesSteps.RunEmailTemplatesProcess();

            // 10. EmailSettings
            _emailSettingsSteps.RunEmailSettingsProcess();
        }
    }
}
