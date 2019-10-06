import { Express, Request, Response } from "express-serve-static-core";
import { isAuthenticated } from "../middleware/permissions.validation.middleware";
import { containsTeamId } from "../middleware/requests.validation.middleware";
import { UsersStore } from "../../dal/manipulation/stores/specific/users.store";

export function mapTeamRoutes(app: Express) {

    app.post('/api/team/members', isAuthenticated, containsTeamId, async (
        req: Request,
        res: Response
    ) => {
        try {
            const users = await UsersStore.GetTeamMembers(res.locals.teamId);

            res.populate(users);
        } catch (error) {
            console.log(error);
            return res.answer(500, error.message);
        }
    });
}