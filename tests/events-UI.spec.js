import {test, expect} from "@playwright/test";

let context;
let page;
const eventData = JSON.parse(JSON.stringify(require("../resources/event_data.json")));

// test.beforeAll(async({browser}) => {
//     context = await browser.newContext({storageState: 'loggedInState.json'});
// });

test.beforeEach(async({browser}) => {
    context = await browser.newContext({storageState: 'loggedInState.json'});
    page = await context.newPage();
    // await page.goto("https://eventhub.rahulshettyacademy.com/");
})

test('Browse events', async() => {
    let expectedEvents = ["Dilli Diwali Mela", "Hollywood Monsoon Night — Los Angeles", "World Tech Summit"];

    await page.goto("https://eventhub.rahulshettyacademy.com/");
    await page.locator("a[href='/events'] > span").click();
    await page.waitForLoadState('networkidle');

    for(let i = 0; i < expectedEvents.length; i++) {
        let eventName = await page.locator("#event-card div h3").nth(i).textContent();
        expect(eventName).toEqual(expectedEvents[i]);
    }
});

test('Add event', async() => {

    page.goto("https://eventhub.rahulshettyacademy.com/admin/events");
    await page.getByPlaceholder('Event title').fill(eventData.title);
    await page.getByPlaceholder('Describe the event…').fill(eventData.description);
    await page.locator('select#category').selectOption(eventData.category);
    await page.getByRole('textbox', { name: 'City*' }).fill(eventData.city);
    await page.getByPlaceholder('Venue name & address').fill(eventData.venue);

    await page.locator("input[id='event-date-&-time']").click();
    await page.locator("input[id='event-date-&-time']").pressSequentially("09252026", {delay: 100});
    await page.locator("input[id='event-date-&-time']").press('Tab');
    await page.locator("input[id='event-date-&-time']").pressSequentially("0400PM", {delay: 100});
    await page.getByPlaceholder('0.00').fill(eventData.price.toString());
    await page.getByLabel('Total Seats*').fill(eventData.totalSeats.toString());
    await page.getByRole('textbox', { name: 'Image URL (optional)' }).fill(eventData.imageUrl);
    await page.getByRole('button', { name: '+ Add Event' }).click();

    await page.locator("div[aria-live='polite']").waitFor({state: "visible"});
    let statusMessage = await page.locator("div[aria-live='polite'] p").textContent();
    console.log(statusMessage);

    expect(statusMessage).toEqual("Event created!");
});

test('Verify new event', async() => {

    page.goto("https://eventhub.rahulshettyacademy.com/admin/events");
    await page.waitForLoadState('networkidle');

    const usdFormatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
    });

    let eventRow = await findEvent();
    await expect(eventRow.locator("td:nth-child(1)")).toHaveText(eventData.title);
    await expect(eventRow.locator("td:nth-child(2)")).toHaveText(eventData.category);
    await expect(eventRow.locator("td:nth-child(3)")).toHaveText(eventData.city);
    await expect(eventRow.locator("td:nth-child(4)")).toHaveText("25 Sept 2026");
    await expect(eventRow.locator("td:nth-child(5)")).toHaveText(usdFormatter.format(eventData.price));
    await expect(eventRow.locator("td:nth-child(6)")).toHaveText(`${eventData.totalSeats}/${eventData.totalSeats}`);


});

test('Filter events', async() => {
    page.goto("https://eventhub.rahulshettyacademy.com/events");
    await page.waitForLoadState('networkidle');

    let allEvents = await page.locator("#event-card > div > div.left-3 > span").allTextContents();
    let totalFestivalEventCount = allEvents.filter(e => e.includes("Festival")).length;
    // console.log(`totalFestivalEventCount ${totalFestivalEventCount}`);

    await page.getByPlaceholder('Search events, venues…').fill("Festival");
    await page.waitForResponse("https://api.eventhub.rahulshettyacademy.com/api/events?search*");

    await page.locator("#event-card > div > div.left-3 > span").allTextContents();

    let filteredEvents = await page.locator("#event-card > div > div.left-3 > span").allTextContents();
    let filteredFestivalEventCount = allEvents.filter(e => e.includes("Festival")).length;
    // console.log(`filteredFestivalEventCount ${filteredFestivalEventCount}`);

    expect(allEvents.length).toBeGreaterThan(filteredEvents.length);
    expect(totalFestivalEventCount.length).toEqual(filteredFestivalEventCount.length);
});

test('Update event', async() => {
    page.goto("https://eventhub.rahulshettyacademy.com/admin/events");
    await page.waitForLoadState('networkidle');

    const usdFormatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
    });

    let eventRow = await findEvent();

    await eventRow.getByTestId('edit-event-btn').click();
    await page.getByRole('button', { name: 'Cancel edit' }).waitFor({state: "visible"});
    await page.getByPlaceholder('0.00').fill("0");
    await page.getByTestId('add-event-btn').click();

    await page.locator("div[aria-live='polite']").waitFor({state: "visible"});
    let statusMessage = await page.locator("div[aria-live='polite'] p").textContent();
    console.log(statusMessage);

    expect(statusMessage).toEqual("Event updated!");

    await page.waitForLoadState('networkidle');
    await expect(eventRow.locator("td:nth-child(1)")).toHaveText(eventData.title);
    await expect(eventRow.locator("td:nth-child(2)")).toHaveText(eventData.category);
    await expect(eventRow.locator("td:nth-child(3)")).toHaveText(eventData.city);
    await expect(eventRow.locator("td:nth-child(4)")).toHaveText("25 Sept 2026");
    await expect(eventRow.locator("td:nth-child(5)")).toHaveText(usdFormatter.format(0));
    await expect(eventRow.locator("td:nth-child(6)")).toHaveText(`${eventData.totalSeats}/${eventData.totalSeats}`);

});

test('Delete event', async() => {
    page.goto("https://eventhub.rahulshettyacademy.com/admin/events");
    await page.waitForLoadState('networkidle');

    let eventRow = await findEvent();
    await eventRow.getByTestId('delete-event-btn').click();
    await page.getByTestId('confirm-dialog-yes').click();

    await page.locator("div[aria-live='polite']").waitFor({state: "visible"});
    let statusMessage = await page.locator("div[aria-live='polite'] p").textContent();
    console.log(statusMessage);

    expect(statusMessage).toEqual("Event deleted");
    await page.waitForLoadState('networkidle');
    // console.log(await findEvent())

    eventRow = await findEvent();
    expect(eventRow).toBeUndefined()
});

test('Events page with no events', async() => {

    await page.goto("https://eventhub.rahulshettyacademy.com/");

    await page.route("https://api.eventhub.rahulshettyacademy.com/api/events*",
        async route => {
            await route.fulfill({
                status: 204,
                body: '',
            })
        })

    await page.goto("https://eventhub.rahulshettyacademy.com/events");
    await page.waitForLoadState('networkidle');

    await expect(page.locator("h3.text-lg")).toHaveText("No events found");

});

test.only('Events admin page with no events', async() => {

    await page.goto("https://eventhub.rahulshettyacademy.com/");

    await page.route("https://api.eventhub.rahulshettyacademy.com/api/events*",
        async route => {
            await route.fulfill({
                status: 204,
                body: '',
            })
        })

    await page.goto("https://eventhub.rahulshettyacademy.com/admin/events");
    await page.waitForLoadState('networkidle');

    await expect(page.locator("h3.text-lg")).toHaveText("No events yet");
});

async function findEvent() {
    let rows = await page.locator("tbody > tr").all();
    let rowNumber;
    for(let i = 0; i < rows.length; i++) {
        let title = await rows[i].locator("td:first-child").textContent();
        // console.log(title);
        if(title === eventData.title) {
            rowNumber = i + 1;
            break;
        }
    }

    if(rowNumber === undefined)
        return undefined;
    else
        return await page.locator(`tbody > tr:nth-child(${rowNumber})`);
}