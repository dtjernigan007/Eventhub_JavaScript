import {test as base, request} from '@playwright/test';
import {APIUtils} from './APIUtils';

const userData = JSON.parse(JSON.stringify(require('../resources/user_data.json')));

export const test = base.extend({

    // Shared API instance — one login for the entire worker process
    api: [async ({}, use) => {
        const apiContext = await request.newContext();
        const api = new APIUtils(apiContext, userData);
        await api.login();               // sets this.token internally
        await use(api);
        await apiContext.dispose();
    }, { scope: 'worker' }],            // one login per worker

    // Browser page using the saved storageState — one context per test
    page: async ({ browser }, use) => {
        const context = await browser.newContext({
            storageState: 'loggedInState.json'
        });
        const page = await context.newPage();
        await use(page);
        await context.close();
    }

});

export {expect} from '@playwright/test';