import { Request, Response, NextFunction } from 'express';
import { ObjectId } from 'bson';
import { UnforeseenData, DailyPredicate } from '../../dal/types/internal.types';
import { isDateValid, containsHex } from '../../business/util/validation.util';

export function extendsImplementation(
    req: Request,
    res: Response,
    next: NextFunction
) {
    // ----------------------------------------------------------------------------------------------
    // Request extends
    // ----------------------------------------------------------------------------------------------
    req.validateLogin = function (): boolean {
        if ((req.body.login === undefined || req.body.login === '') ||
            (req.body.password === undefined || req.body.password === '')) {
            return false;
        }

        return true;
    }

    req.validateUnforeseen = function (): UnforeseenData | undefined {
        if ((req.body.ticket === undefined || req.body.ticket === '') ||
            (req.body.date === undefined || req.body.date === '') ||
            (req.body.teamId === undefined || req.body.teamId === '')) {
            return undefined;
        }

        const date = new Date(req.body.date);

        if (!isDateValid(date)) return undefined;
        if (!containsHex(req.body.teamId, 24)) {
            return undefined
        };

        const teamId = ObjectId.createFromHexString(req.body.teamId);

        return {
            ticketName: req.body.ticket,
            teamId: teamId,
            date: date
        };
    }

    req.validateDailyPredicate = function (): DailyPredicate | undefined {
        if ((req.body.date === undefined || req.body.date === '') ||
            (req.body.teamId === undefined || req.body.teamId === '')) {
            return undefined;
        }

        const date = new Date(req.body.date);

        if (!isDateValid(date)) return undefined;
        if (!containsHex(req.body.teamId, 24)) {
            return undefined
        };

        const teamId = ObjectId.createFromHexString(req.body.teamId);

        return {
            teamId: teamId,
            date: date
        };
    }

    req.validateUser = function (): boolean {
        if ((req.body.user === undefined || req.body.user === '')) {
            return false;
        }

        return true;
    }
    // ----------------------------------------------------------------------------------------------
    // Response extends
    // ----------------------------------------------------------------------------------------------
    res.populate = function (data: any): Response {
        if (data === undefined) {
            return res.status(404).json({
                status: 404,
                data: null
            });
        } else {
            return res.status(200).json({
                status: 200,
                data: data
            });
        }
    }
    res.answer = function (
        status: number,
        message: string
    ): Response {
        return res.status(status).json({
            status: status,
            message: message
        });
    }
    res.terminate = function (
        status: number,
        message: string
    ): void {
        res.writeHead(status, { 'Connection': 'close' });
        res.end(message);
    }

    next();
}