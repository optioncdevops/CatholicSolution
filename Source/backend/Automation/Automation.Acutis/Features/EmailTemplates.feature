Feature: 09_EmailTemplates

A short summary of the feature

Scenario: 001_Verify Email Templates listing, search, editor, preview, reset, save, send test, and Email Settings shortcut
    Given Launch the application with URL
    And Enter the UserName and the Password
    When I click the login button
    When The Dashboard should be open
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
