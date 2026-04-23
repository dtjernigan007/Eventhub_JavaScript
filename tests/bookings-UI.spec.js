import {test, expect} from "@playwright/test";

let context;
let page;
let confirmationNumber;


test.beforeEach(async({browser}) => {
    context = await browser.newContext({storageState: 'loggedInState.json'});
    page = await context.newPage();
    // await page.goto("https://eventhub.rahulshettyacademy.com/");
})

test('Book Event', async() => {

    await page.goto("https://eventhub.rahulshettyacademy.com/events");
    await page.waitForLoadState('networkidle');

    await page.getByTestId('book-now-btn').first().click();
    await page.waitForLoadState('networkidle');

    await expect.soft(page.locator("h1")).toHaveText('Dilli Diwali Mela');
    await expect.soft(page.locator("//p[normalize-space()='Venue']/following-sibling::p")).toHaveText("Pragati Maidan Exhibition Grounds");
    await expect.soft(page.locator("//p[normalize-space()='Price per ticket']/following-sibling::p")).toHaveText("$300");

    await page.getByRole('button', { name: '+' }).click();
    await page.getByPlaceholder('Your full name').fill("John Smith");
    await page.getByPlaceholder('you@email.com').fill("john_smith@fake.biz");
    await page.getByRole('textbox', { name: 'Phone Number*' }).fill("+1 916-555-1234");

    expect.soft(page.locator("//span[normalize-space()='Total']/following-sibling::span")).toHaveText("$600");

    await page.getByRole('button', { name: 'Confirm Booking' }).click();

    await expect(page.locator("h3.text-xl")).toHaveText("Booking Confirmed! 🎉");

    confirmationNumber = await page.locator(".booking-ref").textContent();
});

test('Confirm booked event', async() => {
    test.skip(!confirmationNumber, "No confirmation number - Skipping");

    await page.goto("https://eventhub.rahulshettyacademy.com/bookings");
    await page.waitForLoadState('networkidle');

    let bookings = await page.locator(".booking-ref").allTextContents();

    expect(bookings).toContain(confirmationNumber);
});

test('Cancel booked event', async() => {
    test.skip(!confirmationNumber, "No confirmation number - Skipping");

    await page.goto("https://eventhub.rahulshettyacademy.com/bookings");
    await page.waitForLoadState('networkidle');

    let bookings = await page.locator("#booking-card .booking-ref").allTextContents();
    let initialCount = bookings.length;
    expect(bookings).toContain(confirmationNumber);
    let card = await page.getByTestId('booking-card').nth(bookings.indexOf(confirmationNumber));
    await card.getByRole('button', { name: 'Cancel Booking' }).click();
    await expect(page.locator("//h2[@id='modal-title']/../following-sibling::div/p")).toContainText(confirmationNumber);
    await page.getByRole('button', {name: 'Yes, cancel it'}).click();


    await page.locator("div[aria-live='polite']").waitFor({state: 'visible'});
    // await page.locator("div[aria-live='polite']").waitFor({state: 'hidden'});
    bookings = await page.locator("#booking-card .booking-ref").allTextContents();

    expect(bookings).not.toContain(confirmationNumber);

});