Feature: Admin Access Requests

  Background:
    Given I log in to the admin portal
    And I navigate to the Admin Access Requests page

  Scenario: Viewing the access requests list
    Then I should see the access requests table or an empty state

  Scenario: Filtering access requests by status
    When I select the "Pending" status tab
    Then the requests table should only show pending requests or be empty
