// Copyright (c) OptionC. All rights reserved.

using OpenQA.Selenium;

using static Automation.Framework.ViperPages.ViperCommonVariable;

namespace Automation.Framework.ViperPages.Products
{
    public class ProductPage(IWebDriver webDriver) : BasePageObject(webDriver)
    {
        public void NavigateToProducts()
        {
            try
            {
                var menuElement = _webDriver.FindElements(By.XPath(XPath_Products.MenuProducts)).FirstOrDefault();
                if (menuElement != null && menuElement.Displayed)
                {
                    menuElement.Click();
                }
                else
                {
                    var currentUri = new Uri(_webDriver.Url);
                    string baseUrl = $"{currentUri.Scheme}://{currentUri.Authority}";
                    _webDriver.Navigate().GoToUrl(baseUrl + XPath_Products.ProductsUrlPath);
                }
            }
            catch (Exception)
            {
                var currentUri = new Uri(_webDriver.Url);
                string baseUrl = $"{currentUri.Scheme}://{currentUri.Authority}";
                _webDriver.Navigate().GoToUrl(baseUrl + XPath_Products.ProductsUrlPath);
            }

            WaitFor(driver => driver.FindElements(By.XPath(XPath_Products.SearchInput)).Count > 0, 15);
            Thread.Sleep(1000);
        }

        public void CheckInAllProductsAndFilter(string filterStatus)
        {
            WaitFor(driver => driver.FindElements(By.XPath(XPath_Products.ProductCard)).Count > 0, 15);

            // First click "All Products" chip to ensure all products are visible
            var allChip = _webDriver.FindElements(By.XPath("//button[contains(@class, 'admin-filter-chip') and (contains(., 'All Products') or contains(., 'All'))]")).FirstOrDefault();
            if (allChip != null)
            {
                allChip.Click();
                Thread.Sleep(800);
            }

            if (!string.IsNullOrWhiteSpace(filterStatus) && !filterStatus.Equals("all", StringComparison.OrdinalIgnoreCase))
            {
                var chip = _webDriver.FindElements(By.XPath(XPath_Products.FilterChip(filterStatus))).FirstOrDefault();
                if (chip != null)
                {
                    chip.Click();
                    Thread.Sleep(800);
                }
            }
        }

        public void SearchProduct(string productName)
        {
            if (!string.IsNullOrWhiteSpace(productName))
            {
                SetValueByScript(XPath_Products.SearchInput, productName);
                Thread.Sleep(1000);
            }
        }

        public void ClickViewProduct(string productName = "")
        {
            // If filtering hid the target product, fall back to "All Products" chip so it is visible
            if (!string.IsNullOrWhiteSpace(productName))
            {
                var targetCards = _webDriver.FindElements(By.XPath(XPath_Products.ProductTitle(productName)));
                if (targetCards.Count == 0)
                {
                    var allChip = _webDriver.FindElements(By.XPath("//button[contains(@class, 'admin-filter-chip') and (contains(., 'All Products') or contains(., 'All'))]")).FirstOrDefault();
                    if (allChip != null)
                    {
                        ((IJavaScriptExecutor)_webDriver).ExecuteScript("arguments[0].click();", allChip);
                        Thread.Sleep(800);
                    }
                }
            }

            IWebElement? viewButton = null;
            if (!string.IsNullOrWhiteSpace(productName))
            {
                viewButton = _webDriver.FindElements(By.XPath(XPath_Products.ViewProductButton(productName))).FirstOrDefault();
            }

            viewButton ??= _webDriver.FindElements(By.XPath(XPath_Products.FirstViewProductButton)).FirstOrDefault();

            if (viewButton != null)
            {
                ((IJavaScriptExecutor)_webDriver).ExecuteScript("arguments[0].scrollIntoView(true);", viewButton);
                Thread.Sleep(500);
                ((IJavaScriptExecutor)_webDriver).ExecuteScript("arguments[0].click();", viewButton);
            }
            else
            {
                var targetCard = !string.IsNullOrWhiteSpace(productName)
                    ? _webDriver.FindElements(By.XPath(XPath_Products.ProductTitle(productName))).FirstOrDefault()
                    : _webDriver.FindElements(By.XPath(XPath_Products.ProductCard)).FirstOrDefault();
                if (targetCard != null)
                {
                    ((IJavaScriptExecutor)_webDriver).ExecuteScript("arguments[0].click();", targetCard);
                }
            }

            WaitFor(driver => driver.FindElements(By.XPath(XPath_Products.BtnChangeStatus)).Count > 0, 15);
            Thread.Sleep(1000);
        }

        public bool IsProductDetailsOpened()
        {
            return WaitFor(driver => driver.FindElements(By.XPath(XPath_Products.BtnChangeStatus)).Count > 0, 10);
        }

        public void NavigateThroughSubTabs(IEnumerable<string>? subTabs = null)
        {
            var tabsToVisit = subTabs ?? new[] { "Organizations", "Invoice Details", "Invoice History", "Product Details" };

            foreach (var tab in tabsToVisit)
            {
                ClickSubTab(tab);
                Thread.Sleep(1000);
            }
        }

        public void ClickSubTab(string tabNameOrId)
        {
            string idLookup = tabNameOrId.ToLowerInvariant() switch
            {
                "product details" or "details" => XPath_Products.TabProductDetails,
                "organizations" or "customers" => XPath_Products.TabOrganizations,
                "invoice details" or "invoicedetails" => XPath_Products.TabInvoiceDetails,
                "invoice history" or "invoicehistory" => XPath_Products.TabInvoiceHistory,
                _ => tabNameOrId,
            };

            var tabElement = _webDriver.FindElements(By.XPath(XPath_Products.SubTabById(idLookup))).FirstOrDefault()
                ?? _webDriver.FindElements(By.XPath(XPath_Products.SubTabByLabel(tabNameOrId))).FirstOrDefault();

            if (tabElement != null)
            {
                ((IJavaScriptExecutor)_webDriver).ExecuteScript("arguments[0].click();", tabElement);
            }
        }

        public void ClickChangeStatus()
        {
            ClickByScript(XPath_Products.BtnChangeStatus);
            WaitFor(driver => driver.FindElements(By.XPath(XPath_Products.StatusModal)).Any(e => e.Displayed), 10);
            Thread.Sleep(500);
        }

        public bool IsStatusModalOpened()
        {
            return _webDriver.FindElements(By.XPath(XPath_Products.StatusModal)).Any(e => e.Displayed);
        }

        public void ClickCancelStatusModal()
        {
            var cancelBtn = _webDriver.FindElements(By.XPath(XPath_Products.BtnStatusModalCancel)).FirstOrDefault(e => e.Displayed)
                ?? _webDriver.FindElements(By.XPath("//*[@role='dialog' and (.//h3[contains(., 'Change Status')] or .//legend[contains(., 'New Status')])]//button[@aria-label='Close']")).FirstOrDefault(e => e.Displayed);

            if (cancelBtn != null)
            {
                ((IJavaScriptExecutor)_webDriver).ExecuteScript("arguments[0].click();", cancelBtn);
            }
            else
            {
                ClickByScript(XPath_Products.BtnStatusModalCancel);
            }

            Thread.Sleep(500);
            WaitFor(driver => !driver.FindElements(By.XPath(XPath_Products.StatusModal)).Any(e => e.Displayed), 5);
        }

        public void SelectStatusAndContinue(string newStatus)
        {
            var option = _webDriver.FindElements(By.XPath(XPath_Products.StatusModalOption(newStatus))).FirstOrDefault()
                ?? _webDriver.FindElements(By.XPath(XPath_Products.FirstAvailableStatusOption)).FirstOrDefault();

            if (option != null)
            {
                ((IJavaScriptExecutor)_webDriver).ExecuteScript("arguments[0].click();", option);
                Thread.Sleep(1000);
            }

            ClickByScript(XPath_Products.BtnStatusModalContinue);
            WaitFor(driver => driver.FindElements(By.XPath(XPath_Products.SwalConfirmButton)).Count > 0, 10);
            Thread.Sleep(1000);
        }

        public void ConfirmStatusChangePopup()
        {
            var confirmBtn = _webDriver.FindElements(By.XPath(XPath_Products.SwalConfirmButton)).FirstOrDefault();
            if (confirmBtn != null)
            {
                ((IJavaScriptExecutor)_webDriver).ExecuteScript("arguments[0].click();", confirmBtn);
            }
            else
            {
                ClickByScript(XPath_Products.SwalConfirmButton);
            }
            Thread.Sleep(1500);
        }

        #region Edit Product Workflow

        public void ClickEditProduct()
        {
            var editBtn = _wait.Until(driver =>
            {
                return driver.FindElements(By.XPath(XPath_Products.BtnEditProduct)).FirstOrDefault(e => e.Displayed);
            });

            if (editBtn != null)
            {
                ((IJavaScriptExecutor)_webDriver).ExecuteScript("arguments[0].scrollIntoView(true);", editBtn);
                Thread.Sleep(300);
                ((IJavaScriptExecutor)_webDriver).ExecuteScript("arguments[0].click();", editBtn);
            }
            else
            {
                ClickByScript(XPath_Products.BtnEditProduct);
            }

            WaitFor(driver => driver.FindElements(By.XPath(XPath_Products.EditProductSubtitleInput)).Count > 0
                || driver.FindElements(By.XPath(XPath_Products.BtnEditCancel)).Count > 0, 15);
            Thread.Sleep(1000);
        }

        public bool IsEditProductPageOpened()
        {
            return WaitFor(driver => driver.FindElements(By.XPath(XPath_Products.EditProductSubtitleInput)).Count > 0
                || driver.FindElements(By.XPath(XPath_Products.BtnEditCancel)).Count > 0, 10);
        }

        public void ClickCancelEditProductButtonOnly()
        {
            var cancelBtn = _webDriver.FindElements(By.XPath(XPath_Products.BtnEditCancel)).FirstOrDefault();
            if (cancelBtn != null)
            {
                ((IJavaScriptExecutor)_webDriver).ExecuteScript("arguments[0].scrollIntoView(true);", cancelBtn);
                Thread.Sleep(300);
                ((IJavaScriptExecutor)_webDriver).ExecuteScript("arguments[0].click();", cancelBtn);
            }
            else
            {
                ClickByScript(XPath_Products.BtnEditCancel);
            }
            Thread.Sleep(500);
        }

        public bool IsDiscardChangesPopupOpened()
        {
            return WaitFor(driver => driver.FindElements(By.XPath(XPath_Products.DiscardChangesPopup)).Count > 0
                || driver.FindElements(By.XPath(XPath_Products.DiscardChangesCancel)).Count > 0, 10);
        }

        public void ClickDiscardChangesCancel()
        {
            var cancelBtn = _webDriver.FindElements(By.XPath(XPath_Products.DiscardChangesCancel)).FirstOrDefault();
            if (cancelBtn != null)
            {
                ((IJavaScriptExecutor)_webDriver).ExecuteScript("arguments[0].click();", cancelBtn);
            }
            else
            {
                ClickByScript(XPath_Products.DiscardChangesCancel);
            }

            WaitFor(driver => driver.FindElements(By.XPath(XPath_Products.DiscardChangesPopup)).Count == 0, 5);
            Thread.Sleep(500);
        }

        public void ClickDiscardChangesConfirm()
        {
            var discardBtn = _webDriver.FindElements(By.XPath(XPath_Products.DiscardChangesConfirm)).FirstOrDefault();
            if (discardBtn != null)
            {
                ((IJavaScriptExecutor)_webDriver).ExecuteScript("arguments[0].click();", discardBtn);
            }
            else
            {
                ClickByScript(XPath_Products.DiscardChangesConfirm);
            }

            WaitFor(driver => driver.FindElements(By.XPath(XPath_Products.BtnChangeStatus)).Count > 0, 15);
            Thread.Sleep(1000);
        }

        public void ClickCancelEditProductWithConfirmation()
        {
            // 1. Click Cancel button on edit form
            ClickCancelEditProductButtonOnly();

            // 2. Verify confirmation popup appears
            WaitFor(driver => driver.FindElements(By.XPath(XPath_Products.DiscardChangesPopup)).Count > 0
                || driver.FindElements(By.XPath(XPath_Products.DiscardChangesCancel)).Count > 0, 10);
            Thread.Sleep(500);

            // 3. First: click Cancel on confirmation popup (keep editing)
            ClickDiscardChangesCancel();

            // Verify edit page is still active
            Thread.Sleep(300);

            // 4. Click Cancel button on edit form again
            ClickCancelEditProductButtonOnly();

            // 5. Verify confirmation popup appears again
            WaitFor(driver => driver.FindElements(By.XPath(XPath_Products.DiscardChangesPopup)).Count > 0
                || driver.FindElements(By.XPath(XPath_Products.DiscardChangesConfirm)).Count > 0, 10);
            Thread.Sleep(500);

            // 6. Then: click Yes / Discard changes on confirmation popup
            ClickDiscardChangesConfirm();
        }

        public void ClickCancelEditProduct()
        {
            ClickCancelEditProductButtonOnly();
            Thread.Sleep(800);
            var discardBtn = _webDriver.FindElements(By.XPath(XPath_Products.DiscardChangesConfirm)).FirstOrDefault();
            if (discardBtn != null)
            {
                ((IJavaScriptExecutor)_webDriver).ExecuteScript("arguments[0].click();", discardBtn);
            }

            WaitFor(driver => driver.FindElements(By.XPath(XPath_Products.BtnChangeStatus)).Count > 0, 15);
            Thread.Sleep(1000);
        }

        public void UpdateAllProductFields(
            string? editName,
            string? editShortName,
            string? editSubtitle,
            string? editLicenseType,
            string? editNavTarget,
            string? editContact,
            string? editFeature,
            string? editDescription)
        {
            WaitFor(driver => driver.FindElements(By.XPath(XPath_Products.EditProductSubtitleInput)).Count > 0
                || driver.FindElements(By.XPath(XPath_Products.EditProductNameInput)).Count > 0, 10);

            string timestamp = DateTime.Now.ToString("HHmmss");

            // 1. Product Name
            if (!string.IsNullOrWhiteSpace(editName))
            {
                var nameInput = _webDriver.FindElements(By.XPath(XPath_Products.EditProductNameInput)).FirstOrDefault();
                if (nameInput != null)
                {
                    SetValueByScript(XPath_Products.EditProductNameInput, $"{editName} - {timestamp}");
                }
            }

            // 2. Short Name
            if (!string.IsNullOrWhiteSpace(editShortName))
            {
                var shortNameInput = _webDriver.FindElements(By.XPath(XPath_Products.EditProductShortNameInput)).FirstOrDefault();
                if (shortNameInput != null)
                {
                    SetValueByScript(XPath_Products.EditProductShortNameInput, editShortName);
                }
            }

            // 3. Product Subtitle
            string subtitleToUse = string.IsNullOrWhiteSpace(editSubtitle) ? "OptionC School" : editSubtitle;
            subtitleToUse += $" - {timestamp}";
            SetValueByScript(XPath_Products.EditProductSubtitleInput, subtitleToUse);

            // Note: Production URL is preserved without modification as requested.

            // 4. License Type
            string license = string.IsNullOrWhiteSpace(editLicenseType) ? "Licensed" : editLicenseType;
            var licenseRadio = _webDriver.FindElements(By.XPath(XPath_Products.EditProductRadioOption(license))).FirstOrDefault();
            if (licenseRadio != null)
            {
                ((IJavaScriptExecutor)_webDriver).ExecuteScript("arguments[0].click();", licenseRadio);
                Thread.Sleep(300);
            }

            // 5. Navigation Target
            string nav = string.IsNullOrWhiteSpace(editNavTarget) ? "Same tab" : editNavTarget;
            var navRadio = _webDriver.FindElements(By.XPath(XPath_Products.EditProductRadioOption(nav))).FirstOrDefault();
            if (navRadio != null)
            {
                ((IJavaScriptExecutor)_webDriver).ExecuteScript("arguments[0].click();", navRadio);
                Thread.Sleep(300);
            }

            // 6. Contact Person Dropdown
            var dropdown = _webDriver.FindElements(By.XPath(XPath_Products.EditProductContactDropdown)).FirstOrDefault();
            if (dropdown != null)
            {
                ((IJavaScriptExecutor)_webDriver).ExecuteScript("arguments[0].scrollIntoView(true);", dropdown);
                Thread.Sleep(200);
                ((IJavaScriptExecutor)_webDriver).ExecuteScript("arguments[0].click();", dropdown);
                Thread.Sleep(400);

                var opt = _webDriver.FindElements(By.XPath(XPath_Products.EditProductContactOption)).FirstOrDefault();
                if (opt != null)
                {
                    ((IJavaScriptExecutor)_webDriver).ExecuteScript("arguments[0].click();", opt);
                    Thread.Sleep(300);
                }
            }

            // 7. Features
            string featureToAdd = string.IsNullOrWhiteSpace(editFeature) ? "Acutis Feature" : editFeature;
            var featureInput = _webDriver.FindElements(By.XPath(XPath_Products.EditProductFeatureInput)).FirstOrDefault();
            if (featureInput != null)
            {
                SetValueByScript(XPath_Products.EditProductFeatureInput, $"{featureToAdd} {timestamp}");
                var addBtn = _webDriver.FindElements(By.XPath(XPath_Products.BtnEditAddFeature)).FirstOrDefault();
                if (addBtn != null)
                {
                    ((IJavaScriptExecutor)_webDriver).ExecuteScript("arguments[0].click();", addBtn);
                    Thread.Sleep(300);
                }
            }

            // 8. Description
            if (!string.IsNullOrWhiteSpace(editDescription))
            {
                string descToUse = $"{editDescription} (Updated at {DateTime.Now:HH:mm:ss})";
                SetValueByScript(XPath_Products.EditProductDescTextarea, descToUse);
            }

            Thread.Sleep(1000);
        }

        public void UpdateProductDetails(string editSubtitle, string editDescription)
        {
            UpdateAllProductFields(
                null,
                null,
                editSubtitle,
                null,
                null,
                null,
                null,
                editDescription);
        }

        public void ClickSaveEditProduct()
        {
            WaitFor(driver =>
            {
                var btn = driver.FindElements(By.XPath(XPath_Products.BtnEditSave)).FirstOrDefault();
                return btn != null && btn.Enabled;
            }, 10);

            var saveBtn = _webDriver.FindElements(By.XPath(XPath_Products.BtnEditSave)).FirstOrDefault();
            if (saveBtn != null)
            {
                ((IJavaScriptExecutor)_webDriver).ExecuteScript("arguments[0].scrollIntoView(true);", saveBtn);
                Thread.Sleep(300);
                ((IJavaScriptExecutor)_webDriver).ExecuteScript("arguments[0].click();", saveBtn);
            }
            else
            {
                ClickByScript(XPath_Products.BtnEditSave);
            }

            WaitFor(driver => driver.FindElements(By.XPath(XPath_Products.BtnChangeStatus)).Count > 0, 15);
            Thread.Sleep(1000);
        }

        #endregion Edit Product Workflow

        #region Organizations Tab Workflow

        public void ClickOrganizationsTab()
        {
            ClickSubTab("Organizations");
            Thread.Sleep(1500);
        }

        public void ClickViewFirstOrganization()
        {
            ClickOrganizationsTab();

            // Wait for organization rows or links to appear
            WaitFor(driver =>
                driver.FindElements(By.XPath("//table//tbody//tr[.//a[contains(@href, '/admin/organizations/')] or .//button[contains(@aria-label, 'View')]]")).Count > 0
                || driver.FindElements(By.XPath("//table//tbody//tr")).Count > 0
                || driver.FindElements(By.XPath("//a[contains(@href, '/admin/organizations/')]")).Count > 0,
                15);

            var viewBtn = _webDriver.FindElements(By.XPath("//table//tbody//tr//button[contains(@aria-label, 'View')]")).FirstOrDefault()
                ?? _webDriver.FindElements(By.XPath("//table//tbody//tr//a[contains(@href, '/admin/organizations/')]")).FirstOrDefault()
                ?? _webDriver.FindElements(By.XPath("//a[contains(@href, '/admin/organizations/')]")).FirstOrDefault()
                ?? _webDriver.FindElements(By.XPath("//table//tbody//tr[1]")).FirstOrDefault();

            if (viewBtn != null)
            {
                ((IJavaScriptExecutor)_webDriver).ExecuteScript("arguments[0].scrollIntoView(true);", viewBtn);
                Thread.Sleep(500);
                ((IJavaScriptExecutor)_webDriver).ExecuteScript("arguments[0].click();", viewBtn);
            }

            WaitFor(driver =>
                driver.Url.Contains("/admin/organizations")
                || driver.FindElements(By.XPath("//button[contains(., 'Back to Products') or contains(., 'Back to Organizations')]")).Count > 0,
                15);
            Thread.Sleep(1000);
        }

        public bool IsOrganizationDetailsOpened()
        {
            return WaitFor(driver =>
                driver.Url.Contains("/admin/organizations")
                || driver.FindElements(By.XPath("//button[contains(., 'Back to Products') or contains(., 'Back to Organizations')]")).Count > 0,
                10);
        }

        public void ClickBackToProducts()
        {
            var backBtn = _webDriver.FindElements(By.XPath("//button[contains(., 'Back to Products')]")).FirstOrDefault();
            if (backBtn != null)
            {
                ((IJavaScriptExecutor)_webDriver).ExecuteScript("arguments[0].scrollIntoView(true);", backBtn);
                Thread.Sleep(300);
                ((IJavaScriptExecutor)_webDriver).ExecuteScript("arguments[0].click();", backBtn);
            }
            else
            {
                var backToOrgs = _webDriver.FindElements(By.XPath("//button[contains(., 'Back to Organizations')]")).FirstOrDefault();
                if (backToOrgs != null)
                {
                    ((IJavaScriptExecutor)_webDriver).ExecuteScript("arguments[0].click();", backToOrgs);
                    Thread.Sleep(500);
                }
                _webDriver.Navigate().Back();
            }

            WaitFor(driver => driver.FindElements(By.XPath(XPath_Products.BtnChangeStatus)).Count > 0, 15);
            Thread.Sleep(1000);
        }

        #endregion Organizations Tab Workflow

        #region Invoice Details Tab Workflow

        public void ClickInvoiceDetailsTab()
        {
            ClickSubTab("Invoice Details");
            Thread.Sleep(1500);
        }

        public void NavigateAllInvoiceStatusTabs()
        {
            ClickInvoiceDetailsTab();

            var statusFilterLabels = new[] { "Paid", "Overdue", "Expiring Soon", "All Statuses" };
            foreach (var label in statusFilterLabels)
            {
                var chip = _webDriver.FindElements(By.XPath($"//button[contains(@class, 'admin-filter-chip') and contains(., '{label}')]")).FirstOrDefault();
                if (chip != null)
                {
                    ((IJavaScriptExecutor)_webDriver).ExecuteScript("arguments[0].scrollIntoView(true);", chip);
                    Thread.Sleep(300);
                    ((IJavaScriptExecutor)_webDriver).ExecuteScript("arguments[0].click();", chip);
                    Thread.Sleep(600);
                }
            }
        }

        public void FilterInvoicesByStatus(string status = "all")
        {
            var filterBtn = _webDriver.FindElements(By.XPath(XPath_Products.InvoiceStatusFilterChip(status))).FirstOrDefault();
            if (filterBtn != null)
            {
                ((IJavaScriptExecutor)_webDriver).ExecuteScript("arguments[0].click();", filterBtn);
                Thread.Sleep(1000);
            }
        }

        public void ClickCreateInvoice()
        {
            var createBtn = _webDriver.FindElements(By.XPath(XPath_Products.BtnCreateInvoice)).FirstOrDefault();
            if (createBtn != null)
            {
                ((IJavaScriptExecutor)_webDriver).ExecuteScript("arguments[0].scrollIntoView(true);", createBtn);
                Thread.Sleep(300);
                ((IJavaScriptExecutor)_webDriver).ExecuteScript("arguments[0].click();", createBtn);
            }
            else
            {
                ClickByScript(XPath_Products.BtnCreateInvoice);
            }

            WaitFor(driver => driver.FindElements(By.XPath(XPath_Products.InvoiceTitleInput)).Count > 0
                || driver.FindElements(By.XPath(XPath_Products.BtnInvoiceCancel)).Count > 0, 15);
            Thread.Sleep(1000);
        }

        public bool IsCreateInvoicePageOpened()
        {
            return WaitFor(driver => driver.FindElements(By.XPath(XPath_Products.InvoiceTitleInput)).Count > 0
                || driver.FindElements(By.XPath(XPath_Products.BtnInvoiceCancel)).Count > 0, 10);
        }

        public void ClickCancelCreateInvoice()
        {
            var cancelBtn = _webDriver.FindElements(By.XPath(XPath_Products.BtnInvoiceCancel)).FirstOrDefault();
            if (cancelBtn != null)
            {
                ((IJavaScriptExecutor)_webDriver).ExecuteScript("arguments[0].scrollIntoView(true);", cancelBtn);
                Thread.Sleep(300);
                ((IJavaScriptExecutor)_webDriver).ExecuteScript("arguments[0].click();", cancelBtn);
            }
            else
            {
                ClickByScript(XPath_Products.BtnInvoiceCancel);
            }

            Thread.Sleep(800);
            var discardBtn = _webDriver.FindElements(By.XPath(XPath_Products.DiscardChangesConfirm)).FirstOrDefault();
            if (discardBtn != null)
            {
                ((IJavaScriptExecutor)_webDriver).ExecuteScript("arguments[0].click();", discardBtn);
            }

            WaitFor(driver => driver.FindElements(By.XPath(XPath_Products.BtnCreateInvoice)).Count > 0
                || driver.FindElements(By.XPath(XPath_Products.BtnChangeStatus)).Count > 0, 15);
            Thread.Sleep(1000);
        }

        public void EnterInvoiceDetailsAndSave(string invoiceTitle)
        {
            WaitFor(driver => driver.FindElements(By.XPath(XPath_Products.InvoiceTitleInput)).Count > 0
                || driver.FindElements(By.XPath(XPath_Products.BtnInvoiceCancel)).Count > 0, 10);

            var titleInput = _webDriver.FindElements(By.XPath(XPath_Products.InvoiceTitleInput)).FirstOrDefault();
            if (titleInput != null)
            {
                string titleToSet = string.IsNullOrWhiteSpace(invoiceTitle) ? "License" : invoiceTitle;
                titleToSet += " - " + DateTime.Now.ToString("HHmmss");

                SetValueByScript(XPath_Products.InvoiceTitleInput, titleToSet);
                Thread.Sleep(500);

                var dropdown = _webDriver.FindElements(By.XPath(XPath_Products.InvoiceOrgDropdown)).FirstOrDefault();
                if (dropdown != null)
                {
                    ((IJavaScriptExecutor)_webDriver).ExecuteScript("arguments[0].click();", dropdown);
                    Thread.Sleep(500);

                    var firstOption = _webDriver.FindElements(By.XPath(XPath_Products.FirstDropdownOption)).FirstOrDefault();
                    if (firstOption != null)
                    {
                        ((IJavaScriptExecutor)_webDriver).ExecuteScript("arguments[0].click();", firstOption);
                        Thread.Sleep(500);
                    }
                }

                var saveBtn = _webDriver.FindElements(By.XPath(XPath_Products.BtnInvoiceSave)).FirstOrDefault();
                if (saveBtn != null && saveBtn.Enabled)
                {
                    ((IJavaScriptExecutor)_webDriver).ExecuteScript("arguments[0].scrollIntoView(true);", saveBtn);
                    Thread.Sleep(300);
                    ((IJavaScriptExecutor)_webDriver).ExecuteScript("arguments[0].click();", saveBtn);
                }
                else
                {
                    ClickCancelCreateInvoice();
                }
            }
            else
            {
                ClickCancelCreateInvoice();
            }

            WaitFor(driver => driver.FindElements(By.XPath(XPath_Products.BtnCreateInvoice)).Count > 0
                || driver.FindElements(By.XPath(XPath_Products.BtnChangeStatus)).Count > 0, 15);
            Thread.Sleep(1000);
        }

        #endregion Invoice Details Tab Workflow

        #region Back to Products & Products List Edit Icon

        public void ClickBackToProductsFromDetails()
        {
            var backBtn = _webDriver.FindElements(By.XPath("//button[contains(., 'Back to Products')]")).FirstOrDefault();
            if (backBtn != null)
            {
                ((IJavaScriptExecutor)_webDriver).ExecuteScript("arguments[0].scrollIntoView(true);", backBtn);
                Thread.Sleep(300);
                ((IJavaScriptExecutor)_webDriver).ExecuteScript("arguments[0].click();", backBtn);
            }
            else
            {
                var currentUri = new Uri(_webDriver.Url);
                string baseUrl = $"{currentUri.Scheme}://{currentUri.Authority}";
                _webDriver.Navigate().GoToUrl(baseUrl + XPath_Products.ProductsUrlPath);
            }

            WaitFor(driver => driver.FindElements(By.XPath(XPath_Products.SearchInput)).Count > 0
                || driver.FindElements(By.XPath(XPath_Products.ProductCard)).Count > 0, 15);
            Thread.Sleep(1000);
        }

        public bool IsProductsPageOpened()
        {
            return WaitFor(driver => driver.FindElements(By.XPath(XPath_Products.SearchInput)).Count > 0
                || driver.FindElements(By.XPath(XPath_Products.ProductCard)).Count > 0, 10);
        }

        public void ClickEditProductCardIcon(string productName = "")
        {
            IWebElement? editBtn = null;
            if (!string.IsNullOrWhiteSpace(productName))
            {
                editBtn = _webDriver.FindElements(By.XPath(XPath_Products.EditProductCardButton(productName))).FirstOrDefault();
            }

            editBtn ??= _webDriver.FindElements(By.XPath(XPath_Products.FirstEditProductCardButton)).FirstOrDefault();

            if (editBtn != null)
            {
                ((IJavaScriptExecutor)_webDriver).ExecuteScript("arguments[0].scrollIntoView(true);", editBtn);
                Thread.Sleep(300);
                ((IJavaScriptExecutor)_webDriver).ExecuteScript("arguments[0].click();", editBtn);
            }

            WaitFor(driver => driver.FindElements(By.XPath(XPath_Products.EditProductSubtitleInput)).Count > 0
                || driver.FindElements(By.XPath(XPath_Products.BtnEditCancel)).Count > 0, 15);
            Thread.Sleep(1000);
        }

        #endregion Back to Products & Products List Edit Icon

        #region Invoice Modal & History Workflow

        public void ClickViewInvoiceInInvoiceDetails()
        {
            var viewBtn = _webDriver.FindElements(By.XPath(XPath_Products.FirstInvoiceViewButton)).FirstOrDefault();
            if (viewBtn != null)
            {
                ((IJavaScriptExecutor)_webDriver).ExecuteScript("arguments[0].scrollIntoView(true);", viewBtn);
                Thread.Sleep(300);
                ((IJavaScriptExecutor)_webDriver).ExecuteScript("arguments[0].click();", viewBtn);
                WaitFor(driver => driver.FindElements(By.XPath(XPath_Products.InvoiceModal)).Count > 0, 10);
                Thread.Sleep(500);
            }
        }

        public bool IsInvoiceModalOpened()
        {
            return WaitFor(driver => driver.FindElements(By.XPath(XPath_Products.InvoiceModal)).Count > 0
                || driver.FindElements(By.XPath("//*[contains(text(), 'No records') or contains(text(), 'No license') or contains(text(), 'No invoices') or contains(text(), 'No data')]")).Count > 0
                || driver.FindElements(By.XPath(XPath_Products.BtnCreateInvoice)).Count > 0, 10);
        }

        public void ClickCloseInvoiceModal()
        {
            var modal = _webDriver.FindElements(By.XPath(XPath_Products.InvoiceModal)).FirstOrDefault();
            if (modal != null && modal.Displayed)
            {
                var closeBtn = _webDriver.FindElements(By.XPath(XPath_Products.BtnInvoiceModalClose)).FirstOrDefault();
                if (closeBtn != null)
                {
                    ((IJavaScriptExecutor)_webDriver).ExecuteScript("arguments[0].click();", closeBtn);
                }
                else
                {
                    ClickByScript(XPath_Products.BtnInvoiceModalClose);
                }

                WaitFor(driver => driver.FindElements(By.XPath(XPath_Products.InvoiceModal)).Count == 0, 5);
                Thread.Sleep(500);
            }
        }

        public void ClickInvoiceHistoryTab()
        {
            ClickSubTab("Invoice History");
            Thread.Sleep(1500);
        }

        public void NavigateInvoiceHistoryFilters()
        {
            ClickInvoiceHistoryTab();

            var orgDropdown = _webDriver.FindElements(By.XPath(XPath_Products.InvoiceHistoryOrgDropdown)).FirstOrDefault();
            if (orgDropdown != null)
            {
                ((IJavaScriptExecutor)_webDriver).ExecuteScript("arguments[0].click();", orgDropdown);
                Thread.Sleep(400);
                var firstOpt = _webDriver.FindElements(By.XPath(XPath_Products.FirstDropdownOption)).FirstOrDefault();
                if (firstOpt != null)
                {
                    ((IJavaScriptExecutor)_webDriver).ExecuteScript("arguments[0].click();", firstOpt);
                    Thread.Sleep(500);
                }
            }

            var statusDropdown = _webDriver.FindElements(By.XPath(XPath_Products.InvoiceHistoryStatusDropdown)).FirstOrDefault();
            if (statusDropdown != null)
            {
                ((IJavaScriptExecutor)_webDriver).ExecuteScript("arguments[0].click();", statusDropdown);
                Thread.Sleep(400);
                var firstOpt = _webDriver.FindElements(By.XPath(XPath_Products.FirstDropdownOption)).FirstOrDefault();
                if (firstOpt != null)
                {
                    ((IJavaScriptExecutor)_webDriver).ExecuteScript("arguments[0].click();", firstOpt);
                    Thread.Sleep(500);
                }
            }
        }

        public void ClickViewInvoiceInInvoiceHistory()
        {
            var viewBtn = _webDriver.FindElements(By.XPath(XPath_Products.FirstInvoiceHistoryViewButton)).FirstOrDefault();
            if (viewBtn != null)
            {
                ((IJavaScriptExecutor)_webDriver).ExecuteScript("arguments[0].scrollIntoView(true);", viewBtn);
                Thread.Sleep(300);
                ((IJavaScriptExecutor)_webDriver).ExecuteScript("arguments[0].click();", viewBtn);
                WaitFor(driver => driver.FindElements(By.XPath(XPath_Products.InvoiceModal)).Count > 0, 10);
                Thread.Sleep(500);
            }
        }

        #endregion Invoice Modal & History Workflow
    }
}
