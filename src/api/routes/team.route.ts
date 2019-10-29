import { Express, Request, Response } from "express-serve-static-core";
import { isAuthenticated } from "../middleware/permissions.validation.middleware";
import { containsTeamId } from "../middleware/requests.validation.middleware";
import { TeamsStore } from "../../dal/manipulation/stores/specific/teams.store";

export function mapTeamRoutes(app: Express) {

    app.post('/api/team/members', isAuthenticated, containsTeamId, async (
        req: Request,
        res: Response
    ) => {
        try {
            const users = await TeamsStore.GetTeamMembers(res.locals.teamId);
            if (users) {
                res.populate(users);
            } else {
                return res.answer(404, 'Team not found');
            }
        } catch (error) {
            console.log(error);
            return res.answer(500, error.message);
        }
    });
}