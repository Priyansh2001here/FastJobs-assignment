import {google} from "googleapis";

function calculateAvailability(
    // events,
    timeMin: string,
    timeMax: string,
    slotDurationInMinutes: number
) {
    const availableSlots = [];

    let slotStart = new Date(timeMin);

    while (slotStart.toISOString() < timeMax) {
        const slotEnd = new Date(slotStart);
        slotEnd.setMinutes(slotStart.getMinutes() + slotDurationInMinutes);

        // const slotIsFree: boolean = events.every((event) => {
        //     if (event.start && event.start.dateTime && event.end && event.end.dateTime) {
        //         const eventStart = new Date(event.start.dateTime);
        //         const eventEnd = new Date(event.end.dateTime);
        //         return slotEnd <= eventStart || slotStart >= eventEnd;
        //     }
        // });
        //
        //
        // if (slotIsFree) {
        //     availableSlots.push({start: slotStart.toISOString(), end: slotEnd.toISOString()});
        // }

        slotStart.setMinutes(slotStart.getMinutes() + slotDurationInMinutes);
    }

    // return availableSlots;
}

export async function getAvailability(accessToken: string, timeMin: string, timeMax: string, slotDurationInMinutes: number) {

    // apna hardcoded access token

    const calendar = google.calendar({
        version: "v3",
        auth: accessToken,
    });




    // const events = eventsResponse.data.items;

    // return availability;
}

