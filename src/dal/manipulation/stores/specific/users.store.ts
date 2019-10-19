﻿import { GenericStore } from '../dal.generic.store';
import { User, TerseUser } from '../../../types/persisted.types';
import * as Crypto from './../../../../business/util/crypto.util';
import { TeamsStore } from './teams.store';
import { ObjectId } from 'bson';
import { CacheService } from '../../../../business/cache.service';

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

        let user = await CacheService.GetUserByEmail(email);
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

        return result;
    }

    public static async GetTeamMembers(
        teamId: ObjectId
    ): Promise<Array<TerseUser>> {

        const users = await GenericStore.getBy(
            this.storeName,
            { 'teams': { $elemMatch: { _id: teamId } } },
            {}
        ) as Array<User>;

        return users.map(el => ({
            _id: el._id,
            lastName: el.lastName,
            firstName: el.firstName,
            avatarName: el.avatarName
        }));
    }
}