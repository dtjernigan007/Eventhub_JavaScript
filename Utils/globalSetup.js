import { chromium } from '@playwright/test';
import * as fs from 'fs';
import {LoginPage} from "../pageObjects/LoginPage";

export default async function globalSetup() {
    if (isStorageStateValid()) return;

    console.log('Browser session expired or missing — logging in...');
    await regenerateStorageState();
}

function isStorageStateValid() {
    if (!fs.existsSync('loggedInState.json')) return false;

    try {
        const state = JSON.parse(fs.readFileSync('loggedInState.json', 'utf-8'));
        const origin = state.origins?.find(o => o.origin === 'https://eventhub.rahulshettyacademy.com');
        const tokenEntry = origin?.localStorage?.find(e => e.name === 'eventhub_token');

        if (!tokenEntry?.value) return false;

        // JWT is three base64 segments: header.payload.signature
        const payload = JSON.parse(
            Buffer.from(tokenEntry.value.split('.')[1], 'base64').toString('utf-8')
        );

        const nowInSeconds = Math.floor(Date.now() / 1000);
        const bufferSeconds = 60 * 30;  // treat as expired if less than 30 min remaining

        return payload.exp > nowInSeconds + bufferSeconds;

    } catch {
        return false;  // malformed file or token — treat as expired
    }
}

async function regenerateStorageState() {
    const userData = require('../resources/user_data.json');
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();
    const loginPage = new LoginPage(page);

    await loginPage.login(userData.email, userData.password);
    await page.getByTestId('logout-btn').waitFor({state: 'visible'});

    await context.storageState({ path: 'loggedInState.json' });
    await browser.close();
}