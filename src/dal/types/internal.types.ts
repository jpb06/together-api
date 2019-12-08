import { ObjectId } from "bson";
import { Daily, BareTeam, TeamMembershipRequest, TeamInvite, InvitedUser, MembershipRequest } from "./persisted.types";
import { Moment } from "moment";

/* ---------------------------------------------------------------------------------------------------------------
   Api
   ---------------------------------------------------------------------------------------------------------------*/
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
    type: number;
    shortTitle: string;
    date: Moment;
};
export class TeamTimeLineEntry extends TimeLineEntry {
    entry: Daily | MembershipRequest | InvitedUser;
};
export class UserTimeLineEntry extends TimeLineEntry {
    entry: TeamInvite | TeamMembershipRequest;
};
export class TeamTimeLine extends BareTeam {
    events: Array<TeamTimeLineEntry>;
};
export class TimeLine {
    teams: Array<TeamTimeLine>;
    events: Array<UserTimeLineEntry>;
};

export class NewUserData {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
};