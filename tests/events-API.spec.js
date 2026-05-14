import {test, expect} from '../Utils/fixtures';
// import {APIUtils} from "../Utils/APIUtils";
// const userData = JSON.parse(JSON.stringify(require("../resources/user_data.json")));

// let api;
// let token;
const eventData = JSON.parse(JSON.stringify(require("../resources/event_data.json")));

// test.beforeAll(async () => {
//
//     const apiContext = await request.newContext();
//     api = new APIUtils(apiContext, userData);
//     token = await api.login();
//     // console.log(token);
// });

test.beforeAll(async ({ api }) => {
    await api.deleteAllEvents();         // no token arg needed — it's on this.token
});

test('Verify Default Events', async({api}) => {

    let expectedEvents = ["Dilli Diwali Mela", "Hollywood Monsoon Night — Los Angeles", "World Tech Summit"];


    let events = await api.getEvents();
    // console.log(events)
    let actualEvents = events.data.map(e => e.title);
    expect(actualEvents).toEqual(expect.arrayContaining(expectedEvents));
});

test('Add & Verify new event', async({api}) => {
    let response = await api.createEvent(eventData);
    // console.log(response)
    expect(response.message).toEqual("Event created successfully");

    let id = response.data.id;
    let verifyEvent = await api.getEventDetails(id);
    expect.soft(verifyEvent.data.title).toEqual(eventData.title);
    expect.soft(verifyEvent.data.description).toEqual(eventData.description);
    expect.soft(verifyEvent.data.category).toEqual(eventData.category);
    expect.soft(verifyEvent.data.venue).toEqual(eventData.venue);
    expect.soft(verifyEvent.data.city).toEqual(eventData.city);
    expect.soft(verifyEvent.data.price).toEqual(eventData.price.toString());
});

test('Update Event', async({api}) => {

    const eventToEdit = JSON.parse(JSON.stringify(require("../resources/eventToUpdate.json"))).initial;
    const newEventDetails  = JSON.parse(JSON.stringify(require("../resources/eventToUpdate.json"))).update;

    let createEvent = await api.createEvent(eventToEdit);
    let id = createEvent.data.id;

    let updateEvent = await api.updateEvent(id, newEventDetails);
    // console.log(updateEvent);
    let data = updateEvent.data;

    expect.soft(data.title).toEqual(newEventDetails.title);
    expect.soft(data.description).toEqual(newEventDetails.description);
    expect.soft(data.category).toEqual(newEventDetails.category);
    expect.soft(data.venue).toEqual(newEventDetails.venue);
    expect.soft(data.city).toEqual(newEventDetails.city);
    expect.soft(data.eventDate).toEqual(newEventDetails.eventDate);
    expect.soft(data.price.toString()).toEqual(newEventDetails.price.toString());
    expect.soft(data.totalSeats).toEqual(newEventDetails.totalSeats);
    expect.soft(data.availableSeats).toEqual(newEventDetails.totalSeats);
    expect.soft(data.imageUrl).toEqual(newEventDetails.imageUrl);
    /*
    availableSeats is not updated during the update call, which is a bug.
     */
});

test('Delete Event', async({api}) => {
    const eventToDelete = JSON.parse(JSON.stringify(require("../resources/eventToDelete.json")));
    let createEvent = await api.createEvent(eventToDelete);
    let id = createEvent.data.id;

    let response = await api.deleteEvent(id);
    // console.log(response);

    //Get current list of event IDs
    let updatedEvents = await api.getEvents();
    let updatedIDs = updatedEvents.data.map(e => e.id);

    expect(response.message).toEqual("Event deleted successfully");
    expect(updatedIDs).not.toContain(id);
});