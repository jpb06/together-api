﻿import { Express, Request, Response } from "express-serve-static-core";
import { isAuthenticated } from "../middleware/permissions.validation.middleware";
import { containsUserId } from "../middleware/requests.validation.middleware";
import { ObjectId } from "bson";
import { TeamsStore } from "../../dal/manipulation/stores/specific/teams.store";
import { DailyStore } from "../../dal/manipulation/stores/specific/daily.store";
import { TimeLineEntry } from "../../dal/types/internal.types";
import moment = require("moment");

export function mapUserRoutes(app: Express) {

    app.post('/api/user/teams', isAuthenticated, containsUserId, async (
        req: Request,
        res: Response
    ) => {
        try {
            const userId = <ObjectId>res.locals.userId;

            const userTeams = await TeamsStore.getUserTeams(userId);
            if (userTeams) {
                res.populate(userTeams);
            } else {
                res.answer(500, 'Unable to get user teams');
            }
        } catch (error) {
            console.log(error);
            return res.answer(500, error.message);
        }
    });

    app.post('/api/user/timeline', isAuthenticated, containsUserId, async (
        req: Request,
        res: Response
    ) => {
        try {
            const userId = <ObjectId>res.locals.userId;

            const userTeams = await TeamsStore.getUserTeams(userId);
            if (userTeams) {
                let entries: Array<TimeLineEntry> = [];

                for (let i = 0; i < userTeams.length; i++) {
                    const team = userTeams[i];
                    const teamDailies = await DailyStore.getDailies(team._id);
                    entries = entries.concat(teamDailies.map(daily => ({
                        type: 1,
                        team: team,
                        entry: daily,
                        shortTitle: `Daily - ${daily.day.toString().padStart(2, '0')}/${(daily.month + 1).toString().padStart(2, '0')}/${daily.year}`,
                        date: moment.utc(`${daily.year}-${(daily.month + 1).toString().padStart(2, '0')}-${daily.day.toString().padStart(2, '0')}`)
                    })));
                }

                const sorted = entries.sort((a, b) => b.date.unix() - a.date.unix());

                res.populate(sorted);
            } else {
                res.answer(500, 'Unable to get user timeline');
            }
        } catch (error) {
            console.log(error);
            return res.answer(500, error.message);
        }
    });
}