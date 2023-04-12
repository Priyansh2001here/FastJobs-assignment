import {AnyZodObject} from "zod";
import {NextFunction, Request, Response} from "express";

export const validate = (schema: AnyZodObject) =>
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            await schema.parseAsync(req.body);
            return next();
        } catch (error) {
            return res.status(400).json(error);
        }
    };
