import {test, expect, request} from "@playwright/test";
import {APIUtils} from "../Utils/APIUtils";
const userData = JSON.parse(JSON.stringify(require("../resources/user_data.json")));

let context;
let page;
let api;
let token;

test.beforeAll(async () => {

    const apiContext = await request.newContext();
    api = new APIUtils(apiContext, userData);
    token = await api.login();
    // console.log(token);


})



// test.beforeEach(async({browser, request}) => {
//     context = await browser.newContext({storageState: 'loggedInState.json'});
//     page = await context.newPage();
//
//
//
// })

test('Verify Events', async() => {

    let expectedEvents = ["Dilli Diwali Mela", "Hollywood Monsoon Night — Los Angeles", "World Tech Summit"];
    let actualEvents = [];

    let events = await api.getEvents(token);
    // console.log(events)

    let eventCount = events.pagination.total;
    console.log("Total Events: " + eventCount);

    for(let i = 0; i < eventCount; i++) {
        let event = events.data[i];
        actualEvents.push(event.title);
    }
    expect(actualEvents).toEqual(expectedEvents);
});

