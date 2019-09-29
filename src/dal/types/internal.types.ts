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