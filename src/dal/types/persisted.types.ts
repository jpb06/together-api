﻿import { ObjectId } from "bson";

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
    issues: Array<string>;
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

export class Feeling {
    subject: TerseUser;

    type: number;
    comment: string;
}

export class TerseUser {
    lastName: string;
    firstName: string;
    avatarName: string;
}

