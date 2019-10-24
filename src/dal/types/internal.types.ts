import { ObjectId } from "bson";

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