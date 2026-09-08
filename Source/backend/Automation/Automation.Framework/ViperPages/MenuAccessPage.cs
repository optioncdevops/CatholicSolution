// Copyright (c) OptionC. All rights reserved.

using OpenQA.Selenium;

using static Automation.Framework.ViperPages.ViperCommonVariable;

namespace Automation.Framework.ViperPages
{
    /// <summary>
    /// Walks the Acutis top nav bar and reports whether each page it opens renders anything.
    /// </summary>
    /// <remarks>
    /// Every method here reports failures rather than throwing, so one run visits every menu
    /// and hands back the complete list of pages that did not come up.
    /// <para>
    /// The nav bar is built from labels and routes, not control ids - nothing in the rendered
    /// chrome carries the session key a menu is configured with - so a menu is addressed by
    /// the text it shows and checked against the route it is configured to open.
    /// </para>
    /// </remarks>
    public class MenuAccessPage(IWebDriver webDriver): BasePageObject(webDriver)
    {
        // The bar itself is only waited for once, when the first menu is opened. After that
        // every drop down is already rendered, so a menu that is not found in a couple of
        // seconds is missing rather than slow, and waiting longer only lengthens the run.
        private const int _navBarTimeoutSeconds = 30;

        private const int _menuTimeoutSeconds = 3;

        private const int _dataTimeoutSeconds = 20;

        private const int _shortTimeoutSeconds = 1;

        // The nav bar closes whatever is open when the route changes, and that runs a render
        // after the address bar has already moved on. A menu opened in the gap is closed
        // again underneath the walk, so an entry that is not there is looked for twice
        // before it is believed to be missing.
        private const int _menuAttempts = 2;

        private bool _navBarIsUp;

        /// <summary>
        /// Opens a menu, then its sub menu when there is one, and checks that the page it
        /// lands on is the expected route and has rendered something.
        /// </summary>
        /// <param name="menu">the visible text of the top level menu</param>
        /// <param name="subMenu">the visible text of the sub menu, or an empty string for a menu that navigates directly</param>
        /// <param name="path">the route the entry should land on</param>
        /// <returns>How the menu turned out.</returns>
        public MenuVisit OpenPage(string menu, string subMenu, string path)
        {
            string page = string.IsNullOrWhiteSpace(subMenu) ? menu : $"{menu} > {subMenu}";

            if (!WaitForNavBar())
            {
                return MenuVisit.Broken(page, path, "the top nav bar never rendered, so no menu could be opened");
            }

            string wasAt = CurrentPath();

            string? unopened = ClickThrough(menu, subMenu);
            if (unopened is not null)
            {
                return MenuVisit.Broken(page, path, unopened);
            }

            if (!WaitForPath(path))
            {
                return MenuVisit.Broken(page, path, $"the browser stayed on '{CurrentPath()}'");
            }

            WaitForReload(wasAt, path);
            WaitForGridToSettle();

            if (IsElementVisible(XPath_MenuAccess.PageNotFound, _shortTimeoutSeconds))
            {
                return MenuVisit.Broken(page, path, "the route does not exist - the app rendered its Page not found screen");
            }

            if (IsElementVisible(XPath_MenuAccess.EmptyGrid, _shortTimeoutSeconds))
            {
                return MenuVisit.NoData(page, path);
            }

            if (!HasContent())
            {
                return MenuVisit.Broken(page, path, $"the page opened but rendered nothing within {_dataTimeoutSeconds} seconds");
            }

            return MenuVisit.Opened(page, path);
        }

        /// <summary>Whether the page showing has rendered grid rows, a form or a heading.</summary>
        /// <returns><c>true</c> when any of those is showing.</returns>
        public bool HasContent()
        {
            return IsElementVisible(XPath_MenuAccess.GridRow, _shortTimeoutSeconds)
                || IsElementVisible(XPath_MenuAccess.FormField, _shortTimeoutSeconds)
                || IsElementVisible(XPath_MenuAccess.PageHeading, _shortTimeoutSeconds);
        }

        /// <summary>
        /// Opens a menu and, when it has one, the entry under it.
        /// </summary>
        /// <param name="menu">the visible text of the top level menu</param>
        /// <param name="subMenu">the visible text of the sub menu, or an empty string</param>
        /// <returns><c>null</c> once the entry has been clicked, otherwise why it could not be.</returns>
        private string? ClickThrough(string menu, string subMenu)
        {
            string? problem = null;

            for (int attempt = 0; attempt < _menuAttempts; attempt++)
            {
                if (!OpenTopMenu(menu))
                {
                    problem = $"'{menu}' is not in the top nav bar, nor under {XPath_MenuAccess.MoreMenu}";
                    continue;
                }

                // A menu with no entries under it has already navigated by being clicked.
                if (string.IsNullOrWhiteSpace(subMenu)
                    || ClickFirstDisplayed(XPath_MenuAccess.MenuEntry(subMenu), _menuTimeoutSeconds))
                {
                    return null;
                }

                problem = $"'{subMenu}' did not appear in the '{menu}' drop down";
            }

            return problem;
        }

        /// <summary>
        /// Waits once for the nav bar to render. The wait is only paid on the first menu of
        /// a run; afterwards the bar is up and the check costs a single DOM lookup.
        /// </summary>
        /// <returns><c>true</c> when the bar is showing.</returns>
        private bool WaitForNavBar()
        {
            if (_navBarIsUp)
            {
                return true;
            }

            _navBarIsUp = IsElementVisible(XPath_MenuAccess.TopNav, _navBarTimeoutSeconds);
            return _navBarIsUp;
        }

        /// <summary>
        /// Opens a top level menu, falling back to the More menu the nav bar moves whatever
        /// does not fit into.
        /// </summary>
        /// <param name="menu">the visible text of the top level menu</param>
        /// <returns><c>true</c> when the menu was found and clicked.</returns>
        private bool OpenTopMenu(string menu)
        {
            if (ClickFirstDisplayed(XPath_MenuAccess.TopMenu(menu), _menuTimeoutSeconds))
            {
                return true;
            }

            // A More menu that is already open holds the group as an ordinary entry. Clicking
            // More again would close it, so the group is taken from the open menu first.
            if (ClickFirstDisplayed(XPath_MenuAccess.MenuEntry(menu), _shortTimeoutSeconds))
            {
                return true;
            }

            if (!ClickFirstDisplayed(XPath_MenuAccess.TopMenu(XPath_MenuAccess.MoreMenu), _shortTimeoutSeconds))
            {
                return false;
            }

            return ClickFirstDisplayed(XPath_MenuAccess.MenuEntry(menu), _menuTimeoutSeconds);
        }

        /// <summary>The route showing in the address bar, without its query string.</summary>
        /// <returns>The path part of the current url.</returns>
        private string CurrentPath()
        {
            return Uri.TryCreate(_webDriver.Url, UriKind.Absolute, out var url) ? url.AbsolutePath : _webDriver.Url;
        }

        /// <summary>Waits for the address bar to reach the given route.</summary>
        /// <remarks>
        /// Only the path is compared. Several entries carry the state they open a shared page
        /// with in the query string, so comparing the whole url would fail every one of them.
        /// </remarks>
        /// <param name="path">the route to wait for</param>
        /// <returns><c>true</c> when the browser reached it in time.</returns>
        private bool WaitForPath(string path)
        {
            return WaitFor(
                driver => CurrentPath().EndsWith(path, StringComparison.OrdinalIgnoreCase),
                _menuTimeoutSeconds);
        }

        /// <summary>
        /// Gives a menu that reopens the route already showing a moment to start reloading.
        /// </summary>
        /// <remarks>
        /// Whole groups of entries share one route and differ only in the state they pass it -
        /// every ticket list is /tickets-details, every comment list is /comments-details. For
        /// those the route check is satisfied by the page left over from the previous entry, so
        /// without this the grid that is about to be thrown away is what gets checked.
        /// </remarks>
        /// <param name="wasAt">the route showing before the menu was clicked</param>
        /// <param name="path">the route the menu opens</param>
        private void WaitForReload(string wasAt, string path)
        {
            if (!wasAt.EndsWith(path, StringComparison.OrdinalIgnoreCase))
            {
                return;
            }

            // A page that reloads without a skeleton is left to the settle check below.
            WaitFor(
                driver => driver.FindElements(By.XPath(XPath_MenuAccess.LoadingRow)).Count > 0,
                _shortTimeoutSeconds);
        }

        /// <summary>
        /// Waits for the page to stop loading: the grid's skeleton is gone and something -
        /// rows, a form, a heading, an empty state or the not found screen - is on screen.
        /// </summary>
        /// <remarks>
        /// The skeleton is made of real table rows with nothing in them, so without waiting it
        /// out a loading grid reads as a grid full of data. Both halves are polled together so
        /// a page that is simply not a grid does not sit out the data timeout first.
        /// </remarks>
        private void WaitForGridToSettle()
        {
            // A page that never settles is left to the checks above to report.
            WaitFor(
                driver => driver.FindElements(By.XPath(XPath_MenuAccess.LoadingRow)).Count == 0
                    && driver.FindElements(By.XPath(XPath_MenuAccess.SettledPage)).Any(element => element.Displayed),
                _dataTimeoutSeconds);
        }
    }
}
