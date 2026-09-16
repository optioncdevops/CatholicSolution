Feature: 07_UserRoles

A short summary of the feature

Scenario: 001_Verify User Roles listing, search, toolbar, stable ids, and read-only deep links
    Given Launch the application for the detected environment
    And Enter the environment-configured username and password
    When I click the login button
    When The Dashboard should be open
    Then Click on Administration menu and select User Roles sub menu
    And User Roles page should be opened
    And Search an existing role and verify Edit action is shown
    And Verify User Roles table toolbar Columns, Maximize, Excel, Print, CSV export, column sort, and rows per page
    When Click on Add User Role button
    Then Add User Role modal should open and Click on Cancel button to close
    Then The Manage Rights action for an existing role uses a stable id
    When I click Manage Rights for an existing role
    Then The Rights page should open with that role already selected
    When I go back to User Roles
    And Search an existing role that has assigned users
    Then Its Users count should be a clickable link
    When I click that role's Users count
    Then The Users page should open filtered to that RoleId
    And User should be able to logout from the application

Scenario: 002_Verify Add/Edit User Role dirty-state guards, counter, and duplicate-name handling
    Given Mutating scenarios are permitted for User Roles in this environment
    And Launch the application for the detected environment
    And Enter the environment-configured username and password
    When I click the login button
    When The Dashboard should be open
    Then Click on Administration menu and select User Roles sub menu
    And User Roles page should be opened
    When Click on Add User Role button
    Then The Role Name counter should read 0 of 50
    When I type a role name without saving
    Then The Role Name counter should update to match what was typed
    And The Save button should be enabled once the name is valid
    When I click Cancel on the dirty add form
    Then A discard-changes confirmation should appear
    When I keep editing instead of discarding
    Then The add form should still be open with the typed name preserved
    When I press Escape on the dirty add form
    Then A discard-changes confirmation should appear
    When I confirm discarding the changes
    Then The add form should be closed
    And Focus should return to the Add User Role button
    When Click on Add User Role button
    And Add User Role modal should be opened and enter the role details
    And click on Save in the User Role form and the record should be saved
    And Search Role and Click on Edit button
    Then The read-only status badge should show the role's current status
    And The Save button should be disabled because nothing changed
    When I change the Role Name to an existing role's name and save
    Then A duplicate-role-name error should appear under Role Name
    When I change the Role Name again
    Then The duplicate-role-name error should clear
    When I close the edit form without saving
    And Search Role and Click on Deactivate and Click on Cancel in the confirm box
    And Search Role and Click on Deactivate and Click on Confirm in the confirm box
    And Search Role and Click on Activate button
    And Search Role and Click on Delete Button to delete the records
    Then Role Delete Confirm box should open and Click on the Cancel button
    And Search Role and Click on Delete Button to delete the records
    Then Role Delete Confirm box should open and Click on the Confirm button
    And User should be able to logout from the application
