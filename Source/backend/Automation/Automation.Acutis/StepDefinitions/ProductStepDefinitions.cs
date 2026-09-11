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

        [Then(@"Click on Products menu and verify Products page is opened")]
        public void ThenClickOnProductsMenuAndVerifyProductsPageIsOpened()
        {
            _productPage.NavigateToProducts();
        }

        [Then(@"Check in all products and filter by status")]
        public void ThenCheckInAllProductsAndFilterByStatus()
        {
            string status = _testData.Product?.FilterStatus ?? "Active";
            _productPage.CheckInAllProductsAndFilter(status);

            string searchProduct = _testData.Product?.SearchProductName ?? string.Empty;
            if (!string.IsNullOrWhiteSpace(searchProduct))
            {
                _productPage.SearchProduct(searchProduct);
            }
        }

        [Then(@"Click on View Product icon for the selected product")]
        public void ThenClickOnViewProductIconForTheSelectedProduct()
        {
            string targetProduct = _testData.Product?.TargetProductName ?? string.Empty;
            _productPage.ClickViewProduct(targetProduct);
        }

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
        public void ThenConfirmationPopupShouldOpenAndClickConfirmToUpdateStatus()
        {
            _productPage.ConfirmStatusChangePopup();
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

        [Then(@"Edit Product page should be opened and click on Cancel button")]
        [Then(@"Edit Product page should be opened and edit all fields and first click with Cancel and then click to the Yes")]
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
            Assert.That(_productPage.IsProductDetailsOpened(), Is.True, "Failed to return to Product Details upon discarding changes.");
        }

        [When(@"Edit Product page should be opened and update the fields and click on Save button")]
        [Then(@"Edit Product page should be opened and update the fields and click on Save button")]
        [When(@"Edit Product page should be opened and edit all fields and click on Save button")]
        [Then(@"Edit Product page should be opened and edit all fields and click on Save button")]
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
        public void WhenClickOnCreateInvoiceButton()
        {
            _productPage.ClickCreateInvoice();
        }

        [Then(@"Create Invoice page should be opened and click on Cancel button")]
        public void ThenCreateInvoicePageShouldBeOpenedAndClickOnCancelButton()
        {
            Assert.That(_productPage.IsCreateInvoicePageOpened(), Is.True, "Create Invoice page failed to open.");
            _productPage.ClickCancelCreateInvoice();
        }

        [When(@"Create Invoice page should be opened and enter invoice details and click on Save button")]
        [Then(@"Create Invoice page should be opened and enter invoice details and click on Save button")]
        public void ThenCreateInvoicePageShouldBeOpenedAndEnterInvoiceDetailsAndClickOnSaveButton()
        {
            Assert.That(_productPage.IsCreateInvoicePageOpened(), Is.True, "Create Invoice page failed to open.");
            string invoiceTitle = _testData.Product?.InvoiceTitle ?? "Automated Test Invoice";
            _productPage.EnterInvoiceDetailsAndSave(invoiceTitle);
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

        [Then(@"Invoice details modal should open and click on Close icon to close")]
        public void ThenInvoiceDetailsModalShouldOpenAndClickOnCloseIconToClose()
        {
            Assert.That(_productPage.IsInvoiceModalOpened(), Is.True, "Invoice details modal failed to open.");
            _productPage.ClickCloseInvoiceModal();
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

        [Then(@"Invoice history modal should open and click on Close icon to close")]
        public void ThenInvoiceHistoryModalShouldOpenAndClickOnCloseIconToClose()
        {
            Assert.That(_productPage.IsInvoiceModalOpened(), Is.True, "Invoice history modal failed to open.");
            _productPage.ClickCloseInvoiceModal();
        }
        public void RunProductProcess()
        {
            ThenClickOnProductsMenuAndVerifyProductsPageIsOpened();
            ThenCheckInAllProductsAndFilterByStatus();
            ThenClickOnViewProductIconForTheSelectedProduct();
            ThenProductDetailsPageShouldBeOpened();
            ThenNavigateThroughProductSubTabsOrganizationsInvoiceDetailsInvoiceHistoryAndProductDetails();

            WhenClickOnChangeStatusButton();
            ThenChangeStatusModalShouldOpenAndClickOnCancelButtonToClose();
            WhenClickOnChangeStatusButton();
            WhenSelectNewStatusAndClickOnContinueButton();
            ThenConfirmationPopupShouldOpenAndClickConfirmToUpdateStatus();

            WhenClickOnEditProductButton();
            ThenEditProductPageShouldBeOpenedAndClickOnCancelButton();
            WhenClickOnEditProductButton();
            ThenEditProductPageShouldBeOpenedAndUpdateTheFieldsAndClickOnSaveButton();

            WhenClickOnOrganizationsTab();
            ThenClickOnViewOrganizationIconAndVerifyOrganizationDetailsOpened();
            ThenClickOnBackToProductsButtonAndVerifyProductDetailsOpened();

            WhenClickOnInvoiceDetailsTab();
            ThenNavigateThroughAllInvoiceStatusFilterTabs();
            WhenClickOnCreateInvoiceButton();
            ThenCreateInvoicePageShouldBeOpenedAndClickOnCancelButton();
            WhenClickOnCreateInvoiceButton();
            ThenCreateInvoicePageShouldBeOpenedAndEnterInvoiceDetailsAndClickOnSaveButton();
        }
        #endregion Invoice History Steps
    }
}
