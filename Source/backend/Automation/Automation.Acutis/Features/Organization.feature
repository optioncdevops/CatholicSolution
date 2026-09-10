Feature: 04_OrganizationManagement
  As an Administrator
  I want to manage organizations
  So that I can keep track of all organizations in the system

  Scenario: 001_Verify End-To-End Organization Management
    Given Launch the application with URL
    And Enter the UserName and the Password
    When I click the login button
    Then The Dashboard should be opened

    # Navigate to Organizations list
    When I click on Organizations menu
    Then Organizations list page should be opened

    # 1. Add there cancel check (name only - proves Cancel discards it, without re-running the
    #    full form fill and its two flaky custom dropdown selections a second time)
    When I click Add Organization
    Then Fill in only the organization name
    When I cancel adding the organization
    Then Organizations list page should be opened

    # 2. Then add then save
    When I click Add Organization
    Then Fill in the new organization details
    And I click Save organization
    Then Organizations list page should be opened

    # 3. View and then first tab edit
    When I view the first organization in the list
    Then Organization details tab should be visible
    When I click Edit on the Profile tab
    Then The organization edit form should be displayed
    When I click Cancel on the organization edit form

    # 4. Next tabs in the product tab add app and then other tabs
    When I click on Members tab
    Then Organization members list should be visible

    When I click on Products tab
    Then Organization products panel should be visible
    When I click Assign App button
    Then Assign App modal should open
    When I cancel the Assign App modal

    When I click on Licenses tab
    Then Organization licenses panel should be visible

    When I click on Requests tab
    Then Organization requests panel should be visible

    When I click Back to Organizations
    Then Organizations list page should be opened

    # 5. Then in the action icon edit
    When I click Edit on the first organization
    Then The organization edit form should be displayed
    When I click Cancel on the organization edit form
    When I click Back to Organizations
    Then Organizations list page should be opened

    # 6. Then status (Cancel first, then inactive)
    When I click Change Status on the first organization
    Then Change Status modal should open
    When I cancel the Change Status dialog
    Then Organizations list page should be opened

    When I click Change Status on the first organization
    Then Change Status modal should open
    When I select Inactive status
    And I confirm the status change
    Then Organizations list page should be opened
