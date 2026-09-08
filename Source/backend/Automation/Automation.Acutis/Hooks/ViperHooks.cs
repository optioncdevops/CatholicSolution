// Copyright (c) OptionC. All rights reserved.

using Automation.Framework;

using Reqnroll;
using Reqnroll.BoDi;

namespace Automation.Acutis.Hooks
{
    [Binding]
    public sealed class ViperHooks(IObjectContainer container)
    {
        [BeforeTestRun]
        public static void BeforeTestRun()
        {
            CommonExtentReports.BeforeTestRun();
        }

        [BeforeFeature]
        public static void BeforeFeature(FeatureContext featureContext)
        {
            CommonExtentReports.BeforeFeature(featureContext);
        }

        [AfterFeature]
        public static void AfterFeature()
        {
            CommonExtentReports.AfterFeature();
        }

        [AfterTestRun]
        public static void AfterTestRun()
        {
            CommonExtentReports.AfterTestRun();
        }

        [BeforeScenario]
        public void BeforeScenario()
        {
            CommonExtentReports.BeforeScenario(container);
        }

        [AfterStep]
        public void AfterStep()
        {
            CommonExtentReports.AfterStep(container);
        }

        [AfterScenario]
        public void AfterScenario()
        {
            CommonExtentReports.AfterScenario(container);
        }
    }
}