import { TerseUser, User, BareTeam, Team, TeamInvite, TeamJoinRequest, InvitedUser, UserJoinRequest, Daily, TeamMember } from "./persisted.types";
import { UserTimeLineEntry, TimeLineEntryType, TeamTimeLineEntry } from "./internal.types";
import moment = require("moment");

export function splittedDateToMoment(
    year: number,
    month: number,
    day: number
) {
    return moment.utc(`${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`);
}

export function splittedDateToString(
    year: number,
    month: number,
    day: number
) {
    return `${day.toString().padStart(2, '0')}/${(month + 1).toString().padStart(2, '0')}/${year}`;
}

export function userToTerseUser(
    user: User
): TerseUser {
    return {
        _id: user._id,
        lastName: user.lastName,
        firstName: user.firstName,
        avatarName: user.avatarName,
        email: user.email
    };
};

export function teamToBareTeam(
    team: Team
): BareTeam {
    return {
        _id: team._id,
        name: team.name
    };
};

export function teamInviteToUserTimeLineEntry(
    invite: TeamInvite
): UserTimeLineEntry {
    return {
        type: TimeLineEntryType.UserInvite,
        entry: invite,
        shortTitle: `Invitation - ${moment(invite.date).format('DD/MM/YYYY')}`,
        date: moment(invite.date)
    };
};

export function teamJoinRequestToUserTimeLineEntry(
    joinRequest: TeamJoinRequest
): UserTimeLineEntry {
    return {
        type: TimeLineEntryType.UserJoinRequest,
        entry: joinRequest,
        shortTitle: `Join request - ${moment(joinRequest.date).format('DD/MM/YYYY')}`,
        date: moment(joinRequest.date)
    };
};

export function invitedUserToTeamTimeLineEntry(
    invitedUser: InvitedUser
): TeamTimeLineEntry {
    return {
        type: TimeLineEntryType.TeamInvite,
        entry: invitedUser,
        shortTitle: `Invite - ${moment(invitedUser.date).format('DD/MM/YYYY')}`,
        date: moment(invitedUser.date)
    };
};

export function userJoinRequestToTeamTimeLineEntry(
    joinRequest: UserJoinRequest
): TeamTimeLineEntry {
    return {
        type: TimeLineEntryType.TeamJoinRequest,
        entry: joinRequest,
        shortTitle: `Join request - ${moment(joinRequest.date).format('DD/MM/YYYY')}`,
        date: moment(joinRequest.date)
    };
};

export function dailyToTeamTimeLineEntry(
    daily: Daily
): TeamTimeLineEntry {
    return {
        type: TimeLineEntryType.Daily,
        entry: daily,
        shortTitle: `Daily - ${splittedDateToString(daily.year, daily.month, daily.day)}`,
        date: splittedDateToMoment(daily.year, daily.month, daily.day)
    };
};

export function teamMemberToTeamTimeLineEntry(
    user: TeamMember
): TeamTimeLineEntry {
    return {
        type: TimeLineEntryType.TeamMemberJoinNotice,
        shortTitle: user.status === 'creator'
            ? `The adventure begins - ${moment(user.joinDate).format('DD/MM/YYYY')}`
            : `New member - ${moment(user.joinDate).format('DD/MM/YYYY')}`,
        date: moment(user.joinDate),
        entry: user
    };
};