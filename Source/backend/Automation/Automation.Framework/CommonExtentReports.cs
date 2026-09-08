// Copyright (c) OptionC. All rights reserved.

using System.Diagnostics;
using System.Net;

using AventStack.ExtentReports;
using AventStack.ExtentReports.Gherkin.Model;
using AventStack.ExtentReports.Reporter;

using OpenQA.Selenium;
using OpenQA.Selenium.Chrome;

using Reqnroll;
using Reqnroll.BoDi;

using static Automation.Framework.CommonVariable;

namespace Automation.Framework
{
    public static class CommonExtentReports
    {
        // Keys under which the per-feature and per-scenario report nodes are
        // stashed in Reqnroll's own contexts. The previous version held these
        // in static fields, which meant two scenarios could never run at the
        // same time without overwriting each other's report node.
        private const string _featureNodeKey = "ExtentFeatureNode";

        private const string _scenarioNodeKey = "ExtentScenarioNode";

        // A step that has a table of results to show leaves it here for AfterStep to put
        // into the report. The step node does not exist while the step is still running,
        // so a step cannot write to the report itself.
        private const string _stepDetailKey = "ExtentStepDetail";

        private static readonly string _reportPath =
            Path.Combine(
                Directory.GetParent(@"../../../")!.FullName,
                "Result",
                "Result_" + DateTime.Now.ToString("yyyyMMddHHmmss"));

        private static ExtentReports? _extent;

        private static ExtentReports Extent =>
            _extent ?? throw new InvalidOperationException(
                "The Extent report was not initialised. Check that the project's " +
                "[BeforeTestRun] hook calls CommonExtentReports.BeforeTestRun().");

        public static void BeforeTestRun()
        {
            var htmlReport = new ExtentHtmlReporter(_reportPath);
            _extent = new ExtentReports();
            _extent.AttachReporter(htmlReport);
        }

        public static void BeforeFeature(FeatureContext featureContext)
        {
            ArgumentNullException.ThrowIfNull(featureContext);

            var featureNode = Extent.CreateTest<Feature>(featureContext.FeatureInfo.Title);
            featureContext.Set(featureNode, _featureNodeKey);
        }

        public static void BeforeScenario(IObjectContainer container)
        {
            ArgumentNullException.ThrowIfNull(container);

            var featureContext = container.Resolve<FeatureContext>();
            var scenarioContext = container.Resolve<ScenarioContext>();

            var featureNode = featureContext.Get<ExtentTest>(_featureNodeKey);
            var scenarioNode = featureNode.CreateNode<Scenario>(scenarioContext.ScenarioInfo.Title);
            scenarioContext.Set(scenarioNode, _scenarioNodeKey);

            var options = new ChromeOptions();
            options.AddArgument("no-sandbox");

            // No ChromeDriverService path is passed: Selenium Manager locates a
            // driver matching the installed browser, so the driver no longer
            // has to be pinned to a Chrome version in the project file.
            var driver = new ChromeDriver(options);
            driver.Manage().Timeouts().PageLoad = TimeSpan.FromSeconds(60);

            // Make 'driver' available for DI (Dependency injection)
            container.RegisterInstanceAs<IWebDriver>(driver);
        }

        public static void AfterStep(IObjectContainer container)
        {
            ArgumentNullException.ThrowIfNull(container);

            var scenarioContext = container.Resolve<ScenarioContext>();
            var scenarioNode = scenarioContext.Get<ExtentTest>(_scenarioNodeKey);
            var stepInfo = scenarioContext.StepContext.StepInfo;
            string stepType = stepInfo.StepDefinitionType.ToString();

            var stepNode = stepType switch
            {
                "Given" => scenarioNode.CreateNode<Given>(stepInfo.Text),
                "When" => scenarioNode.CreateNode<When>(stepInfo.Text),
                "Then" => scenarioNode.CreateNode<Then>(stepInfo.Text),
                "And" => scenarioNode.CreateNode<And>(stepInfo.Text),
                _ => null,
            };

            if (scenarioContext.TryGetValue(_stepDetailKey, out string detail))
            {
                scenarioContext.Remove(_stepDetailKey);
                stepNode?.Info(AsReportBlock(detail));
            }

            if (scenarioContext.TestError == null)
            {
                return;
            }

            CaptureScreenshot(container);
            stepNode?.Fail(AsReportBlock(scenarioContext.TestError.Message));
        }

        /// <summary>
        /// Records a block of text for the running step to show in the report.
        /// </summary>
        /// <remarks>
        /// A step that checks many things at once - every menu in the nav bar, say - has a
        /// result per thing rather than a single message. Handing that whole table over here
        /// keeps it in the report even when the step passes, instead of it only surviving as
        /// part of an assertion message when the step fails.
        /// </remarks>
        /// <param name="scenarioContext">the running scenario</param>
        /// <param name="detail">the text to show, one result per line</param>
        public static void ReportDetail(ScenarioContext scenarioContext, string detail)
        {
            ArgumentNullException.ThrowIfNull(scenarioContext);

            scenarioContext.Set(detail, _stepDetailKey);
        }

        /// <summary>
        /// Turns plain text into something the report renders as written.
        /// </summary>
        /// <remarks>
        /// Extent drops the text straight into the page, so a message broken into lines
        /// arrives as one unreadable paragraph and any angle bracket in it is swallowed as
        /// markup. Encoding it and wrapping it in a pre keeps the line breaks and the column
        /// alignment that make a long list of results readable.
        /// </remarks>
        /// <param name="text">the text to show</param>
        /// <returns>The text as report markup.</returns>
        private static string AsReportBlock(string text)
        {
            return "<pre style=\"white-space:pre-wrap;margin:0;font-family:Consolas,monospace\">"
                + WebUtility.HtmlEncode(text)
                + "</pre>";
        }

        public static void AfterScenario(IObjectContainer container)
        {
            ArgumentNullException.ThrowIfNull(container);

            var driver = container.Resolve<IWebDriver>();
            try
            {
                driver.Quit();
                driver.Dispose();
            }
            catch (Exception e)
            {
                CommonErrorLog.WriteErrorLog(e);
            }
        }

        public static void AfterFeature()
        {
            Extent.Flush();
        }

        public static void AfterTestRun()
        {
            foreach (var chromeDriverProcess in Process.GetProcessesByName("chromedriver"))
            {
                try
                {
                    chromeDriverProcess.Kill();
                }
                catch (Exception e)
                {
                    CommonErrorLog.WriteErrorLog(e);
                }
            }
        }

        private static void CaptureScreenshot(IObjectContainer container)
        {
            var driver = container.Resolve<IWebDriver>();
            string featureTitle = container.Resolve<FeatureContext>().FeatureInfo.Title;
            string screenshotDirectory = Path.Combine(Environment.CurrentDirectory, DefaultValue.ScreenShots);

            try
            {
                Directory.CreateDirectory(screenshotDirectory);
                var screenshot = ((ITakesScreenshot)driver).GetScreenshot();
                string fileName = featureTitle + "-" + Guid.NewGuid() + DefaultValue.ScreenShotFormat;
                screenshot.SaveAsFile(Path.Combine(screenshotDirectory, fileName));
            }
            catch (Exception e)
            {
                CommonErrorLog.WriteErrorLog(e);
            }
        }
    }
}
