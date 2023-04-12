import {Router} from 'express';
import {availableSlotsMap, Meeting, meetingsMap, tokensMap} from "./dbService";
import {v4 as uuidv4} from 'uuid';
import {validate} from "./utils";
import {bookSlotSchema, meetingDetailsRes, newMeetingResponse, scheduleMeetingSchema} from "./schemas";
import {GoogleAPIServices} from "./services";

export const meetingRouter = Router();
/*
    returns meeting details for a specific meeting ID,


    API endpoint to schedule a meeting between a host and an attendee, queries the host's available time slots,
    sends a scheduling email, and returns a JSON response with meeting details and a confirmation message.

 */
meetingRouter.post('/', validate(scheduleMeetingSchema), async (req, res) => {
    const {
        attendee,
        timeMin,
        timeMax,
        accessToken,
        refreshToken
    } = req.body;

    const gapi: GoogleAPIServices = new GoogleAPIServices(accessToken, refreshToken);

    const userData = await gapi.getUserDetails();

    const meetingID = uuidv4().toString();

    const newMeeting: Meeting = {
        host: userData.data.email!,
        attendee: attendee,
        timeMax: timeMax,
        timeMin: timeMin
    }

    meetingsMap[meetingID] = newMeeting;

    tokensMap[newMeeting.host] = {
        accessToken: accessToken,
        refreshToken: refreshToken
    }
    const availableSlots = await gapi.getAvailableSlots(timeMin, timeMax);
    // await gapi.sendSchedulingEmail(meetingID, newMeeting.attendee, newMeeting.host);
    availableSlotsMap[meetingID] = availableSlots;
    const newMeetingRes: newMeetingResponse = {
        'meetingID': meetingID,
        ...newMeeting,
        'message': 'Meeting notification sent'
    };

    return res.json(newMeetingRes)
})

meetingRouter.get('/all', async (req, res) => {
    res.json(meetingsMap)
})


meetingRouter.get('/schedule/:meetingID', async (req, res) => {
    const meetingID = req.params['meetingID'];

    if (meetingsMap[meetingID] === undefined) {
        return  res.json({
            'message': 'meeting doesn\'t exist'
        }).status(400)
    }
    const meetingDetailsRes: meetingDetailsRes = {
        'meetingDetails': meetingsMap[meetingID],
        'availableSlots': availableSlotsMap[meetingID]
    }

    return  res.json(meetingDetailsRes)

})

meetingRouter.post('/schedule/:meetingID', validate(bookSlotSchema), async (req, res) => {
    const meetingID = req.params['meetingID'];

    if (meetingsMap[meetingID] === undefined) {
        return res.json({
            'message': 'meeting doesn\'t exist'
        }).status(400)

    }

    const {
        accessToken,
        refreshToken,
        start,
        duration
    } = req.body;

    // check user details and validate if user with access token is either host or attendee of that meeting id
    const gapi: GoogleAPIServices = new GoogleAPIServices(accessToken, refreshToken);
    const meeting = meetingsMap[meetingID];

    const userDetails = await gapi.getUserDetails();

    if (userDetails.data!.email !== meeting.attendee && userDetails.data!.email !== meeting.host) {
        return res.json({
            'message': 'meeting doesn\'t exist'
        }).status(400)
    }

    const startTime = new Date(start);
    const endTime = new Date(startTime.getTime() + duration * 60000);
    try {
        await gapi.bookSlot(startTime, endTime, meetingID);
        return  res.json({
                'message': 'slot successfully blocked and added to calendar'
            }
        )
    } catch (e: any) {
        if (e.message == 'Host Slot Booked') {
            return res.json({
                'message': 'Slot Already booked, try another time/slot'
            })
        }
        console.log(e)
        return res.json({
            'message': 'error occurred'
        }).status(500)
    }
})