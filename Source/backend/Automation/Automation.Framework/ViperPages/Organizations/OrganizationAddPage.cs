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
            FindElementByXPath(XPath_Organizations.State, state);
            FindElementByXPath(XPath_Organizations.Zip, zip);
        }

        /// <summary>
        /// Fills the organization name plus deliberately malformed website/phone/email/ZIP
        /// values, for the format-validation scenario. The name and type are filled with valid
        /// values so the resulting errors are isolated to the four format checks rather than
        /// mixed in with the separate required-field errors.
        /// </summary>
        /// <param name="orgName">a valid organization name</param>
        public void FillInvalidFormatValues(string orgName)
        {
            FindElementByXPath(XPath_Organizations.OrgName, orgName);
            Thread.Sleep(500);
            SelectDropdownOption("orgType", "Other");
            FindElementByXPath(XPath_Organizations.Website, "not-a-url");
            FindElementByXPath(XPath_Organizations.ContactPhone, "1");
            FindElementByXPath(XPath_Organizations.ContactEmail, "not-an-email");
            FindElementByXPath(XPath_Organizations.Zip, "!!");
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

        /// <summary>Reads the required-field error shown under the organization name input.</summary>
        /// <returns>The error text, or an empty string when none appeared in time.</returns>
        public string ReadOrgNameError()
        {
            return FindFirstDisplayed(XPath_Organizations.OrgNameError, 5)?.Text ?? string.Empty;
        }

        /// <summary>Reads the format error shown under the website input.</summary>
        /// <returns>The error text, or an empty string when none appeared in time.</returns>
        public string ReadWebsiteError()
        {
            return FindFirstDisplayed(XPath_Organizations.WebsiteError, 5)?.Text ?? string.Empty;
        }

        /// <summary>Reads the format error shown under the contact phone input.</summary>
        /// <returns>The error text, or an empty string when none appeared in time.</returns>
        public string ReadContactPhoneError()
        {
            return FindFirstDisplayed(XPath_Organizations.ContactPhoneError, 5)?.Text ?? string.Empty;
        }

        /// <summary>Reads the format error shown under the contact email input.</summary>
        /// <returns>The error text, or an empty string when none appeared in time.</returns>
        public string ReadContactEmailError()
        {
            return FindFirstDisplayed(XPath_Organizations.ContactEmailError, 5)?.Text ?? string.Empty;
        }

        /// <summary>Reads the format error shown under the ZIP input.</summary>
        /// <returns>The error text, or an empty string when none appeared in time.</returns>
        public string ReadZipError()
        {
            return FindFirstDisplayed(XPath_Organizations.ZipError, 5)?.Text ?? string.Empty;
        }

        /// <summary>Reads the toast banner shown after a submit attempt (success or validation summary).</summary>
        /// <returns>The toast text, or an empty string when none appeared in time.</returns>
        public string ReadToast()
        {
            return FindFirstDisplayed(XPath_Organizations.ToastBanner, 10)?.Text ?? string.Empty;
        }
    }
}
