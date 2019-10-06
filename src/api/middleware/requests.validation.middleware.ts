import { Request, Response, NextFunction } from 'express';
import { containsHex, isDateValid } from '../../business/util/validation.util';
import { ObjectId } from 'bson';
import { durationRanges } from '../../dal/types/static.data';

export async function containsIdentifiers(
    req: Request,
    res: Response,
    next: NextFunction
) {
    if ((req.body.login === undefined || req.body.login === '') ||
        (req.body.password === undefined || req.body.password === '')) {
        return res.answer(400, 'Expecting identifiers');
    }

    next();
};

export async function containsUnforeseenTicket(
    req: Request,
    res: Response,
    next: NextFunction
) {
    if ((req.body.ticket === undefined || req.body.ticket === '') ||
        (req.body.date === undefined || req.body.date === '') ||
        (req.body.teamId === undefined || req.body.teamId === '')) {
        return res.answer(400, 'Expecting a ticket for a daily');
    }

    const date = new Date(req.body.date);

    if (!isDateValid(date)) return undefined;
    if (!containsHex(req.body.teamId, 24)) {
        return res.answer(400, 'Expecting a ticket for a daily');
    };

    const teamId = ObjectId.createFromHexString(req.body.teamId);

    res.locals.ticket = {
        ticketName: req.body.ticket,
        teamId: teamId,
        date: date
    };

    next();
};

export async function containsDailyPredicate(
    req: Request,
    res: Response,
    next: NextFunction
) {
    if ((req.body.date === undefined || req.body.date === '') ||
        (req.body.teamId === undefined || req.body.teamId === '')) {
        return res.answer(400, 'Expecting a daily predicate');
    }

    const date = new Date(req.body.date);

    if (!isDateValid(date) || !containsHex(req.body.teamId, 24)) {
        return res.answer(400, 'Expecting a daily predicate');
    };

    const teamId = ObjectId.createFromHexString(req.body.teamId);

    res.locals.dailyPredicate = {
        teamId: teamId,
        date: date
    };

    next();
};

export async function containsDurationIndicator(
    req: Request,
    res: Response,
    next: NextFunction
) {
    if (req.body.durationIndicator === undefined
     || req.body.durationIndicator === ''
     || !durationRanges.includes(req.body.durationIndicator)) {
        return res.answer(400, 'Expecting a duration');
    }

    next();
};

export async function containsTeamId(
    req: Request,
    res: Response,
    next: NextFunction
) {
    if (req.body.teamId === undefined
     || req.body.teamId === ''
     || !containsHex(req.body.teamId, 24)) {
        return res.answer(400, 'Expecting a team id');
    }

    const teamId = ObjectId.createFromHexString(req.body.teamId);

    res.locals.teamId = teamId;

    next();
};