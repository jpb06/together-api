import { GenericStore } from '../dal.generic.store';
import { User } from '../../../types/persisted.types';
import * as Crypto from './../../../../business/util/crypto.util';
import { TeamsStore } from './teams.store';
import { ObjectId } from 'bson';

export abstract class UsersStore {
    public static storeName = 'users';

    public static async create(
        email: string,
        lastname: string,
        firstname: string,
        avatarName: string
    ): Promise<string> {

        const password: string = [...Array(8)].map(i => (~~(Math.random() * 36)).toString(36)).join('');

        const hash = await Crypto.hash(password);

        await GenericStore.createOrUpdate(
            this.storeName,
            { email: email },
            {
                email: email,
                password: hash,
                lastname: lastname,
                firstname: firstname,
                avatarName: avatarName,
                teams: [],
                session: undefined
            }
        );

        return password;
    }

    public static async addToTeam(
        email: string,
        teamId: ObjectId
    ): Promise<boolean> {

        let user = await this.get(email);
        if (user && user.teams.filter(el => el._id.equals(teamId)).length === 0) {
            const team = await TeamsStore.get(teamId);
            if (team) {
                user.teams.push(team);

                return await GenericStore.createOrUpdate(
                    this.storeName,
                    { email: email },
                    user
                );
            } else {
                return false;
            }
        }
        else return false;
    }

    public static async get(
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

        return result;
    }
}