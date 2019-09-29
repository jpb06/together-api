import { GenericStore } from '../dal.generic.store';
import { Daily, User } from '../../../types/persisted.types';
import { ObjectId } from 'bson';

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

        let matches = await GenericStore.getBy(
            this.storeName, this.searchCriteria(date, teamId), { "created_at": 1 }
        ) as Array<Daily>;

        if (matches.length === 0) {

            let daily = {
                teamId: teamId,
                day: date.getDate(),
                month: date.getMonth(),
                year: date.getFullYear(),
                durationIndicator: '',
                unforeseenTickets: [],
                doneTickets: [],
                issues: [],
                feelings: []
            };

            let insertedId = await GenericStore.create(this.storeName, daily);
            if (insertedId) {
                return { ...daily, _id: insertedId };
            } else {
                return undefined;
            }
        } else {
            return matches[0];
        }
    }

    public static async addUnforeseenTicket(
        date: Date,
        teamId: ObjectId,
        creator: User,
        ticketName: string
    ): Promise<boolean> {

        let daily = await this.getCreateDaily(date, teamId);
        if (daily && daily.unforeseenTickets.filter(el => el.name === ticketName).length === 0) {

            daily.unforeseenTickets.push({
                creator: {
                    lastName: creator.lastName,
                    firstName: creator.firstName,
                    avatarName: creator.avatarName
                },
                name: ticketName
            });

            const result = await GenericStore.createOrUpdate(
                this.storeName,
                { _id: daily._id },
                daily);

            return result;
        } else {
            return false;
        }
    }

    public static async removeUnforeseenTicket(
        date: Date,
        teamId: ObjectId,
        name: string
    ): Promise<boolean> {

        let daily = await this.getCreateDaily(date, teamId);
        if (daily) {

            daily.unforeseenTickets = daily.unforeseenTickets.filter(el => el.name !== name);

            const result = await GenericStore.createOrUpdate(
                this.storeName,
                this.searchCriteria(date, teamId),
                daily);

            return result;

        } else {
            return false;
        }
    }
}