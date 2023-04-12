export interface Meeting {
    host: string;
    attendee : string;
    timeMax: string;
    timeMin: string;
}
// meetingID
export const  meetingsMap : Record<string, Meeting> = {};

export interface Tokens {
    refreshToken: string;
    accessToken: string;
}
// host: string;
export const tokensMap : Record<string, Tokens> = {};

export interface availableSlots {
    start: string;
    end: string;
}

// meetingID
export const availableSlotsMap : Record<string, availableSlots[]> = {};