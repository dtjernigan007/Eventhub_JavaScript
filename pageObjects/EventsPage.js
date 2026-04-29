class EventsPage {
    constructor(page) {
        this.page = page;
        this.url = "https://eventhub.rahulshettyacademy.com/events";

        // Locators
        this.eventCards = page.locator("#event-card div h3");
        this.eventCategories = page.locator("#event-card > div > div.left-3 > span");
        this.searchInput = page.getByPlaceholder('Search events, venues…');
        this.noEventsMessage = page.locator("h3.text-lg");
        this.bookNowButton = page.getByTestId('book-now-btn');
    }

    // Navigation
    async goto() {
        await this.page.goto(this.url);
    }

    // Search and filter
    async search(searchTerm) {
        await this.searchInput.fill(searchTerm);
        await this.page.waitForResponse("https://api.eventhub.rahulshettyacademy.com/api/events?search*");
    }

    // Event retrieval
    async getEventCardText(index) {
        return await this.page.locator("#event-card div h3").nth(index).textContent();
    }

    async getAllEventCategories() {
        return await this.eventCategories.allTextContents();
    }

    async getEventCount() {
        return await this.page.locator("#event-card div h3").count();
    }

    // Verification
    async getNoEventsMessage() {
        return await this.noEventsMessage.textContent();
    }

    // Wait and navigation
    async waitForNetworkIdle() {
        await this.page.waitForLoadState('networkidle');
    }

    // Utility to verify multiple events
    async verifyEventsDisplayed(expectedEvents) {
        for(let i = 0; i < expectedEvents.length; i++) {
            let eventName = await this.getEventCardText(i);
            if(eventName !== expectedEvents[i]) {
                return false;
            }
        }
        return true;
    }

    // Booking
    async clickFirstBookNow() {
        await this.bookNowButton.first().click();
    }
}
module.exports = {EventsPage};
