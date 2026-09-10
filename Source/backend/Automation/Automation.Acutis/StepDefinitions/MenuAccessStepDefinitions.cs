// Copyright (c) OptionC. All rights reserved.

using Automation.Framework;
using Automation.Framework.ViperPages;

using NUnit.Framework;

using OpenQA.Selenium;

using Reqnroll;

namespace Automation.Acutis.StepDefinitions
{
    [Binding]
    public class MenuAccessStepDefinitions(IWebDriver driver, ScenarioContext scenarioContext)
    {
        private readonly MenuAccessPage _menuPage = new(driver);

        [Then(@"The top navigation menu should be loaded")]
        public void ThenTheTopNavigationMenuShouldBeLoaded()
        {
            Assert.That(_menuPage.WaitForTopNav(), Is.True, "The top navigation bar did not render after sign in.");

            var labels = _menuPage.ReadTopMenuLabels();
            CommonExtentReports.ReportDetail(scenarioContext, "Menus found: " + string.Join(", ", labels));
            Assert.That(labels, Is.Not.Empty, "The top navigation bar rendered without any menu in it.");
        }

        [Then(@"Every menu should open and every sub menu link should open its own page")]
        public void ThenEveryMenuShouldOpenAndEverySubMenuLinkShouldOpenItsOwnPage()
        {
            var visits = _menuPage.VisitAllMenus();

            // Every visit is reported, not just the failing ones, so the run shows which
            // pages were actually covered rather than only what went wrong.
            CommonExtentReports.ReportDetail(scenarioContext, string.Join(Environment.NewLine, visits));

            Assert.That(visits, Is.Not.Empty, "No menu was visited, so nothing was checked.");

            var failures = visits.Where(visit => !visit.Passed).ToList();
            Assert.That(
                failures,
                Is.Empty,
                $"{failures.Count} of {visits.Count} menu links did not open:"
                    + Environment.NewLine
                    + string.Join(Environment.NewLine, failures));
        }

        public void RunMenuAccessProcess()
        {
            ThenTheTopNavigationMenuShouldBeLoaded();
            ThenEveryMenuShouldOpenAndEverySubMenuLinkShouldOpenItsOwnPage();
        }
    }
}
