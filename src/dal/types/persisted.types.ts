import { ObjectId } from "bson";

/* ---------------------------------------------------------------------------------------------------------------
   Persisted
   ---------------------------------------------------------------------------------------------------------------*/
export class User {
    _id: ObjectId;
    teams: Array<BareTeam>;
    teamInvites: Array<TeamInvite>;
    teamJoinRequests: Array<TeamJoinRequest>;

    email: string;
    password: string;
    session: Session;

    lastName: string;
    firstName: string;
    avatarName: string;
}
export class BareTeam {
    _id: ObjectId;

    name: string;
}
export class Team extends BareTeam {
    members: Array<TeamMember>;
    invitedUsers: Array<InvitedUser>;
    joinRequests: Array<UserJoinRequest>;
}

export class Daily {
    _id: ObjectId;
    teamId: ObjectId;

    day: number;
    month: number;
    year: number;

    durationIndicator: string;
    unforeseenTickets: Array<Ticket>;
    doneTickets: Array<Ticket>;
    subjects: Array<Subject>;
    feelings: Array<Feeling>;
}

/* ---------------------------------------------------------------------------------------------------------------
   Subsets
   ---------------------------------------------------------------------------------------------------------------*/
export class Session {
    expirationDate: Date;
}

export class Ticket {
    assignee?: TerseUser;
    creator: TerseUser;

    name: string;
}

export class Subject {
    creator: TerseUser;

    id: ObjectId;
    type: number;
    description: string;
}

export class Feeling {
    creator: TerseUser;

    id: ObjectId;
    type: number;
    comment: string;
}

export class TerseUser {
    _id: ObjectId;
    lastName: string;
    firstName: string;
    avatarName: string;
    email: string;
}

export class TeamMember extends TerseUser {
    status: string;
}

export class InvitedUser {
    _id: ObjectId;
    date: Date;
    referrer: TerseUser;
    invitee: TerseUser;
}

export class TeamInvite {
    _id: ObjectId;
    date: Date;
    team: BareTeam;
    referrer: TerseUser;
}

export class UserJoinRequest {
    _id: ObjectId;
    date: Date;
    user: TerseUser;
}

export class TeamJoinRequest {
    _id: ObjectId;
    date: Date;
    team: BareTeam;
}