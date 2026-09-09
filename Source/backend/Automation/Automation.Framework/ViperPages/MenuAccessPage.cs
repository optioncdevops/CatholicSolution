// Copyright (c) OptionC. All rights reserved.

using OpenQA.Selenium;

using static Automation.Framework.ViperPages.ViperCommonVariable;

namespace Automation.Framework.ViperPages
{
    /// <summary>
    /// The outcome of opening one menu entry.
    /// </summary>
    /// <param name="Group">the top level menu the entry sits under, or the entry itself when it is a top level link</param>
    /// <param name="Entry">the visible label that was clicked</param>
    /// <param name="ExpectedPath">the path the menu link pointed at</param>
    /// <param name="ActualUrl">where the browser ended up</param>
    /// <param name="Passed">whether the page opened</param>
    /// <param name="Detail">why it failed, or what settled the page when it passed</param>
    public sealed record MenuVisit(
        string Group,
        string Entry,
        string ExpectedPath,
        string ActualUrl,
        bool Passed,
        string Detail)
    {
        /// <summary>One fixed width line per visit, for the run report.</summary>
        /// <returns>The visit as a report line.</returns>
        public override string ToString()
        {
            string outcome = Passed ? "PASS" : "FAIL";
            return $"{outcome}  {Group,-18}  {Entry,-28}  {Detail}";
        }
    }

    /// <summary>
    /// Walks every menu in the Acutis top nav bar and checks that each one opens its page.
    /// </summary>
    /// <remarks>
    /// The menus are read out of the DOM rather than listed here. They come from the menu
    /// data the login response returns, so they differ per role and per environment, and a
    /// hardcoded list would either miss a menu the role has or fail on one it does not.
    /// </remarks>
    public class MenuAccessPage(IWebDriver webDriver) : BasePageObject(webDriver)
    {
        // Long enough for a lazily loaded route chunk plus its first data call on a cold
        // server, short enough that a genuinely broken link does not stall the whole run.
        private const int _pageLoadTimeoutSeconds = 30;

        private const int _menuTimeoutSeconds = 10;

        /// <summary>Waits for the top nav bar to render after sign in.</summary>
        /// <returns><c>true</c> when the bar appeared.</returns>
        public bool WaitForTopNav()
        {
            return IsElementVisible(XPath_MenuAccess.TopNavItem, _pageLoadTimeoutSeconds);
        }

        /// <summary>Reads the visible label of every top level menu in the nav bar.</summary>
        /// <returns>The labels, in the order the bar shows them.</returns>
        public IReadOnlyList<string> ReadTopMenuLabels()
        {
            var labels = new List<string>();
            foreach (var item in _webDriver.FindElements(By.XPath(XPath_MenuAccess.TopNavItem)))
            {
                string label = ReadLabel(item);
                if (label.Length > 0 && !labels.Contains(label))
                {
                    labels.Add(label);
                }
            }

            return labels;
        }

        /// <summary>
        /// Opens every top level menu and every entry underneath it, and reports on each one.
        /// </summary>
        /// <remarks>
        /// Nothing throws on a bad page. A menu that does not open is recorded and the walk
        /// carries on, so one broken link produces one failure line rather than hiding every
        /// menu after it.
        /// </remarks>
        /// <returns>One result per menu entry that was visited.</returns>
        public IReadOnlyList<MenuVisit> VisitAllMenus()
        {
            var results = new List<MenuVisit>();

            foreach (string group in ReadTopMenuLabels())
            {
                // The entries are collected as text before anything is clicked. Navigating
                // away unmounts the drop down, so element handles taken from it are stale by
                // the time the next entry is due to be clicked.
                var entries = OpenMenuAndReadEntries(group);

                if (entries is null)
                {
                    results.Add(new MenuVisit(group, group, string.Empty, _webDriver.Url, false, "the menu did not open"));
                    continue;
                }

                if (entries.Count == 0)
                {
                    // No drop down opened, so this is a top level link: the click that was
                    // meant to open a menu has navigated instead.
                    results.Add(CheckLandedPage(group, group, ReadTopMenuHref(group)));
                    continue;
                }

                foreach (var (label, href) in entries)
                {
                    results.Add(VisitEntry(group, label, href));
                }
            }

            return results;
        }

        /// <summary>Clicks one entry of a drop down and checks the page it opens.</summary>
        /// <param name="group">the top level menu the entry sits under</param>
        /// <param name="label">the visible label of the entry</param>
        /// <param name="href">the path the entry points at</param>
        /// <returns>The result of the visit.</returns>
        private MenuVisit VisitEntry(string group, string label, string href)
        {
            // The drop down closed on the previous navigation, so it is reopened per entry.
            if (!ClickFirstDisplayed(XPath_MenuAccess.TopMenu(group), _menuTimeoutSeconds))
            {
                return new MenuVisit(group, label, href, _webDriver.Url, false, "the menu did not open");
            }

            if (!ClickFirstDisplayed(XPath_MenuAccess.MenuEntry(label), _menuTimeoutSeconds))
            {
                return new MenuVisit(group, label, href, _webDriver.Url, false, "the sub menu entry was not clickable");
            }

            return CheckLandedPage(group, label, href);
        }

        /// <summary>
        /// Opens a top level menu and reads its entries.
        /// </summary>
        /// <param name="group">the visible label of the menu</param>
        /// <returns>
        /// The label and path of each entry, an empty list when the menu is a link that
        /// navigated instead of opening, or <c>null</c> when the menu could not be clicked.
        /// </returns>
        private List<(string Label, string Href)>? OpenMenuAndReadEntries(string group)
        {
            if (!ClickFirstDisplayed(XPath_MenuAccess.TopMenu(group), _menuTimeoutSeconds))
            {
                return null;
            }

            var entries = new List<(string Label, string Href)>();
            if (FindFirstDisplayed(XPath_MenuAccess.DropDownPanel, 2) is null)
            {
                return entries;
            }

            foreach (var entry in _webDriver.FindElements(By.XPath(XPath_MenuAccess.DropDownEntry)))
            {
                string label = ReadLabel(entry);
                if (label.Length > 0)
                {
                    entries.Add((label, ReadPath(entry)));
                }
            }

            return entries;
        }

        /// <summary>
        /// Checks the page the browser landed on after a menu was clicked.
        /// </summary>
        /// <remarks>
        /// The url is checked as well as the content, because the router sends an unmatched
        /// path to the dashboard rather than to a not found screen. Without the url check a
        /// menu pointing at a route that no longer exists would quietly pass on the dashboard
        /// that replaced it.
        /// </remarks>
        /// <param name="group">the top level menu the entry sits under</param>
        /// <param name="label">the visible label that was clicked</param>
        /// <param name="expectedPath">the path the menu link pointed at</param>
        /// <returns>The result of the visit.</returns>
        private MenuVisit CheckLandedPage(string group, string label, string expectedPath)
        {
            WaitForLoadingToFinish();

            if (!IsElementVisible(XPath_MenuAccess.SettledPage, _pageLoadTimeoutSeconds))
            {
                return new MenuVisit(group, label, expectedPath, _webDriver.Url, false, $"the page did not render within {_pageLoadTimeoutSeconds}s");
            }

            string url = _webDriver.Url;
            string landedPath = CurrentPath();

            if (IsElementVisible(XPath_MenuAccess.AccessDenied, 1))
            {
                return new MenuVisit(group, label, expectedPath, url, false, "the page reported access denied");
            }

            if (expectedPath.Length > 0 && !landedPath.Equals(expectedPath, StringComparison.OrdinalIgnoreCase))
            {
                return new MenuVisit(group, label, expectedPath, url, false, $"the link went to '{landedPath}' instead of '{expectedPath}'");
            }

            return new MenuVisit(group, label, expectedPath, url, true, $"opened {landedPath}");
        }

        /// <summary>Waits out the route loader and any grid skeleton rows.</summary>
        private void WaitForLoadingToFinish()
        {
            WaitFor(
                driver => driver.FindElements(By.XPath(XPath_MenuAccess.Loading)).All(element => !element.Displayed),
                _pageLoadTimeoutSeconds);
        }

        /// <summary>Reads the path of the top level menu with the given label.</summary>
        /// <param name="label">the visible text of the menu</param>
        /// <returns>The path it points at, or an empty string when it is not a link.</returns>
        private string ReadTopMenuHref(string label)
        {
            var menu = FindFirstDisplayed(XPath_MenuAccess.TopMenu(label), _menuTimeoutSeconds);
            return menu is null ? string.Empty : ReadPath(menu);
        }

        /// <summary>Reads the current url's path, without its query or fragment.</summary>
        /// <returns>The path part of the browser's url.</returns>
        private string CurrentPath()
        {
            return NormalisePath(new Uri(_webDriver.Url).AbsolutePath);
        }

        /// <summary>Reads the path an anchor points at, dropping the origin.</summary>
        /// <param name="element">the anchor to read</param>
        /// <returns>The path, or an empty string when the element is not a link.</returns>
        private static string ReadPath(IWebElement element)
        {
            string href = element.GetAttribute("href") ?? string.Empty;
            if (href.Length == 0)
            {
                return string.Empty;
            }

            return Uri.TryCreate(href, UriKind.Absolute, out var uri)
                ? NormalisePath(uri.AbsolutePath)
                : NormalisePath(href);
        }

        /// <summary>Drops a trailing slash so '/admin/' and '/admin' compare equal.</summary>
        /// <param name="path">the path to tidy</param>
        /// <returns>The path without its trailing slash.</returns>
        private static string NormalisePath(string path)
        {
            string trimmed = path.TrimEnd('/');
            return trimmed.Length > 0 ? trimmed : "/";
        }

        /// <summary>
        /// Reads the visible label of a nav item.
        /// </summary>
        /// <remarks>
        /// The trigger also holds an icon and a chevron, so the label is taken from the span
        /// that carries the text rather than from the whole element's text.
        /// </remarks>
        /// <param name="element">the nav item to read</param>
        /// <returns>The label, or an empty string when it carries none.</returns>
        private static string ReadLabel(IWebElement element)
        {
            foreach (var span in element.FindElements(By.XPath(".//span")))
            {
                string text = span.Text.Trim();
                if (text.Length > 0)
                {
                    return text;
                }
            }

            return element.Text.Trim();
        }
    }
}
