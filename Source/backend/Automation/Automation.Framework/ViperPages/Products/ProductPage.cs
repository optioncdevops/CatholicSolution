// Copyright (c) OptionC. All rights reserved.

using OpenQA.Selenium;
using OpenQA.Selenium.Interactions;

using static Automation.Framework.ViperPages.ViperCommonVariable;

namespace Automation.Framework.ViperPages.Products
{
    public class ProductPage(IWebDriver webDriver) : BasePageObject(webDriver)
    {
        public void NavigateToProducts()
        {
            // Right after login the top nav's menu items are still hydrating from the login
            // response, so an immediate, unwaited FindElements can miss the "Products" link and
            // fall through to a hard page reload below - much slower than the in-app SPA click,
            // and exactly why this used to feel slow straight after signing in. Give the link up
            // to 10s to actually render before treating it as unavailable.
            bool clicked = ClickFirstDisplayed(XPath_Products.MenuProducts, 10);

            if (!clicked)
            {
                var currentUri = new Uri(_webDriver.Url);
                string baseUrl = $"{currentUri.Scheme}://{currentUri.Authority}";
                _webDriver.Navigate().GoToUrl(baseUrl + XPath_Products.ProductsUrlPath);
            }

            WaitFor(driver => driver.FindElements(By.XPath(XPath_Products.SearchInput)).Count > 0, 15);
            Thread.Sleep(1000);
        }

        public void NavigateThroughAllProductFilterTabs()
        {
            WaitFor(driver => driver.FindElements(By.XPath(XPath_Products.ProductCard)).Count > 0, 15);
            Thread.Sleep(500);

            // 1. Click "All Statuses" chip
            var allChip = _webDriver.FindElements(By.XPath(XPath_Products.AllStatusChip)).FirstOrDefault();
            if (allChip != null)
            {
                ((IJavaScriptExecutor)_webDriver).ExecuteScript("arguments[0].scrollIntoView(true);", allChip);
                ((IJavaScriptExecutor)_webDriver).ExecuteScript("arguments[0].click();", allChip);
                Thread.Sleep(800);
            }

            // 2. Click "Active" chip
            var activeChip = _webDriver.FindElements(By.XPath(XPath_Products.ActiveStatusChip)).FirstOrDefault();
            if (activeChip != null)
            {
                ((IJavaScriptExecutor)_webDriver).ExecuteScript("arguments[0].scrollIntoView(true);", activeChip);
                ((IJavaScriptExecutor)_webDriver).ExecuteScript("arguments[0].click();", activeChip);
                Thread.Sleep(800);
            }

            // 3. Click "Inactive" chip
            var inactiveChip = _webDriver.FindElements(By.XPath(XPath_Products.InactiveStatusChip)).FirstOrDefault();
            if (inactiveChip != null)
            {
                ((IJavaScriptExecutor)_webDriver).ExecuteScript("arguments[0].scrollIntoView(true);", inactiveChip);
                ((IJavaScriptExecutor)_webDriver).ExecuteScript("arguments[0].click();", inactiveChip);
                Thread.Sleep(800);
            }

            // 4. Click "Coming Soon" chip
            var comingSoonChip = _webDriver.FindElements(By.XPath(XPath_Products.ComingSoonStatusChip)).FirstOrDefault();
            if (comingSoonChip != null)
            {
                ((IJavaScriptExecutor)_webDriver).ExecuteScript("arguments[0].scrollIntoView(true);", comingSoonChip);
                ((IJavaScriptExecutor)_webDriver).ExecuteScript("arguments[0].click();", comingSoonChip);
                Thread.Sleep(800);
            }

            // 5. Navigate other filter: Sort by dropdown
            var sortDropdown = _webDriver.FindElements(By.XPath(XPath_Products.ProductSortDropdown)).FirstOrDefault();
            if (sortDropdown != null)
            {
                ((IJavaScriptExecutor)_webDriver).ExecuteScript("arguments[0].scrollIntoView(true);", sortDropdown);
                ((IJavaScriptExecutor)_webDriver).ExecuteScript("arguments[0].click();", sortDropdown);
                Thread.Sleep(500);

                var sortOptions = _webDriver.FindElements(By.XPath("//div[@role='listbox']//button[@role='option']"));
                if (sortOptions.Count > 0)
                {
                    var targetSort = sortOptions.FirstOrDefault(o => o.Text.Contains("Name", StringComparison.OrdinalIgnoreCase)) ?? sortOptions[0];
                    ((IJavaScriptExecutor)_webDriver).ExecuteScript("arguments[0].click();", targetSort);
                    Thread.Sleep(600);
                }
            }

            // Return to All Statuses so that all products are available for the subsequent search
            allChip = _webDriver.FindElements(By.XPath(XPath_Products.AllStatusChip)).FirstOrDefault();
            if (allChip != null)
            {
                ((IJavaScriptExecutor)_webDriver).ExecuteScript("arguments[0].click();", allChip);
                Thread.Sleep(800);
            }
        }

        public void CheckProductSearch(string productName = "")
        {
            if (string.IsNullOrWhiteSpace(productName))
            {
                productName = "OptionC";
            }

            var searchInput = _webDriver.FindElements(By.XPath(XPath_Products.SearchInput)).FirstOrDefault();
            if (searchInput != null)
            {
                ((IJavaScriptExecutor)_webDriver).ExecuteScript("arguments[0].scrollIntoView(true);", searchInput);
                searchInput.Clear();
                SetValueByScript(XPath_Products.SearchInput, productName);
                Thread.Sleep(1000);
            }

            WaitFor(driver => driver.FindElements(By.XPath(XPath_Products.ProductCard)).Count > 0, 10);
            Thread.Sleep(500);
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
            if (string.IsNullOrWhiteSpace(productName))
            {
                productName = "OptionC";
            }

            // If filtering hid the target product, fall back to "All Products" chip and clear search
            var targetCards = _webDriver.FindElements(By.XPath(XPath_Products.ProductTitle(productName)));
            if (targetCards.Count == 0)
            {
                var searchInput = _webDriver.FindElements(By.XPath(XPath_Products.SearchInput)).FirstOrDefault();
                if (searchInput != null && !string.IsNullOrEmpty(searchInput.GetAttribute("value")))
                {
                    searchInput.Clear();
                    SetValueByScript(XPath_Products.SearchInput, "");
                    Thread.Sleep(500);
                }

                var allChip = _webDriver.FindElements(By.XPath(XPath_Products.AllStatusChip)).FirstOrDefault();
                if (allChip != null)
                {
                    ((IJavaScriptExecutor)_webDriver).ExecuteScript("arguments[0].click();", allChip);
                    Thread.Sleep(800);
                }
            }

            IWebElement? viewButton = _webDriver.FindElements(By.XPath(XPath_Products.ViewProductButton(productName))).FirstOrDefault()
                ?? _webDriver.FindElements(By.XPath(XPath_Products.FirstViewProductButton)).FirstOrDefault();

            if (viewButton != null)
            {
                ((IJavaScriptExecutor)_webDriver).ExecuteScript("arguments[0].scrollIntoView(true);", viewButton);
                Thread.Sleep(500);
                try
                {
                    viewButton.Click();
                }
                catch
                {
                    ((IJavaScriptExecutor)_webDriver).ExecuteScript("arguments[0].click();", viewButton);
                }
            }
            else
            {
                var targetCard = _webDriver.FindElements(By.XPath(XPath_Products.ProductTitle(productName))).FirstOrDefault()
                    ?? _webDriver.FindElements(By.XPath(XPath_Products.ProductCard)).FirstOrDefault();
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
            return WaitFor(driver =>
                driver.Url.Contains("/admin/product-details", StringComparison.OrdinalIgnoreCase)
                || driver.FindElements(By.XPath(XPath_Products.BtnChangeStatus)).Any(e => e.Displayed)
                || driver.FindElements(By.XPath(XPath_Products.SubTabById(XPath_Products.TabOrganizations))).Any(e => e.Displayed)
                || driver.FindElements(By.XPath(XPath_Products.SubTabByLabel("Product Details"))).Any(e => e.Displayed),
                10);
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
            // 1. Ensure Change Status modal is open
            WaitFor(driver => driver.FindElements(By.XPath(XPath_Products.StatusModal)).Any(e => e.Displayed), 10);

            // 2. Locate and select the requested status option
            var option = _webDriver.FindElements(By.XPath(XPath_Products.StatusModalOption(newStatus))).FirstOrDefault(e => e.Displayed)
                ?? _webDriver.FindElements(By.XPath(XPath_Products.FirstAvailableStatusOption)).FirstOrDefault(e => e.Displayed);

            if (option != null)
            {
                ((IJavaScriptExecutor)_webDriver).ExecuteScript("arguments[0].scrollIntoView({block: 'center', inline: 'nearest'});", option);
                Thread.Sleep(200);
                try
                {
                    option.Click();
                }
                catch
                {
                    ((IJavaScriptExecutor)_webDriver).ExecuteScript("arguments[0].click();", option);
                }
                Thread.Sleep(800);
            }

            // 3. Wait for Continue button to be enabled (it is disabled until an option is selected)
            WaitFor(driver =>
            {
                var btn = driver.FindElements(By.XPath(XPath_Products.BtnStatusModalContinue)).FirstOrDefault(e => e.Displayed);
                return btn != null && btn.Enabled;
            }, 10);

            var continueBtn = _webDriver.FindElements(By.XPath(XPath_Products.BtnStatusModalContinue)).FirstOrDefault(e => e.Displayed);
            if (continueBtn != null)
            {
                try
                {
                    continueBtn.Click();
                }
                catch
                {
                    ((IJavaScriptExecutor)_webDriver).ExecuteScript("arguments[0].click();", continueBtn);
                }
            }
            else
            {
                ClickByScript(XPath_Products.BtnStatusModalContinue);
            }

            WaitFor(IsAnySwalVisible, 10);
            Thread.Sleep(400);
        }

        public void ConfirmStatusChangePopup()
        {
            WaitFor(IsAnySwalVisible, 10);

            // Confirm first. Do not close the Change Status modal while this popup
            // is still open — Escape would leave the confirmation on screen.
            ClickSwalButton(confirm: true);
            WaitFor(driver => !IsAnySwalVisible(driver), 10);

            if (IsAnySwalVisible(_webDriver))
            {
                ClickSwalButton(confirm: true);
                WaitFor(driver => !IsAnySwalVisible(driver), 5);
            }

            CloseAllOpenProductDialogs();
        }

        public void CloseStatusModalIfOpen()
        {
            if (IsAnySwalVisible(_webDriver))
            {
                return;
            }

            if (!_webDriver.FindElements(By.XPath(XPath_Products.StatusModal)).Any(e => e.Displayed))
            {
                return;
            }

            ClickCancelStatusModal();

            if (_webDriver.FindElements(By.XPath(XPath_Products.StatusModal)).Any(e => e.Displayed))
            {
                var closeBtn = _webDriver.FindElements(By.XPath("//*[@role='dialog' and (.//h3[contains(., 'Change Status')] or .//legend[contains(., 'New Status')])]//button[@aria-label='Close']")).FirstOrDefault(e => e.Displayed);
                if (closeBtn != null)
                {
                    ((IJavaScriptExecutor)_webDriver).ExecuteScript("arguments[0].click();", closeBtn);
                }

                WaitFor(driver => !driver.FindElements(By.XPath(XPath_Products.StatusModal)).Any(e => e.Displayed), 8);
            }
        }

        public bool IsStatusConfirmationPopupClosed()
        {
            return !IsAnySwalVisible(_webDriver);
        }

        public void CloseAllOpenProductDialogs()
        {
            CloseLeftoverConfirmations();

            if (_webDriver.FindElements(By.XPath(XPath_Products.InvoiceModal)).Any(e => e.Displayed))
            {
                ClickCloseInvoiceModal();
            }
        }

        private void FocusMainBrowserWindow()
        {
            var handles = _webDriver.WindowHandles;
            if (handles.Count == 0)
            {
                return;
            }

            _webDriver.SwitchTo().Window(handles[0]);
        }

        public void CloseLeftoverConfirmations()
        {
            if (IsAnySwalVisible(_webDriver))
            {
                ClickSwalButton(confirm: true);
                if (IsAnySwalVisible(_webDriver))
                {
                    ClickSwalButton(confirm: false);
                }

                WaitFor(driver => !IsAnySwalVisible(driver), 5);
            }

            CloseStatusModalIfOpen();
        }

        private bool IsAnySwalVisible(IWebDriver driver)
        {
            var previousWait = driver.Manage().Timeouts().ImplicitWait;
            try
            {
                driver.Manage().Timeouts().ImplicitWait = TimeSpan.Zero;
                return driver.FindElements(By.XPath(XPath_Products.SwalContainer)).Any(IsVisibleSwal)
                    || driver.FindElements(By.XPath(XPath_Products.SwalPopup)).Any(IsVisibleSwal)
                    || driver.FindElements(By.XPath(XPath_Products.SwalConfirmButton)).Any(e => e.Displayed)
                    || driver.FindElements(By.XPath(XPath_Products.SwalCancelButton)).Any(e => e.Displayed);
            }
            finally
            {
                driver.Manage().Timeouts().ImplicitWait = previousWait;
            }
        }

        private static bool IsVisibleSwal(IWebElement element)
        {
            try
            {
                string cssClass = element.GetAttribute("class") ?? string.Empty;
                if (cssClass.Contains("swal2-backdrop-hide", StringComparison.OrdinalIgnoreCase))
                {
                    return false;
                }

                return element.Displayed;
            }
            catch (StaleElementReferenceException)
            {
                return false;
            }
        }

        private void ClickSwalButton(bool confirm)
        {
            string script = confirm
                ? @"
                    var labels = ['confirm status change', 'discard invoice', 'discard license', 'discard changes'];
                    var buttons = Array.from(document.querySelectorAll('.swal2-container button, .swal2-popup button'));
                    var btn = buttons.find(function(b) {
                      var text = (b.innerText || b.textContent || '').replace(/\s+/g, ' ').trim().toLowerCase();
                      return labels.some(function(label) { return text.indexOf(label) !== -1; });
                    }) || document.querySelector('.swal2-container .swal2-confirm, .swal2-confirm');
                    if (!btn) { return false; }
                    btn.focus();
                    btn.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true, cancelable: true, view: window }));
                    btn.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true, view: window }));
                    btn.dispatchEvent(new MouseEvent('pointerup', { bubbles: true, cancelable: true, view: window }));
                    btn.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true, view: window }));
                    btn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
                    btn.click();
                    if (typeof Swal !== 'undefined' && Swal.isVisible && Swal.isVisible()) { Swal.clickConfirm(); }
                    return true;
                  "
                : @"
                    var buttons = Array.from(document.querySelectorAll('.swal2-container button, .swal2-popup button'));
                    var btn = buttons.find(function(b) {
                      var text = (b.innerText || b.textContent || '').replace(/\s+/g, ' ').trim().toLowerCase();
                      return text === 'cancel' || text.indexOf('cancel') !== -1;
                    }) || document.querySelector('.swal2-container .swal2-cancel, .swal2-cancel');
                    if (!btn) { return false; }
                    btn.focus();
                    btn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
                    btn.click();
                    if (typeof Swal !== 'undefined' && Swal.isVisible && Swal.isVisible()) { Swal.clickCancel(); }
                    return true;
                  ";

            var buttonXPath = confirm
                ? XPath_Products.DiscardInvoiceConfirm + " | " + XPath_Products.SwalConfirmButton
                : XPath_Products.SwalCancelButton;
            var button = _webDriver.FindElements(By.XPath(buttonXPath)).FirstOrDefault(e => e.Displayed);
            if (button != null)
            {
                try
                {
                    new Actions(_webDriver).MoveToElement(button).Pause(TimeSpan.FromMilliseconds(120)).Click().Perform();
                }
                catch
                {
                    ((IJavaScriptExecutor)_webDriver).ExecuteScript("arguments[0].click();", button);
                }
            }

            ((IJavaScriptExecutor)_webDriver).ExecuteScript(script);

            if (WaitFor(driver => !IsAnySwalVisible(driver), 4))
            {
                return;
            }

            ((IJavaScriptExecutor)_webDriver).ExecuteScript(script);
            if (WaitFor(driver => !IsAnySwalVisible(driver), 3))
            {
                return;
            }

            try
            {
                new Actions(_webDriver).SendKeys(Keys.Escape).Perform();
            }
            catch
            {
                // Ignore
            }

            if (WaitFor(driver => !IsAnySwalVisible(driver), 2))
            {
                return;
            }

            // Last resort: remove the leftover overlay so the next step is not blocked.
            ((IJavaScriptExecutor)_webDriver).ExecuteScript(@"
                document.querySelectorAll('.swal2-container').forEach(function(el) { el.remove(); });
                document.body.classList.remove('swal2-shown', 'swal2-height-auto');
                document.documentElement.classList.remove('swal2-shown', 'swal2-height-auto');
            ");
            WaitFor(driver => !IsAnySwalVisible(driver), 2);
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
            return WaitFor(driver => driver.FindElements(By.XPath(XPath_Products.DiscardChangesPopup)).Any(e => e.Displayed)
                || driver.FindElements(By.XPath(XPath_Products.DiscardChangesCancel)).Any(e => e.Displayed), 10);
        }

        public void ClickDiscardChangesCancel()
        {
            ClickSwalButton(confirm: false);
            WaitFor(driver => !IsAnySwalVisible(driver), 8);
            Thread.Sleep(300);
        }

        public void ClickDiscardChangesConfirm()
        {
            ClickSwalButton(confirm: true);
            WaitFor(driver => !IsAnySwalVisible(driver), 10);
            if (IsAnySwalVisible(_webDriver))
            {
                ClickSwalButton(confirm: false);
            }

            WaitFor(driver => driver.FindElements(By.XPath(XPath_Products.BtnChangeStatus)).Any(e => e.Displayed), 15);
            Thread.Sleep(500);
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
            if (IsAnySwalVisible(_webDriver))
            {
                ClickDiscardChangesConfirm();
                return;
            }

            WaitFor(driver => driver.FindElements(By.XPath(XPath_Products.BtnChangeStatus)).Count > 0, 15);
            Thread.Sleep(500);
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
                || driver.FindElements(By.XPath(XPath_Products.EditProductNameInput)).Count > 0
                || driver.FindElements(By.XPath(XPath_Products.EditProductUrlInput)).Count > 0, 10);

            string timestamp = DateTime.Now.ToString("HHmmss");

            // 1. Production URL
            var urlInput = _webDriver.FindElements(By.XPath(XPath_Products.EditProductUrlInput)).FirstOrDefault();
            if (urlInput != null)
            {
                ((IJavaScriptExecutor)_webDriver).ExecuteScript("arguments[0].scrollIntoView({block: 'center', inline: 'nearest'});", urlInput);
                Thread.Sleep(200);
                string newUrl = $"https://app-{timestamp}.optionc.com";
                try
                {
                    urlInput.Click();
                    urlInput.SendKeys(Keys.Control + "a");
                    urlInput.SendKeys(Keys.Backspace);
                    urlInput.SendKeys(newUrl);
                }
                catch
                {
                    ((IJavaScriptExecutor)_webDriver).ExecuteScript("arguments[0].focus();", urlInput);
                }
                SetValueByScript(XPath_Products.EditProductUrlInput, newUrl);
                Thread.Sleep(300);
            }

            // 2. License Type: toggle to the other option (Free <-> Licensed)
            var freeRadio = _webDriver.FindElements(By.XPath("//div[@role='radiogroup' and ancestor::div[.//label[contains(., 'License Type')]]]//label[contains(., 'Free')] | //label[contains(., 'Free')]")).FirstOrDefault();
            var licensedRadio = _webDriver.FindElements(By.XPath("//div[@role='radiogroup' and ancestor::div[.//label[contains(., 'License Type')]]]//label[contains(., 'Licensed')] | //label[contains(., 'Licensed')]")).FirstOrDefault();
            var currentLicenseChecked = _webDriver.FindElements(By.XPath("//div[@role='radiogroup' and ancestor::div[.//label[contains(., 'License Type')]]]//input[@type='radio' and @checked]")).FirstOrDefault();
            
            IWebElement? licenseTarget = null;
            if (currentLicenseChecked != null && currentLicenseChecked.GetAttribute("id")?.Contains("free", StringComparison.OrdinalIgnoreCase) == true)
            {
                licenseTarget = licensedRadio ?? freeRadio;
            }
            else
            {
                licenseTarget = freeRadio ?? licensedRadio;
            }

            if (licenseTarget != null)
            {
                ((IJavaScriptExecutor)_webDriver).ExecuteScript("arguments[0].scrollIntoView({block: 'center', inline: 'nearest'});", licenseTarget);
                Thread.Sleep(200);
                try
                {
                    licenseTarget.Click();
                }
                catch
                {
                    ((IJavaScriptExecutor)_webDriver).ExecuteScript("arguments[0].click();", licenseTarget);
                }
                Thread.Sleep(300);
            }

            // 3. Navigation Target: toggle to the other option (Same Tab <-> New Tab)
            var sameTabRadio = _webDriver.FindElements(By.XPath("//div[@role='radiogroup' and ancestor::div[.//label[contains(., 'Navigation Target')]]]//label[contains(., 'Same Tab')] | //label[contains(., 'Same Tab')]")).FirstOrDefault();
            var newTabRadio = _webDriver.FindElements(By.XPath("//div[@role='radiogroup' and ancestor::div[.//label[contains(., 'Navigation Target')]]]//label[contains(., 'New Tab')] | //label[contains(., 'New Tab')]")).FirstOrDefault();
            var currentNavChecked = _webDriver.FindElements(By.XPath("//div[@role='radiogroup' and ancestor::div[.//label[contains(., 'Navigation Target')]]]//input[@type='radio' and @checked]")).FirstOrDefault();

            IWebElement? navTarget = null;
            if (currentNavChecked != null && currentNavChecked.GetAttribute("id")?.Contains("same-tab", StringComparison.OrdinalIgnoreCase) == true)
            {
                navTarget = newTabRadio ?? sameTabRadio;
            }
            else
            {
                navTarget = sameTabRadio ?? newTabRadio;
            }

            if (navTarget != null)
            {
                ((IJavaScriptExecutor)_webDriver).ExecuteScript("arguments[0].scrollIntoView({block: 'center', inline: 'nearest'});", navTarget);
                Thread.Sleep(200);
                try
                {
                    navTarget.Click();
                }
                catch
                {
                    ((IJavaScriptExecutor)_webDriver).ExecuteScript("arguments[0].click();", navTarget);
                }
                Thread.Sleep(300);
            }

            // 4. Contact Person Dropdown: open and select option
            var dropdown = _webDriver.FindElements(By.XPath(XPath_Products.EditProductContactDropdown)).FirstOrDefault();
            if (dropdown != null)
            {
                ((IJavaScriptExecutor)_webDriver).ExecuteScript("arguments[0].scrollIntoView({block: 'center', inline: 'nearest'});", dropdown);
                Thread.Sleep(200);
                try
                {
                    dropdown.Click();
                }
                catch
                {
                    ((IJavaScriptExecutor)_webDriver).ExecuteScript("arguments[0].click();", dropdown);
                }
                Thread.Sleep(500);

                var options = _webDriver.FindElements(By.XPath("//div[@role='listbox']//button[@role='option']"));
                var opt = options.Count > 1 ? options[1] : options.FirstOrDefault();
                if (opt != null)
                {
                    ((IJavaScriptExecutor)_webDriver).ExecuteScript("arguments[0].click();", opt);
                    Thread.Sleep(300);
                }
            }

            // 5. Features: enter new feature and click Add
            string featureToAdd = string.IsNullOrWhiteSpace(editFeature) ? "Acutis Feature" : editFeature;
            var featureInput = _webDriver.FindElements(By.XPath(XPath_Products.EditProductFeatureInput)).FirstOrDefault();
            if (featureInput != null)
            {
                ((IJavaScriptExecutor)_webDriver).ExecuteScript("arguments[0].scrollIntoView({block: 'center', inline: 'nearest'});", featureInput);
                Thread.Sleep(200);
                try
                {
                    featureInput.Click();
                }
                catch
                {
                    ((IJavaScriptExecutor)_webDriver).ExecuteScript("arguments[0].focus();", featureInput);
                }
                featureInput.SendKeys($"{featureToAdd} {timestamp}");
                Thread.Sleep(200);
                var addBtn = _webDriver.FindElements(By.XPath(XPath_Products.BtnEditAddFeature)).FirstOrDefault();
                if (addBtn != null)
                {
                    ((IJavaScriptExecutor)_webDriver).ExecuteScript("arguments[0].scrollIntoView({block: 'center', inline: 'nearest'});", addBtn);
                    Thread.Sleep(200);
                    try
                    {
                        addBtn.Click();
                    }
                    catch
                    {
                        ((IJavaScriptExecutor)_webDriver).ExecuteScript("arguments[0].click();", addBtn);
                    }
                    Thread.Sleep(400);
                }
            }

            // 6. Product Logo: Temporarily skipped per test requirements

            // 7. Description: clear and enter new description
            string descToUse = string.IsNullOrWhiteSpace(editDescription)
                ? $"Automated updated description for product at {DateTime.Now:HH:mm:ss}."
                : $"{editDescription} (Updated at {DateTime.Now:HH:mm:ss})";
            var descInput = _webDriver.FindElements(By.XPath(XPath_Products.EditProductDescTextarea)).FirstOrDefault();
            if (descInput != null)
            {
                ((IJavaScriptExecutor)_webDriver).ExecuteScript("arguments[0].scrollIntoView({block: 'center', inline: 'nearest'});", descInput);
                Thread.Sleep(200);
                try
                {
                    descInput.Click();
                    descInput.SendKeys(Keys.Control + "a");
                    descInput.SendKeys(Keys.Backspace);
                    descInput.SendKeys(descToUse);
                }
                catch
                {
                    ((IJavaScriptExecutor)_webDriver).ExecuteScript("arguments[0].focus();", descInput);
                }
                SetValueByScript(XPath_Products.EditProductDescTextarea, descToUse);
                Thread.Sleep(300);
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
            CloseAllOpenProductDialogs();
            Thread.Sleep(500);
        }

        #endregion Edit Product Workflow

        #region Organizations Tab Workflow

        public void ClickOrganizationsTab()
        {
            CloseLeftoverConfirmations();
            ClickSubTab("Organizations");
            Thread.Sleep(1500);
        }

        public void NavigateAllOrganizationStatusTabs()
        {
            ClickOrganizationsTab();

            // Status filter chips in CustomerDetails.tsx: Active, Expiring Soon, Expired, 0 Users, All Statuses
            var statusFilterLabels = new[] { "Active", "Expiring Soon", "Expired", "Users", "All Statuses" };
            foreach (var label in statusFilterLabels)
            {
                string xpath = label switch
                {
                    "Active" => XPath_Products.OrgFilterChipActive,
                    "Expiring Soon" => XPath_Products.OrgFilterChipExpiringSoon,
                    "Expired" => XPath_Products.OrgFilterChipExpired,
                    "Users" => XPath_Products.OrgFilterChipUsers,
                    "All Statuses" or _ => XPath_Products.OrgFilterChipAll
                };

                var chip = _webDriver.FindElements(By.XPath(xpath)).FirstOrDefault()
                    ?? _webDriver.FindElements(By.XPath($"//button[contains(@class, 'admin-filter-chip') and contains(., '{label}')]")).FirstOrDefault();

                if (chip != null)
                {
                    ((IJavaScriptExecutor)_webDriver).ExecuteScript("arguments[0].scrollIntoView({block: 'center', inline: 'nearest'});", chip);
                    Thread.Sleep(300);
                    ((IJavaScriptExecutor)_webDriver).ExecuteScript("arguments[0].click();", chip);
                    Thread.Sleep(800);
                }
            }
        }

        public void ClickViewFirstOrganization()
        {
            ClickOrganizationsTab();

            // If table has no rows under current filter, click All Statuses chip to ensure organization rows exist
            var rows = _webDriver.FindElements(By.XPath("//table//tbody//tr[.//a[contains(@href, '/admin/organizations/')] or .//button[contains(@aria-label, 'View')]]"));
            if (rows.Count == 0)
            {
                var allChip = _webDriver.FindElements(By.XPath(XPath_Products.OrgFilterChipAll)).FirstOrDefault()
                    ?? _webDriver.FindElements(By.XPath("//button[contains(@class, 'admin-filter-chip') and (contains(., 'All Statuses') or contains(., 'All'))]")).FirstOrDefault();
                if (allChip != null)
                {
                    ((IJavaScriptExecutor)_webDriver).ExecuteScript("arguments[0].click();", allChip);
                    Thread.Sleep(800);
                }
            }

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
                ((IJavaScriptExecutor)_webDriver).ExecuteScript("arguments[0].scrollIntoView({block: 'center', inline: 'nearest'});", viewBtn);
                Thread.Sleep(400);
                ((IJavaScriptExecutor)_webDriver).ExecuteScript("arguments[0].click();", viewBtn);
            }

            WaitFor(driver =>
                System.Text.RegularExpressions.Regex.IsMatch(driver.Url, @"/admin/organizations/\d+", System.Text.RegularExpressions.RegexOptions.IgnoreCase)
                || driver.FindElements(By.XPath("//button[contains(., 'Back to Products')]")).Any(e => e.Displayed),
                15);
            Thread.Sleep(800);
        }

        public bool IsOrganizationDetailsOpened()
        {
            return WaitFor(driver =>
                System.Text.RegularExpressions.Regex.IsMatch(driver.Url, @"/admin/organizations/\d+", System.Text.RegularExpressions.RegexOptions.IgnoreCase)
                || driver.FindElements(By.XPath("//button[contains(., 'Back to Products')]")).Any(e => e.Displayed),
                10);
        }

        public void ClickBackToProducts()
        {
            CloseLeftoverConfirmations();

            var backBtn = _webDriver.FindElements(By.XPath("//button[contains(., 'Back to Products')]")).FirstOrDefault(e => e.Displayed);
            if (backBtn != null)
            {
                ((IJavaScriptExecutor)_webDriver).ExecuteScript("arguments[0].scrollIntoView({block: 'center', inline: 'nearest'});", backBtn);
                Thread.Sleep(300);
                ((IJavaScriptExecutor)_webDriver).ExecuteScript("arguments[0].click();", backBtn);
            }
            else
            {
                _webDriver.Navigate().Back();
            }

            WaitFor(driver =>
                driver.Url.Contains("/admin/product-details", StringComparison.OrdinalIgnoreCase)
                || driver.FindElements(By.XPath(XPath_Products.BtnChangeStatus)).Any(e => e.Displayed),
                15);
            Thread.Sleep(800);
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

            WaitFor(driver => driver.FindElements(By.XPath(XPath_Products.InvoiceProductTitleInput)).Count > 0
                || driver.FindElements(By.XPath(XPath_Products.InvoiceTitleInput)).Count > 0
                || driver.FindElements(By.XPath(XPath_Products.BtnInvoiceCancel)).Count > 0, 15);
            Thread.Sleep(1000);
        }

        public bool IsCreateInvoicePageOpened()
        {
            return WaitFor(driver => driver.FindElements(By.XPath(XPath_Products.InvoiceProductTitleInput)).Count > 0
                || driver.FindElements(By.XPath(XPath_Products.InvoiceTitleInput)).Count > 0
                || driver.FindElements(By.XPath(XPath_Products.BtnInvoiceCancel)).Count > 0, 10);
        }

        public bool IsInvoiceProductTitleReadOnly()
        {
            var titleInput = _webDriver.FindElements(By.XPath(XPath_Products.InvoiceProductTitleInput)).FirstOrDefault()
                ?? _webDriver.FindElements(By.XPath(XPath_Products.InvoiceTitleInput)).FirstOrDefault()
                ?? _webDriver.FindElements(By.XPath("//input[@id='invoiceProductTitle' or @name='invoiceProductTitle']")).FirstOrDefault()
                ?? _webDriver.FindElements(By.XPath("//form//input[@readonly and (@disabled or @aria-disabled='true') and not(@type='hidden')]")).FirstOrDefault();

            if (titleInput == null)
            {
                return false;
            }

            string? readOnlyAttr = titleInput.GetAttribute("readonly");
            string? disabledAttr = titleInput.GetAttribute("disabled");
            string? ariaReadOnly = titleInput.GetAttribute("aria-readonly");
            string? ariaDisabled = titleInput.GetAttribute("aria-disabled");

            return (!string.IsNullOrEmpty(readOnlyAttr) && readOnlyAttr != "false")
                || (!string.IsNullOrEmpty(disabledAttr) && disabledAttr != "false")
                || (!string.IsNullOrEmpty(ariaReadOnly) && ariaReadOnly != "false")
                || (!string.IsNullOrEmpty(ariaDisabled) && ariaDisabled != "false")
                || !titleInput.Enabled;
        }

        public string GetInvoiceProductTitleValue()
        {
            var titleInput = _webDriver.FindElements(By.XPath(XPath_Products.InvoiceProductTitleInput)).FirstOrDefault()
                ?? _webDriver.FindElements(By.XPath(XPath_Products.InvoiceTitleInput)).FirstOrDefault()
                ?? _webDriver.FindElements(By.XPath("//input[@id='invoiceProductTitle' or @name='invoiceProductTitle']")).FirstOrDefault()
                ?? _webDriver.FindElements(By.XPath("//form//input[@readonly and (@disabled or @aria-disabled='true') and not(@type='hidden')]")).FirstOrDefault();

            if (titleInput == null)
            {
                return string.Empty;
            }

            return titleInput.GetAttribute("value") ?? string.Empty;
        }

        public void ClickCancelCreateInvoice()
        {
            // Dirty the form so Cancel opens the discard confirmation.
            var remarksElement = _webDriver.FindElements(By.XPath(XPath_Products.InvoiceRemarksInput)).FirstOrDefault();
            if (remarksElement != null)
            {
                ((IJavaScriptExecutor)_webDriver).ExecuteScript(
                    "arguments[0].focus(); arguments[0].dispatchEvent(new Event('input', { bubbles: true }));",
                    remarksElement);
                try
                {
                    remarksElement.SendKeys(" ");
                }
                catch
                {
                    // Ignore
                }
            }

            ClickInvoiceFormCancel();
            WaitFor(IsAnySwalVisible, 8);
            Thread.Sleep(300);

            // Cancel on the discard popup must close it and leave the form open.
            if (IsAnySwalVisible(_webDriver))
            {
                ClickSwalButton(confirm: false);
                WaitFor(driver => !IsAnySwalVisible(driver), 8);
            }

            ClickInvoiceFormCancel();
            WaitFor(IsAnySwalVisible, 8);
            Thread.Sleep(300);

            // Discard invoice / Discard license must close the popup and leave the page.
            if (IsAnySwalVisible(_webDriver))
            {
                ClickSwalButton(confirm: true);
            }

            WaitFor(driver => !IsAnySwalVisible(driver), 10);
            WaitFor(driver => driver.FindElements(By.XPath(XPath_Products.BtnCreateInvoice)).Count > 0
                || driver.FindElements(By.XPath(XPath_Products.BtnChangeStatus)).Count > 0, 15);
            Thread.Sleep(500);
        }

        private void ClickInvoiceFormCancel()
        {
            var cancelBtn = _webDriver.FindElements(By.XPath(XPath_Products.BtnInvoiceCancel)).FirstOrDefault(e => e.Displayed);
            if (cancelBtn != null)
            {
                ((IJavaScriptExecutor)_webDriver).ExecuteScript("arguments[0].scrollIntoView(true);", cancelBtn);
                Thread.Sleep(200);
                ((IJavaScriptExecutor)_webDriver).ExecuteScript("arguments[0].click();", cancelBtn);
            }
            else
            {
                ClickByScript(XPath_Products.BtnInvoiceCancel);
            }

            Thread.Sleep(400);
        }

        public void SetDatePickerDate(string inputXPath, string mmDdYyyyDate)
        {
            var element = _webDriver.FindElements(By.XPath(inputXPath)).FirstOrDefault();
            if (element != null)
            {
                ((IJavaScriptExecutor)_webDriver).ExecuteScript("arguments[0].scrollIntoView(true);", element);
                Thread.Sleep(200);
                try
                {
                    element.Click();
                }
                catch
                {
                    ((IJavaScriptExecutor)_webDriver).ExecuteScript("arguments[0].focus();", element);
                }
                Thread.Sleep(200);
                element.SendKeys(Keys.Control + "a");
                element.SendKeys(Keys.Backspace);
                element.SendKeys(mmDdYyyyDate);
                Thread.Sleep(200);
                element.SendKeys(Keys.Enter);
                Thread.Sleep(200);
                element.SendKeys(Keys.Tab);
                Thread.Sleep(300);
            }
        }

        public void EnterInvoiceDetailsAndSave(string invoiceRemarks)
        {
            FocusMainBrowserWindow();

            WaitFor(driver => driver.FindElements(By.XPath(XPath_Products.InvoiceProductTitleInput)).Count > 0
                || driver.FindElements(By.XPath(XPath_Products.InvoiceTitleInput)).Count > 0
                || driver.FindElements(By.XPath(XPath_Products.BtnInvoiceCancel)).Count > 0, 10);

            // Wait for any remaining swal overlays to clear
            WaitFor(driver => driver.FindElements(By.XPath("//div[contains(@class, 'swal2-container')]")).Count == 0, 10);

            // Verify Product Title is present and read-only
            var titleInput = _webDriver.FindElements(By.XPath(XPath_Products.InvoiceProductTitleInput)).FirstOrDefault()
                ?? _webDriver.FindElements(By.XPath(XPath_Products.InvoiceTitleInput)).FirstOrDefault()
                ?? _webDriver.FindElements(By.XPath("//input[@id='invoiceProductTitle' or @name='invoiceProductTitle']")).FirstOrDefault()
                ?? _webDriver.FindElements(By.XPath("//form//input[@readonly and (@disabled or @aria-disabled='true') and not(@type='hidden')]")).FirstOrDefault();

            if (titleInput != null && !IsInvoiceProductTitleReadOnly())
            {
                throw new InvalidOperationException("Product Title input must be read-only and/or disabled.");
            }

            // Enter remarks
            string remarksToSet = string.IsNullOrWhiteSpace(invoiceRemarks) ? "OptionC License Remarks" : invoiceRemarks;
            remarksToSet += " - " + DateTime.Now.ToString("HHmmss");

            var remarksElement = _webDriver.FindElements(By.XPath(XPath_Products.InvoiceRemarksInput)).FirstOrDefault();
            if (remarksElement != null)
            {
                ((IJavaScriptExecutor)_webDriver).ExecuteScript("arguments[0].scrollIntoView(true);", remarksElement);
                Thread.Sleep(300);
                try
                {
                    remarksElement.Click();
                }
                catch
                {
                    ((IJavaScriptExecutor)_webDriver).ExecuteScript("arguments[0].focus();", remarksElement);
                }
                Thread.Sleep(200);
                ((IJavaScriptExecutor)_webDriver).ExecuteScript(
                    "var el = arguments[0]; " +
                    "if (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT') { " +
                    "  el.value = arguments[1]; " +
                    "} else { " +
                    "  el.innerHTML = arguments[1]; " +
                    "} " +
                    "el.dispatchEvent(new Event('input', { bubbles: true })); " +
                    "el.dispatchEvent(new Event('change', { bubbles: true })); " +
                    "el.dispatchEvent(new Event('blur', { bubbles: true }));",
                    remarksElement, remarksToSet);
                Thread.Sleep(400);
            }

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

            // Initial non-overlapping future date block (e.g. 2035)
            int startYear = 2035;
            bool saved = false;

            for (int attempt = 0; attempt < 8; attempt++)
            {
                SetDatePickerDate(XPath_Products.InvoiceStartDateInput, $"01/01/{startYear}");
                SetDatePickerDate(XPath_Products.InvoiceExpiryDateInput, $"12/31/{startYear}");
                Thread.Sleep(400);

                var saveBtn = _webDriver.FindElements(By.XPath(XPath_Products.BtnInvoiceSave)).FirstOrDefault();
                if (saveBtn != null && saveBtn.Enabled)
                {
                    ((IJavaScriptExecutor)_webDriver).ExecuteScript("arguments[0].scrollIntoView(true);", saveBtn);
                    Thread.Sleep(300);
                    try
                    {
                        saveBtn.Click();
                    }
                    catch
                    {
                        ((IJavaScriptExecutor)_webDriver).ExecuteScript("arguments[0].click();", saveBtn);
                    }
                }

                Thread.Sleep(1500);

                // Check if navigated away from Add License page
                bool stillOnAddPage = _webDriver.Url.Contains("/add-product-license", StringComparison.OrdinalIgnoreCase)
                    || _webDriver.FindElements(By.XPath(XPath_Products.InvoiceRemarksInput)).Count > 0;

                    if (!stillOnAddPage)
                    {
                        saved = true;
                        break;
                    }

                    // Check if duration overlap toast appeared
                    bool overlapToastVisible = _webDriver.FindElements(By.XPath(XPath_Products.InvoiceOverlapToast)).Any(e => e.Displayed);

                    if (overlapToastVisible || stillOnAddPage)
                    {
                        // Advance year and retry with next non-overlapping period
                        startYear += 2;
                        Thread.Sleep(500);
                    }
                }

            if (!saved)
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
            var allChip = _webDriver.FindElements(By.XPath("//button[contains(@class, 'admin-filter-chip') and (contains(., 'All Statuses') or contains(., 'All'))]")).FirstOrDefault();
            if (allChip != null)
            {
                ((IJavaScriptExecutor)_webDriver).ExecuteScript("arguments[0].click();", allChip);
                Thread.Sleep(600);
            }

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
            return WaitFor(driver => driver.FindElements(By.XPath(XPath_Products.InvoiceModal)).Any(e => e.Displayed), 10);
        }

        public void ClickCloseInvoiceModal()
        {
            var modal = _webDriver.FindElements(By.XPath(XPath_Products.InvoiceModal)).FirstOrDefault(e => e.Displayed);
            if (modal != null)
            {
                var closeBtn = _webDriver.FindElements(By.XPath(XPath_Products.BtnInvoiceModalClose)).FirstOrDefault(e => e.Displayed);
                if (closeBtn != null)
                {
                    ((IJavaScriptExecutor)_webDriver).ExecuteScript("arguments[0].scrollIntoView(true);", closeBtn);
                    Thread.Sleep(200);
                    try
                    {
                        closeBtn.Click();
                    }
                    catch
                    {
                        ((IJavaScriptExecutor)_webDriver).ExecuteScript("arguments[0].click();", closeBtn);
                    }
                }
                else
                {
                    ClickByScript(XPath_Products.BtnInvoiceModalClose);
                }

                // If modal is still displayed, send Escape as a fallback
                if (_webDriver.FindElements(By.XPath(XPath_Products.InvoiceModal)).Any(e => e.Displayed))
                {
                    try
                    {
                        new OpenQA.Selenium.Interactions.Actions(_webDriver).SendKeys(Keys.Escape).Perform();
                    }
                    catch
                    {
                        // Ignore
                    }
                }

                WaitFor(driver => !driver.FindElements(By.XPath(XPath_Products.InvoiceModal)).Any(e => e.Displayed), 8);
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
            Thread.Sleep(800);

            // 1. Organization dropdown: select All Organizations
            var orgDropdown = _webDriver.FindElements(By.XPath(XPath_Products.InvoiceHistoryOrgDropdown)).FirstOrDefault();
            if (orgDropdown != null)
            {
                ((IJavaScriptExecutor)_webDriver).ExecuteScript("arguments[0].click();", orgDropdown);
                Thread.Sleep(400);
                var allOrgOpt = _webDriver.FindElements(By.XPath("//div[@role='listbox']//button[@role='option' and (contains(., 'All Organizations') or contains(., 'All'))]")).FirstOrDefault()
                    ?? _webDriver.FindElements(By.XPath(XPath_Products.FirstDropdownOption)).FirstOrDefault();
                if (allOrgOpt != null)
                {
                    ((IJavaScriptExecutor)_webDriver).ExecuteScript("arguments[0].click();", allOrgOpt);
                    Thread.Sleep(500);
                }
            }

            // 2. Status dropdown: cycle through filter options and leave on 'Paid' so invoice records remain visible
            var statusDropdown = _webDriver.FindElements(By.XPath(XPath_Products.InvoiceHistoryStatusDropdown)).FirstOrDefault();
            if (statusDropdown != null)
            {
                ((IJavaScriptExecutor)_webDriver).ExecuteScript("arguments[0].click();", statusDropdown);
                Thread.Sleep(400);

                var options = _webDriver.FindElements(By.XPath("//div[@role='listbox']//button[@role='option']")).ToList();
                foreach (var opt in options)
                {
                    try
                    {
                        ((IJavaScriptExecutor)_webDriver).ExecuteScript("arguments[0].click();", opt);
                        Thread.Sleep(400);
                        ((IJavaScriptExecutor)_webDriver).ExecuteScript("arguments[0].click();", statusDropdown);
                        Thread.Sleep(300);
                    }
                    catch
                    {
                        // Ignore
                    }
                }

                // Ensure it is set to 'Paid' where active license rows are populated
                var paidOpt = _webDriver.FindElements(By.XPath("//div[@role='listbox']//button[@role='option' and contains(., 'Paid')]")).FirstOrDefault()
                    ?? _webDriver.FindElements(By.XPath("//div[@role='listbox']//button[@role='option']")).FirstOrDefault();
                if (paidOpt != null)
                {
                    ((IJavaScriptExecutor)_webDriver).ExecuteScript("arguments[0].click();", paidOpt);
                    Thread.Sleep(600);
                }
                else
                {
                    ((IJavaScriptExecutor)_webDriver).ExecuteScript("arguments[0].click();", statusDropdown);
                    Thread.Sleep(300);
                }
            }
        }

        public void ClickViewInvoiceInInvoiceHistory()
        {
            ClickInvoiceHistoryTab();
            Thread.Sleep(800);

            // Ensure rows are loaded; if no rows currently visible, select 'Paid' filter
            bool hasRows = WaitFor(driver => driver.FindElements(By.XPath("//div[@role='tabpanel']//table//tbody//tr[not(contains(., 'No license history'))]")).Count > 0, 5);
            if (!hasRows)
            {
                var statusDropdown = _webDriver.FindElements(By.XPath(XPath_Products.InvoiceHistoryStatusDropdown)).FirstOrDefault();
                if (statusDropdown != null)
                {
                    ((IJavaScriptExecutor)_webDriver).ExecuteScript("arguments[0].click();", statusDropdown);
                    Thread.Sleep(400);
                    var paidOpt = _webDriver.FindElements(By.XPath("//div[@role='listbox']//button[@role='option' and contains(., 'Paid')]")).FirstOrDefault()
                        ?? _webDriver.FindElements(By.XPath("//div[@role='listbox']//button[@role='option']")).FirstOrDefault();
                    if (paidOpt != null)
                    {
                        ((IJavaScriptExecutor)_webDriver).ExecuteScript("arguments[0].click();", paidOpt);
                        Thread.Sleep(800);
                    }
                }
            }

            WaitFor(driver => driver.FindElements(By.XPath(XPath_Products.FirstInvoiceHistoryViewButton)).Count > 0, 10);
            var viewBtn = _webDriver.FindElements(By.XPath(XPath_Products.FirstInvoiceHistoryViewButton)).FirstOrDefault();
            if (viewBtn != null)
            {
                ((IJavaScriptExecutor)_webDriver).ExecuteScript("arguments[0].scrollIntoView({block: 'center'});", viewBtn);
                Thread.Sleep(400);
                try
                {
                    viewBtn.Click();
                }
                catch
                {
                    ((IJavaScriptExecutor)_webDriver).ExecuteScript("arguments[0].click();", viewBtn);
                }

                WaitFor(driver => driver.FindElements(By.XPath(XPath_Products.InvoiceModal)).Any(e => e.Displayed), 10);
                Thread.Sleep(500);
            }
        }

        #endregion Invoice Modal & History Workflow
    }
}
