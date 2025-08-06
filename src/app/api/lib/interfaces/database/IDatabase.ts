import { Collection, Document } from "mongodb";

export interface IDatabase {
    findAll(collection: string): Promise<any[]>;
    findQuery(collection: string, query: any): Promise<any[]>;
    findOne(collection: string, query: any): Promise<any>;
    create(collection: string, data: any): Promise<any>;
    update(collection: string, id: string, data: any): Promise<any>;
    delete(collection: string, id: string): Promise<any>;
    findById(collection: string, id: string): Promise<any>;
}

