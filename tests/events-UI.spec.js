import {test, expect, request} from "@playwright/test";
import {EventsPage} from "../pageObjects/EventsPage";
import {APIUtils} from "../Utils/APIUtils";
import {EventsAdminPage} from "../pageObjects/EventsAdminPage";

let api;
let token;
let context;
let page;
const eventData = JSON.parse(JSON.stringify(require("../resources/event_data.json")));

/*
Can be run in parrallel.
Mocking API responses to avoid potential issues with calling the /events endpoint since there may be extra events
added, not added, or deleted, at any given time.
 */

test.beforeAll(async () => {
    const userData = JSON.parse(JSON.stringify(require("../resources/user_data.json")));
    const apiContext = await request.newContext();
    api = new APIUtils(apiContext, userData);
    token = await api.login();
    // console.log(token);

    await api.deleteAllEvents(token);
});

test.beforeEach(async({browser}) => {
    context = await browser.newContext({storageState: 'loggedInState.json'});
    page = await context.newPage();
    // await page.goto("https://eventhub.rahulshettyacademy.com/");
})

// The afterAll block can be uncommented if desired. Having some test artifacts left behind could be useful for manual
// testing though. beforeAll will clear them regardless.
// test.afterAll('Delete All Events', async () => {
//     await api.deleteAllEvents(token);
// });

test('Browse events', async() => {
    const eventsPage = new EventsPage(page);

    const defaultEvents = JSON.stringify(require("../resources/defaultEvents.json"));
    const route = "https://api.eventhub.rahulshettyacademy.com/api/events*";

    let expectedEvents = ["Dilli Diwali Mela", "Hollywood Monsoon Night — Los Angeles", "World Tech Summit"];
    await page.goto("https://eventhub.rahulshettyacademy.com/");

    await api.fulfillCall(page, route, 200, defaultEvents);

    await eventsPage.goto();
    await eventsPage.waitForNetworkIdle();

    for(let i = 0; i < expectedEvents.length; i++) {
        let eventName = await eventsPage.getEventCardText(i);
        expect(eventName).toEqual(expectedEvents[i]);
    }
});

test('Add event', async() => {
    const eventsAdminPage = new EventsAdminPage(page);

    await eventsAdminPage.goto();
    await eventsAdminPage.fillEventTitle(eventData.title);
    await eventsAdminPage.fillDescription(eventData.description);
    await eventsAdminPage.selectCategory(eventData.category);
    await eventsAdminPage.fillCity(eventData.city);
    await eventsAdminPage.fillVenue(eventData.venue);

    await eventsAdminPage.dateTimeInput.click();
    await eventsAdminPage.dateTimeInput.pressSequentially("09252026", {delay: 100});
    await eventsAdminPage.dateTimeInput.press('Tab');
    await eventsAdminPage.dateTimeInput.pressSequentially("0400PM", {delay: 100});

    await eventsAdminPage.fillPrice(eventData.price.toString());
    await eventsAdminPage.fillTotalSeats(eventData.totalSeats.toString());
    await eventsAdminPage.fillImageUrl(eventData.imageUrl);
    await eventsAdminPage.clickAddEvent();

    let statusMessage = await eventsAdminPage.getStatusMessage();
    console.log(statusMessage);

    expect(statusMessage).toEqual("Event created!");
});

test('Verify new event', async() => {
    const eventsAdminPage = new EventsAdminPage(page);

    const mockedEvents = JSON.stringify(require("../resources/verifyEvents.json"));
    const route = "https://api.eventhub.rahulshettyacademy.com/api/events*";

    await page.goto("https://eventhub.rahulshettyacademy.com/");

    await api.fulfillCall(page, route, 200, mockedEvents);

    await eventsAdminPage.goto();
    await eventsAdminPage.waitForNetworkIdle();

    let eventCell = eventsAdminPage.findEvent(eventData.title);
    await eventsAdminPage.verifyEventTitle(eventCell, eventData.title);
    await eventsAdminPage.verifyEventCategory(eventCell, eventData.category);
    await eventsAdminPage.verifyEventCity(eventCell, eventData.city);
    await eventsAdminPage.verifyEventDate(eventCell, "25 Sept 2026");
    await eventsAdminPage.verifyEventPrice(eventCell, eventsAdminPage.formatPrice(eventData.price));
    await eventsAdminPage.verifyEventSeats(eventCell, `${eventData.totalSeats}/${eventData.totalSeats}`);
});

/*
The filter does not work properly, not just with Festival but with all categories.
After a fix is confirmed regression testing can be conducted in the API suite by passing in multiple filters
and validating the expected results are returned.
 */
test('Filter events', async() => {
    const eventsPage = new EventsPage(page);

    const mockedEvents = JSON.stringify(require("../resources/verifyEvents.json"));
    //don't regex the ending of the URL with * because the filter is back end not front end code.
    const route = "https://api.eventhub.rahulshettyacademy.com/api/events?page=1&limit=12";
    await page.goto("https://eventhub.rahulshettyacademy.com/");

    // await page.pause();

    await api.fulfillCall(page, route, 200, mockedEvents);

    await eventsPage.goto();
    await eventsPage.waitForNetworkIdle();

    let allEvents = await eventsPage.getAllEventCategories();
    let totalFestivalEventCount = allEvents.filter(e => e.includes("Festival")).length;

    console.log(`totalFestivalEventCount ${totalFestivalEventCount}`);
    await eventsPage.search("Festival");

    let filteredEvents = await eventsPage.getAllEventCategories();
    let filteredFestivalEventCount = filteredEvents.filter(e => e.includes("Festival")).length;
    console.log(`filteredFestivalEventCount ${filteredFestivalEventCount}`);

    expect(allEvents.length).toBeGreaterThan(filteredEvents.length);
    expect(totalFestivalEventCount).toEqual(filteredFestivalEventCount);
});

test('Update event', async() => {
    const eventsAdminPage = new EventsAdminPage(page);

    const eventToEdit = JSON.parse(JSON.stringify(require("../resources/eventToUpdate.json")));
    await api.createEvent(token, eventToEdit);

    await eventsAdminPage.goto();
    await eventsAdminPage.waitForNetworkIdle();

    let eventCell = eventsAdminPage.findEvent(eventToEdit.title);

    await eventsAdminPage.editEvent(eventCell);
    await eventsAdminPage.fillPrice("0");
    await eventsAdminPage.clickUpdateEvent();

    let statusMessage = await eventsAdminPage.getStatusMessage();
    console.log(statusMessage);
    expect(statusMessage).toEqual("Event updated!");

    await eventsAdminPage.waitForNetworkIdle();

    // Re-find the event cell after update to ensure we have the latest reference
    eventCell = eventsAdminPage.findEvent(eventToEdit.title);

    await eventsAdminPage.verifyEventTitle(eventCell, eventToEdit.title);
    await eventsAdminPage.verifyEventCategory(eventCell, eventToEdit.category);
    await eventsAdminPage.verifyEventCity(eventCell, eventToEdit.city);
    await eventsAdminPage.verifyEventDate(eventCell, "25 Sept 2026");
    await eventsAdminPage.verifyEventPrice(eventCell, eventsAdminPage.formatPrice(0));
    await eventsAdminPage.verifyEventSeats(eventCell, `${eventToEdit.totalSeats}/${eventToEdit.totalSeats}`);

});

test('Delete event', async() => {
    const eventsAdminPage = new EventsAdminPage(page);

    const eventToDelete = JSON.parse(JSON.stringify(require("../resources/eventToDelete.json")));
    await api.createEvent(token, eventToDelete);

    await eventsAdminPage.goto();
    await eventsAdminPage.waitForNetworkIdle();

    let eventCell = eventsAdminPage.findEvent(eventToDelete.title);
    await eventsAdminPage.deleteEvent(eventCell);

    let statusMessage = await eventsAdminPage.getStatusMessage();
    console.log(statusMessage);

    expect(statusMessage).toEqual("Event deleted");
    await eventsAdminPage.waitForNetworkIdle();

    await expect(eventsAdminPage.findEvent(eventToDelete.title)).toHaveCount(0);
    // eventCell = await eventsAdminPage.findEvent(eventToDelete.title);
    // expect(eventCell).toBeUndefined()
});

test('Events page with no events', async() => {
    const eventsPage = new EventsPage(page);

    await page.goto("https://eventhub.rahulshettyacademy.com/");

    await page.route("https://api.eventhub.rahulshettyacademy.com/api/events*",
        async route => {
            await route.fulfill({
                status: 204,
                body: '',
            })
        })

    await eventsPage.goto();
    await eventsPage.waitForNetworkIdle();

    await expect(page.locator("h3.text-lg")).toHaveText("No events found");

});

test('Events admin page with no events', async() => {
    const eventsAdminPage = new EventsAdminPage(page);

    await page.goto("https://eventhub.rahulshettyacademy.com/");

    await page.route("https://api.eventhub.rahulshettyacademy.com/api/events*",
        async route => {
            await route.fulfill({
                status: 204,
                body: '',
            })
        })

    await eventsAdminPage.goto();
    await eventsAdminPage.waitForNetworkIdle();

    await expect(page.locator("h3.text-lg")).toHaveText("No events yet");
});