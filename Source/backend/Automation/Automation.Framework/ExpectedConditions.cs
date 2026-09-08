// Copyright (c) OptionC. All rights reserved.

using OpenQA.Selenium;

namespace Automation.Framework
{
    /// <summary>
    /// The wait conditions this framework actually uses.
    /// </summary>
    /// <remarks>
    /// These previously came from SeleniumExtras.WaitHelpers. That package
    /// (DotNetSeleniumExtras.WaitHelpers) was last released for Selenium 3 and
    /// has no Selenium 4 successor, so the single condition in use is defined
    /// here rather than pinning the solution to an abandoned dependency.
    /// </remarks>
    public static class ExpectedConditions
    {
        /// <summary>
        /// Waits for the element located by <paramref name="locator"/> to be
        /// both present in the DOM and visible, and returns it.
        /// </summary>
        public static Func<IWebDriver, IWebElement?> ElementIsVisible(By locator)
        {
            return driver =>
            {
                try
                {
                    var element = driver.FindElement(locator);
                    return element.Displayed ? element : null;
                }
                catch (NoSuchElementException)
                {
                    // Not in the DOM yet - keep polling until the wait times out.
                    return null;
                }
                catch (StaleElementReferenceException)
                {
                    // Re-rendered between locating and querying - poll again.
                    return null;
                }
            };
        }
    }
}
