import { Express, Request, Response } from "express-serve-static-core";
import { isAuthenticated } from "../middleware/permissions.validation.middleware";
import { containsUserId, containsNewUser, containsTeamId, containsUserEmail, containsTeamName } from "../middleware/requests.validation.middleware";
import { ObjectId } from "bson";
import { TeamsStore } from "../../dal/manipulation/stores/specific/teams.store";
import { DailyStore } from "../../dal/manipulation/stores/specific/daily.store";
import { NewUserData, TimeLine, TimeLineEntryType, TeamTimeLine } from "../../dal/types/internal.types";
import moment = require("moment");
import { UsersStore } from "../../dal/manipulation/stores/specific/users.store";
import { CacheService } from "../../business/cache.service";
import { userToTerseUser, TeamToBareTeam } from "../../dal/types/conversion.helper";
import { TerseUser } from "../../dal/types/persisted.types";

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

    app.post('/api/user/timeline', isAuthenticated, containsUserId, containsTeamId, async (
        req: Request,
        res: Response
    ) => {
        try {
            const userId = <ObjectId>res.locals.userId;
            const teamId = <ObjectId>res.locals.teamId;

            const user = await CacheService.GetUserById(userId);
            if (user) {
                let timeline: TimeLine = {
                    userEvents: []
                };

                // Invitations sent to the caller
                timeline.userEvents = timeline.userEvents.concat(user.teamInvites.map(invite => ({
                    type: TimeLineEntryType.UserInvite,
                    entry: invite,
                    shortTitle: `Invitation - ${moment(invite.date).format('DD/MM/YYYY')}`,
                    date: moment(invite.date)
                })));
                // Requests to join a team sent by the caller
                timeline.userEvents = timeline.userEvents.concat(user.teamJoinRequests.map(request => ({
                    type: TimeLineEntryType.UserJoinRequest,
                    entry: request,
                    shortTitle: `Join request - ${moment(request.date).format('DD/MM/YYYY')}`,
                    date: moment(request.date)
                }))).sort((a, b) => b.date.unix() - a.date.unix());

                const team = await TeamsStore.get(teamId);
                if (team) {
                    const teamTimeLine: TeamTimeLine = {
                        _id: team._id,
                        name: team.name,
                        events: []
                    };

                    // invitations sent by team members to outsiders
                    teamTimeLine.events = teamTimeLine.events.concat(team.invitedUsers.map(invite => ({
                        type: TimeLineEntryType.TeamInvite,
                        entry: invite,
                        shortTitle: `Invite - ${moment(invite.date).format('DD/MM/YYYY')}`,
                        date: moment(invite.date)
                    })));

                    // Requests by outsiders to join the team
                    teamTimeLine.events = teamTimeLine.events.concat(team.joinRequests.map(request => ({
                        type: TimeLineEntryType.TeamJoinRequest,
                        entry: request,
                        shortTitle: `Join request - ${moment(request.date).format('DD/MM/YYYY')}`,
                        date: moment(request.date)
                    })));

                    const teamDailies = await DailyStore.getDailies(team._id);
                    // daily entries
                    teamTimeLine.events = teamTimeLine.events.concat(teamDailies.map(daily => ({
                        type: TimeLineEntryType.Daily,
                        team: team,
                        entry: daily,
                        shortTitle: `Daily - ${daily.day.toString().padStart(2, '0')}/${(daily.month + 1).toString().padStart(2, '0')}/${daily.year}`,
                        date: moment.utc(`${daily.year}-${(daily.month + 1).toString().padStart(2, '0')}-${daily.day.toString().padStart(2, '0')}`)
                    })));

                    teamTimeLine.events = teamTimeLine.events.sort((a, b) => b.date.unix() - a.date.unix());
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
            const referrerEmail = <string>res.locals.email; 
            const targetUserEmail = <string>res.locals.userEmail;
            const teamId = <ObjectId>res.locals.teamId;

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

            if (team.invitedUsers.find(el => (<TerseUser>el.invitee)._id.equals(targetUser._id))
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
                team: TeamToBareTeam(team)
            });
            
            const userAlterationresult = await UsersStore.Update(targetUser);
            const teamAlterationresult = await TeamsStore.Update(team);
            if (userAlterationresult && teamAlterationresult) {
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
            const userEmail = <string>res.locals.email;
            const teamName = <string>res.locals.teamName;

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
                team: TeamToBareTeam(team)
            });
            team.joinRequests.push({
                _id: requestId,
                date: requestDate,
                user: userToTerseUser(user)
            });

            const userAlterationresult = await UsersStore.Update(user);
            const teamAlterationresult = await TeamsStore.Update(team);
            if (userAlterationresult && teamAlterationresult) {
                return res.answer(200, 'Join request sent');
            } else {
                return res.answer(520, 'An error occured while saving the join request');
            }
        } catch (error) {
            console.log(error);
            return res.answer(500, error.message);
        }
    });

}