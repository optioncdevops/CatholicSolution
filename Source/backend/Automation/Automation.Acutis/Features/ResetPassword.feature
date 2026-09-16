Feature: 12_ResetPassword

A short summary of the feature

Scenario: 001_Verify Reset Password with no token, an invalid token, and an unknown token
    When Open the Reset Password page with no token in the URL
    Then The Link Required panel should be shown
    When Open the Reset Password page with a syntactically invalid token
    Then The Link Required panel should be shown
    When Open the Reset Password page with a syntactically valid but unknown token
    Then The Link Can't Be Used panel should show the invalid link message

Scenario: 002_Verify a used token, an expired token, and a successful reset that is reverted back
    Given Database-seeded reset tokens are permitted for Reset Password in this environment
    And Any existing password reset tokens for the test account are removed
    When A password reset token is seeded and immediately marked used for the test account
    And Open the Reset Password page with that used token
    Then The Link Can't Be Used panel should show the already used message
    When A password reset token is seeded that has already expired for the test account
    And Open the Reset Password page with that expired token
    Then The Link Can't Be Used panel should show the expired message
    When A valid password reset token is seeded for the test account
    And Open the Reset Password page with that valid token
    Then The account email for the reset should be shown
    And Submit the Reset Password form with a weak password and verify the validation message
    And Submit the Reset Password form with mismatched passwords and verify the validation message
    And Submit the Reset Password form with a strong matching new password and verify the Password Successfully Updated panel is shown
    And Click on Continue to Sign In and the Login page should open
    Then Restore the test account password and remove any leftover reset tokens
