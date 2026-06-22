https://eventhub.rahulshettyacademy.com - Automation practice site featuring event management and ticket booking via UI and API.

In order to run the tests, register an account and add the email and password to resources/userdata.json. A valid email address is NOT required, so just make something up.

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
Preconditions: No current booked events. The beforeAll block removes any pre-exsiting bookings.

TC1: Book an event\
TC2: Confirm event was booked\
TC3: Cancel booked event\
TC4: Booked events page with no events booked - mock API response to ensure there are no booked events

### API Tests ###

### events-API.spec.js ###
Scenario: Event administration function API calls. Can be run in parallel, each test creates the event it will work with.\
Preconditions: Start with only the default events. The beforeAll block will delete any non-default events prior to the test run.

TC1: Verify default events\
TC2: Add and verify the new event details\
TC3: Add and then update event details\
TC4: Add and then delete an event

#### bookings-API.spec.js ###
Scenario: Booking administration function API calls.\
Preconditions: No current booked events. The beforeAll block removes any pre-exsiting bookings.

TC1: Book and then cancel the booking\
Note: In order for this to run in parallel mode tests were consolidated. Soft assertions were used on non-critical/blocker assertions to let the test continue to run if there's a failure.
