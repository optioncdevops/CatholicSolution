// Copyright (c) OptionC. All rights reserved.

using OpenQA.Selenium;

using static Automation.Framework.ViperPages.ViperCommonVariable;

namespace Automation.Framework.ViperPages
{
    public class MenuNavigationPage(IWebDriver webDriver): BasePageObject(webDriver)
    {
        public void NavigateToSchoolMenuPages()
        {
            FindElementById(XPath_Menus.liSchool);
        }

        public void NavigateToDiocesesMenuPages()
        {
            FindElementById(XPath_Menus.liDioceses);
        }

        public void NavigateToTicketMenuPages()
        {
            FindElementById(XPath_Menus.liTickets);
            FindElementById(XPath_Menus.liAddTickets);

            FindElementById(XPath_Menus.liTickets);
            FindElementById(XPath_Menus.liTMyTickets);

            FindElementById(XPath_Menus.liTickets);
            FindElementById(XPath_Menus.liActiveTickets);

            FindElementById(XPath_Menus.liTickets);
            FindElementById(XPath_Menus.liTicketStatistic);

            FindElementById(XPath_Menus.liTickets);
            FindElementById(XPath_Menus.liRecentTickets);

            FindElementById(XPath_Menus.liTickets);
            FindElementById(XPath_Menus.liClosedTickets);

            FindElementById(XPath_Menus.liTickets);
            FindElementById(XPath_Menus.liCustomerTickets);

            FindElementById(XPath_Menus.liTickets);
            FindElementById(XPath_Menus.liEnhancementTickets);

            FindElementById(XPath_Menus.liTickets);
            FindElementById(XPath_Menus.liPostiveTickets);

            FindElementById(XPath_Menus.liTickets);
            FindElementById(XPath_Menus.liFeedbackTickets);
        }

        public void NavigateToAdministrationMenuPages()
        {
            FindElementById(XPath_Menus.liAdministration);
            FindElementById(XPath_Menus.liSchoolWorkload);

            FindElementById(XPath_Menus.liAdministration);
            FindElementById(XPath_Menus.liPhoneEmail);

            FindElementById(XPath_Menus.liAdministration);
            FindElementById(XPath_Menus.liStaffDirectory);

            FindElementById(XPath_Menus.liAdministration);
            FindElementById(XPath_Menus.liCustomerDirectory);

            FindElementById(XPath_Menus.liAdministration);
            FindElementById(XPath_Menus.liTrainingSchedule);

            FindElementById(XPath_Menus.liAdministration);
            FindElementById(XPath_Menus.liUserDetails);

            FindElementById(XPath_Menus.liAdministration);
            FindElementById(XPath_Menus.liSystemMessage);

            FindElementById(XPath_Menus.liAdministration);
            FindElementById(XPath_Menus.liUserRole);

            FindElementById(XPath_Menus.liAdministration);
            FindElementById(XPath_Menus.liUserRight);

            FindElementById(XPath_Menus.liAdministration);
            FindElementById(XPath_Menus.liSMSMenuRights);

            FindElementById(XPath_Menus.liAdministration);
            FindElementById(XPath_Menus.liFamilyMenuRights);
        }

        public void NavigateToSupportMenuPages()
        {
            FindElementById(XPath_Menus.liSupport);
            FindElementById(XPath_Menus.liCommunitySupport);

            FindElementById(XPath_Menus.liSupport);
            FindElementById(XPath_Menus.liDocumentationLibrary);

            FindElementById(XPath_Menus.liSupport);
            FindElementById(XPath_Menus.liFAQs);

            FindElementById(XPath_Menus.liSupport);
            FindElementById(XPath_Menus.liFAQCategories);

            FindElementById(XPath_Menus.liSupport);
            FindElementById(XPath_Menus.liMissingHelp);

            FindElementById(XPath_Menus.liSupport);
            FindElementById(XPath_Menus.liHelpUsage);

            FindElementById(XPath_Menus.liSupport);
            FindElementById(XPath_Menus.liCatholicContent);
        }

        public void NavigateToReportMenuPages()
        {
        }

        public void NavigateToCommentsMenuPages()
        {
            FindElementById(XPath_Menus.liComments);
            FindElementById(XPath_Menus.liAllComments);

            FindElementById(XPath_Menus.liComments);
            FindElementById(XPath_Menus.liSalesComments);

            FindElementById(XPath_Menus.liComments);
            FindElementById(XPath_Menus.liMemberServiceComments);

            FindElementById(XPath_Menus.liComments);
            FindElementById(XPath_Menus.liDevelopmentComments);

            FindElementById(XPath_Menus.liComments);
            FindElementById(XPath_Menus.liMarketingComments);

            FindElementById(XPath_Menus.liComments);
            FindElementById(XPath_Menus.liFinanceComments);

            FindElementById(XPath_Menus.liComments);
            FindElementById(XPath_Menus.liExternalComments);
        }

        public void NavigateToSaintoftheDayMenuPages()
        {
            FindElementById(XPath_Menus.liSaintoftheDay);
        }

        public void NavigateToDataImportMenuPages()
        {
            FindElementById(XPath_Menus.liDataImport);
        }

        public void NavigateToLogoutMenuPages()
        {
            FindElementById(XPath_Menus.liLogout);
        }
    }
}
