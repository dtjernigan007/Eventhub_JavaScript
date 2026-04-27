class EventsAdminPage {
    constructor(page) {
        this.page = page;
        this.url = "https://eventhub.rahulshettyacademy.com/admin/events";

        // Form Locators
        this.eventTitleInput = page.getByPlaceholder('Event title');
        this.descriptionInput = page.getByPlaceholder('Describe the event…');
        this.categorySelect = page.locator('select#category');
        this.cityInput = page.getByRole('textbox', { name: 'City*' });
        this.venueInput = page.getByPlaceholder('Venue name & address');
        this.dateTimeInput = page.locator("input[id='event-date-&-time']");
        this.priceInput = page.getByPlaceholder('0.00');
        this.totalSeatsInput = page.getByLabel('Total Seats*');
        this.imageUrlInput = page.getByRole('textbox', { name: 'Image URL (optional)' });

        // Buttons
        this.addEventButton = page.getByRole('button', { name: '+ Add Event' });
        this.updateEventButton = page.getByTestId('add-event-btn');
        this.cancelEditButton = page.getByRole('button', { name: 'Cancel edit' });

        // Status/Message areas
        this.statusMessage = page.locator("div[aria-live='polite'] p");
        this.statusMessageContainer = page.locator("div[aria-live='polite']");

        // Table Locators
        this.eventTable = page.locator("tbody > tr");
        this.noEventsMessage = page.locator("h3.text-lg");

        // Dialog
        this.confirmDialogYes = page.getByTestId('confirm-dialog-yes');
    }

    // Navigation
    async goto() {
        await this.page.goto(this.url);
    }

    async waitForNetworkIdle() {
        await this.page.waitForLoadState('networkidle');
    }

    // Form filling methods
    async fillEventTitle(title) {
        await this.eventTitleInput.fill(title);
    }

    async fillDescription(description) {
        await this.descriptionInput.fill(description);
    }

    async selectCategory(category) {
        await this.categorySelect.selectOption(category);
    }

    async fillCity(city) {
        await this.cityInput.fill(city);
    }

    async fillVenue(venue) {
        await this.venueInput.fill(venue);
    }

    async fillDateTime(dateTime) {
        await this.dateTimeInput.click();
        await this.dateTimeInput.pressSequentially(dateTime, {delay: 100});
        await this.dateTimeInput.press('Tab');
    }

    async fillTime(time) {
        await this.dateTimeInput.pressSequentially(time, {delay: 100});
    }

    async fillPrice(price) {
        await this.priceInput.fill(price);
    }

    async fillTotalSeats(seats) {
        await this.totalSeatsInput.fill(seats);
    }

    async fillImageUrl(url) {
        await this.imageUrlInput.fill(url);
    }

    // Form submission
    async clickAddEvent() {
        await this.addEventButton.click();
    }

    async clickUpdateEvent() {
        await this.updateEventButton.click();
    }

    async clickCancelEdit() {
        await this.cancelEditButton.click();
    }

    // Status message retrieval
    async getStatusMessage() {
        await this.statusMessageContainer.waitFor({state: "visible"});
        return await this.statusMessage.textContent();
    }

    async waitForStatusMessage() {
        await this.statusMessageContainer.waitFor({state: "visible"});
    }

    // Complete event creation
    async createEvent(eventData) {
        await this.fillEventTitle(eventData.title);
        await this.fillDescription(eventData.description);
        await this.selectCategory(eventData.category);
        await this.fillCity(eventData.city);
        await this.fillVenue(eventData.venue);
        await this.fillDateTime(eventData.dateTime);
        await this.fillTime(eventData.time);
        await this.fillPrice(eventData.price.toString());
        await this.fillTotalSeats(eventData.totalSeats.toString());
        await this.fillImageUrl(eventData.imageUrl);
        await this.clickAddEvent();
    }

    // Table/Event management
    async findEvent(eventTitle) {
        let rows = await this.eventTable.all();
        let rowNumber;

        for(let i = 0; i < rows.length; i++) {
            let title = await rows[i].locator("td:first-child").textContent();
            if(title === eventTitle) {
                rowNumber = i + 1;
                break;
            }
        }

        if(rowNumber === undefined)
            return undefined;
        else
            return await this.page.locator(`tbody > tr:nth-child(${rowNumber})`);
    }

    async getEventRow(rowNumber) {
        return await this.page.locator(`tbody > tr:nth-child(${rowNumber})`);
    }

    // Event row operations
    async editEvent(eventRow) {
        await eventRow.getByTestId('edit-event-btn').click();
        await this.cancelEditButton.waitFor({state: "visible"});
    }

    async deleteEvent(eventRow) {
        await eventRow.getByTestId('delete-event-btn').click();
        await this.confirmDialogYes.click();
    }

    // Getters for table cell data
    async getEventTitle(eventRow) {
        return await eventRow.locator("td:nth-child(1)").textContent();
    }

    async getEventCategory(eventRow) {
        return await eventRow.locator("td:nth-child(2)").textContent();
    }

    async getEventCity(eventRow) {
        return await eventRow.locator("td:nth-child(3)").textContent();
    }

    async getEventDate(eventRow) {
        return await eventRow.locator("td:nth-child(4)").textContent();
    }

    async getEventPrice(eventRow) {
        return await eventRow.locator("td:nth-child(5)").textContent();
    }

    async getEventSeats(eventRow) {
        return await eventRow.locator("td:nth-child(6)").textContent();
    }

    // Verification helpers
    async getNoEventsMessage() {
        return await this.noEventsMessage.textContent();
    }

    formatPrice(price) {
        const usdFormatter = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0,
        });
        return usdFormatter.format(price);
    }
}
module.exports = {EventsAdminPage};
