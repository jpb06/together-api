import { Express, Request, Response } from "express-serve-static-core";
import { isAuthenticated } from "../middleware/permissions.validation.middleware";

export function mapUserRoutes(app: Express) {

    app.post('/api/users/get', isAuthenticated, async (
        req: Request,
        res: Response
    ) => {
        try {


        } catch (error) {
            console.log(error);
            return res.answer(500, error.message);
        }
    });
}