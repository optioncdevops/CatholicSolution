// Copyright (c) OptionC. All rights reserved.

using Automation.Framework.JsonTestData;
using Automation.Framework.ViperPages.Products;

using NUnit.Framework;

using OpenQA.Selenium;

using Reqnroll;

namespace Automation.Acutis.StepDefinitions
{
    [Binding]
    public class ProductStepDefinitions(IWebDriver driver)
    {
        private readonly ProductPage _productPage = new(driver);
        private readonly AcutisJsonDataObjects _testData = (AcutisJsonDataObjects)JsonDataReader.GetJsonData("Acutis");

        [When(@"Click on Products menu and verify Products page is opened")]
        [Then(@"Click on Products menu and verify Products page is opened")]
        public void ThenClickOnProductsMenuAndVerifyProductsPageIsOpened()
        {
            _productPage.NavigateToProducts();
        }

        [When(@"Navigate through all product filter tabs: Active, Inactive, Coming Soon, and other filters")]
        [Then(@"Navigate through all product filter tabs: Active, Inactive, Coming Soon, and other filters")]
        public void WhenNavigateThroughAllProductFilterTabsActiveInactiveComingSoonAndOtherFilters()
        {
            _productPage.NavigateThroughAllProductFilterTabs();
        }

        [When(@"Check the search functionality for products")]
        [Then(@"Check the search functionality for products")]
        public void WhenCheckTheSearchFunctionalityForProducts()
        {
            string searchProduct = _testData.Product?.SearchProductName ?? "OptionC";
            _productPage.CheckProductSearch(searchProduct);
        }

        [Then(@"Check in all products and filter by status")]
        public void ThenCheckInAllProductsAndFilterByStatus()
        {
            _productPage.NavigateThroughAllProductFilterTabs();
            string searchProduct = _testData.Product?.SearchProductName ?? "OptionC";
            _productPage.CheckProductSearch(searchProduct);
        }

        [When(@"Click on View Product icon for the selected product")]
        [Then(@"Click on View Product icon for the selected product")]
        public void ThenClickOnViewProductIconForTheSelectedProduct()
        {
            string targetProduct = _testData.Product?.TargetProductName ?? string.Empty;
            _productPage.ClickViewProduct(targetProduct);
        }

        [When(@"Product Details page should be opened")]
        [Then(@"Product Details page should be opened")]
        public void ThenProductDetailsPageShouldBeOpened()
        {
            Assert.That(_productPage.IsProductDetailsOpened(), Is.True, "Product Details page failed to open.");
        }

        [When(@"Navigate through product sub tabs: Organizations, Invoice Details, Invoice History, and Product Details")]
        [Then(@"Navigate through product sub tabs: Organizations, Invoice Details, Invoice History, and Product Details")]
        public void ThenNavigateThroughProductSubTabsOrganizationsInvoiceDetailsInvoiceHistoryAndProductDetails()
        {
            var subTabs = _testData.Product?.SubTabs ?? new List<string> { "Organizations", "Invoice Details", "Invoice History", "Product Details" };
            _productPage.NavigateThroughSubTabs(subTabs);
        }

        [When(@"Click on Change Status button")]
        public void WhenClickOnChangeStatusButton()
        {
            _productPage.ClickChangeStatus();
        }

        [When(@"Change Status modal should open and Click on Cancel button to close")]
        [Then(@"Change Status modal should open and Click on Cancel button to close")]
        public void ThenChangeStatusModalShouldOpenAndClickOnCancelButtonToClose()
        {
            Assert.That(_productPage.IsStatusModalOpened(), Is.True, "Status modal did not open.");
            _productPage.ClickCancelStatusModal();
            Assert.That(_productPage.IsStatusModalOpened(), Is.False, "Status modal did not close upon clicking Cancel.");
        }

        [When(@"Select new status and Click on Continue button")]
        [Then(@"Select new status and Click on Continue button")]
        public void WhenSelectNewStatusAndClickOnContinueButton()
        {
            string newStatus = _testData.Product?.NewStatus ?? "Coming Soon";
            _productPage.SelectStatusAndContinue(newStatus);
        }

        [When(@"Confirmation popup should open and Click Confirm to update status")]
        [Then(@"Confirmation popup should open and Click Confirm to update status")]
        [When(@"Confirmation popup should open and Click Confirm to update status and close the Change Status modal")]
        [Then(@"Confirmation popup should open and Click Confirm to update status and close the Change Status modal")]
        public void ThenConfirmationPopupShouldOpenAndClickConfirmToUpdateStatus()
        {
            _productPage.ConfirmStatusChangePopup();
            Assert.That(_productPage.IsStatusConfirmationPopupClosed(), Is.True, "Status confirmation popup remained open after clicking Confirm.");
            Assert.That(_productPage.IsStatusModalOpened(), Is.False, "Change Status modal remained open after confirming status update.");
            _productPage.CloseAllOpenProductDialogs();
            Assert.That(_productPage.IsStatusConfirmationPopupClosed(), Is.True, "A confirmation modal was still open after the status change finished.");
        }

        #region Edit Product Steps

        [When(@"Click on Edit Product button")]
        [Then(@"Click on Edit Product button")]
        [When(@"Click on Edit Product button in product details")]
        [Then(@"Click on Edit Product button in product details")]
        public void WhenClickOnEditProductButton()
        {
            _productPage.ClickEditProduct();
        }

        [When(@"Edit Product page should be opened and click on Cancel button")]
        [Then(@"Edit Product page should be opened and click on Cancel button")]
        [When(@"Edit Product page should be opened and edit all fields and first click with Cancel and then click to the Yes")]
        [Then(@"Edit Product page should be opened and edit all fields and first click with Cancel and then click to the Yes")]
        [When(@"Edit Product page should be opened and edit all fields and first click Cancel then Discard changes and the confirmation modal should close")]
        [Then(@"Edit Product page should be opened and edit all fields and first click Cancel then Discard changes and the confirmation modal should close")]
        public void ThenEditProductPageShouldBeOpenedAndEditAllFieldsAndFirstClickWithCancelAndThenClickToTheYes()
        {
            Assert.That(_productPage.IsEditProductPageOpened(), Is.True, "Edit Product page failed to open.");

            string name = _testData.Product?.EditProductName ?? "OptionC School";
            string shortName = _testData.Product?.EditShortName ?? "OptionC";
            string subtitle = _testData.Product?.EditSubtitle ?? "OptionC School - Updated Subtitle";
            string licenseType = _testData.Product?.EditLicenseType ?? "Licensed";
            string navTarget = _testData.Product?.EditNavigationTarget ?? "Same tab";
            string contact = _testData.Product?.EditContactPerson ?? string.Empty;
            string feature = _testData.Product?.EditFeature ?? "Acutis Integration";
            string description = _testData.Product?.EditDescription ?? "Automated test updated description for OptionC product.";

            _productPage.UpdateAllProductFields(name, shortName, subtitle, licenseType, navTarget, contact, feature, description);
            _productPage.ClickCancelEditProductWithConfirmation();
            Assert.That(_productPage.IsStatusConfirmationPopupClosed(), Is.True, "Edit Product confirmation modal remained open after Cancel or Discard changes.");
            Assert.That(_productPage.IsProductDetailsOpened(), Is.True, "Failed to return to Product Details upon discarding changes.");
        }

        [When(@"Edit Product page should be opened and update the fields and click on Save button")]
        [Then(@"Edit Product page should be opened and update the fields and click on Save button")]
        [When(@"Edit Product page should be opened and edit all fields and click on Save button")]
        [Then(@"Edit Product page should be opened and edit all fields and click on Save button")]
        [When(@"Edit Product page should be opened and update the fields and click on Save button and any confirmation modal should close")]
        [Then(@"Edit Product page should be opened and update the fields and click on Save button and any confirmation modal should close")]
        public void ThenEditProductPageShouldBeOpenedAndUpdateTheFieldsAndClickOnSaveButton()
        {
            Assert.That(_productPage.IsEditProductPageOpened(), Is.True, "Edit Product page failed to open.");

            string name = _testData.Product?.EditProductName ?? "OptionC School";
            string shortName = _testData.Product?.EditShortName ?? "OptionC";
            string subtitle = _testData.Product?.EditSubtitle ?? "OptionC School - Updated Subtitle";
            string licenseType = _testData.Product?.EditLicenseType ?? "Licensed";
            string navTarget = _testData.Product?.EditNavigationTarget ?? "Same tab";
            string contact = _testData.Product?.EditContactPerson ?? string.Empty;
            string feature = _testData.Product?.EditFeature ?? "Acutis Integration";
            string description = _testData.Product?.EditDescription ?? "Automated test updated description for OptionC product.";

            _productPage.UpdateAllProductFields(name, shortName, subtitle, licenseType, navTarget, contact, feature, description);
            _productPage.ClickSaveEditProduct();
            Assert.That(_productPage.IsStatusConfirmationPopupClosed(), Is.True, "A confirmation modal remained open after Save.");
            Assert.That(_productPage.IsProductDetailsOpened(), Is.True, "Failed to return to Product Details upon saving.");
        }

        #endregion Edit Product Steps

        #region Organizations Steps

        [When(@"Click on Organizations tab")]
        [Then(@"Click on Organizations tab")]
        public void WhenClickOnOrganizationsTab()
        {
            _productPage.ClickOrganizationsTab();
        }

        [When(@"Navigate through all organization status filter tabs: Active, Expiring Soon, Expired, and Users")]
        [Then(@"Navigate through all organization status filter tabs: Active, Expiring Soon, Expired, and Users")]
        [When(@"Navigate through all organization status filter tabs")]
        [Then(@"Navigate through all organization status filter tabs")]
        [When(@"Navigate through organization sub tabs: Active, Expiring Soon, Expired, and Users")]
        [Then(@"Navigate through organization sub tabs: Active, Expiring Soon, Expired, and Users")]
        [When(@"Navigate through organization sub tabs")]
        [Then(@"Navigate through organization sub tabs")]
        public void WhenNavigateThroughAllOrganizationStatusFilterTabs()
        {
            _productPage.NavigateAllOrganizationStatusTabs();
        }

        [When(@"Click on View Organization icon and verify Organization Details opened")]
        [Then(@"Click on View Organization icon and verify Organization Details opened")]
        public void ThenClickOnViewOrganizationIconAndVerifyOrganizationDetailsOpened()
        {
            _productPage.ClickViewFirstOrganization();
            Assert.That(_productPage.IsOrganizationDetailsOpened(), Is.True, "Organization Details page failed to open.");
        }

        [When(@"Click on Back to Products button and verify Product Details opened")]
        [Then(@"Click on Back to Products button and verify Product Details opened")]
        public void ThenClickOnBackToProductsButtonAndVerifyProductDetailsOpened()
        {
            _productPage.ClickBackToProducts();
            Assert.That(_productPage.IsProductDetailsOpened(), Is.True, "Failed to return to Product Details page upon clicking Back to Products.");
        }

        #endregion Organizations Steps

        #region Invoice Details Steps

        [When(@"Click on Invoice Details tab")]
        [Then(@"Click on Invoice Details tab")]
        public void WhenClickOnInvoiceDetailsTab()
        {
            _productPage.ClickInvoiceDetailsTab();
        }

        [When(@"Navigate through all invoice status filter tabs")]
        [Then(@"Navigate through all invoice status filter tabs")]
        public void ThenNavigateThroughAllInvoiceStatusFilterTabs()
        {
            _productPage.NavigateAllInvoiceStatusTabs();
        }

        [When(@"Click on Create Invoice button")]
        [Then(@"Click on Create Invoice button")]
        public void WhenClickOnCreateInvoiceButton()
        {
            _productPage.ClickCreateInvoice();
        }

        [When(@"Create Invoice page should be opened and click on Cancel button")]
        [Then(@"Create Invoice page should be opened and click on Cancel button")]
        [When(@"Create Invoice page should be opened and click on Cancel then Discard invoice and the confirmation modal should close")]
        [Then(@"Create Invoice page should be opened and click on Cancel then Discard invoice and the confirmation modal should close")]
        public void ThenCreateInvoicePageShouldBeOpenedAndClickOnCancelButton()
        {
            Assert.That(_productPage.IsCreateInvoicePageOpened(), Is.True, "Create Invoice page failed to open.");
            _productPage.ClickCancelCreateInvoice();
            Assert.That(_productPage.IsStatusConfirmationPopupClosed(), Is.True, "Create Invoice confirmation modal remained open after Cancel or Discard invoice.");
        }

        [When(@"Create Invoice page should be opened and enter invoice details and click on Save button")]
        [Then(@"Create Invoice page should be opened and enter invoice details and click on Save button")]
        public void ThenCreateInvoicePageShouldBeOpenedAndEnterInvoiceDetailsAndClickOnSaveButton()
        {
            Assert.That(_productPage.IsCreateInvoicePageOpened(), Is.True, "Create Invoice page failed to open.");
            Assert.That(_productPage.IsInvoiceProductTitleReadOnly(), Is.True, "Product Title should be read-only in Create Invoice page.");
            string invoiceRemarks = _testData.Product?.InvoiceRemarks ?? _testData.Product?.InvoiceTitle ?? "Automated Test Invoice Renewal";
            _productPage.EnterInvoiceDetailsAndSave(invoiceRemarks);
        }

        [When(@"Product Title should be read only and display the product name")]
        [Then(@"Product Title should be read only and display the product name")]
        [When(@"Product Title should be read only")]
        [Then(@"Product Title should be read only")]
        public void ThenProductTitleShouldBeReadOnly()
        {
            Assert.That(_productPage.IsInvoiceProductTitleReadOnly(), Is.True, "Product Title should be read-only in Create Invoice page.");
        }

        [When(@"Click on Back to Products button and verify Products page is opened")]
        [Then(@"Click on Back to Products button and verify Products page is opened")]
        public void ThenClickOnBackToProductsButtonAndVerifyProductsPageIsOpened()
        {
            _productPage.ClickBackToProductsFromDetails();
            Assert.That(_productPage.IsProductsPageOpened(), Is.True, "Failed to return to Products page upon clicking Back to Products.");
        }

        [When(@"Click on Edit Product icon for the selected product")]
        [Then(@"Click on Edit Product icon for the selected product")]
        public void WhenClickOnEditProductIconForTheSelectedProduct()
        {
            string targetProduct = _testData.Product?.TargetProductName ?? string.Empty;
            _productPage.ClickEditProductCardIcon(targetProduct);
        }

        [When(@"Click on View Invoice icon in Invoice Details tab")]
        [Then(@"Click on View Invoice icon in Invoice Details tab")]
        public void WhenClickOnViewInvoiceIconInInvoiceDetailsTab()
        {
            _productPage.ClickViewInvoiceInInvoiceDetails();
        }

        [When(@"Invoice details modal should open and click on Close icon to close")]
        [Then(@"Invoice details modal should open and click on Close icon to close")]
        public void ThenInvoiceDetailsModalShouldOpenAndClickOnCloseIconToClose()
        {
            Assert.That(_productPage.IsInvoiceModalOpened(), Is.True, "Invoice details modal failed to open.");
            _productPage.ClickCloseInvoiceModal();
            _productPage.CloseAllOpenProductDialogs();
        }

        #endregion Invoice Details Steps

        #region Invoice History Steps

        [When(@"Click on Invoice History tab")]
        [Then(@"Click on Invoice History tab")]
        public void WhenClickOnInvoiceHistoryTab()
        {
            _productPage.ClickInvoiceHistoryTab();
        }

        [When(@"Navigate through invoice history filters")]
        [Then(@"Navigate through invoice history filters")]
        public void ThenNavigateThroughInvoiceHistoryFilters()
        {
            _productPage.NavigateInvoiceHistoryFilters();
        }

        [When(@"Click on View Invoice icon in Invoice History tab")]
        [Then(@"Click on View Invoice icon in Invoice History tab")]
        public void WhenClickOnViewInvoiceIconInInvoiceHistoryTab()
        {
            _productPage.ClickViewInvoiceInInvoiceHistory();
        }

        [When(@"Invoice history modal should open and click on Close icon to close")]
        [Then(@"Invoice history modal should open and click on Close icon to close")]
        public void ThenInvoiceHistoryModalShouldOpenAndClickOnCloseIconToClose()
        {
            Assert.That(_productPage.IsInvoiceModalOpened(), Is.True, "Invoice history modal failed to open.");
            _productPage.ClickCloseInvoiceModal();
            _productPage.CloseAllOpenProductDialogs();
        }
        public void RunProductProcess()
        {
            ThenClickOnProductsMenuAndVerifyProductsPageIsOpened();
            WhenNavigateThroughAllProductFilterTabsActiveInactiveComingSoonAndOtherFilters();
            WhenCheckTheSearchFunctionalityForProducts();
            ThenClickOnViewProductIconForTheSelectedProduct();
            ThenProductDetailsPageShouldBeOpened();
            ThenNavigateThroughProductSubTabsOrganizationsInvoiceDetailsInvoiceHistoryAndProductDetails();

            WhenClickOnChangeStatusButton();
            ThenChangeStatusModalShouldOpenAndClickOnCancelButtonToClose();
            WhenClickOnChangeStatusButton();
            WhenSelectNewStatusAndClickOnContinueButton();
            ThenConfirmationPopupShouldOpenAndClickConfirmToUpdateStatus();

            WhenClickOnEditProductButton();
            ThenEditProductPageShouldBeOpenedAndEditAllFieldsAndFirstClickWithCancelAndThenClickToTheYes();
            WhenClickOnEditProductButton();
            ThenEditProductPageShouldBeOpenedAndUpdateTheFieldsAndClickOnSaveButton();

            WhenClickOnOrganizationsTab();
            WhenNavigateThroughAllOrganizationStatusFilterTabs();
            ThenClickOnViewOrganizationIconAndVerifyOrganizationDetailsOpened();
            ThenClickOnBackToProductsButtonAndVerifyProductDetailsOpened();

            WhenClickOnInvoiceDetailsTab();
            ThenNavigateThroughAllInvoiceStatusFilterTabs();
            WhenClickOnCreateInvoiceButton();
            ThenCreateInvoicePageShouldBeOpenedAndClickOnCancelButton();
            WhenClickOnCreateInvoiceButton();
            ThenCreateInvoicePageShouldBeOpenedAndEnterInvoiceDetailsAndClickOnSaveButton();

            WhenClickOnInvoiceHistoryTab();
            ThenNavigateThroughInvoiceHistoryFilters();
            WhenClickOnViewInvoiceIconInInvoiceHistoryTab();
            ThenInvoiceHistoryModalShouldOpenAndClickOnCloseIconToClose();
        }
        #endregion Invoice History Steps
    }
}
