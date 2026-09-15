using System.Threading;
using OpenQA.Selenium;
using static Automation.Framework.CommonVariable;
using static Automation.Framework.ViperPages.ViperCommonVariable;

namespace Automation.Framework.ViperPages.Organizations
{
    public class OrganizationAddPage : BasePageObject
    {
        public OrganizationAddPage(IWebDriver webDriver) : base(webDriver)
        {
        }

        /// <summary>
        /// Fills only the required organization name field. Used for the cancel-check path,
        /// which only needs to prove that in-progress input gets discarded - it does not need
        /// every field (including the two flaky custom dropdowns) filled in a second time, since
        /// the save path right after it already exercises the full form.
        /// </summary>
        public void FillOrganizationName(string orgName)
        {
            FindElementByXPath(XPath_Organizations.OrgName, orgName);
        }

        public void FillOrganizationDetails(string orgName, string orgType, string website, string status, string contactPerson, string contactPhone, string contactEmail, string address, string city, string state, string zip)
        {
            FindElementByXPath(XPath_Organizations.OrgName, orgName);

            // Wait briefly before engaging custom dropdowns to ensure React hydration
            Thread.Sleep(500);

            // Using the robust generic dropdown method from ViperCommonVariable
            SelectDropdownOption("orgType", orgType);
            SelectDropdownOption("orgStatus", status);

            FindElementByXPath(XPath_Organizations.Website, website);
            FindElementByXPath(XPath_Organizations.ContactPerson, contactPerson);
            FindElementByXPath(XPath_Organizations.ContactPhone, contactPhone);
            FindElementByXPath(XPath_Organizations.ContactEmail, contactEmail);
            FindElementByXPath(XPath_Organizations.Address, address);
            FindElementByXPath(XPath_Organizations.City, city);
            SelectDropdownOption("state", state);
            FindElementByXPath(XPath_Organizations.Zip, zip);
        }

        private void SelectDropdownOption(string controlId, string optionText)
        {
            string trigger = $"//div[@role='combobox'][@id='{controlId}']";
            
            // Scroll to and open the dropdown
            ScrollIntoView(trigger);
            ClickByScript(trigger);
            
            // Wait up to 5 seconds for the listbox to be visible
            string listBoxId = $"{controlId}-listbox";
            bool listboxOpened = IsElementVisible($"//div[@id='{listBoxId}']", 5);
            
            if (!listboxOpened)
            {
                // Retry once more
                ClickByScript(trigger);
                listboxOpened = IsElementVisible($"//div[@id='{listBoxId}']", 5);
            }

            if (!listboxOpened)
            {
                // Last resort: click any visible option containing the text
                ClickFirstDisplayed($"//*[@role='option'][contains(normalize-space(), '{optionText}')]", 3);
                return;
            }

            Thread.Sleep(300); // Small settle time after listbox appears
            
            // Try exact match in the listbox first
            if (ClickFirstDisplayed($"//div[@id='{listBoxId}']//*[@role='option'][normalize-space()='{optionText}']", 3))
                return;

            // Try contains match
            if (ClickFirstDisplayed($"//div[@id='{listBoxId}']//*[@role='option'][contains(normalize-space(), '{optionText}')]", 2))
                return;

            // Global fallback
            ClickFirstDisplayed($"//*[@role='option'][contains(normalize-space(), '{optionText}')]", 2);
        }

        public void ClickSave()
        {
            ClickByScript(XPath_Organizations.BtnSave);
        }

        public void ClickCancel()
        {
            ClickByScript(XPath_Organizations.BtnCancel);
        }
    }
}
