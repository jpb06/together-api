import { Express, Request, Response } from "express-serve-static-core";
import { isAuthenticated } from "../middleware/permissions.validation.middleware";
import { containsTeamId, containsTeamName } from "../middleware/requests.validation.middleware";
import { TeamsStore } from "../../dal/manipulation/stores/specific/teams.store";
import { CacheService } from "../../business/cache.service";
import { UsersStore } from "../../dal/manipulation/stores/specific/users.store";
import { userToTerseUser } from "../../dal/types/conversion.helper";

export function mapTeamRoutes(app: Express) {

    app.post('/api/team/create', isAuthenticated, containsTeamName, async (
        req: Request,
        res: Response
    ) => {
        try {
            const teamName = <string>res.locals.teamName;
            const creatorEmail = <string>res.locals.email;

            const isExisting = await TeamsStore.exists(teamName);
            if (isExisting) {
                return res.status(400).json({
                    status: 400,
                    error: 'Team already exists'
                });
            } else {
                const teamId = await TeamsStore.create(teamName);
                if (teamId) {
                    const creator = await CacheService.GetUserByEmail(creatorEmail);
                    if (creator) {
                        const teamAlterationResult = await TeamsStore.addUserToTeam(teamId, {
                            ...userToTerseUser(creator),
                            status: 'creator'
                        });
                        const userAlterationResult = await UsersStore.addToTeam(creator.email, teamId);

                        if (teamAlterationResult && userAlterationResult) {
                            res.populate(teamId);
                        } else {
                            res.answer(500, `Unable to add user ${creator.email} to team ${teamName}`);
                        }
                    } else {
                        res.answer(500, `Unable to find team ${teamName} creator`);
                    }
                } else {
                    res.answer(500, `Unable to create team ${teamName}`);
                }
            }
        } catch (error) {
            console.log(error);
            return res.answer(500, error.message);
        }
    });

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