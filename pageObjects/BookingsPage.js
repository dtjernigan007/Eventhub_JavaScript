class BookingsPage {
    constructor(page) {
        this.page = page;
        this.url = "https://eventhub.rahulshettyacademy.com/bookings";

        // Locators
        this.bookingCards = page.getByTestId('booking-card');
        this.bookingReferences = page.locator("#booking-card .booking-ref");
        this.cancelBookingButton = page.getByRole('button', { name: 'Cancel Booking' });
        this.confirmCancelButton = page.getByRole('button', { name: 'Yes, cancel it' });
        this.noBookingsMessage = page.locator("h3.text-lg");
        this.statusMessage = page.locator("div[aria-live='polite']");
        this.modalConfirmationNumber = page.locator("//h2[@id='modal-title']/../following-sibling::div/p");
    }

    async goto() {
        await this.page.goto(this.url);
    }

    async waitForNetworkIdle() {
        await this.page.waitForLoadState('networkidle');
    }

    // Booking retrieval
    async getAllBookingReferences() {
        return await this.bookingReferences.allTextContents();
    }

    async getBookingCount() {
        return await this.bookingCards.count();
    }

    // Find specific booking
    async findBookingCardByReference(reference) {
        const references = await this.getAllBookingReferences();
        const index = references.indexOf(reference);
        if (index === -1) return null;
        return this.bookingCards.nth(index);
    }

    // Cancellation methods
    async cancelBooking(reference) {
        const bookingCard = await this.findBookingCardByReference(reference);
        if (!bookingCard) throw new Error(`Booking with reference ${reference} not found`);

        await bookingCard.locator(this.cancelBookingButton).click();
        await this.page.waitForSelector("//h2[@id='modal-title']");

        const modalText = await this.modalConfirmationNumber.textContent();
        expect(modalText).toContain(reference);

        await this.confirmCancelButton.click();
        await this.statusMessage.waitFor({ state: 'visible' });
    }

    // Verification methods
    async hasBooking(reference) {
        const references = await this.getAllBookingReferences();
        return references.includes(reference);
    }

    async getNoBookingsMessage() {
        return await this.noBookingsMessage.textContent();
    }

    async getStatusMessage() {
        return await this.statusMessage.textContent();
    }
}

module.exports = { BookingsPage };
