Feature: 04_OrganizationManagement

A short summary of the feature

Scenario: 001_Verify Organizations list, search, and read-only navigation through every tab
    Given Launch the application for the detected environment
    And Enter the environment-configured username and password
    When I click the login button
    When The Dashboard should be open
    Then I click on Organizations menu
    And Organizations list page should be opened
    When I search the organizations list for the first row's own name
    Then The search should leave that row in the list
    And I clear the organizations search
    When I view the first organization in the list
    Then Organization details tab should be visible
    When I click on Members tab
    Then Organization members list should be visible
    And I view the first member's detail page if one exists
    When I click on Products tab
    Then Organization products panel should be visible
    When I click on Licenses tab
    Then Organization licenses panel should be visible
    When I click on Requests tab
    Then Organization requests panel should be visible
    When I click Back to Organizations
    Then Organizations list page should be opened
    And User should be able to logout from the application

Scenario: 002_Verify Add Organization required-field and format validation without saving
    Given Launch the application for the detected environment
    And Enter the environment-configured username and password
    When I click the login button
    When The Dashboard should be open
    Then I click on Organizations menu
    And Organizations list page should be opened
    When I click Add Organization
    Then Fill in only the organization name
    When I cancel adding the organization
    Then Organizations list page should be opened
    When I click Add Organization
    And I attempt to save the organization form with an empty name
    Then The organization name field should show a required-field error
    When I fill in invalid website, phone, email, and ZIP values
    And I click Save organization
    Then The organization form should show format validation errors
    When I cancel adding the organization
    Then Organizations list page should be opened
    And User should be able to logout from the application

Scenario: 003_Verify creating, editing, and changing the status of a new organization
    Given Mutating scenarios are permitted for Organization in this environment
    And Launch the application for the detected environment
    And Enter the environment-configured username and password
    When I click the login button
    When The Dashboard should be open
    Then I click on Organizations menu
    And Organizations list page should be opened
    When I click Add Organization
    Then Fill in the new organization details
    And I click Save organization
    Then Organizations list page should be opened
    And the new organization should be in the list
    When I view the new organization
    Then Organization details tab should be visible
    When I click Edit on the Profile tab
    Then The organization edit form should be displayed
    And I update the editable profile fields and save
    Then The organization profile should show the updated details
    When I click Back to Organizations
    Then Organizations list page should be opened
    When I click Change Status on the new organization
    Then Change Status modal should open
    When I cancel the Change Status dialog
    Then Organizations list page should be opened
    When I click Change Status on the new organization
    Then Change Status modal should open
    When I select Inactive status
    And I confirm the status change
    Then Organizations list page should be opened
    And the new organization should show Inactive status
    And User should be able to logout from the application

Scenario: 004_Verify activating and deactivating a product on an organization is reversible
    Given Mutating scenarios are permitted for Organization in this environment
    And Launch the application for the detected environment
    And Enter the environment-configured username and password
    When I click the login button
    When The Dashboard should be open
    Then I click on Organizations menu
    And Organizations list page should be opened
    When I view the first organization in the list
    Then Organization products panel should be visible
    When I toggle the first product's activation state if one exists
    Then The product's activation state should be confirmed and reverted back to its original state
    And User should be able to logout from the application
