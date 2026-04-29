class EventDetailsPage {
    constructor(page) {
        this.page = page;

        // Locators - Event details
        this.eventTitle = page.locator("h1");
        this.venueInfo = page.locator("//p[normalize-space()='Venue']/following-sibling::p");
        this.priceInfo = page.locator("//p[normalize-space()='Price per ticket']/following-sibling::p");

        // Locators - Booking form
        this.quantityIncreaseButton = page.getByRole('button', { name: '+' });
        this.fullNameInput = page.getByPlaceholder('Your full name');
        this.emailInput = page.getByPlaceholder('you@email.com');
        this.phoneInput = page.getByRole('textbox', { name: 'Phone Number*' });
        this.totalPrice = page.locator("//span[normalize-space()='Total']/following-sibling::span");
        this.confirmBookingButton = page.getByRole('button', { name: 'Confirm Booking' });

        // Locators - Confirmation
        this.confirmationTitle = page.locator("h3.text-xl");
        this.bookingReference = page.locator(".booking-ref");
    }

    async waitForNetworkIdle() {
        await this.page.waitForLoadState('networkidle');
    }

    // Verification methods
    async getEventTitle() {
        return await this.eventTitle.textContent();
    }

    async getVenue() {
        return await this.venueInfo.textContent();
    }

    async getPricePerTicket() {
        return await this.priceInfo.textContent();
    }

    // Booking form methods
    async increaseQuantity() {
        await this.quantityIncreaseButton.click();
    }

    async fillFullName(name) {
        await this.fullNameInput.fill(name);
    }

    async fillEmail(email) {
        await this.emailInput.fill(email);
    }

    async fillPhone(phone) {
        await this.phoneInput.fill(phone);
    }

    async getTotalPrice() {
        return await this.totalPrice.textContent();
    }

    async clickConfirmBooking() {
        await this.confirmBookingButton.click();
    }

    // Complete booking flow
    async bookEvent(name, email, phone) {
        await this.increaseQuantity();
        await this.fillFullName(name);
        await this.fillEmail(email);
        await this.fillPhone(phone);
        await this.clickConfirmBooking();
    }

    // Confirmation methods
    async getConfirmationTitle() {
        return await this.confirmationTitle.textContent();
    }

    async getBookingReference() {
        return await this.bookingReference.textContent();
    }
}

module.exports = { EventDetailsPage };
