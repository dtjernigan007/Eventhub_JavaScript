import {test, expect} from '../Utils/fixtures';

// const userData = JSON.parse(JSON.stringify(require("../resources/user_data.json")));


test.beforeAll(async ({api}) =>{
    let response = await api.deleteAllBookings();
    console.log(response)
});

//In order to run in parallel the tests needed to be consolidated into 1 test.
test('Book and Cancel Event', async({api}) => {
    let eventId = 3;
    let numTix = 2;
    let initialDetails = await api.getEventDetails(eventId);
    // console.log(initialDetails);
    let availSeats = initialDetails.data.availableSeats;

    let response = await api.bookEvent(eventId, numTix);
    expect(response.message).toEqual("Booking confirmed!")

    let updatedDetails = await api.getEventDetails(eventId);
    // console.log(updatedDetails);
    let updatedAvailSeats = updatedDetails.data.availableSeats;

    expect.soft(updatedAvailSeats).toEqual(availSeats - numTix);

    let bookings = await api.getBookings();
    // console.log(bookings);

    let numBookings = bookings.pagination.total;
    expect.soft(numBookings).toEqual(1);

    let bookingId;
    if(numBookings > 0)
        bookingId = bookings.data[0].id;

    let cancel = await api.cancelBooking(bookingId);
    // console.log(cancel);

    expect.soft(cancel.message).toEqual("Booking cancelled");

    let updatedBookings = await api.getBookings();
    let updatedNumBookings = updatedBookings.pagination.total;
    expect(updatedNumBookings).toEqual(numBookings - 1);
});