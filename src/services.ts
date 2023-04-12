import {OAuth2Client} from "google-auth-library";
import {clientId, clientSecret, redirectUri} from "./index";
import {calendar_v3, google} from "googleapis";
import {availableSlotsMap, meetingsMap, Tokens, tokensMap} from "./dbService";

export const GOOGLE_AUTH_URL = new OAuth2Client(clientId, clientSecret, redirectUri).generateAuthUrl({
    access_type: "offline",
    prompt: 'consent',
    scope: ["https://www.googleapis.com/auth/calendar", "https://www.googleapis.com/auth/calendar.events", "https://www.googleapis.com/auth/userinfo.email", "https://www.googleapis.com/auth/userinfo.profile", "https://www.googleapis.com/auth/gmail.compose"],
});

export async function getTokens(code: string) {
    const oauth2Client = new OAuth2Client(clientId, clientSecret, redirectUri);
    const {tokens} = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    return tokens;
}

export class GoogleAPIServices {
    access_token: string
    refresh_token: string
    oauth2Client = new OAuth2Client(clientId, clientSecret, redirectUri);

    constructor(accessToken: string, refreshToken: string) {
        this.refresh_token = refreshToken;
        this.access_token = accessToken;

        this.oauth2Client.setCredentials({
            access_token: accessToken,
            refresh_token: refreshToken
        })
    }

    calculateFreeSlots(timeMin: string, timeMax: string, busySlots: any[]): any[] {
        const freeSlots = [];
        let currentTime = new Date(timeMin);

        busySlots.forEach((busySlot) => {
            const busyStartTime = new Date(busySlot.start);
            const busyEndTime = new Date(busySlot.end);

            if (currentTime < busyStartTime) {
                freeSlots.push({start: currentTime.toISOString(), end: busyStartTime.toISOString()});
            }
            currentTime = busyEndTime;
        });

        if (currentTime < new Date(timeMax)) {
            freeSlots.push({start: currentTime.toISOString(), end: timeMax});
        }

        return freeSlots;
    }

    getUserDetails() {

        const oauth2 = google.oauth2({
            auth: this.oauth2Client,
            version: 'v2'
        });
        return oauth2.userinfo.get();
    }

    async sendSchedulingEmail(meetingID: string, recipient: string, sender: string) {
        const rawMessage = this.formatEmail(meetingID, recipient, sender);
        this.sendEmail(
            recipient, rawMessage
        )
    }

    async sendEmail(recipientEmail: string, message: string) {
        let mailer = google.gmail({
            version: 'v1',
            auth: this.oauth2Client
        })

        const email =
            `To: ${recipientEmail}
Subject: Invitation
Content-Type: text/plain; charset=utf-8

${message}`;

        const base64Email = Buffer.from(email).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

        try {
            const response = await mailer.users.messages.send({
                userId: 'me',
                requestBody: {
                    raw: base64Email,
                },
            });

            console.log('Email sent:', response.data);
        } catch (error) {
            console.error('Failed to send email:', error);
        }
    }

    formatEmail(meetingID: string, recipient: string, sender: string) {
        return `
        Hi ${recipient}, ${sender} want's to schedule a meeting with you, this is your meeting ID ${meetingID}`
    }

    async getAvailableSlots(timeMin: string, timeMax: string) {
        const calendar = google.calendar({
            auth: this.oauth2Client,
            version: "v3",
        });
        const availableCals = await calendar.calendarList.list()
        const calendar_ids = availableCals.data.items;
        const calendarId = calendar_ids![0].id!


        const response = await calendar.freebusy.query({
            requestBody: {
                timeMin: timeMin,
                timeMax: timeMax,
                timeZone: 'UTC',
                items: [{id: calendarId}],
            },
        });


        const busySlots = response!.data!.calendars![calendarId].busy!;
        return this.calculateFreeSlots(timeMin, timeMax, busySlots);
    }


    isSlotAvailable(availableSlots: any[], start: Date, end: Date): boolean {
        for (const slot of availableSlots) {
            const slotStart = new Date(slot.start);
            const slotEnd = new Date(slot.end);

            if (start >= slotStart && end <= slotEnd) {
                return true;
            }
        }

        return false;
    }
    async addEventToCalendar(event: Record<any, any>){
        const calendar = google.calendar({version: 'v3', auth: this.oauth2Client});
        const availableCals = await calendar.calendarList.list()
        const calendar_ids = availableCals.data.items;
        const calendarId = calendar_ids![0].id!

        const response = await calendar.events.insert({
            calendarId: calendarId,
            requestBody: event,
        });
        return response;
    }
    async bookSlotForHost(start: Date, end: Date, meetingID: string, hostTokens: Tokens, host: string, attendee: string){
        const hostGIns = new GoogleAPIServices(hostTokens.accessToken, hostTokens.refreshToken);
        const event = {
            summary: 'Scheduled Meeting',
            start: {
                dateTime: start,
                timeZone: 'UTC',
            },
            end: {
                dateTime: end,
                timeZone: 'UTC',
            },
            attendees: [
                {email: host},
                {email: attendee},
            ],
        };

        return await hostGIns.addEventToCalendar(event)


    }
    async bookSlot(start: Date, end: Date, meetingID: string) {
        const {host, attendee} = meetingsMap[meetingID];
        const availableSlots = availableSlotsMap[meetingID];
        const hostTokens = tokensMap[host];
        const isSlotAvailable = this.isSlotAvailable(availableSlots, start, end);

        if (!isSlotAvailable) {
            throw Error('Host Slot Booked')
        }

        const response = await this.bookSlotForHost(start, end, meetingID, hostTokens, host, attendee)

        try {
            console.log('Meeting scheduled:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error scheduling meeting:', error);
            throw error;
        }
    }

}
