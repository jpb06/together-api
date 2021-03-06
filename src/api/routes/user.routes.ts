﻿import { Express, Request, Response } from "express-serve-static-core";
import { isAuthenticated } from "../middleware/permissions.validation.middleware";
import { containsUserId, containsNewUser, containsTeamId, containsUserEmail, containsTeamName, containsInviteId, ensureFetchLastActivity } from "../middleware/requests.validation.middleware";
import { ObjectId } from "bson";
import { TeamsStore } from "../../dal/manipulation/stores/specific/teams.store";
import { DailyStore } from "../../dal/manipulation/stores/specific/daily.store";
import { NewUserData, TimeLine, TeamTimeLine, TeamWithLastActivity } from "../../dal/types/internal.types";
import moment = require("moment");
import { UsersStore } from "../../dal/manipulation/stores/specific/users.store";
import { CacheService } from "../../business/cache.service";
import {
    userToTerseUser,
    teamToBareTeam,
    teamInviteToUserTimeLineEntry,
    teamJoinRequestToUserTimeLineEntry,
    invitedUserToTeamTimeLineEntry,
    userJoinRequestToTeamTimeLineEntry,
    dailyToTeamTimeLineEntry,
    splittedDateToMoment,
    splittedDateToString,
    teamMemberToTeamTimeLineEntry
} from "../../dal/types/conversion.helper";

export function mapUserRoutes(app: Express) {

    app.post('/api/user/create', containsNewUser, async (
        req: Request,
        res: Response
    ) => {
        try {
            const newUser = res.locals.newUser as NewUserData;

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
                    await CacheService.SetUser(persistedUser);
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

    app.post('/api/user/teams', isAuthenticated, containsUserId, ensureFetchLastActivity, async (
        req: Request,
        res: Response
    ) => {
        try {
            const userId = res.locals.userId as ObjectId;
            const fetchLastActivity = res.locals.fetchLastActivity as boolean;

            const userTeams = await TeamsStore.getUserTeams(userId) as Array<TeamWithLastActivity>;
            if (userTeams) {
                if (fetchLastActivity) {
                    const dailies = await DailyStore.getTeamsDailies(userTeams.map(el => el._id));
                    const sorted = dailies.sort((a, b) =>
                        splittedDateToMoment(b.year, b.month, b.day).unix() -
                        splittedDateToMoment(a.year, a.month, a.day).unix());

                    for (const team of userTeams) {
                        const teamEvents = sorted.filter(el => el.teamId.equals(team._id));
                        team.lastActivity = teamEvents.length > 0
                            ? splittedDateToString(teamEvents[0].year, teamEvents[0].month, teamEvents[0].day)
                            : 'None';
                    }
                }
                
                res.populate(userTeams);
            } else {
                res.answer(500, 'Unable to get user teams');
            }
        } catch (error) {
            console.log(error);
            return res.answer(500, error.message);
        }
    });

    app.post('/api/user/timeline', isAuthenticated, containsTeamId, async (
        req: Request,
        res: Response
    ) => {
        try {
            const userEmail = res.locals.email as string;
            const teamId = res.locals.teamId as ObjectId;

            const user = await CacheService.GetUserByEmail(userEmail);
            if (user) {
                const timeline: TimeLine = {
                    userEvents: []
                };

                // Invitations sent to the caller
                const userTeamInvites = user.teamInvites.map(invite => teamInviteToUserTimeLineEntry(invite));
                // Requests to join a team sent by the caller
                const userJoinRequests = user.teamJoinRequests.map(request => teamJoinRequestToUserTimeLineEntry(request));

                timeline.userEvents = timeline.userEvents
                    .concat(userTeamInvites)
                    .concat(userJoinRequests)
                    .sort((a, b) => b.date.unix() - a.date.unix());

                const team = await TeamsStore.get(teamId);
                if (team) {
                    const teamTimeLine: TeamTimeLine = {
                        _id: team._id,
                        name: team.name,
                        events: []
                    };

                    // invitations sent by team members to outsiders
                    const teamInvites = team.invitedUsers.map(invite => invitedUserToTeamTimeLineEntry(invite));
                    // Requests by outsiders to join the team
                    const teamJoinRequests = team.joinRequests.map(request => userJoinRequestToTeamTimeLineEntry(request));

                    const teamDailies = await DailyStore.getDailies(team._id);
                    
                    teamTimeLine.events = teamTimeLine.events
                        .concat(teamInvites)
                        .concat(teamJoinRequests)
                        // daily entries
                        .concat(teamDailies.map(daily => dailyToTeamTimeLineEntry(daily)))
                        .concat(team.members.map(user => teamMemberToTeamTimeLineEntry(user)))
                        .sort((a, b) => b.date.unix() - a.date.unix())

                    timeline.currentTeam = teamTimeLine;
                }

                res.populate(timeline);
            } else {
                res.answer(500, 'Unable to get user account');
            }
        } catch (error) {
            console.log(error);
            return res.answer(500, error.message);
        }
    });

    app.post('/api/user/inviteUser', isAuthenticated, containsUserEmail, containsTeamId, async (
        req: Request,
        res: Response
    ) => {
        try {
            const referrerEmail = res.locals.email as string; 
            const targetUserEmail = res.locals.userEmail as string;
            const teamId = res.locals.teamId as ObjectId;

            const referrer = await CacheService.GetUserByEmail(referrerEmail);
            if (!referrer) {
                return res.answer(520, 'Unable to get the invite referrer user');
            }

            const targetUser = await CacheService.GetUserByEmail(targetUserEmail);
            if (!targetUser) {
                return res.answer(520, 'We could not find any user matching this email. Mind checking again the address for any typo?');
            }

            const team = await TeamsStore.get(teamId);
            if (!team) {
                return res.answer(520, 'Unable to locate the selected team');
            }

            if (team.invitedUsers.find(el => el.invitee._id.equals(targetUser._id))
            ||  team.members.find(el => el._id.equals(targetUser._id))) {
                return res.answer(520, 'This user has already been added to the team');
            }

            const requestId = new ObjectId();
            const requestDate = moment().toDate();
            const terseRefered = userToTerseUser(referrer);
            const terseTargetUser = userToTerseUser(targetUser);
            team.invitedUsers.push({
                _id: requestId,
                date: requestDate,
                referrer: terseRefered,
                invitee: terseTargetUser
            });
            targetUser.teamInvites.push({
                _id: requestId,
                date: requestDate,
                referrer: terseRefered,
                team: teamToBareTeam(team)
            });
            
            const userAlterationresult = await UsersStore.Update(targetUser);
            const teamAlterationresult = await TeamsStore.Update(team);
            if (userAlterationresult && teamAlterationresult) {
                await CacheService.SetUser(targetUser);
                return res.populate(terseTargetUser);
            } else {
                return res.answer(520, 'An error occured while saving the team invitation');
            }
        } catch (error) {
            console.log(error);
            return res.answer(500, error.message);
        }
    });

    app.post('/api/user/requestToJoinTeam', isAuthenticated, containsTeamName, async (
        req: Request,
        res: Response
    ) => {
        try {
            const userEmail = res.locals.email as string;
            const teamName = res.locals.teamName as string;

            const user = await CacheService.GetUserByEmail(userEmail);
            if (!user) {
                return res.answer(520, 'Unable to get the source user');
            }

            const team = await TeamsStore.getByName(teamName);
            if (!team) {
                return res.answer(520, 'This team does not exist');
            }

            const requestId = new ObjectId();
            const requestDate = moment().toDate();
            user.teamJoinRequests.push({
                _id: requestId,
                date: requestDate,
                team: teamToBareTeam(team)
            });
            team.joinRequests.push({
                _id: requestId,
                date: requestDate,
                user: userToTerseUser(user)
            });

            const userAlterationresult = await UsersStore.Update(user);
            const teamAlterationresult = await TeamsStore.Update(team);
            if (userAlterationresult && teamAlterationresult) {
                await CacheService.SetUser(user);
                return res.answer(200, 'Join request sent');
            } else {
                return res.answer(520, 'An error occured while saving the join request');
            }
        } catch (error) {
            console.log(error);
            return res.answer(500, error.message);
        }
    });

    app.post('/api/user/acceptTeamInvite', isAuthenticated, containsInviteId, async (
        req: Request,
        res: Response
    ) => {
        try {
            const userEmail = res.locals.email as string;
            const inviteId = res.locals.inviteId as string;

            const user = await CacheService.GetUserByEmail(userEmail);
            if (!user) {
                return res.answer(520, 'Unable to get the current user');
            }

            const matchingInvites = user.teamInvites.filter(el => el._id.equals(inviteId));
            if (matchingInvites.length !== 1) {
                return res.answer(520, 'Unable to find the team join invite');
            }

            const team = await TeamsStore.get(matchingInvites[0].team._id);
            if (!team) {
                return res.answer(520, 'Unable to find the targeted team');
            }

            user.teamInvites = user.teamInvites.filter(el => !el._id.equals(inviteId));
            user.teams.push(teamToBareTeam(team));

            const userUpdateResult = await UsersStore.Update(user);
            if (!userUpdateResult) {
                await CacheService.SetUser(user);
                return res.answer(520, 'Unable to update the user');
            }

            team.members.push({
                status: 'member',
                ...userToTerseUser(user),
                joinDate: moment().toDate()
            });
            team.invitedUsers = team.invitedUsers.filter(el => !el._id.equals(matchingInvites[0]._id));

            const teamUpdateResult = await TeamsStore.Update(team);
            if (!teamUpdateResult) {
                return res.answer(520, 'Unable to update the targeted team');
            }

            return res.answer(200, "Added to team");

        } catch (error) {
            console.log(error);
            return res.answer(500, error.message);
        }
    });

    app.post('/api/user/declineTeamInvite', isAuthenticated, containsInviteId, async (
        req: Request,
        res: Response
    ) => {
        try {
            const userEmail = res.locals.email as string;
            const inviteId = res.locals.inviteId as string;

            const user = await CacheService.GetUserByEmail(userEmail);
            if (!user) {
                return res.answer(520, 'Unable to get the current user');
            }

            const matchingInvites = user.teamInvites.filter(el => el._id.equals(inviteId));
            if (matchingInvites.length !== 1) {
                return res.answer(520, 'Unable to find the team join invite');
            }

            const team = await TeamsStore.get(matchingInvites[0].team._id);
            if (!team) {
                return res.answer(520, 'Unable to find the targeted team');
            }

            user.teamInvites = user.teamInvites.filter(el => !el._id.equals(inviteId));
            team.invitedUsers = team.invitedUsers.filter(el => !el._id.equals(matchingInvites[0]._id));

            const userUpdateResult = await UsersStore.Update(user);
            if (!userUpdateResult) {
                await CacheService.SetUser(user);
                return res.answer(520, 'Unable to update the user');
            }

            const teamUpdateResult = await TeamsStore.Update(team);
            if (!teamUpdateResult) {
                return res.answer(520, 'Unable to update the targeted team');
            }

            return res.answer(200, "Invite declined");

        } catch (error) {
            console.log(error);
            return res.answer(500, error.message);
        }
    });
}