import { GenericStore } from '../dal.generic.store';
import { Daily, TerseUser } from '../../../types/persisted.types';
import { ObjectId } from 'bson';

export abstract class DailyStore {
    public static storeName = 'daily';

    private static searchCriteria (
        date: Date,
        teamId: ObjectId,
    ): any {
        const searchCriteria = {
            teamId: teamId,
            day: date.getDay(),
            month: date.getMonth(),
            year: date.getFullYear()
        };

        return searchCriteria;
    }

    public static async getCreateDaily(
        date: Date,
        teamId: ObjectId,
    ): Promise<Daily> {

        let matches = await GenericStore.getBy(
            this.storeName, this.searchCriteria(date, teamId), { "created_at": 1 }
        ) as Array<Daily>;

        if (matches.length === 0) {

            let daily = {
                teamId: teamId,
                day: date.getDay(),
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
                throw new Error('Unable to create Daily!');
            }
        } else {
            return matches[0];
        }
    }

    public static async addUnforeseenTicket(
        date: Date,
        teamId: ObjectId,
        creator: TerseUser,
        ticketName: string
    ): Promise<boolean> {

        let daily = await this.getCreateDaily(date, teamId);
        if(daily && daily.unforeseenTickets.filter(el => el.name === name).length === 0) {

            daily.unforeseenTickets.push({
                creator: creator,
                name: ticketName
            });

            const result = await GenericStore.createOrUpdate(
                this.storeName,
                this.searchCriteria(date, teamId),
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