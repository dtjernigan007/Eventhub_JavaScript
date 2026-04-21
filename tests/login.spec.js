import {test, expect} from "@playwright/test";


test('UI valid login', async({browser}) => {

    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto("https://eventhub.rahulshettyacademy.com/login");
    await page.locator("#email").fill("john_smith@fake.biz");
    await page.locator("#password").fill("abc123DEF@");
    await page.getByRole('button').click();
    await page.waitForLoadState('networkidle');

    await expect(page.getByTestId('logout-btn')).toBeVisible();

    await context.storageState({path: 'loggedInState.json'})
});

test('UI invalid login, short password', async({page}) => {

    await page.goto("https://eventhub.rahulshettyacademy.com/login");
    await page.locator("#email").fill("john_smith@fake.biz");
    await page.locator("#password").fill("abc12");
    await page.getByRole('button').click();

    await expect(page.locator("#password ~ p")).toHaveText("Password must be at least 6 characters");
});

test('UI invalid login, incorrect password', async({page}) => {

    await page.goto("https://eventhub.rahulshettyacademy.com/login");
    await page.locator("#email").fill("john_smith@fake.biz");
    await page.locator("#password").fill("abc123DEF");
    await page.getByRole('button').click();

    await expect(page.locator("div[aria-live='polite']")).toContainText("Invalid email or password");
});

test('API valid login', async({request}) => {
    const login = await request.post('https://api.eventhub.rahulshettyacademy.com/api/auth/login', {
        data: {
            email: "john_smith@fake.biz",
            password: "abc123DEF@"
        }
    });

    console.log(login);
    expect(login.status()).toEqual(200);

});

test('API invalid login, incorrect password', async({request}) => {
    const login = await request.post('https://api.eventhub.rahulshettyacademy.com/api/auth/login', {
        data: {
            email: "john_smith@fake.biz",
            password: "abc123DEF"
        }
    });

    const responseBody = await login.json();
    let error = responseBody.error;
    // console.log(responseBody);
    // console.log(error);

    // console.log(login);
    expect(login.status()).toEqual(400);
    expect(error).toEqual("Invalid email or password");

});
