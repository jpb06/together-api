import { Express, Request, Response } from "express-serve-static-core";
import { isAuthenticated } from "../middleware/permissions.validation.middleware";

export function mapSecurityRoutes(app: Express) {

    app.post('/api/getUser', isAuthenticated, async (
        req: Request,
        res: Response
    ) => {
        try {
            if (!req.validateUser()) {
                return res.answer(400, 'Expecting an user');
            }

            
        } catch (error) {
            console.log(error);
            return res.answer(500, error.message);
        }
    })
}