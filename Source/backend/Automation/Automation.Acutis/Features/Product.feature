Feature: 03_Product

  As an Administrator
  I want to manage products, view product details, update status, edit product information, and manage customer licenses and invoices
  So that product subscriptions and customer access are accurately tracked and maintained

Scenario: 001_Verify Products listing, sub-tabs navigation, status change, edit product, organizations, and invoice details workflows
    Given Launch the application with URL
    And Enter the UserName and the Password
    When I click the login button
    When The Dashboard should be open
    Then Click on Products menu and verify Products page is opened
    When Navigate through all product filter tabs: Active, Inactive, Coming Soon, and other filters
    And Check the search functionality for products
    And Click on View Product icon for the selected product
    And Product Details page should be opened
    And Click on Back to Products button and verify Products page is opened
    When Click on Edit Product icon for the selected product
    Then Edit Product page should be opened and edit all fields and first click Cancel then Discard changes and the confirmation modal should close
    When Click on Edit Product button in product details
    And Edit Product page should be opened and update the fields and click on Save button and any confirmation modal should close
    And Navigate through product sub tabs: Organizations, Invoice Details, Invoice History, and Product Details
    When Click on Change Status button
    Then Change Status modal should open and Click on Cancel button to close
    When Click on Change Status button
    And Select new status and Click on Continue button
    Then Confirmation popup should open and Click Confirm to update status and close the Change Status modal
    When Click on Organizations tab
    And Navigate through all organization status filter tabs: Active, Expiring Soon, Expired, and Users
    Then Click on View Organization icon and verify Organization Details opened
    And Click on Back to Products button and verify Product Details opened
    When Click on Invoice Details tab
    And Navigate through all invoice status filter tabs
    When Click on View Invoice icon in Invoice Details tab
    Then Invoice details modal should open and click on Close icon to close
    When Click on Create Invoice button
    Then Create Invoice page should be opened and click on Cancel then Discard invoice and the confirmation modal should close
    When Click on Create Invoice button
    And Product Title should be read only and display the product name
    And Create Invoice page should be opened and enter invoice details and click on Save button
    When Click on Invoice History tab
    And Navigate through invoice history filters
    And Click on View Invoice icon in Invoice History tab
    Then Invoice history modal should open and click on Close icon to close
