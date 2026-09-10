Feature: 04_Product

A short summary of the feature

Scenario: 001_Verify Products listing, sub-tabs navigation, status change, edit product, organizations, and invoice details workflows
    Given Launch the application with URL
    And Enter the UserName and the Password
    When I click the login button
    When The Dashboard should be open
    Then Click on Products menu and verify Products page is opened
    And Check in all products and filter by status
    And Click on View Product icon for the selected product
    And Product Details page should be opened
    And Click on Back to Products button and verify Products page is opened
    When Click on Edit Product icon for the selected product
    Then Edit Product page should be opened and edit all fields and first click with Cancel and then click to the Yes
    When Click on Edit Product button in product details
    And Edit Product page should be opened and update the fields and click on Save button
    And Navigate through product sub tabs: Organizations, Invoice Details, Invoice History, and Product Details
    When Click on Change Status button
    Then Change Status modal should open and Click on Cancel button to close
    When Click on Change Status button
    And Select new status and Click on Continue button
    Then Confirmation popup should open and Click Confirm to update status
    When Click on Organizations tab
    Then Click on View Organization icon and verify Organization Details opened
    And Click on Back to Products button and verify Product Details opened
    When Click on Invoice Details tab
    And Navigate through all invoice status filter tabs
    When Click on View Invoice icon in Invoice Details tab
    Then Invoice details modal should open and click on Close icon to close
    When Click on Create Invoice button
    Then Create Invoice page should be opened and click on Cancel button
    When Click on Create Invoice button
    And Create Invoice page should be opened and enter invoice details and click on Save button
    When Click on Invoice History tab
    And Navigate through invoice history filters
    And Click on View Invoice icon in Invoice History tab
    Then Invoice history modal should open and click on Close icon to close
