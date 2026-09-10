Feature: 08_UserRights

A short summary of the feature

Scenario: 001_Verify User Rights listing, role and module filters, permission toggle, discard, save, and apply-to-all cancel
    Given Launch the application with URL
    And Enter the UserName and the Password
    When I click the login button
    When The Dashboard should be open
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
    Then Click on Cancel to discard unsaved rights changes
    When Change the first row permission
    And Click on Save to persist the rights changes
    When Click on Apply to all Access
    Then Apply to all confirm box should open and Click on Cancel
    When Click on Apply to all Read Only
    Then Apply to all confirm box should open and Click on Cancel
    When Click on Apply to all Denied
    Then Apply to all confirm box should open and Click on Cancel
