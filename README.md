https://eventhub.rahulshettyacademy.com - Automation practice site featuring event management and ticket booking via UI and API.

### Hybrid Tests ###
### login.spec.js ###

Using an existing account, test assorted login scenarios in the UI and API layers. 

TC1: UI Valid login
TC2: UI Invalid login - short password field validation
TC3: UI Invalid login - incorrect credentials
TC4: API Valid login
TC5: API Invalid login - incorrect credentials

### UI Tests ###

### events-UI.spec.js ###
Scenario: Event administration functions. Mocking API responses removes test interdependence and allows these tests to run in parallel.\
Preconditions: Start with only the default events. The beforeAll block will delete any non-default events prior to the test run.

TC1: Browse default events\
TC2: Add a new event - verify success message displays after event creation in the UI\
TC3: Verify new event - verify mocked api response maps properly to the UI\
TC4: Filter events - verify the event filter works (it does not work properly)\
TC5: Update event - update an existing event and validate the changes display correctly in the UI\
TC6: Delete event\
TC7: Events page with no events - Edge case, the default events cannot be deleted but we still want to ensure the UI handles no events to display gracefully\
TC8: Events admin page with no events - Edge case, the default events cannot be deleted but we still want to ensure the UI handles no events to display gracefully

### bookings-UI.spec.js ###
Scenario: Event booking functions. Refactoring required to allow parallel execution.\
Preconditions: No current booked events. The test cleans up after itself. TODO: Add a beforeAll block to remove any pre-exsiting bookings

TC1: Book an event
TC2: Confirm event was booked
TC3: Cancel booked event
TC4: Booked events page with no events booked - mock API response to ensure there are no booked events
