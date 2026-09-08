// Copyright (c) OptionC. All rights reserved.

namespace Automation.Framework.ViperPages
{
    /// <summary>How a menu the walk opened turned out.</summary>
    public enum MenuResult
    {
        /// <summary>The page opened and rendered its data.</summary>
        Opened,

        /// <summary>The page opened, but its grid had nothing to show.</summary>
        NoData,

        /// <summary>The menu did not open its page.</summary>
        Broken,
    }

    /// <summary>
    /// What happened when one menu was opened.
    /// </summary>
    /// <remarks>
    /// A grid with no rows is kept apart from a menu that is actually broken. The walk is
    /// checking that every link reaches its page, and a page that comes up with an empty
    /// grid has done that - reporting it as a failure buries the menus that really are
    /// broken among rows that are only empty.
    /// </remarks>
    /// <param name="Page">the menu, as it reads in the nav bar</param>
    /// <param name="Path">the route the menu opens</param>
    /// <param name="Result">how it turned out</param>
    /// <param name="Detail">what went wrong, empty when nothing did</param>
    public sealed record MenuVisit(string Page, string Path, MenuResult Result, string Detail)
    {
        /// <summary>A menu that opened its page with data on it.</summary>
        /// <param name="page">the menu, as it reads in the nav bar</param>
        /// <param name="path">the route the menu opens</param>
        /// <returns>The visit.</returns>
        public static MenuVisit Opened(string page, string path)
        {
            return new MenuVisit(page, path, MenuResult.Opened, string.Empty);
        }

        /// <summary>A menu that opened its page, on which the grid was empty.</summary>
        /// <param name="page">the menu, as it reads in the nav bar</param>
        /// <param name="path">the route the menu opens</param>
        /// <returns>The visit.</returns>
        public static MenuVisit NoData(string page, string path)
        {
            return new MenuVisit(page, path, MenuResult.NoData, "the grid reported 'No data available'");
        }

        /// <summary>A menu that did not open its page.</summary>
        /// <param name="page">the menu, as it reads in the nav bar</param>
        /// <param name="path">the route the menu opens</param>
        /// <param name="detail">what went wrong</param>
        /// <returns>The visit.</returns>
        public static MenuVisit Broken(string page, string path, string detail)
        {
            return new MenuVisit(page, path, MenuResult.Broken, detail);
        }
    }
}
