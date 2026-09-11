Feature: 10_EmailSettings

A short summary of the feature

Scenario: 001_Verify Email Settings SMTP and branding fields, switches, save, restore, and cancel
    Given Launch the application with URL
    And Enter the UserName and the Password
    When I click the login button
    When The Dashboard should be open
    Then Click on Administration menu and select Email Settings sub menu
    And Email Settings page should be opened
    And SMTP Server and Branding sections should be visible
    And Open the Font family dropdown and close it
    When Update the Display name and click on Save
    Then Email settings should be saved
    And Restore the original Display name and click on Save
    And Toggle Send mail enabled and SSL switches and restore them
    When Click on Cancel on Email Settings
    Then Email Templates page should be opened from Email Settings cancel
