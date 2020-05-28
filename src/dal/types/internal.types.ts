import { ObjectId } from "bson";
import { Daily, BareTeam, TeamJoinRequest, TeamInvite, InvitedUser, UserJoinRequest, Team, TeamMember } from "./persisted.types";
import { Moment } from "moment";

/* ---------------------------------------------------------------------------------------------------------------
   Api
   ---------------------------------------------------------------------------------------------------------------*/
export enum TimeLineEntryType {
    Daily = 1,
    TeamInvite = 2,
    TeamJoinRequest = 3,
    UserInvite = 4,
    UserJoinRequest = 5,
    TeamMemberJoinNotice = 6
};

export class UnforeseenData {
    teamId: ObjectId;
    date: Date;
    ticketName: string;
};
export class DailyPredicate {
    teamId: ObjectId;
    date: Date;
};
export class SubjectData {
    type: number;
    description: string;
};
export class FeelingData {
    type: number;
    comment: string;
};

export class TimeLineEntry {
    type: TimeLineEntryType;
    shortTitle: string;
    date: Moment;
};
export class TeamTimeLineEntry extends TimeLineEntry {
    entry: Daily | UserJoinRequest | InvitedUser | TeamMember;
};
export class UserTimeLineEntry extends TimeLineEntry {
    entry: TeamInvite | TeamJoinRequest;
};
export class TeamTimeLine extends BareTeam {
    events: Array<TeamTimeLineEntry>;
};
export class TimeLine {
    currentTeam?: TeamTimeLine;
    userEvents: Array<UserTimeLineEntry>;
};

export class NewUserData {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
};

export class TeamWithLastActivity extends Team {
    lastActivity: string;
};