import { GenericStore } from './../dal.generic.store';
import { User } from './../../../types/persisted.types';

import * as Crypto from './../../../../business/util/crypto.util';

export abstract class UsersStore {
    public static storeName = 'users';

    public static async create(
        guildId: string
    ): Promise<string> {
        let password: string = [...Array(8)].map(i => (~~(Math.random() * 36)).toString(36)).join('');

        let hash = await Crypto.hash(password);

        await GenericStore.createOrUpdate(
            this.storeName,
            { login: guildId },
            { login: guildId, password: hash }
        );

        return password;
    }

    public static async get(
        guildId: string
    ): Promise<User | undefined> {
        let result = await GenericStore.getBy(
            this.storeName,
            { login: guildId },
            {}
        ) as Array<User>;

        if (result.length !== 1) return undefined;

        return result[0];
    }
}