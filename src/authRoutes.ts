import {Request} from "express"
import {Router} from 'express';
import {getTokens, GOOGLE_AUTH_URL} from "./services";

export const authRouter = Router();

authRouter.get('/getauth', (req, res) => {
    res.redirect(GOOGLE_AUTH_URL)
})

authRouter.get('/auth', async (req: Request, res) => {
    if (req.query.code !== undefined) {
        const code: string = (req.query.code).toString();
        res.json(await getTokens(code));
    }
})
