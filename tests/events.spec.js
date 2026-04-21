import {test, expect, request} from "@playwright/test";
import {APIUtils} from "../Utils/APIUtils";
const userData = JSON.parse(JSON.stringify(require("../resources/user_data.json")));

let api;
let token;
const eventData = JSON.parse(JSON.stringify(require("../resources/event_data.json")));

test.beforeAll(async () => {

    const apiContext = await request.newContext();
    api = new APIUtils(apiContext, userData);
    token = await api.login();
    // console.log(token);
});

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

test('Add new event', async() => {


    let response = await api.createEvent(token, eventData);
    // console.log(response)

    expect(response.message).toEqual("Event created successfully");

});

test('Verify New Event', async() => {
    let id;
    let events = await api.getEvents(token);
    let eventCount = events.pagination.total;
    for(let i = 0; i < eventCount; i++) {
        let event = events.data[i];
        console.log(event)
        if((event.title).includes("Neon Night Market")) {
            id = event.id;
            break;
        }
    }

    let response = await api.getEventDetails(token, id);
    expect.soft(response.data.title).toEqual(eventData.title);
    expect.soft(response.data.description).toEqual(eventData.description);
    expect.soft(response.data.category).toEqual(eventData.category);
    expect.soft(response.data.venue).toEqual(eventData.venue);
    expect.soft(response.data.city).toEqual(eventData.city);
    expect.soft(response.data.price).toEqual(eventData.price.toString());
});

test('Update Event', async() => {
    let updateData = eventData;
    updateData.price = 500;

    //Find our event ID to update
    let id;
    let events = await api.getEvents(token);
    let eventCount = events.pagination.total;
    for(let i = 0; i < eventCount; i++) {
        let event = events.data[i];
        if(event.title.includes("Neon Night Market")) {
            id = event.id;
            break;
        }
    }


    let response = await api.updateEvent(token, id, updateData);
    // console.log(response);
    expect(response.data.price).toEqual(updateData.price.toString());

});

test('Delete Event', async() => {
    let id;
    //Find the ID of the event to delete
    let initialEvents = await api.getEvents(token);
    let initialCount = initialEvents.pagination.total;
    for(let i = 0; i < initialCount; i++) {
        let event = initialEvents.data[i];
        if(event.title.includes("Neon Night Market"))
            id = event.id;
    }
    //Fail fast if there's no event to delete
    expect(id).toBeDefined();

    let response = await api.deleteEvent(token, id);
    // console.log(response);

    //Get updated list of event IDs
    let updatedIDs = [];
    let updatedEvents = await api.getEvents(token);
    let updatedCount = updatedEvents.pagination.total;
    for(let i = 0; i < updatedCount; i++) {
        let event = updatedEvents.data[i];
        updatedIDs.push(event.id);
    }

    expect(response.message).toEqual("Event deleted successfully");
    expect(updatedIDs).not.toContain(id);
});