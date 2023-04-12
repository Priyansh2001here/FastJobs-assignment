import {z} from "zod";


export const scheduleMeetingSchema = z.object({

    accessToken: z.string({
        required_error: "access code is required",
    }),
    refreshToken: z.string({
        required_error: "refresh code is required",
    }),
    attendee: z.string({
        required_error: "attendee email is required",
    }),
    timeMin: z
        .string({
            required_error: "timeMin is required",
        }),
    timeMax: z
        .string({
            required_error: "timeMax is required",
        })
});

export const bookSlotSchema = z.object({

    accessToken: z.string({
        required_error: "access code is required",
    }),
    start: z.string({
        required_error: "start is required",
    }),
    refreshToken: z.string({
        required_error: "refresh code is required",
    }),
    duration: z
        .number({
            required_error: "duration(minutes) is required",
        }),
});
