import dotenv from "dotenv";
import express from 'express';

dotenv.config({
    path: '.env'
});


export const clientId = process.env.GOOGLE_CLIENT_ID;
export const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
export const redirectUri = process.env.GOOGLE_REDIRECT_URI;
import {meetingRouter} from "./meetingRoutes";

import {authRouter} from "./authRoutes";

const app = express();
app.use(express.json())
const port = process.env.PORT;

app.get('/', (req, res) => {
    res.send('Express + TypeScript Server');
});

app.use("/meetings", meetingRouter)
app.use("/", authRouter)

console.log("Starting Server")
app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});