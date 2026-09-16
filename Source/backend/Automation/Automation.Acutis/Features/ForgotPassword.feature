Feature: 11_ForgotPassword

A short summary of the feature

Scenario: 001_Verify Forgot Password field validation and the account-not-found message
    Given Launch the application at the Forgot Password page
    Then Submit the Forgot Password form with an empty email and verify the validation message
    And Submit the Forgot Password form with an invalid email format and verify the validation message
    And Submit the Forgot Password form with an email that does not exist and verify the account not found message

Scenario: 002_Verify a successful Forgot Password submission and the already-requested message
    Given Mutating scenarios are permitted for Forgot Password in this environment
    And Any password reset tokens left over from a previous run are removed for the test account
    And Launch the application at the Forgot Password page
    Then Submit the Forgot Password form with the existing test account email and verify the Check Your Email panel is shown
    And Submit the Forgot Password form again with the same email and verify the already requested message
    And Click on Use a Different Email and the request form should be shown again
    And Click on Back To Sign In and the Login page should open
    Then Clean up any password reset tokens left for the test account
