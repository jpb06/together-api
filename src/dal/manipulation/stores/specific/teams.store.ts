import { GenericStore } from '../dal.generic.store';
import { Team, TerseUser } from '../../../types/persisted.types';
import { ObjectId } from 'bson';

export abstract class TeamsStore {
    public static storeName = 'teams';

    public static async create(
        name: string
    ): Promise<ObjectId | undefined> {

        const insertedId = await GenericStore.create(this.storeName, {
            name: name
        });
        return insertedId;
    }

    public static async get(
        id: ObjectId
    ): Promise<Team | undefined> {

        const result = await GenericStore.getBy(
            this.storeName,
            { _id: id },
            {}) as Array<Team>;

        if (result.length !== 1) return undefined;

        return result[0];
    }

    public static async GetTeamMembers(
        teamId: ObjectId
    ): Promise<Array<TerseUser> | undefined> {

        const team = await this.get(teamId);
        if (team) {
            return team.members;
        }
        else {
            return undefined;
        }
    }

    public static async getUserTeams(
        userId: ObjectId
    ): Promise<Array<Team>> {

        const teams = await GenericStore.getBy(
            this.storeName,
            { 'members': { $elemMatch: { _id: userId } } },
            {}
        ) as Array<Team>;

        return teams;
    }
}