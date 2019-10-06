import { Express, Request, Response } from "express-serve-static-core";
import { isAuthenticated } from "../middleware/permissions.validation.middleware";
import { DailyStore } from "../../dal/manipulation/stores/specific/daily.store";
import { CacheService } from "../../business/cache.service";
import { UnforeseenData, DailyPredicate } from "../../dal/types/internal.types";
import { containsUnforeseenTicket, containsDailyPredicate, containsDurationIndicator } from "../middleware/requests.validation.middleware";

export function mapDailyRoutes(app: Express) {

    app.post('/api/daily', isAuthenticated, containsDailyPredicate, async (
        req: Request,
        res: Response
    ) => {
        try {
            const predicate = <DailyPredicate>res.locals.dailyPredicate;

            setTimeout(async () => {
                let result = await DailyStore.getCreateDaily(predicate.date, predicate.teamId);
                res.populate(result);
            }, 3000);

        } catch (error) {
            return res.answer(500, error.message);
        }
    });

    app.post('/api/daily/setDuration', isAuthenticated, containsDailyPredicate, containsDurationIndicator, async (
        req: Request,
        res: Response
    ) => {
        try {
            const predicate = <DailyPredicate>res.locals.dailyPredicate;

            let result = await DailyStore.setDuration(predicate.date, predicate.teamId, req.body.durationIndicator);
            if (result) {
                res.answer(200, `Duration set for ${predicate.date}`);
            } else {
                res.answer(500, `Unable to set daily duration for ${predicate.date}`);
            }
        } catch (error) {
            return res.answer(500, error.message);
        }
    });

    app.post('/api/daily/unforeseen/add', isAuthenticated, containsUnforeseenTicket, async (
        req: Request,
        res: Response
    ) => {
        try {
            const ticket = <UnforeseenData>res.locals.ticket;

            const creator = await CacheService.GetUser(res.locals.email);
            if (creator) {
                let result = await DailyStore.addUnforeseenTicket(ticket.date, ticket.teamId, creator, ticket.ticketName);
                if (result) {
                    res.answer(201, `${ticket.ticketName} created`);
                } else {
                    res.answer(500, `Unable to create ticket ${ticket.ticketName}`);
                }
            } else {
                res.answer(500, "Unable to retrieve ticket creator");
            }
        } catch (error) {
            return res.answer(500, error.message);
        }
    });

    app.post('/api/daily/unforeseen/remove', isAuthenticated, containsUnforeseenTicket, async (
        req: Request,
        res: Response
    ) => {
        try {
            const ticket = <UnforeseenData>res.locals.ticket;

            let result = await DailyStore.removeUnforeseenTicket(ticket.date, ticket.teamId, ticket.ticketName);
            if (result) {
                res.answer(200, `${ticket.ticketName} deleted`);
            } else {
                res.answer(500, `Unable to delete ticket ${ticket.ticketName}`);
            }
        } catch (error) {
            return res.answer(500, error.message);
        }
    });
}