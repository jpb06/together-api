import { Express, Request, Response } from "express-serve-static-core";
import { isAuthenticated } from "../middleware/permissions.validation.middleware";
import { DailyStore } from "../../dal/manipulation/stores/specific/daily.store";
import { CacheService } from "../../business/cache.service";

export function mapUserRoutes(app: Express) {

    app.post('/api/daily/addunforeseen', isAuthenticated, async (
        req: Request,
        res: Response
    ) => {
        try {
            if (!req.validateUnforeseen()) {
                return res.answer(400, 'Expecting a ticket for a daily');
            }

            const creator = await CacheService.GetUser(res.locals.email);
            if (creator) {
                let result = await DailyStore.addUnforeseenTicket(req.body.date, req.body.teamId, creator, req.body.name);
                if (result) {
                    res.answer(201, `${req.body.name} created`);
                } else {
                    res.answer(500, `Unable to create ticket ${req.body.name}`);
                }
            } else {
                res.answer(500, "Unable to retrieve ticket creator");
            }
        } catch (error) {
            console.log(error);
            return res.answer(500, error.message);
        }
    });

    app.post('/api/daily/removeunforeseen', isAuthenticated, async (
        req: Request,
        res: Response
    ) => {
        try {
            if (!req.validateUnforeseen()) {
                return res.answer(400, 'Expecting a ticket for a daily');
            }

            let result = await DailyStore.removeUnforeseenTicket(req.body.date, req.body.teamId, req.body.name);
            if (result) {
                res.answer(200, `${req.body.name} deleted`);
            } else {
                res.answer(500, `Unable to delete ticket ${req.body.name}`);
            }
        } catch (error) {
            console.log(error);
            return res.answer(500, error.message);
        }
    });
}