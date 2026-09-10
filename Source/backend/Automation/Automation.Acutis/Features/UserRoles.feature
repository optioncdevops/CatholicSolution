Feature: 07_UserRoles

A short summary of the feature

Scenario: 001_Verify User Roles listing, search, toolbar, add, edit, status toggle, and delete workflows
    Given Launch the application with URL
    And Enter the UserName and the Password
    When I click the login button
    When The Dashboard should be open
    Then Click on Administration menu and select User Roles sub menu
    And User Roles page should be opened
    And Search an existing role and verify Edit, Status, and Delete actions are shown
    And Verify User Roles table toolbar Columns, Maximize, Excel, Print, CSV export, column sort, and rows per page
    When Click on Add User Role button
    Then Add User Role modal should open and Click on Cancel button to close
    When Click on Add User Role button
    And Add User Role modal should be opened and enter the role details
    And click on Save in the User Role form and the record should be saved
    And Search Role and Click on Edit button and update the fields and click on Save button
    And Search Role and Click on Deactivate and Click on Cancel in the confirm box
    And Search Role and Click on Deactivate and Click on Confirm in the confirm box
    And Search Role and Click on Activate button
    And Search Role and Click on Delete Button to delete the records
    Then Role Delete Confirm box should open and Click on the Cancel button
    And Search Role and Click on Delete Button to delete the records
    Then Role Delete Confirm box should open and Click on the Confirm button
