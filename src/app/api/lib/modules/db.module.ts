import 'reflect-metadata';
import { ContainerModule, ContainerModuleLoadOptions } from 'inversify';
import { DB_TYPES } from '../symbols/Symbols';
import { IDatabase } from '../interfaces/database/IDatabase';
import { MongoDBProvider } from '../providers/mongoDb.provider';
import { DBProviderFactory } from '../factories/DBFactory';

export const dbModule: ContainerModule = new ContainerModule(
    (options: ContainerModuleLoadOptions) => {
        options.bind<IDatabase>(DB_TYPES.MongoDBProvider).to(MongoDBProvider);
        options.bind(DB_TYPES.DBProviderFactory).to(DBProviderFactory);
    }
);

