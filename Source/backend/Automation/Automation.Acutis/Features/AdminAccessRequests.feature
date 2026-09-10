Feature: 05_AdminAccessRequests

A short summary of the feature

  Background:
    Given Launch the application with URL
    And Enter the UserName and the Password
    When I click the login button
    When The Dashboard should be open
    Then I navigate to the Admin Access Requests page

  Scenario: 001_Verify Admin Access Requests listing, status tabs, and dropdown filters
    Then I should see the access requests table or an empty state
    When I select the "Pending" status tab
    Then the requests table should show filtered results or be empty
    When I select the "Approved" status tab
    Then the requests table should show filtered results or be empty
    When I select the "Rejected" status tab
    Then the requests table should show filtered results or be empty
    When I select the "Info requested" status tab
    Then the requests table should show filtered results or be empty
    When I select the "All statuses" status tab
    Then the requests table should show filtered results or be empty
    When I click on the Application filter dropdown
    Then the requests table should show filtered results or be empty
    When I click on the Organization filter dropdown
    Then the requests table should show filtered results or be empty
