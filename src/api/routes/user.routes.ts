﻿import { Express, Request, Response } from "express-serve-static-core";
import { isAuthenticated } from "../middleware/permissions.validation.middleware";
import { containsUserId, containsNewUser, containsTeamId, containsUserEmail } from "../middleware/requests.validation.middleware";
import { ObjectId } from "bson";
import { TeamsStore } from "../../dal/manipulation/stores/specific/teams.store";
import { DailyStore } from "../../dal/manipulation/stores/specific/daily.store";
import { TimeLineEntry, NewUserData } from "../../dal/types/internal.types";
import moment = require("moment");
import { UsersStore } from "../../dal/manipulation/stores/specific/users.store";
import { CacheService } from "../../business/cache.service";
import { userToTerseUser } from "../../dal/types/conversion.helper";
import { MembershipRequest, TerseUser } from "../../dal/types/persisted.types";

export function mapUserRoutes(app: Express) {

    app.post('/api/user/create', containsNewUser, async (
        req: Request,
        res: Response
    ) => {
        try {
            const newUser = <NewUserData>res.locals.newUser;

            const existingUser = await CacheService.GetUserByEmail(newUser.email);
            if (existingUser) {
                return res.status(400).json({
                    status: 400,
                    error: 'Mail already used'
                });
            } else {

                const persistedUser = await UsersStore.create(
                    newUser.email,
                    newUser.lastName, newUser.firstName,
                    '', // no avatar for now
                    newUser.password);

                if (persistedUser) {
                    return res.status(200).json({
                        status: 200,
                        user: {
                            id: persistedUser._id,
                            email: persistedUser.email,
                            lastName: persistedUser.lastName,
                            firstName: persistedUser.firstName,
                            avatarName: persistedUser.avatarName,
                        }
                    });
                } else {
                    res.answer(500, 'Unable to create user');
                }
            }



        } catch (error) {
            console.log(error);
            return res.answer(500, error.message);
        }
    });

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

    app.post('/api/user/requestMembership', isAuthenticated, containsUserEmail, containsTeamId, async (
        req: Request,
        res: Response
    ) => {
        try {
            const referrerEmail = <string>res.locals.email; 
            const targetUserEmail = <string>res.locals.userEmail;
            const teamId = <ObjectId>res.locals.teamId;

            const referrer = await CacheService.GetUserByEmail(referrerEmail);
            if (!referrer) {
                return res.answer(520, 'Unable to get the membership request referrer');
            }

            const targetUser = await CacheService.GetUserByEmail(targetUserEmail);
            if (!targetUser) {
                return res.answer(520, 'We could not find any user matching this email. Mind checking again the address for any typo?');
            }

            const team = await TeamsStore.get(teamId);
            if (!team) {
                return res.answer(520, 'Unable to locate the selected team');
            }

            if (team.membershipRequests.find(el => (<TerseUser>el.user)._id.equals(targetUser._id))
            ||  team.members.find(el => el._id.equals(targetUser._id))) {
                return res.answer(520, 'This user has already been added to the team');
            }

            const membershipRequest: MembershipRequest = {
                teamId: teamId,
                referrer: userToTerseUser(referrer),
                date: moment().toDate()
            };
            const terseTargetUser = userToTerseUser(targetUser);

            targetUser.membershipRequests.push(membershipRequest);
            team.membershipRequests.push({
                ...membershipRequest,
                user: terseTargetUser
            });

            const userAlterationresult = await UsersStore.Update(targetUser);
            const teamAlterationresult = await TeamsStore.Update(team);
            if (userAlterationresult && teamAlterationresult) {
                return res.populate(terseTargetUser);
            } else {
                return res.answer(520, 'An error occured while saving the membership request');
            }
        } catch (error) {
            console.log(error);
            return res.answer(500, error.message);
        }
    });

}