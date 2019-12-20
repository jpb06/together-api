import { User } from '../dal/types/persisted.types';
import { UsersStore } from '../dal/manipulation/stores/specific/users.store';
import { ObjectId } from 'bson';

interface Dictionary<T> {
    [Key: string]: T;
}

export abstract class CacheService {

    private static cachedUsers: Dictionary<User> = {};

    public static async GetUserByEmail(
        email: string
    ): Promise<User | undefined> {

        let user = this.cachedUsers[email];
        if (user) {
            return user;
        } else {
            const persistedUser = await UsersStore.getByEmail(email);
            if (persistedUser) {

                this.cachedUsers[email] = persistedUser;
                return persistedUser;
            } else {
                return undefined;
            }
        }
    }

    public static async SetUser(
        email: string,
        user: User
    ): Promise<void> {
        this.cachedUsers[email] = user;
    }
}