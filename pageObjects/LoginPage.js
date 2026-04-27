const {expect} = require("@playwright/test");

class LoginPage {
    constructor(page) {
        this.page = page;
        this.url = "https://eventhub.rahulshettyacademy.com/login";
        this.apiUrl = "https://api.eventhub.rahulshettyacademy.com/api/auth/login";

        // Locators
        this.emailInput = page.locator("#email");
        this.passwordInput = page.locator("#password");
        this.loginButton = page.getByRole('button');
        this.logoutButton = page.getByTestId('logout-btn');
        this.passwordErrorMessage = page.locator("#password ~ p");
        this.invalidCredentialsError = page.locator("div[aria-live='polite']");
    }

    // Navigation methods
    async goto() {
        await this.page.goto(this.url);
    }

    // Input methods
    async fillEmail(email) {
        await this.emailInput.fill(email);
    }

    async fillPassword(password) {
        await this.passwordInput.fill(password);
    }

    // Action methods
    async clickLogin() {
        await this.loginButton.click();
    }

    async waitForNetworkIdle() {
        await this.page.waitForLoadState('networkidle');
    }

    // State management methods
    async storeSessionState(path = 'loggedInState.json') {
        await this.page.context().storageState({path: path});
    }

    // Element visibility/validation methods
    async isLogoutButtonVisible() {
        return expect(this.logoutButton.isVisible()).toBeTruthy();
    }

    async getPasswordErrorMessage() {
        return await this.passwordErrorMessage.textContent();
    }

    async getInvalidCredentialsErrorMessage() {
        return await this.invalidCredentialsError.textContent();
    }

    // Convenience methods
    async login(email, password) {
        await this.goto();
        await this.fillEmail(email);
        await this.fillPassword(password);
        await this.clickLogin();
    }

}

module.exports = {LoginPage};
