import { GenericStore } from '../dal.generic.store';
import { Daily, User } from '../../../types/persisted.types';
import { ObjectId } from 'bson';
import { userToTerseUser } from '../../../types/conversion.helper';

export abstract class DailyStore {
    public static storeName = 'daily';

    private static searchCriteria (
        date: Date,
        teamId: ObjectId,
    ): any {
        const searchCriteria = {
            teamId: teamId,
            day: date.getDate(),
            month: date.getMonth(),
            year: date.getFullYear()
        };

        return searchCriteria;
    }

    public static async getCreateDaily(
        date: Date,
        teamId: ObjectId,
    ): Promise<Daily | undefined> {

        const matches = await GenericStore.getBy(
            this.storeName, this.searchCriteria(date, teamId), { "created_at": 1 }
        ) as Array<Daily>;

        if (matches.length === 0) {

            const daily = {
                teamId: teamId,
                day: date.getDate(),
                month: date.getMonth(),
                year: date.getFullYear(),
                durationIndicator: '',
                unforeseenTickets: [],
                doneTickets: [],
                subjects: [],
                feelings: []
            };

            const insertedId = await GenericStore.create(this.storeName, daily);
            if (insertedId) {
                return { ...daily, _id: insertedId };
            } else {
                return undefined;
            }
        } else {
            return matches[0];
        }
    }

    public static async setDuration(
        date: Date,
        teamId: ObjectId,
        durationIndicator: string
    ): Promise<boolean> {

        const daily = await this.getCreateDaily(date, teamId);
        if (daily) {
            daily.durationIndicator = durationIndicator;

            const result = await GenericStore.createOrUpdate(
                this.storeName,
                { _id: daily._id },
                daily);

            return result ? true : false;
        }
        else {
            return false;
        }

    }

    public static async addUnforeseenTicket(
        date: Date,
        teamId: ObjectId,
        creator: User,
        ticketName: string
    ): Promise<boolean> {

        const daily = await this.getCreateDaily(date, teamId);
        if (daily && daily.unforeseenTickets.filter(el => el.name === ticketName).length === 0) {

            daily.unforeseenTickets.push({
                creator: userToTerseUser(creator),
                name: ticketName
            });

            const result = await GenericStore.createOrUpdate(
                this.storeName,
                { _id: daily._id },
                daily);

            return result ? true : false;
        } else {
            return false;
        }
    }

    public static async addDoneTicket(
        date: Date,
        teamId: ObjectId,
        creator: User,
        assignee: User,
        ticketName: string
    ): Promise<boolean> {

        const daily = await this.getCreateDaily(date, teamId);
        if (daily && daily.doneTickets.filter(el => el.name === ticketName).length === 0) {

            daily.doneTickets.push({
                creator: userToTerseUser(creator),
                assignee: userToTerseUser(assignee),
                name: ticketName
            });

            const result = await GenericStore.createOrUpdate(
                this.storeName,
                { _id: daily._id },
                daily);

            return result ? true : false;
        } else {
            return false;
        }
    }

    public static async removeUnforeseenTicket(
        date: Date,
        teamId: ObjectId,
        name: string
    ): Promise<boolean> {

        const daily = await this.getCreateDaily(date, teamId);
        if (daily) {

            daily.unforeseenTickets = daily.unforeseenTickets.filter(el => el.name !== name);

            const result = await GenericStore.createOrUpdate(
                this.storeName,
                this.searchCriteria(date, teamId),
                daily);

            return result ? true : false;

        } else {
            return false;
        }
    }

    public static async removeDoneTicket(
        date: Date,
        teamId: ObjectId,
        name: string
    ): Promise<boolean> {

        const daily = await this.getCreateDaily(date, teamId);
        if (daily) {

            daily.doneTickets = daily.doneTickets.filter(el => el.name !== name);

            const result = await GenericStore.createOrUpdate(
                this.storeName,
                this.searchCriteria(date, teamId),
                daily);

            return result ? true : false;

        } else {
            return false;
        }
    }

    public static async addSubject(
        date: Date,
        teamId: ObjectId,
        creator: User,
        type: number,
        description: string
    ): Promise<ObjectId | undefined> {

        const daily = await this.getCreateDaily(date, teamId);
        if (daily) {

            const subjectId = new ObjectId();

            daily.subjects.push({
                creator: userToTerseUser(creator),
                id: subjectId,
                type: type,
                description: description
            });

            const result = await GenericStore.createOrUpdate(
                this.storeName,
                { _id: daily._id },
                daily);

            return result ? subjectId : undefined;
        } else {
            return undefined;
        }
    }

    public static async removeSubject(
        date: Date,
        teamId: ObjectId,
        id: ObjectId
    ): Promise<boolean> {

        const daily = await this.getCreateDaily(date, teamId);
        if (daily) {

            daily.subjects = daily.subjects.filter(el => !el.id.equals(id));

            const result = await GenericStore.createOrUpdate(
                this.storeName,
                this.searchCriteria(date, teamId),
                daily);

            return result ? true : false;

        } else {
            return false;
        }
    }

    public static async addFeeling(
        date: Date,
        teamId: ObjectId,
        creator: User,
        type: number,
        comment: string
    ): Promise<ObjectId | undefined> {

        const daily = await this.getCreateDaily(date, teamId);
        if (daily) {

            const feelingId = new ObjectId();

            daily.feelings.push({
                creator: userToTerseUser(creator),
                id: feelingId,
                type: type,
                comment: comment
            });

            const result = await GenericStore.createOrUpdate(
                this.storeName,
                { _id: daily._id },
                daily);

            return result ? feelingId : undefined;
        } else {
            return undefined;
        }
    }

    public static async removeFeeling(
        date: Date,
        teamId: ObjectId,
        id: ObjectId
    ): Promise<boolean> {

        const daily = await this.getCreateDaily(date, teamId);
        if (daily) {

            daily.feelings = daily.feelings.filter(el => !el.id.equals(id));

            const result = await GenericStore.createOrUpdate(
                this.storeName,
                this.searchCriteria(date, teamId),
                daily);

            return result ? true : false;

        } else {
            return false;
        }
    }

    public static async getDailies(
        teamId: ObjectId,
    ): Promise<Array<Daily>> {

        const matches = await GenericStore.getBy(
            this.storeName,
            { teamId: teamId },
            {}
        ) as Array<Daily>;

        return matches;
    }

    public static async getTeamsDailies(
        teamsIds: Array<ObjectId>,
    ): Promise<Array<Daily>> {

        const matches = await GenericStore.getBy(
            this.storeName,
            { teamId: { $in: teamsIds } },
            {}
        ) as Array<Daily>;

        return matches;
    }
}