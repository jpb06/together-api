import { GenericStore } from '../dal.generic.store';
import { User, TerseUser } from '../../../types/persisted.types';
import * as Crypto from './../../../../business/util/crypto.util';
import { TeamsStore } from './teams.store';
import { ObjectId } from 'bson';
import { CacheService } from '../../../../business/cache.service';

export abstract class UsersStore {
    public static storeName = 'users';

    public static async create(
        email: string,
        lastName: string,
        firstName: string,
        avatarName: string,
        password: string
    ): Promise<User | undefined> {

        const hash = await Crypto.hash(password);

        const user = await GenericStore.createOrUpdate(
            this.storeName,
            { email: email },
            {
                email: email,
                password: hash,
                lastName: lastName,
                firstName: firstName,
                avatarName: avatarName,
                teams: [],
                teamInvites: [],
                teamJoinRequests: [],
                session: undefined
            }
        );

        return <User | undefined>user;
    }

    public static async addToTeam(
        email: string,
        teamId: ObjectId
    ): Promise<boolean> {

        let user = await CacheService.GetUserByEmail(email);
        if (user && user.teams.filter(el => el._id.equals(teamId)).length === 0) {
            const team = await TeamsStore.get(teamId);
            if (team) {
                user.teams.push({
                    _id: team._id,
                    name: team.name 
                });

                const result = await GenericStore.createOrUpdate(
                    this.storeName,
                    { email: email },
                    user
                );

                return result ? true : false;
            } else {
                return false;
            }
        }
        else return false;
    }

    public static async getById(
        id: ObjectId
    ): Promise<User | undefined> {

        const result = await GenericStore.getBy(
            this.storeName,
            { _id: id },
            {}
        ) as Array<User>;

        if (result.length !== 1) return undefined;

        return result[0];
    }

    public static async getByEmail(
        email: string
    ): Promise<User | undefined> {

        const result = await GenericStore.getBy(
            this.storeName,
            { email: email },
            {}
        ) as Array<User>;

        if (result.length !== 1) return undefined;

        return result[0];
    }

    public static async Update(
        user: User
    ): Promise<boolean> {

        const result = await GenericStore.createOrUpdate(
            this.storeName,
            { _id: user._id },
            user
        );

        return result ? true : false;
    }
}