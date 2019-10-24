import { Express, Request, Response } from "express-serve-static-core";
import { isAuthenticated } from "../middleware/permissions.validation.middleware";
import { DailyStore } from "../../dal/manipulation/stores/specific/daily.store";
import { CacheService } from "../../business/cache.service";
import { UnforeseenData, DailyPredicate, SubjectData } from "../../dal/types/internal.types";
import { containsTicket, containsDailyPredicate, containsDurationIndicator, containsAssignee, containsSubject, containsSubjectId } from "../middleware/requests.validation.middleware";
import { ObjectId } from "bson";

export function mapDailyRoutes(app: Express) {

    app.post('/api/daily', isAuthenticated, containsDailyPredicate, async (
        req: Request,
        res: Response
    ) => {
        try {
            const predicate = <DailyPredicate>res.locals.dailyPredicate;

            const result = await DailyStore.getCreateDaily(predicate.date, predicate.teamId);
            res.populate(result);

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

            const result = await DailyStore.setDuration(predicate.date, predicate.teamId, req.body.durationIndicator);
            if (result) {
                res.answer(200, `Duration set for ${predicate.date}`);
            } else {
                res.answer(500, `Unable to set daily duration for ${predicate.date}`);
            }
        } catch (error) {
            return res.answer(500, error.message);
        }
    });

    app.post('/api/daily/unforeseen/add', isAuthenticated, containsTicket, async (
        req: Request,
        res: Response
    ) => {
        try {
            const ticket = <UnforeseenData>res.locals.ticket;

            const creator = await CacheService.GetUserByEmail(res.locals.email);
            if (creator) {
                const result = await DailyStore.addUnforeseenTicket(ticket.date, ticket.teamId, creator, ticket.ticketName);
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

    app.post('/api/daily/unforeseen/remove', isAuthenticated, containsTicket, async (
        req: Request,
        res: Response
    ) => {
        try {
            const ticket = <UnforeseenData>res.locals.ticket;

            const result = await DailyStore.removeUnforeseenTicket(ticket.date, ticket.teamId, ticket.ticketName);
            if (result) {
                res.answer(200, `${ticket.ticketName} deleted`);
            } else {
                res.answer(500, `Unable to delete ticket ${ticket.ticketName}`);
            }
        } catch (error) {
            return res.answer(500, error.message);
        }
    });

    app.post('/api/daily/done/add', isAuthenticated, containsTicket, containsAssignee, async (
        req: Request,
        res: Response
    ) => {
        try {
            const ticket = <UnforeseenData>res.locals.ticket;
            const assigneeId = <ObjectId>res.locals.assigneeId;

            const creator = await CacheService.GetUserByEmail(res.locals.email);
            const assignee = await CacheService.GetUserById(assigneeId);
            if (creator && assignee) {
                const result = await DailyStore.addDoneTicket(ticket.date, ticket.teamId, creator, assignee, ticket.ticketName);
                if (result) {
                    res.answer(201, `${ticket.ticketName} created`);
                } else {
                    res.answer(500, `Unable to create ticket ${ticket.ticketName}`);
                }
            } else {
                if (!creator) {
                    res.answer(500, "Unable to retrieve ticket creator");
                } else if (!assignee) {
                    res.answer(500, "Unable to retrieve ticket assignee");
                }
            }
        } catch (error) {
            return res.answer(500, error.message);
        }
    });

    app.post('/api/daily/done/remove', isAuthenticated, containsTicket, async (
        req: Request,
        res: Response
    ) => {
        try {
            const ticket = <UnforeseenData>res.locals.ticket;

            const result = await DailyStore.removeDoneTicket(ticket.date, ticket.teamId, ticket.ticketName);
            if (result) {
                res.answer(200, `${ticket.ticketName} deleted`);
            } else {
                res.answer(500, `Unable to delete ticket ${ticket.ticketName}`);
            }
        } catch (error) {
            return res.answer(500, error.message);
        }
    });

    app.post('/api/daily/subjects/add', isAuthenticated, containsDailyPredicate, containsSubject, async (
        req: Request,
        res: Response
    ) => {
        try {
            const predicate = <DailyPredicate>res.locals.dailyPredicate;
            const subject = <SubjectData>res.locals.subject;

            const creator = await CacheService.GetUserByEmail(res.locals.email);
            if (creator) {
                const subjectId = await DailyStore.addSubject(predicate.date, predicate.teamId, creator, subject.type, subject.description);
                if (subjectId) {
                    res.answer(201, subjectId.toHexString());
                } else {
                    res.answer(500, 'Unable to create subject');
                }
            } else {
                res.answer(500, "Unable to retrieve subject creator");
            }
        } catch (error) {
            return res.answer(500, error.message);
        }
    });

    app.post('/api/daily/subjects/remove', isAuthenticated, containsDailyPredicate, containsSubjectId, async (
        req: Request,
        res: Response
    ) => {
        try {
            const predicate = <DailyPredicate>res.locals.dailyPredicate;
            const subjectId = <ObjectId>res.locals.subjectId;

            const result = await DailyStore.removeSubject(predicate.date, predicate.teamId, subjectId);
            if (result) {
                res.answer(200, 'Subject deleted');
            } else {
                res.answer(500, 'Unable to delete subject');
            }
        } catch (error) {
            return res.answer(500, error.message);
        }
    });
}