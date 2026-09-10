Feature: 02_MenuAccess

Every menu the signed in role is shown has to open, and every link under it has to
land on its own page rather than an error, an empty screen or the dashboard.

Scenario: 001_Open every menu and check every link as a admin
    Given Launch the application with URL
    And Enter the UserName and the Password
    When I click the login button
    Then The Dashboard should be opened
    And The top navigation menu should be loaded
    And Every menu should open and every sub menu link should open its own page
    And User should be able to logout from the application
