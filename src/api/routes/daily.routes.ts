import { Express, Request, Response } from "express-serve-static-core";
import { isAuthenticated } from "../middleware/permissions.validation.middleware";
import { DailyStore } from "../../dal/manipulation/stores/specific/daily.store";
import { CacheService } from "../../business/cache.service";

export function mapDailyRoutes(app: Express) {

    app.post('/api/daily/unforeseen/add', isAuthenticated, async (
        req: Request,
        res: Response
    ) => {
        try {
            const data = req.validateUnforeseen();
            if (!data) {
                return res.answer(400, 'Expecting a ticket for a daily');
            }

            const creator = await CacheService.GetUser(res.locals.email);
            if (creator) {
                let result = await DailyStore.addUnforeseenTicket(data.date, data.teamId, creator, data.ticketName);
                if (result) {
                    res.answer(201, `${data.ticketName} created`);
                } else {
                    res.answer(500, `Unable to create ticket ${data.ticketName}`);
                }
            } else {
                res.answer(500, "Unable to retrieve ticket creator");
            }
        } catch (error) {
            return res.answer(500, error.message);
        }
    });

    app.post('/api/daily/unforeseen/remove', isAuthenticated, async (
        req: Request,
        res: Response
    ) => {
        try {
            const data = req.validateUnforeseen();
            if (!data) {
                return res.answer(400, 'Expecting a ticket for a daily');
            }

            let result = await DailyStore.removeUnforeseenTicket(data.date, data.teamId, data.ticketName);
            if (result) {
                res.answer(200, `${data.ticketName} deleted`);
            } else {
                res.answer(500, `Unable to delete ticket ${data.ticketName}`);
            }
        } catch (error) {
            return res.answer(500, error.message);
        }
    });

    app.post('/api/daily', isAuthenticated, async (
        req: Request,
        res: Response
    ) => {
        try {
            const data = req.validateDailyPredicate();
            if (!data) {
                return res.answer(400, 'Expecting a daily predicate');
            }

            let result = await DailyStore.getCreateDaily(data.date, data.teamId);
            res.populate(result);

        } catch (error) {
            return res.answer(500, error.message);
        }
    });
}