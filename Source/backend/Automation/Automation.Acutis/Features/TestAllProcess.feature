Feature: TestAllProcess
  As an Administrator
  I want to run an end-to-end automation test of all modules
  So that I can verify the entire system functionality in a single run

  Scenario: 001_Verify All System Processes End-To-End
    # 01. Login
    Given Launch the application with URL
    And Enter the UserName and the Password
    When I click the login button
    When The Dashboard should be open

    # 02. MenuAccess (menu rights)
    Then The top navigation menu should be loaded
    And Every menu should open and every sub menu link should open its own page

    # 03. Product
    Then Click on Products menu and verify Products page is opened
    And Check in all products and filter by status
    And Click on View Product icon for the selected product
    And Product Details page should be opened
    And Navigate through product sub tabs: Organizations, Invoice Details, Invoice History, and Product Details
    When Click on Change Status button
    Then Change Status modal should open and Click on Cancel button to close
    When Click on Change Status button
    And Select new status and Click on Continue button
    Then Confirmation popup should open and Click Confirm to update status
    When Click on Edit Product button
    Then Edit Product page should be opened and click on Cancel button
    When Click on Edit Product button
    And Edit Product page should be opened and update the fields and click on Save button
    When Click on Organizations tab
    And Navigate through all organization status filter tabs: Active, Expiring Soon, Expired, and Users
    Then Click on View Organization icon and verify Organization Details opened
    And Click on Back to Products button and verify Product Details opened
    When Click on Invoice Details tab
    And Navigate through all invoice status filter tabs
    When Click on Create Invoice button
    Then Create Invoice page should be opened and click on Cancel button
    When Click on Create Invoice button
    And Create Invoice page should be opened and enter invoice details and click on Save button

    # 04. OrganizationManagement
    When I click on Organizations menu
    Then Organizations list page should be opened
    When I click Add Organization
    Then Fill in the new organization details
    And I click Save organization
    Then Organizations list page should be opened
    When I view the first organization in the list
    Then Organization details tab should be visible
    When I click on Members tab
    Then Organization members list should be visible

    # 05. UserDetail
    Then Click on Administration menu and selct UserDetail Sub menu
    And UserDetail page should be opened and click on Addnewuser button
    And New user page should be opened and enter the basic info
    And click on save button and the record should be saved
    And Search Email and Click on Edit button and update the fields and click on save button
    And Search Email and Click on Delete Button to delete the records
    Then Delete Alert Confirm box should open and Click on the No button
    And Search Email and Click on Delete Button to delete the records
    Then Delete Alert Confirm Box should open and Click on the Yes button

    # 06. AdminAccessRequests
    Then I navigate to the Admin Access Requests page
    Then I should see the access requests table or an empty state
    When I select the "Pending" status tab
    Then the requests table should show filtered results or be empty
    When I select the "Approved" status tab
    Then the requests table should show filtered results or be empty
    When I select the "Rejected" status tab
    Then the requests table should show filtered results or be empty
    When I select the "Info requested" status tab
    Then the requests table should show filtered results or be empty
    When I select the "All statuses" status tab
    Then the requests table should show filtered results or be empty
    When I click on the Application filter dropdown
    Then the requests table should show filtered results or be empty
    When I click on the Organization filter dropdown
    Then the requests table should show filtered results or be empty

    # 07. UserRoles
    Then Click on Administration menu and select User Roles sub menu
    Then User Roles page should be opened
    Then Search an existing role and verify Edit action is shown
    Then Verify User Roles table toolbar Columns, Maximize, Excel, Print, CSV export, column sort, and rows per page
    When Click on Add User Role button
    Then Add User Role modal should open and Click on Cancel button to close
    When Click on Add User Role button
    Then Add User Role modal should be opened and enter the role details
    Then click on Save in the User Role form and the record should be saved
    Then Search Role and Click on Edit button and update the fields and click on Save button
    Then Search Role and Click on Deactivate and Click on Cancel in the confirm box
    Then Search Role and Click on Deactivate and Click on Confirm in the confirm box
    Then Search Role and Click on Activate button
    Then Search Role and Click on Delete Button to delete the records
    Then Role Delete Confirm box should open and Click on the Cancel button
    Then Search Role and Click on Delete Button to delete the records
    Then Role Delete Confirm box should open and Click on the Confirm button

    # 08. UserRights
    Then Click on Administration menu and select Rights sub menu
    And User Rights page should be opened
    And Select each role from the Role dropdown
    And Select each module from the Module dropdown
    And Click on Clear Filters and verify the rights matrix is shown
    And Change User Rights rows per page
    And Toggle the first tree row expand or collapse
    And Search the rights matrix and open the Columns menu
    And Click Access, Read Only, and Denied on the first permission row
    When Change the first row permission
    And Click on Save to persist the rights changes
    When Click on Apply to all Access
    Then Apply to all confirm box should open and Click on Cancel
    When Click on Apply to all Read Only
    Then Apply to all confirm box should open and Click on Cancel
    When Click on Apply to all Denied
    Then Apply to all confirm box should open and Click on Cancel

    # 09. EmailTemplates
    Then Click on Administration menu and select Email Template sub menu
    And Email Templates page should be opened
    And Search templates and then clear the search
    And Select each email template from the list
    And Select the target email template
    And Edit the subject and Click on Preview and close the preview
    When Click on Reset template
    Then Reset confirm box should open and Click on Cancel
    When Click on Reset template
    Then Reset confirm box should open and Click on Confirm
    And Insert a merge tag variable into the template
    When Click on Reset template
    Then Reset confirm box should open and Click on Confirm
    And Edit the subject and click on Save template
    And Restore the original subject and click on Save template
    And Click on Send Test email
    And Click on Email Settings from Email Templates page
    Then Email Settings page should be opened from the shortcut

    # 10. EmailSettings
    Then Click on Administration menu and select Email Settings sub menu
    And Email Settings page should be opened
    And SMTP Server and Branding sections should be visible
    And Open the Font family dropdown and close it
    When Update the Display name and click on Save
    Then Email settings should be saved
    And Restore the original Display name and click on Save
    And Toggle Send mail enabled and SSL switches and restore them

    # Finally, Logout
    And User should be able to logout from the application
