import { MongoClient } from 'mongodb';

import { DalConfiguration } from './../../configuration/dal.configuration';

export abstract class GenericStore {

    private static async connect(): Promise<MongoClient> {
        const client = await MongoClient.connect(DalConfiguration.url, {
            auth: {
                user: DalConfiguration.username,
                password: DalConfiguration.password
            },
            useNewUrlParser: true,
        });

        return client;
    }

    public static async create(
        collectionName: string,
        value: object
    ): Promise<boolean> {
        DalConfiguration.VerifyDatabaseConfig();

        const client = await this.connect();

        try {
            let db = client.db(DalConfiguration.database);
            let collection = db.collection(collectionName);

            let result = await collection.insertOne(value);
            if (result.result.ok === 1)
                return true;
            else
                return false;
        } finally {
            await client.close();
        }
    }

    public static async createOrUpdate(
        collectionName: string,
        term: object,
        value: object
    ): Promise<boolean> {
        DalConfiguration.VerifyDatabaseConfig();

        const client = await this.connect();

        try {
            let db = client.db(DalConfiguration.database);
            let collection = db.collection(collectionName);

            // nb : upsert either
            // + Creates a new document if no documents match the filter. Returns null after inserting the new document, unless returnNewDocument is true.
            // + Updates a single document that matches the filter.

            let result = await collection.findOneAndUpdate(term, { $set: value }, { upsert: true });
            if (result.ok === 1)
                return true;
            else
                return false;
        } finally {
            await client.close();
        }
    }

    public static async clearAndCreateMany(
        collectionName: string,
        term: object,
        values: Array<object>
    ): Promise<boolean> {
        DalConfiguration.VerifyDatabaseConfig();

        const client = await this.connect();

        try {
            let db = client.db(DalConfiguration.database);
            let collection = db.collection(collectionName);

            let deleteResult = await collection.deleteMany(term);
            let insertResult = await collection.insertMany(values);

            if (deleteResult.result.ok === 1 && insertResult.result.ok === 1) {
                return true;
            } else {
                return false;
            }

        } finally {
            await client.close();
        }
    }

    public static async clearAllAndCreateMany(
        collectionName: string,
        values: Array<object>
    ): Promise<boolean> {
        return await GenericStore.clearAndCreateMany(collectionName, {}, values);
    }

    public static async getAll(
        collectionName: string
    ): Promise<Array<object>> {
        DalConfiguration.VerifyDatabaseConfig();

        const client = await this.connect();

        try {
            let db = client.db(DalConfiguration.database);
            let collection = db.collection(collectionName);

            const result = await collection.find().toArray();

            return result;
        } finally {
            await client.close();
        }
    }

    public static async getBy(
        collectionName: string,
        term: object,
        sort: object,
        count?: number
    ): Promise<Array<object>> {
        DalConfiguration.VerifyDatabaseConfig();

        const client = await this.connect();

        try {
            let db = client.db(DalConfiguration.database);
            let collection = db.collection(collectionName);

            let result = await collection
                .find(term)
                .sort(sort);

            if (count) result = result.limit(count);

            return result.toArray();
        } finally {
            await client.close();
        }
    }

    public static async remove(
        collectionName: string,
        term: object
    ): Promise<boolean> {
        DalConfiguration.VerifyDatabaseConfig();

        const client = await this.connect();

        try {
            let db = client.db(DalConfiguration.database);
            let collection = db.collection(collectionName);

            let result = await collection.deleteOne(term);

            return result.deletedCount === 1;
        } finally {
            await client.close();
        }
    }
}