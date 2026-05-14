class APIUtils {

    constructor(apiContext, userData) {
        this.apiContext = apiContext;
        this.userData = userData;
        this.baseURL = "https://api.eventhub.rahulshettyacademy.com/api";
    }

    async login() {

        let r = await this.apiContext.post(`${this.baseURL}/auth/login`, {
            data: {
                email: this.userData.email,
                password: this.userData.password
            }
        });

        let loginResponse = await r.json();
        this.token = loginResponse.token;
    }

    async getEvents() {
        let r = await this.apiContext.get(`${this.baseURL}/events`, {
            headers: {
                "Accept": "application/json",
                "Authorization": `Bearer ${this.token}`
            }
        });
        return await r.json();
    }

    async getEventDetails(id) {

        let r = await this.apiContext.get(`${this.baseURL}/events/${id}`, {
            headers: {
                "Accept": "application/json",
                "Authorization": `Bearer ${this.token}`
            }
        });
        return await r.json();
    }

    async bookEvent(eventID, numTix){
        let body = {customerName: this.userData.name, customerEmail: this.userData.email, customerPhone: this.userData.phone, quantity: numTix, eventId: eventID};

        let r = await this.apiContext.post(`${this.baseURL}/bookings`, {
            data: body,
            headers: {
                "Accept": "application/json",
                "Authorization": `Bearer ${this.token}`
            }
        });
        return await r.json();
    }

    async getBookings() {

        let r = await this.apiContext.get(`${this.baseURL}/bookings`, {
            headers: {
                "Accept": "application/json",
                "Authorization": `Bearer ${this.token}`
            }
        });
        return await r.json();
    }

    async cancelBooking(id) {

        let r = await this.apiContext.delete(`${this.baseURL}/bookings/${id}`, {
            headers: {
                "Accept": "application/json",
                "Authorization": `Bearer ${this.token}`
            }
        });
        return await r.json();
    }

    async deleteAllBookings() {
        let r = await this.apiContext.delete(`${this.baseURL}/bookings`, {
            headers: {
                "Accept": "application/json",
                "Authorization": `Bearer ${this.token}`
            }
        });

        return await r.json();
    }

    async createEvent(eventData) {

        let r = await this.apiContext.post(`${this.baseURL}/events`, {
            data: eventData,
            headers: {
                "Accept": "application/json",
                "Authorization": `Bearer ${this.token}`
            }
        });

        return await r.json();
    }

    async updateEvent(id, updateData) {

        let r = await this.apiContext.put(`${this.baseURL}/events/${id}`, {
            data: updateData,
            headers: {
                "Accept": "application/json",
                "Authorization": `Bearer ${this.token}`
            }
        });

        return await r.json();
    }

    async deleteEvent(id) {

        let r = await this.apiContext.delete(`${this.baseURL}/events/${id}`, {
            headers: {
                "Accept": "application/json",
                "Authorization": `Bearer ${this.token}`
            }
        });
        return await r.json();
    }

    async deleteAllEvents() {
        const staticIDs = [3, 2, 1];
        let r = await this.getEvents();
        // console.log(r);
        let eventIDs = r.data.map(e => e.id);

        let idsToRemove = eventIDs.filter(id => !staticIDs.includes(id));
        for(let i = 0; i < idsToRemove.length; i++) {
            await this.deleteEvent(idsToRemove[i]);
        }
    }

    async fulfillCall(page, route, status, body) {

        await page.goto("https://eventhub.rahulshettyacademy.com/");

        await page.route(route,
            async route => {
                await route.fulfill({
                    status: status,
                    body: body,
                });
            });
    }




}
module.exports = {APIUtils};