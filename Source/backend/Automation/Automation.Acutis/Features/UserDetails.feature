Feature:02_UserDetail

A short summary of the feature

Scenario: 001_UserDetail as a admin with valid user credentials
    Given Launch the application with URL
    And Enter the UserName and the Password
    When I click the login button
    When The Dashboard should be open
    Then Click on Administration menu and selct UserDetail Sub menu
    And UserDetail page should be opened and click on Addnewuser button
    And New user page should be opened and enter the basic info
    And click on save button and the record should be saved
    And Search Email and Click on Edit button and update the fields and click on save button
    And Search Email and Click on Delete Button to delete the records
    Then Delete Alert Confirm box should open and Click on the No button
    And Search Email and Click on Delete Button to delete the records
    Then Delete Alert Confirm Box should open and Click on the Yes button