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
        public void WhenSelectNewStatusAndClickOnContinueButton()
        {
            string newStatus = _testData.Product?.NewStatus ?? "Coming Soon";
            _productPage.SelectStatusAndContinue(newStatus);
        }

        [Then(@"Confirmation popup should open and Click Confirm to update status")]
        public void ThenConfirmationPopupShouldOpenAndClickConfirmToUpdateStatus()
        {
            _productPage.ConfirmStatusChangePopup();
        }

        #region Edit Product Steps

        [When(@"Click on Edit Product button")]
        public void WhenClickOnEditProductButton()
        {
            _productPage.ClickEditProduct();
        }

        [Then(@"Edit Product page should be opened and click on Cancel button")]
        public void ThenEditProductPageShouldBeOpenedAndClickOnCancelButton()
        {
            Assert.That(_productPage.IsEditProductPageOpened(), Is.True, "Edit Product page failed to open.");
            _productPage.ClickCancelEditProduct();
            Assert.That(_productPage.IsProductDetailsOpened(), Is.True, "Failed to return to Product Details upon clicking Cancel.");
        }

        [When(@"Edit Product page should be opened and update the fields and click on Save button")]
        [Then(@"Edit Product page should be opened and update the fields and click on Save button")]
        public void ThenEditProductPageShouldBeOpenedAndUpdateTheFieldsAndClickOnSaveButton()
        {
            Assert.That(_productPage.IsEditProductPageOpened(), Is.True, "Edit Product page failed to open.");
            string subtitle = _testData.Product?.EditSubtitle ?? "OptionC School - Updated Subtitle";
            string description = _testData.Product?.EditDescription ?? "Automated test updated description for OptionC product.";
            _productPage.UpdateProductDetails(subtitle, description);
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

        [Then(@"Click on View Organization icon and verify Organization Details opened")]
        public void ThenClickOnViewOrganizationIconAndVerifyOrganizationDetailsOpened()
        {
            _productPage.ClickViewFirstOrganization();
            Assert.That(_productPage.IsOrganizationDetailsOpened(), Is.True, "Organization Details page failed to open.");
        }

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

        #endregion Invoice Details Steps

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
    }
}
