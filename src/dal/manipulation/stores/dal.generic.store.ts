﻿import { MongoClient, ObjectId } from 'mongodb';

import { DalConfiguration } from './../../configuration/dal.configuration';

export abstract class GenericStore {

    private static async connect(): Promise<MongoClient> {
        const client = await MongoClient.connect(DalConfiguration.url, {
            auth: {
                user: DalConfiguration.username,
                password: DalConfiguration.password
            },
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        return client;
    }

    public static async create(
        collectionName: string,
        value: object
    ): Promise<ObjectId | undefined> {
        DalConfiguration.VerifyDatabaseConfig();

        const client = await this.connect();

        try {
            const db = client.db(DalConfiguration.database);
            const collection = db.collection(collectionName);

            const result = await collection.insertOne(value);
            if (result.insertedCount === 1)
                return result.insertedId as ObjectId;
            else
                return undefined;

        } finally {
            await client.close();
        }
    }

    public static async createOrUpdate(
        collectionName: string,
        term: object,
        value: object
    ): Promise<object | undefined> {
        DalConfiguration.VerifyDatabaseConfig();

        const client = await this.connect();

        try {
            const db = client.db(DalConfiguration.database);
            const collection = db.collection(collectionName);

            // nb : upsert either
            // + Creates a new document if no documents match the filter. Returns null after inserting the new document, unless returnNewDocument is true.
            // + Updates a single document that matches the filter.

            const result = await collection.findOneAndUpdate(term, { $set: value }, { upsert: true, returnOriginal:false });
            if (result.ok === 1)
                return result.value;
            else
                return undefined;
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
            const db = client.db(DalConfiguration.database);
            const collection = db.collection(collectionName);

            const deleteResult = await collection.deleteMany(term);
            const insertResult = await collection.insertMany(values);

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
            const db = client.db(DalConfiguration.database);
            const collection = db.collection(collectionName);

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
            const db = client.db(DalConfiguration.database);
            const collection = db.collection(collectionName);

            let result = await collection
                .find(term)
                .sort(sort);

            if (count) result = result.limit(count);

            return await result.toArray();
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
            const db = client.db(DalConfiguration.database);
            const collection = db.collection(collectionName);

            const result = await collection.deleteOne(term);

            return result.deletedCount === 1;
        } finally {
            await client.close();
        }
    }
}