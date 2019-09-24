import { GenericStore } from './../dal.generic.store';
import { User } from './../../../types/persisted.types';

import * as Crypto from './../../../../business/util/crypto.util';

export abstract class UsersStore {
    public static storeName = 'users';

    public static async create(
        username: string
    ): Promise<string> {
        const password: string = [...Array(8)].map(i => (~~(Math.random() * 36)).toString(36)).join('');

        const hash = await Crypto.hash(password);

        await GenericStore.createOrUpdate(
            this.storeName,
            { email: username },
            { email: username, password: hash }
        );

        return password;
    }

    public static async get(
        username: string
    ): Promise<User | undefined> {
        const result = await GenericStore.getBy(
            this.storeName,
            { email: username },
            {}
        ) as Array<User>;

        if (result.length !== 1) return undefined;

        return result[0];
    }
}