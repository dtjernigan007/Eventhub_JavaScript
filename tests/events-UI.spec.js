import {test, expect} from "@playwright/test";
import {EventsPage} from "../pageObjects/EventsPage";
import {EventsAdminPage} from "../pageObjects/EventsAdminPage";

let context;
let page;
const eventData = JSON.parse(JSON.stringify(require("../resources/event_data.json")));

/*
These are intended to be run sequentially
 */

test.beforeEach(async({browser}) => {
    context = await browser.newContext({storageState: 'loggedInState.json'});
    page = await context.newPage();
    // await page.goto("https://eventhub.rahulshettyacademy.com/");
})

test('Browse events', async() => {
    const eventsPage = new EventsPage(page);
    let expectedEvents = ["Dilli Diwali Mela", "Hollywood Monsoon Night — Los Angeles", "World Tech Summit"];

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

    await eventsAdminPage.goto();
    await eventsAdminPage.waitForNetworkIdle();

    let eventRow = await eventsAdminPage.findEvent(eventData.title);
    expect(await eventsAdminPage.getEventTitle(eventRow)).toBe(eventData.title);
    expect(await eventsAdminPage.getEventCategory(eventRow)).toBe(eventData.category);
    expect(await eventsAdminPage.getEventCity(eventRow)).toBe(eventData.city);
    expect(await eventsAdminPage.getEventDate(eventRow)).toBe("25 Sept 2026");
    expect(await eventsAdminPage.getEventPrice(eventRow)).toBe(eventsAdminPage.formatPrice(eventData.price));
    expect(await eventsAdminPage.getEventSeats(eventRow)).toBe(`${eventData.totalSeats}/${eventData.totalSeats}`);
});

test('Filter events', async() => {
    const eventsPage = new EventsPage(page);

    await eventsPage.goto();
    await eventsPage.waitForNetworkIdle();

    let allEvents = await eventsPage.getAllEventCategories();
    let totalFestivalEventCount = allEvents.filter(e => e.includes("Festival")).length;
    // console.log(`totalFestivalEventCount ${totalFestivalEventCount}`);

    await eventsPage.search("Festival");

    let filteredEvents = await eventsPage.getAllEventCategories();
    let filteredFestivalEventCount = allEvents.filter(e => e.includes("Festival")).length;
    // console.log(`filteredFestivalEventCount ${filteredFestivalEventCount}`);

    expect(allEvents.length).toBeGreaterThan(filteredEvents.length);
    expect(totalFestivalEventCount.length).toEqual(filteredFestivalEventCount.length);
});

test('Update event', async() => {
    const eventsAdminPage = new EventsAdminPage(page);

    await eventsAdminPage.goto();
    await eventsAdminPage.waitForNetworkIdle();

    let eventRow = await eventsAdminPage.findEvent(eventData.title);

    await eventsAdminPage.editEvent(eventRow);
    await eventsAdminPage.fillPrice("0");
    await eventsAdminPage.clickUpdateEvent();

    let statusMessage = await eventsAdminPage.getStatusMessage();
    console.log(statusMessage);

    expect(statusMessage).toEqual("Event updated!");

    await eventsAdminPage.waitForNetworkIdle();
    expect(await eventsAdminPage.getEventTitle(eventRow)).toBe(eventData.title);
    expect(await eventsAdminPage.getEventCategory(eventRow)).toBe(eventData.category);
    expect(await eventsAdminPage.getEventCity(eventRow)).toBe(eventData.city);
    expect(await eventsAdminPage.getEventDate(eventRow)).toBe("25 Sept 2026");
    expect(await eventsAdminPage.getEventPrice(eventRow)).toBe(eventsAdminPage.formatPrice(0));
    expect(await eventsAdminPage.getEventSeats(eventRow)).toBe(`${eventData.totalSeats}/${eventData.totalSeats}`);

});

test('Delete event', async() => {
    const eventsAdminPage = new EventsAdminPage(page);

    await eventsAdminPage.goto();
    await eventsAdminPage.waitForNetworkIdle();

    let eventRow = await eventsAdminPage.findEvent(eventData.title);
    await eventsAdminPage.deleteEvent(eventRow);

    let statusMessage = await eventsAdminPage.getStatusMessage();
    console.log(statusMessage);

    expect(statusMessage).toEqual("Event deleted");
    await eventsAdminPage.waitForNetworkIdle();
    // console.log(await findEvent())

    eventRow = await eventsAdminPage.findEvent(eventData.title);
    expect(eventRow).toBeUndefined()
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

