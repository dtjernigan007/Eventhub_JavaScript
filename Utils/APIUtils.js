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
        return loginResponse.token;
    }

    async getEvents(token) {
        let r = await this.apiContext.get(`${this.baseURL}/events`, {
            headers: {
                "Accept": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });
        return await r.json();
    }

    async getEventDetails(token, id) {

        let r = await this.apiContext.get(`${this.baseURL}/events/${id}`, {
            headers: {
                "Accept": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });
        return await r.json();
    }

    async bookEvent(token, eventID, numTix){
        let body = {customerName: this.userData.name, customerEmail: this.userData.email, customerPhone: this.userData.phone, quantity: numTix, eventId: eventID};

        let r = await this.apiContext.post(`${this.baseURL}/bookings`, {
            data: body,
            headers: {
                "Accept": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });
        return await r.json();
    }

    async getBookings(token) {

        let r = await this.apiContext.get(`${this.baseURL}/bookings`, {
            headers: {
                "Accept": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });
        return await r.json();
    }

    async cancelBooking(token, id) {

        let r = await this.apiContext.delete(`${this.baseURL}/bookings/${id}`, {
            headers: {
                "Accept": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });
        return await r.json();
    }

    async deleteAllBookings(token) {
        let r = await this.apiContext.delete(`${this.baseURL}/bookings`, {
            headers: {
                "Accept": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        return await r.json();
    }

    async createEvent(token, eventData) {

        let r = await this.apiContext.post(`${this.baseURL}/events`, {
            data: eventData,
            headers: {
                "Accept": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        return await r.json();
    }

    async updateEvent(token, id, updateData) {

        let r = await this.apiContext.put(`${this.baseURL}/events/${id}`, {
            data: updateData,
            headers: {
                "Accept": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        return await r.json();
    }

    async deleteEvent(token, id) {

        let r = await this.apiContext.delete(`${this.baseURL}/events/${id}`, {
            headers: {
                "Accept": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });
        return await r.json();
    }




}
module.exports = {APIUtils};