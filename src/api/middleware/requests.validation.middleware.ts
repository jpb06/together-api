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

export async function containsTicket(
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

export async function containsAssignee(
    req: Request,
    res: Response,
    next: NextFunction
) {
    if (req.body.assigneeId === undefined
     || req.body.assigneeId === ''
     || !containsHex(req.body.assigneeId, 24)) {
        return res.answer(400, 'Expecting an assignee id');
    }

    const assigneeId = ObjectId.createFromHexString(req.body.assigneeId);
    res.locals.assigneeId = assigneeId;

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


export async function containsSubject(
    req: Request,
    res: Response,
    next: NextFunction
) {
    if ((req.body.type === undefined || req.body.type === '') ||
        (req.body.description === undefined || req.body.description === '')) {
        return res.answer(400, 'Expecting a subject');
    }

    const type = parseInt(req.body.type);
    if (isNaN(type))
        return res.answer(400, 'Expecting a subject');

    res.locals.subject = {
        type: type,
        description: req.body.description
    };

    next();
};

export async function containsSubjectId(
    req: Request,
    res: Response,
    next: NextFunction
) {
    if (req.body.subjectId === undefined ||
        req.body.subjectId === '' ||
        !containsHex(req.body.subjectId, 24)) {
        return res.answer(400, 'Expecting a subject id');
    }

    const subjectId = ObjectId.createFromHexString(req.body.subjectId);

    res.locals.subjectId = subjectId;

    next();
}

export async function containsFeeling(
    req: Request,
    res: Response,
    next: NextFunction
) {
    if ((req.body.type === undefined || req.body.type === '') ||
        (req.body.comment === undefined || req.body.comment === '')) {
        return res.answer(400, 'Expecting a feeling');
    }

    const type = parseInt(req.body.type);
    if (isNaN(type))
        return res.answer(400, 'Expecting a feeling');

    res.locals.feeling = {
        type: type,
        comment: req.body.comment
    };

    next();
};

export async function containsFeelingId(
    req: Request,
    res: Response,
    next: NextFunction
) {
    if (req.body.feelingId === undefined ||
        req.body.feelingId === '' ||
        !containsHex(req.body.feelingId, 24)) {
        return res.answer(400, 'Expecting a feeling id');
    }

    const feelingId = ObjectId.createFromHexString(req.body.feelingId);

    res.locals.feelingId = feelingId;

    next();
}