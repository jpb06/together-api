import { Express, Request, Response } from "express-serve-static-core";
import { isAuthenticated } from "../middleware/permissions.validation.middleware";
import { containsUserId } from "../middleware/requests.validation.middleware";
import { ObjectId } from "bson";
import { TeamsStore } from "../../dal/manipulation/stores/specific/teams.store";

export function mapUserRoutes(app: Express) {

    app.post('/api/users/teams', isAuthenticated, containsUserId, async (
        req: Request,
        res: Response
    ) => {
        try {

            const userId = <ObjectId>res.locals.userId;

            const userTeams = await TeamsStore.getUserTeams(userId);
            if (userTeams) {
                res.populate(userTeams);
            } else {
                res.answer(500, 'Unable to get user teams');
            }
        } catch (error) {
            console.log(error);
            return res.answer(500, error.message);
        }
    });
}