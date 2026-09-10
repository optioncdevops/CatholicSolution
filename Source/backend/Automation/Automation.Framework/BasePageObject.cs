// Copyright (c) OptionC. All rights reserved.

using OpenQA.Selenium;
using OpenQA.Selenium.Support.UI;

using SeleniumExtras.PageObjects;

using static Automation.Framework.CommonVariable;

namespace Automation.Framework
{
    public abstract class BasePageObject
    {
        protected readonly IWebDriver _webDriver;
        protected readonly IWait<IWebDriver> _wait;
        protected readonly int _webDriverType = 2; // 1 - IWebDriver and  2 - IWait

        private const int _implicitWaitMilliseconds = 5000;

        protected BasePageObject(IWebDriver webDriver)
        {
            ArgumentNullException.ThrowIfNull(webDriver);

            PageFactory.InitElements(webDriver, this);
            webDriver.Manage().Timeouts().ImplicitWait = TimeSpan.FromMilliseconds(_implicitWaitMilliseconds);
            _wait = new WebDriverWait(webDriver, TimeSpan.FromSeconds(300));
            _webDriver = webDriver;
        }

        public void OpenWebDriver(string url)
        {
            _webDriver.Navigate().GoToUrl(url);
            _webDriver.Manage().Window.Maximize();
        }

        #region Commom Methods

        //Common method for converting the given date into MM/DD/YYYY format
        public string GetDateFormat(string sDate = "")
        {
            if (string.IsNullOrEmpty(sDate))
            {
                return DateTime.Today.ToString("MM/dd/yyyy");
            }

            return Convert.ToDateTime(sDate).ToString("MM/dd/yyyy");
        }

        //Common method for converting the given time into HH:MM TT format
        public string GetTimeFormat(string sTime = "")
        {
            if (string.IsNullOrEmpty(sTime))
            {
                return DateTime.Now.ToString("hh:mm tt");
            }

            return Convert.ToDateTime(sTime).ToString("hh:mm tt");
        }

        #endregion Commom Methods

        #region Find the Element By Id

        /// <summary>
        ///  This method used to get the id from the active page and click the controls
        /// </summary>
        /// <param name="id"> send the control id</param>
        public void FindElementById(string id)
        {
            FindElementById(id, "", "");
        }

        /// <summary>
        /// This method used to get the id from the active page and bind the value is passed
        /// </summary>
        /// <param name="id">send the control id</param>
        /// <param name="value">the value to bind to the control</param>
        public void FindElementById(string id, string value = "")
        {
            FindElementById(id, value, "SendKey");
        }

        /// <summary>
        /// This method used to get the id from the active page and bind the value is passed and then action to be performed
        /// </summary>
        /// <param name="id">send the control id</param>
        /// <param name="value">the value to bind to the control</param>
        /// <param name="action">the action to be performed on the control</param>
        /// <returns>The control text when <paramref name="action"/> is "Text", otherwise an empty string.</returns>
        public string FindElementById(string id, string value, string action)
        {
            ArgumentNullException.ThrowIfNull(value);

            string returnValues = "";
            new CommonErrorLog().WriteLog(id, value, action, 1);
            if (_webDriverType == 1)
            {
                if (action == "SendKey")
                {
                    _webDriver.FindElement(By.Id(id)).Clear();
                    _webDriver.FindElement(By.Id(id)).SendKeys(value);
                }
                else if (action == "Text")
                {
                    returnValues = _webDriver.FindElement(By.Id(id)).Text;
                }
                else if (action == "FileUpload")
                {
                    // Approach 01 : sendKeys
                    _webDriver.FindElement(By.Id(id)).SendKeys(GetDateFormat(value));

                    //// Approach 02 : AutoItX3
                    //_webDriver.FindElement(By.Id(id)).Click();
                    //AutoItX3 autoItX3 = new AutoItX3();
                    //autoItX3.WinActivate("Open");
                    //autoItX3.Send(value);
                    //autoItX3.Send("ENTER");
                }
                else if (action == "Date")
                {
                    _webDriver.FindElement(By.Id(id)).Clear();
                    _webDriver.FindElement(By.Id(id)).SendKeys(GetDateFormat(value));
                }
                else if (action == "Time")
                {
                    _webDriver.FindElement(By.Id(id)).Clear();
                    _webDriver.FindElement(By.Id(id)).SendKeys(GetTimeFormat(value));
                }
                else if (action == "Clear")
                {
                    _webDriver.FindElement(By.Id(id)).Clear();
                }
                else if (action == "MultiSelect")
                {
                    string[] valueList = value.Split(',');
                    for (int count = 0; count < valueList.Length; ++count)
                    {
                        new SelectElement(_webDriver.FindElement(By.Id(id))).SelectByValue(valueList[count]);
                    }
                }
                else if (action == "Select")
                {
                    new SelectElement(_webDriver.FindElement(By.Id(id))).SelectByValue(value);
                }
                else
                {
                    _webDriver.FindElement(By.Id(id)).Click();
                }
            }
            else
            {
                if (action == "SendKey")
                {
                    _wait.Until(ExpectedConditions.ElementIsVisible(By.Id(id))).Clear();
                    _wait.Until(ExpectedConditions.ElementIsVisible(By.Id(id))).SendKeys(value);
                }
                else if (action == "Text")
                {
                    returnValues = _wait.Until(ExpectedConditions.ElementIsVisible(By.Id(id))).Text;
                }
                else if (action == "FileUpload")
                {
                    // Approach 01 : sendKeys
                    _wait.Until(ExpectedConditions.ElementIsVisible(By.Id(id))).SendKeys(value);

                    // Approach 02 : AutoItX3
                    //_wait.Until(ExpectedConditions.ElementIsVisible(By.Id(id))).Click();
                    //AutoItX3 autoItX3 = new AutoItX3();
                    //autoItX3.WinActivate("Open");
                    //autoItX3.Send(value);
                    //autoItX3.Send("ENTER");
                }
                else if (action == "Date")
                {
                    _wait.Until(ExpectedConditions.ElementIsVisible(By.Id(id))).Clear();
                    _wait.Until(ExpectedConditions.ElementIsVisible(By.Id(id))).SendKeys(GetDateFormat(value));
                }
                else if (action == "Time")
                {
                    _wait.Until(ExpectedConditions.ElementIsVisible(By.Id(id))).Clear();
                    _wait.Until(ExpectedConditions.ElementIsVisible(By.Id(id))).SendKeys(GetTimeFormat(value));
                }
                else if (action == "Clear")
                {
                    _wait.Until(ExpectedConditions.ElementIsVisible(By.Id(id))).Clear();
                }
                else if (action == "MultiSelect")
                {
                    string[] valueList = value.Split(',');
                    for (int count = 0; count < valueList.Length; ++count)
                    {
                        new SelectElement(_wait.Until(ExpectedConditions.ElementIsVisible(By.Id(id)))).SelectByValue(valueList[count]);
                    }
                }
                else if (action == "Select")
                {
                    new SelectElement(_wait.Until(ExpectedConditions.ElementIsVisible(By.Id(id)))).SelectByValue(value);
                }
                else
                {
                    _wait.Until(ExpectedConditions.ElementIsVisible(By.Id(id))).Click();
                }
            }

            Thread.Sleep(1000);
            return returnValues;
        }

        #endregion Find the Element By Id

        #region Find the Element By Name

        /// <summary>
        ///  This method used to get the name from the active page and click the controls
        /// </summary>
        /// <param name="name"> send the control name</param>
        public void FindElementByName(string name)
        {
            FindElementByName(name, "", "");
        }

        /// <summary>
        /// This method used to get the name from the active page and bind the value is passed
        /// </summary>
        /// <param name="name">send the control name</param>
        /// <param name="value">the value to bind to the control</param>
        public void FindElementByName(string name, string value = "")
        {
            FindElementByName(name, value, "SendKey");
        }

        /// <summary>
        /// This method used to get the name from the active page and bind the value is passed and then action to be performed
        /// </summary>
        /// <param name="name">send the control name</param>
        /// <param name="value">the value to bind to the control</param>
        /// <param name="action">the action to be performed on the control</param>
        /// <returns>The control text when <paramref name="action"/> is "Text", otherwise an empty string.</returns>
        public string FindElementByName(string name, string value, string action)
        {
            ArgumentNullException.ThrowIfNull(value);

            string returnValues = "";
            new CommonErrorLog().WriteLog(name, value, action, 1);
            if (_webDriverType == 1)
            {
                if (action == "SendKey")
                {
                    _webDriver.FindElement(By.Name(name)).Clear();
                    _webDriver.FindElement(By.Name(name)).SendKeys(value);
                }
                else if (action == "Text")
                {
                    returnValues = _webDriver.FindElement(By.Id(name)).Text;
                }
                else if (action == "Date")
                {
                    _webDriver.FindElement(By.Name(name)).Clear();
                    _webDriver.FindElement(By.Name(name)).SendKeys(GetDateFormat(value));
                }
                else if (action == "Time")
                {
                    _webDriver.FindElement(By.Name(name)).Clear();
                    _webDriver.FindElement(By.Name(name)).SendKeys(GetTimeFormat(value));
                }
                else if (action == "Clear")
                {
                    _webDriver.FindElement(By.Name(name)).Clear();
                }
                else if (action == "MultiSelect")
                {
                    string[] valueList = value.Split(',');
                    for (int count = 0; count < valueList.Length; ++count)
                    {
                        new SelectElement(_webDriver.FindElement(By.Name(name))).SelectByValue(valueList[count]);
                    }
                }
                else if (action == "Select")
                {
                    new SelectElement(_webDriver.FindElement(By.Name(name))).SelectByValue(value);
                }
                else
                {
                    _webDriver.FindElement(By.Name(name)).Click();
                }
            }
            else
            {
                if (action == "SendKey")
                {
                    _wait.Until(ExpectedConditions.ElementIsVisible(By.Name(name))).Clear();
                    _wait.Until(ExpectedConditions.ElementIsVisible(By.Name(name))).SendKeys(value);
                }
                else if (action == "Text")
                {
                    returnValues = _wait.Until(ExpectedConditions.ElementIsVisible(By.Name(name))).Text;
                }
                else if (action == "Date")
                {
                    _wait.Until(ExpectedConditions.ElementIsVisible(By.Name(name))).Clear();
                    _wait.Until(ExpectedConditions.ElementIsVisible(By.Name(name))).SendKeys(GetDateFormat(value));
                }
                else if (action == "Time")
                {
                    _wait.Until(ExpectedConditions.ElementIsVisible(By.Name(name))).Clear();
                    _wait.Until(ExpectedConditions.ElementIsVisible(By.Name(name))).SendKeys(GetTimeFormat(value));
                }
                else if (action == "Clear")
                {
                    _wait.Until(ExpectedConditions.ElementIsVisible(By.Name(name))).Clear();
                }
                else if (action == "MultiSelect")
                {
                    string[] valueList = value.Split(',');
                    for (int count = 0; count < valueList.Length; ++count)
                    {
                        new SelectElement(_wait.Until(ExpectedConditions.ElementIsVisible(By.Name(name)))).SelectByValue(valueList[count]);
                    }
                }
                else if (action == "Select")
                {
                    new SelectElement(_wait.Until(ExpectedConditions.ElementIsVisible(By.Name(name)))).SelectByValue(value);
                }
                else
                {
                    _wait.Until(ExpectedConditions.ElementIsVisible(By.Name(name))).Click();
                }
            }

            return returnValues;
        }

        #endregion Find the Element By Name

        #region Find the Element By XPath

        /// <summary>
        ///  This method used to get the element from the active page and click the controls
        /// </summary>
        /// <param name="xPath"> send the control xpath</param>
        public void FindElementByXPath(string xPath)
        {
            FindElementByXPath(xPath, "", "");
        }

        /// <summary>
        /// This method used to get the element from the active page and bind the value is passed
        /// </summary>
        /// <param name="xPath">send the control xpath</param>
        /// <param name="value">the value to bind to the control</param>
        public void FindElementByXPath(string xPath, string value = "")
        {
            FindElementByXPath(xPath, value, "SendKey");
        }

        /// <summary>
        /// This method used to get the element from the active page and bind the value is passed and then action to be performed
        /// </summary>
        /// <param name="xPath">send the control xpath</param>
        /// <param name="value">the value to bind to the control</param>
        /// <param name="action">the action to be performed on the control</param>
        /// <returns>The control text when <paramref name="action"/> is "Text", otherwise an empty string.</returns>
        public string FindElementByXPath(string xPath, string value, string action)
        {
            ArgumentNullException.ThrowIfNull(value);

            string returnValues = "";
            new CommonErrorLog().WriteLog(xPath, value, action, 1);
            if (_webDriverType == 1)
            {
                if (action == "SendKey")
                {
                    _webDriver.FindElement(By.XPath(xPath)).Clear();
                    _webDriver.FindElement(By.XPath(xPath)).SendKeys(value);
                }
                else if (action == "Text")
                {
                    returnValues = _webDriver.FindElement(By.XPath(xPath)).Text;
                }
                else if (action == "Date")
                {
                    _webDriver.FindElement(By.XPath(xPath)).Clear();
                    _webDriver.FindElement(By.XPath(xPath)).SendKeys(GetDateFormat(value));
                }
                else if (action == "Time")
                {
                    _webDriver.FindElement(By.XPath(xPath)).Clear();
                    _webDriver.FindElement(By.XPath(xPath)).SendKeys(GetTimeFormat(value));
                }
                else if (action == "Clear")
                {
                    _webDriver.FindElement(By.XPath(xPath)).Clear();
                }
                else if (action == "MultiSelect")
                {
                    string[] valueList = value.Split(',');
                    for (int count = 0; count < valueList.Length; ++count)
                    {
                        new SelectElement(_webDriver.FindElement(By.XPath(xPath))).SelectByValue(valueList[count]);
                    }
                }
                else if (action == "Enter")
                {
                    _webDriver.FindElement(By.XPath(xPath)).SendKeys(Keys.Enter);
                    _webDriver.FindElement(By.XPath(xPath)).SendKeys(Keys.Tab);
                }
                else if (action == "Dropdown")
                {
                    _webDriver.FindElement(By.XPath(xPath)).SendKeys(value);
                    _webDriver.FindElement(By.XPath(xPath)).SendKeys(Keys.Enter);
                    _webDriver.FindElement(By.XPath(xPath)).SendKeys(Keys.Tab);
                }
                else if (action == "Select")
                {
                    new SelectElement(_webDriver.FindElement(By.XPath(xPath))).SelectByValue(value);
                }
                else
                {
                    _webDriver.FindElement(By.XPath(xPath)).Click();
                }
            }
            else
            {
                if (action == "SendKey")
                {
                    _wait.Until(ExpectedConditions.ElementIsVisible(By.XPath(xPath))).Clear();
                    _wait.Until(ExpectedConditions.ElementIsVisible(By.XPath(xPath))).SendKeys(value);
                }
                else if (action == "Date")
                {
                    _wait.Until(ExpectedConditions.ElementIsVisible(By.XPath(xPath))).Clear();
                    _wait.Until(ExpectedConditions.ElementIsVisible(By.XPath(xPath))).SendKeys(GetDateFormat(value));
                }
                else if (action == "Time")
                {
                    _wait.Until(ExpectedConditions.ElementIsVisible(By.XPath(xPath))).Clear();
                    _wait.Until(ExpectedConditions.ElementIsVisible(By.XPath(xPath))).SendKeys(GetTimeFormat(value));
                }
                else if (action == "Clear")
                {
                    _wait.Until(ExpectedConditions.ElementIsVisible(By.XPath(xPath))).Clear();
                }
                else if (action == "MultiSelect")
                {
                    string[] valueList = value.Split(',');
                    for (int count = 0; count < valueList.Length; ++count)
                    {
                        new SelectElement(_wait.Until(ExpectedConditions.ElementIsVisible(By.XPath(xPath)))).SelectByValue(valueList[count]);
                    }
                }
                else if (action == "Enter")
                {
                    _wait.Until(ExpectedConditions.ElementIsVisible(By.XPath(xPath))).SendKeys(Keys.Enter);
                    _wait.Until(ExpectedConditions.ElementIsVisible(By.XPath(xPath))).SendKeys(Keys.Tab);
                }
                else if (action == "Dropdown")
                {
                    _wait.Until(ExpectedConditions.ElementIsVisible(By.XPath(xPath))).SendKeys(value);
                    _wait.Until(ExpectedConditions.ElementIsVisible(By.XPath(xPath))).SendKeys(Keys.Enter);
                    _wait.Until(ExpectedConditions.ElementIsVisible(By.XPath(xPath))).SendKeys(Keys.Tab);
                }
                else if (action == "Select")
                {
                    new SelectElement(_wait.Until(ExpectedConditions.ElementIsVisible(By.XPath(xPath)))).SelectByValue(value);
                }
                else
                {
                    _wait.Until(ExpectedConditions.ElementIsVisible(By.XPath(xPath))).Click();
                }
            }

            Thread.Sleep(1000);
            return returnValues;
        }

        #endregion Find the Element By XPath

        #region Find the Element By Link Text

        public void FindElementByLinkText(string linkText)
        {
            if (_webDriverType == 1)
            {
                _webDriver.FindElement(By.LinkText(linkText)).Click();
            }
            else
            {
                _wait.Until(ExpectedConditions.ElementIsVisible(By.LinkText(linkText))).Click();
            }
        }

        #endregion Find the Element By Link Text

        #region Presence Checks

        /// <summary>
        /// The first element matching the xpath that the browser is actually showing, or
        /// <c>null</c> when none appears within the timeout.
        /// </summary>
        /// <remarks>
        /// Every match is considered, not just the first one in the document. The Acutis shell
        /// renders the same link twice - once in the desktop top nav and once in the mobile
        /// sidebar, which is display:none at a desktop width - so taking the document order
        /// first match finds a hidden copy and then waits the whole timeout out on it.
        /// </remarks>
        /// <param name="xPath">the xpath to look for</param>
        /// <param name="timeoutSeconds">how long to keep polling before giving up</param>
        /// <returns>The first showing match, or <c>null</c> when none appeared in time.</returns>
        public IWebElement? FindFirstDisplayed(string xPath, int timeoutSeconds)
        {
            return WaitFor(
                driver =>
                {
                    foreach (var candidate in driver.FindElements(By.XPath(xPath)))
                    {
                        if (candidate.Displayed)
                        {
                            return candidate;
                        }
                    }

                    return null;
                },
                timeoutSeconds);
        }

        /// <summary>
        /// Whether an element matching the given xpath is shown within the timeout. Unlike the
        /// FindElement helpers this reports back instead of throwing, so a caller can carry on
        /// and report every page it visited rather than stopping at the first bad one.
        /// </summary>
        /// <param name="xPath">the xpath to look for</param>
        /// <param name="timeoutSeconds">how long to keep polling before giving up</param>
        /// <returns><c>true</c> when the element was shown within the timeout.</returns>
        public bool IsElementVisible(string xPath, int timeoutSeconds)
        {
            return FindFirstDisplayed(xPath, timeoutSeconds) is not null;
        }

        /// <summary>
        /// Clicks the first showing match through the browser. See <see cref="ClickByScript"/>
        /// for why the click is scripted rather than synthesised by the driver.
        /// </summary>
        /// <param name="xPath">the xpath of the control to click</param>
        /// <param name="timeoutSeconds">how long to wait for the control to appear</param>
        /// <returns><c>true</c> when a control was found and clicked.</returns>
        public bool ClickFirstDisplayed(string xPath, int timeoutSeconds)
        {
            var element = FindFirstDisplayed(xPath, timeoutSeconds);
            if (element is null)
            {
                return false;
            }

            ((IJavaScriptExecutor)_webDriver).ExecuteScript("arguments[0].click();", element);
            return true;
        }

        /// <summary>
        /// Polls <paramref name="condition"/> until it returns a value or the timeout expires.
        /// </summary>
        /// <remarks>
        /// The implicit wait is suspended for the duration. Left on, every FindElements call
        /// that matches nothing blocks for the whole implicit wait, so a poll loop that is
        /// meant to run four times a second manages one attempt every five seconds instead.
        /// </remarks>
        /// <typeparam name="TResult">what the condition produces once it is satisfied</typeparam>
        /// <param name="condition">the condition to poll</param>
        /// <param name="timeoutSeconds">how long to keep polling before giving up</param>
        /// <returns>The condition's result, or <c>null</c> when it never came good.</returns>
        protected TResult? WaitFor<TResult>(Func<IWebDriver, TResult?> condition, int timeoutSeconds)
            where TResult : class
        {
            var wait = new WebDriverWait(_webDriver, TimeSpan.FromSeconds(timeoutSeconds))
            {
                PollingInterval = TimeSpan.FromMilliseconds(250),
            };
            wait.IgnoreExceptionTypes(typeof(StaleElementReferenceException));

            _webDriver.Manage().Timeouts().ImplicitWait = TimeSpan.Zero;
            try
            {
                return wait.Until(condition);
            }
            catch (WebDriverTimeoutException)
            {
                return null;
            }
            finally
            {
                _webDriver.Manage().Timeouts().ImplicitWait = TimeSpan.FromMilliseconds(_implicitWaitMilliseconds);
            }
        }

        /// <summary>Polls a true or false condition until it holds or the timeout expires.</summary>
        /// <param name="condition">the condition to poll</param>
        /// <param name="timeoutSeconds">how long to keep polling before giving up</param>
        /// <returns><c>true</c> when the condition held within the timeout.</returns>
        protected bool WaitFor(Func<IWebDriver, bool> condition, int timeoutSeconds)
        {
            ArgumentNullException.ThrowIfNull(condition);

            return WaitFor<string>(driver => condition(driver) ? "met" : null, timeoutSeconds) is not null;
        }

        #endregion Presence Checks

        #region All the Button Click Events

        public void ClickOnAdd()
        {
            FindElementById(XPath_Button.btnAdd);
        }

        public virtual void ClickOnSave()
        {
            FindElementById(XPath_Button.btnSave);
        }

        public virtual void ClickOnCancel()
        {
            FindElementById(XPath_Button.btnCancel);
        }

        /// <summary>
        /// Types through the browser rather than the driver. The Acutis shell swallows the
        /// key events the driver synthesises, so the value is set with the native setter and
        /// the input event React listens for is raised by hand.
        /// </summary>
        /// <param name="xPath">the xpath of the control to type into</param>
        /// <param name="value">the value to set on the control</param>
        public void SetValueByScript(string xPath, string value)
        {
            var element = _wait.Until(d => d.FindElement(By.XPath(xPath)));
            ((IJavaScriptExecutor)_webDriver).ExecuteScript(
                "var el = arguments[0], value = arguments[1];" +
                "var prototype = el.tagName === 'TEXTAREA' ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;" +
                "Object.getOwnPropertyDescriptor(prototype, 'value').set.call(el, value);" +
                "el.dispatchEvent(new Event('input', { bubbles: true }));" +
                "el.dispatchEvent(new Event('change', { bubbles: true }));",
                element, value);
            Thread.Sleep(500);
        }

        /// <summary>Sets the value of the element with the given id. See SetValueByScript.</summary>
        /// <param name="id">the id of the control to type into</param>
        /// <param name="value">the value to set on the control</param>
        public void SetValueByScriptById(string id, string value)
        {
            SetValueByScript("//*[@id='" + id + "']", value);
        }

        /// <summary>
        /// Types a date into a date picker and commits it.
        /// </summary>
        /// <remarks>
        /// Typing into the picker only updates the text it is showing. The value does not
        /// reach the form until the field is left, so the field is focused first and blurred
        /// afterwards - setting the text alone leaves the form holding no date at all, and
        /// the save fails on a required date that looks filled in on screen.
        /// </remarks>
        /// <param name="id">the id of the date picker to type into</param>
        /// <param name="value">the date to set, in the format the picker shows</param>
        public void SetDateByScriptById(string id, string value)
        {
            string xPath = "//*[@id='" + id + "']";
            var element = _wait.Until(d => d.FindElement(By.XPath(xPath)));
            ((IJavaScriptExecutor)_webDriver).ExecuteScript("arguments[0].focus();", element);
            SetValueByScript(xPath, value);
            ((IJavaScriptExecutor)_webDriver).ExecuteScript("arguments[0].blur();", element);
            Thread.Sleep(500);
        }

        /// <summary>
        /// Scrolls the first match into the middle of the viewport so a later click is not
        /// swallowed by the sticky footer or a control that is still below the fold.
        /// </summary>
        /// <param name="xPath">the xpath of the control to bring on screen</param>
        public void ScrollIntoView(string xPath)
        {
            var element = _webDriver.FindElements(By.XPath(xPath)).FirstOrDefault();
            if (element is null)
            {
                return;
            }

            ((IJavaScriptExecutor)_webDriver).ExecuteScript(
                "arguments[0].scrollIntoView({block:'center', inline:'nearest'});",
                element);
            Thread.Sleep(400);
        }

        /// <summary>
        /// Clicks through the browser rather than the driver. Some Acutis menus keep their
        /// drop down closed when the driver synthesises the click, but react to a scripted one.
        /// </summary>
        /// <param name="xPath">the xpath of the control to click</param>
        public void ClickByScript(string xPath)
        {
            var element = _wait.Until(d => d.FindElement(By.XPath(xPath)));
            ((IJavaScriptExecutor)_webDriver).ExecuteScript("arguments[0].click();", element);
            Thread.Sleep(1000);
        }

        /// <summary>
        /// Opens an Administration page from the top nav by the route it points at.
        /// </summary>
        /// <remarks>
        /// Which menu the entry sits under comes from the signed in role's menu data, and a
        /// group with no sub menus renders as a plain link rather than a drop down, so the
        /// bar is searched for the entry instead of a single menu being assumed.
        /// </remarks>
        /// <param name="route">the path the menu entry navigates to, for example /admin/administration-user-roles</param>
        public void ClickAdminNavByRoute(string route)
        {
            string topMenu = "//nav[@id='menuAdminNavigation']//a[@href='" + route + "']";
            string menuItem = "//a[@role='menuitem'][@href='" + route + "']";
            const string navDropDownTrigger = "//nav[@id='menuAdminNavigation']//button[@aria-haspopup='menu']";

            if (ClickFirstDisplayed(topMenu, 2))
            {
                return;
            }

            int groupCount = _webDriver.FindElements(By.XPath(navDropDownTrigger)).Count;
            for (int index = 1; index <= groupCount; index++)
            {
                ClickByScript($"({navDropDownTrigger})[{index}]");
                if (ClickFirstDisplayed(menuItem, 2))
                {
                    return;
                }
            }

            throw new NoSuchElementException(
                $"No menu in the top nav bar leads to '{route}'. "
                + "Either the signed in role has no rights to the page, or the route has moved.");
        }

        public void GridSearch(string searchValue)
        {
            FindElementByXPath("//*[@class='form-control input-small input-inline']", searchValue);
        }

        public void GridSearch(string searchXPathKey, string searchValue)
        {
            FindElementByXPath(searchXPathKey, searchValue);
        }

        public void ClickOnEdit()
        {
            FindElementById(XPath_Button.btnEdit);
            //_webDriver.FindElement(By.XPath("(//*[@id='btnEdit'][1])")).Click();
        }

        public void ClickOnDelete()
        {
            FindElementById(XPath_Button.btnDelete);
        }

        public virtual void ClickDeleteConfirmNo()
        {
            Thread.Sleep(1000);
            _webDriver.FindElement(By.XPath("//button[text()='No']")).Click();
            Thread.Sleep(1000);
        }

        public virtual void ClickDeleteConfirmYes()
        {
            Thread.Sleep(1000);
            _webDriver.FindElement(By.XPath("//button[text()='Yes']")).Click();
            Thread.Sleep(1000);
        }

        public void ClickOnUpdate()
        {
            FindElementById(XPath_Button.btnUpdate);
            //_webDriver.FindElement(By.XPath("(//*[@id='btnEdit'][1])")).Click();
        }

        #endregion All the Button Click Events
    }
}
