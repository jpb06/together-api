import { ObjectId } from "bson";

/* ---------------------------------------------------------------------------------------------------------------
   Persisted
   ---------------------------------------------------------------------------------------------------------------*/
export class User {
    _id: ObjectId;
    teams: Array<Team>;

    email: string;
    password: string;
    session: Session;

    lastName: string;
    firstName: string;
    avatarName: string;
}

export class Team {
    _id: ObjectId;

    name: string;
    members: Array<TerseUser>;
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
}

