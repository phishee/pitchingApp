// TODO: Implement DBProviderFactory
import { injectable, inject } from "inversify";
import { DB_TYPES } from "../symbols/Symbols";
import type { IDatabase } from "../interfaces/database/IDatabase";
import {MongoDBProvider} from "../providers/mongoDb.provider";

@injectable()
export class DBProviderFactory {
    private dbStrategy: string;
    constructor(@inject(DB_TYPES.MongoDBProvider) private mongoDbProvider: IDatabase) {
        this.dbStrategy = process.env.DB_STRATEGY || "mongodb";
    }

    createDBProvider(collectionName?: string): IDatabase {
        switch (this.dbStrategy) {
            case "mongodb":
                return this.mongoDbProvider;
            default:
                throw new Error(`Unsupported database strategy: ${this.dbStrategy}`);
        }
    }
}
    