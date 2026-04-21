import {test, expect, request} from "@playwright/test";
import {APIUtils} from "../Utils/APIUtils";

// const userData = JSON.parse(JSON.stringify(require("../resources/user_data.json")));
let eventId = 3;
let numTix = 2;
let api;
let token;


test.beforeAll(async () => {

    const apiContext = await request.newContext();
    const userData = JSON.parse(JSON.stringify(require("../resources/user_data.json")));
    api = new APIUtils(apiContext, userData);
    token = await api.login();
    // console.log(token);
})

test('Book Event', async() => {

    let initialDetails = await api.getEventDetails(token, eventId);
    // console.log(initialDetails);
    let availSeats = initialDetails.data.availableSeats;

    let response = await api.bookEvent(token, eventId, numTix);
    expect(response.message).toEqual("Booking confirmed!")

    let updatedDetails = await api.getEventDetails(token, eventId);
    // console.log(updatedDetails);
    let updatedAvailSeats = updatedDetails.data.availableSeats;

    expect(updatedAvailSeats).toEqual(availSeats - numTix);
});

test('Cancel booking', async() => {

    let response = await api.getBookings(token);
    console.log(response);

    let numBookings = response.pagination.total;

    expect(numBookings).toBeGreaterThan(0);

    let bookingId;
    if(numBookings > 0)
        bookingId = response.data[0].id;

    let cancel = await api.cancelBooking(token, bookingId);
    console.log(cancel);

    expect(cancel.message).toEqual("Booking cancelled");

    let updatedBookings = await api.getBookings(token);
    let updatedNumBookings = updatedBookings.pagination.total;
    expect(updatedNumBookings).toEqual(numBookings - 1);

});

test.afterAll(async () => {

    let response = await api.deleteAllBookings(token);
    console.log(response)


});