import { Express, Request, Response } from "express-serve-static-core";
import { isAuthenticated } from "../middleware/permissions.validation.middleware";
import { DailyStore } from "../../dal/manipulation/stores/specific/daily.store";
import { CacheService } from "../../business/cache.service";
import { UnforeseenData, DailyPredicate, SubjectData, FeelingData } from "../../dal/types/internal.types";
import {
    containsTicket, containsDailyPredicate, containsDurationIndicator,
    containsSubject, containsSubjectId,
    containsFeeling, containsFeelingId, containsAssigneeEmail
} from "../middleware/requests.validation.middleware";
import { ObjectId } from "bson";

export function mapDailyRoutes(app: Express) {

    app.post('/api/daily', isAuthenticated, containsDailyPredicate, async (
        req: Request,
        res: Response
    ) => {
        try {
            const predicate = res.locals.dailyPredicate as DailyPredicate;

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
            const predicate = res.locals.dailyPredicate as DailyPredicate;

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
            const ticket = res.locals.ticket as UnforeseenData;

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
            const ticket = res.locals.ticket as UnforeseenData;

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

    app.post('/api/daily/done/add', isAuthenticated, containsTicket, containsAssigneeEmail, async (
        req: Request,
        res: Response
    ) => {
        try {
            const ticket = res.locals.ticket as UnforeseenData;
            const assigneeEmail = res.locals.assigneeEmail as string;

            const creator = await CacheService.GetUserByEmail(res.locals.email);
            const assignee = await CacheService.GetUserByEmail(assigneeEmail);
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
            const ticket = res.locals.ticket as UnforeseenData;

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
            const predicate = res.locals.dailyPredicate as DailyPredicate;
            const subject = res.locals.subject as SubjectData;

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
            const predicate = res.locals.dailyPredicate as DailyPredicate;
            const subjectId = res.locals.subjectId as ObjectId;

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

    app.post('/api/daily/feelings/add', isAuthenticated, containsDailyPredicate, containsFeeling, async (
        req: Request,
        res: Response
    ) => {
        try {
            const predicate = res.locals.dailyPredicate as DailyPredicate;
            const feeling = res.locals.feeling as FeelingData;

            const creator = await CacheService.GetUserByEmail(res.locals.email);
            if (creator) {
                const feelingId = await DailyStore.addFeeling(predicate.date, predicate.teamId, creator, feeling.type, feeling.comment);
                if (feelingId) {
                    res.answer(201, feelingId.toHexString());
                } else {
                    res.answer(500, 'Unable to create feeling');
                }
            } else {
                res.answer(500, "Unable to retrieve feeling creator");
            }
        } catch (error) {
            return res.answer(500, error.message);
        }
    });

    app.post('/api/daily/feelings/remove', isAuthenticated, containsDailyPredicate, containsFeelingId, async (
        req: Request,
        res: Response
    ) => {
        try {
            const predicate = res.locals.dailyPredicate as DailyPredicate;
            const feelingId = res.locals.feelingId as ObjectId;

            const result = await DailyStore.removeFeeling(predicate.date, predicate.teamId, feelingId);
            if (result) {
                res.answer(200, 'Feeling deleted');
            } else {
                res.answer(500, 'Unable to delete feeling');
            }
        } catch (error) {
            return res.answer(500, error.message);
        }
    });
}