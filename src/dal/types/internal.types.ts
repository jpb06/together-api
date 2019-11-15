import { ObjectId } from "bson";
import { Team, Daily } from "./persisted.types";
import { Moment } from "moment";

/* ---------------------------------------------------------------------------------------------------------------
   Api
   ---------------------------------------------------------------------------------------------------------------*/
export class UnforeseenData {
    teamId: ObjectId;
    date: Date;
    ticketName: string;
}
export class DailyPredicate {
    teamId: ObjectId;
    date: Date;
}
export class SubjectData {
    type: number;
    description: string;
}
export class FeelingData {
    type: number;
    comment: string;
}
export class TimeLineEntry {
    type: number;
    team: Team;
    entry: Daily;
    shortTitle: string;
    date: Moment;
}
export class NewUserData {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}