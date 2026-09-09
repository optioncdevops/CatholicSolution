Feature: 01_Login

A short summary of the feature

Scenario: 001_Login as a admin with valid user credentials
    Given Launch the application with URL
    And Enter the UserName and the Password
    When I click the login button
    Then The Dashboard should be opened
    And User should be able to logout from the application 