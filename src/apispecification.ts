import {zodToJsonSchema} from "zod-to-json-schema";
import {bookSlotSchema, scheduleMeetingSchema} from "./schemas";
const newMeetingResponseSpec = {
    type: 'object',
    properties: {
        message: {type: 'string'},
        host: {type: 'string'},
        attendee: {type: 'string'},
        timeMax: {type: 'string'},
        timeMin: {type: 'string'},
        meetingID: {type: 'string'},

    },
    required: ['message', 'host', 'attendee', 'timeMax', 'timeMin', 'meetingID'],
    additionalProperties: false,
    '$schema': 'http://json-schema.org/draft-07/schema#'
}


const meetingDetailsRes = {
    type: "object",
    properties: {
        meetingDetails: {
            "$ref": "#/components/schemas/Meeting"
        },
        availableSlots: {
            type: "array",
            items: {
                "$ref": "#/components/schemas/AvailableSlots"
            }
        }
    },
    additionalProperties: false,
    "$schema": "http://json-schema.org/draft-07/schema#",

};


const APIMessageSchema = {
    type: "object",
    properties: {
        message: {type: 'string'},
    },
    additionalProperties: false,
    "$schema": "http://json-schema.org/draft-07/schema#",

};


const scheduleMeetingAPISchema = zodToJsonSchema(scheduleMeetingSchema,);
const bookSlotAPISchema = zodToJsonSchema(bookSlotSchema,);

export const openApiDefinition = {
    openapi: "3.0.0",
    info: {
        title: "My API",
        version: "1.0.0",
    },
    paths: {
        "/meetings/": {
            post: {
                requestBody: {
                    content: {
                        "application/json": {
                            schema: scheduleMeetingAPISchema,
                        },
                    },
                },
                responses: {
                    200: {
                        content: {
                            "application/json": {
                                schema: newMeetingResponseSpec
                            },
                        },
                    },
                },
            },
        },
        "/meetings/schedule/{meetingID}": {
            post: {
                requestBody: {
                    content: {
                        "application/json": {
                            schema: bookSlotAPISchema,
                        },
                    },
                },
                responses: {
                    200: {
                        content: {
                            "application/json": {
                                "schema": APIMessageSchema
                            },
                        },
                    },
                },
            },
            get: {
                description: "Returns list of all scheduled invitations or meetings",
                responses: {
                    200: {
                        "content": {
                            "application/json": {
                                "schema": meetingDetailsRes
                            }
                        }
                    }
                }
            }
        },
    },
    components: {
        schemas: {
            "Meeting": {
                "type": "object",
                "properties": {
                    "host": {
                        "type": "string"
                    },
                    "attendee": {
                        "type": "string"
                    },
                    "timeMax": {
                        "type": "string"
                    },
                    "timeMin": {
                        "type": "string"
                    }
                },
                "additionalProperties": false
            },
            "AvailableSlots": {
                "type": "object",
                "properties": {
                    "start": {
                        "type": "string"
                    },
                    "end": {
                        "type": "string"
                    }
                },
                "additionalProperties": false
            }
        }
    }
};
