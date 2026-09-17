Feature: 13_ChangePassword

A short summary of the feature

Scenario: 001_Verify Change Password validation for a wrong current password, a weak new password, and a mismatch
    Given Launch the application for the detected environment
    And Enter the environment-configured username and password
    When I click the login button
    When The Dashboard should be open
    Then Open the Change Password modal from the account menu
    And Submit the Change Password form with an incorrect current password and verify the validation message
    And Submit the Change Password form with a weak new password and verify the validation message
    And Submit the Change Password form with mismatched new and confirm passwords and verify the validation message
    And User should be able to logout from the application

Scenario: 002_Verify a successful Change Password that is reverted back to the original
    Given Mutating scenarios are permitted for Change Password in this environment
    And Launch the application for the detected environment
    And Enter the environment-configured username and password
    When I click the login button
    When The Dashboard should be open
    Then Open the Change Password modal from the account menu
    And Submit the Change Password form with the correct current password and a strong new password and verify it succeeds
    Then Open the Change Password modal from the account menu
    And Change the password back to the original and verify it succeeds
    And User should be able to logout from the application
