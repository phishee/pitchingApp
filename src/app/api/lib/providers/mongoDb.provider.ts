// src/app/api/lib/providers/mongoDb.provider.ts

import { IDatabase, PopulateOptions } from "../interfaces/database/IDatabase";
import { MongoClient, Db, ObjectId, Collection, MongoClientOptions, Document } from "mongodb";
import { injectable } from "inversify";
import { ClientSession } from "mongodb";

@injectable()
export class MongoDBProvider implements IDatabase {
    private db!: Db;
    private client: MongoClient;
    private initPromise: Promise<void>;
    private readonly MAX_RETRIES = 5;
    private readonly RETRY_DELAY = 2000;

    constructor() {
        const uri = process.env.MONGODB_URI;
        if (!uri) {
            console.error('MONGODB_URI is not set in environment variables');
            throw new Error('MONGODB_URI environment variable is not set');
        }

        const options: MongoClientOptions = {
            connectTimeoutMS: 30000,
            socketTimeoutMS: 45000,
            serverSelectionTimeoutMS: 30000,
            maxPoolSize: 10,
            minPoolSize: 5,
            retryWrites: true,
            retryReads: true,
            heartbeatFrequencyMS: 5000,
            maxIdleTimeMS: 30000
        };

        this.client = new MongoClient(uri, options);
        this.initPromise = this.initializeWithRetry();
    }

    /**
     * Gets a MongoDB collection with type safety
     */
    getCollection<T extends Document>(name: string): Collection<T> {
        return this.db.collection<T>(name);
    }

    /**
     * Initializes the MongoDB connection with retry logic
     */
    private async initializeWithRetry(retryCount = 0): Promise<void> {
        try {
            console.log(`[MongoDB] Attempting connection (attempt ${retryCount + 1}/${this.MAX_RETRIES})...`);

            await this.client.connect();
            const dbName = process.env.DB_NAME || "bible";
            console.log(`[MongoDB] Connected to server, using database: ${dbName}`);

            this.db = this.client.db(dbName);

            await this.db.command({ ping: 1 });
            console.log('[MongoDB] Ping successful');

            const collections = await this.db.listCollections().toArray();
            console.log(`[MongoDB] Available collections: ${collections.map(c => c.name).join(', ')}`);

        } catch (error: any) {
            console.error(`[MongoDB] Connection failed (attempt ${retryCount + 1}/${this.MAX_RETRIES}):`, error.message);

            try {
                await this.client.close();
            } catch (closeError) {
                console.error('[MongoDB] Error closing connection:', closeError);
            }

            if (retryCount < this.MAX_RETRIES - 1) {
                console.log(`[MongoDB] Retrying in ${this.RETRY_DELAY}ms...`);
                await new Promise(resolve => setTimeout(resolve, this.RETRY_DELAY));
                return this.initializeWithRetry(retryCount + 1);
            }

            throw new Error(`[MongoDB] Initialization failed after ${this.MAX_RETRIES} attempts: ${error.message}`);
        }
    }

    /**
     * Ensures the database connection is active and ready
     */
    private async ensureConnected(): Promise<void> {
        try {
            await this.initPromise;
            await this.db.command({ ping: 1 });
        } catch (error: any) {
            console.error('[MongoDB] Connection error:', error.message);
            this.initPromise = this.initializeWithRetry();
            await this.initPromise;
        }
    }

    /**
     * Helper method to convert date fields to Date objects
     */
    private convertDatesToObjects(data: any): any {
        if (!data || typeof data !== 'object') {
            return data;
        }

        const converted = { ...data };

        // Common date fields to convert
        const dateFields = ['startTime', 'endTime', 'createdAt', 'updatedAt', 'startDate', 'endDate'];
        
        dateFields.forEach(field => {
            if (converted[field] && !(converted[field] instanceof Date)) {
                converted[field] = new Date(converted[field]);
            }
        });

        // Handle recurrence dates
        if (converted.recurrence) {
            if (converted.recurrence.startDate && !(converted.recurrence.startDate instanceof Date)) {
                converted.recurrence.startDate = new Date(converted.recurrence.startDate);
            }
            if (converted.recurrence.endDate && !(converted.recurrence.endDate instanceof Date)) {
                converted.recurrence.endDate = new Date(converted.recurrence.endDate);
            }
        }

        // Note: Details are now stored separately and referenced by detailsId
        // Date conversion for details would need to be handled in the respective detail services

        return converted;
    }

    /**
     * Converts query object to handle ObjectId conversion for _id fields
     */
    private processQuery(query: any): any {
        if (!query || typeof query !== 'object') {
            return query;
        }

        const processedQuery = { ...query };

        // ✅ FIXED: Handle _id field conversion safely (no deprecation warnings)
        if (processedQuery._id) {
            // If it's already an ObjectId, use it as-is
            if (processedQuery._id instanceof ObjectId) {
                processedQuery._id = processedQuery._id;
            }
            // If it's a valid hex string, convert it
            else if (typeof processedQuery._id === 'string' && ObjectId.isValid(processedQuery._id)) {
                processedQuery._id = ObjectId.createFromHexString(processedQuery._id);
            }
            // If it's a 24-character hex string (legacy format)
            else if (typeof processedQuery._id === 'string' && /^[0-9a-fA-F]{24}$/.test(processedQuery._id)) {
                processedQuery._id = ObjectId.createFromHexString(processedQuery._id);
            }
            // If it's an object with _bsontype (from MongoDB driver)
            else if (processedQuery._id && typeof processedQuery._id === 'object' && processedQuery._id._bsontype === 'ObjectID') {
                processedQuery._id = ObjectId.createFromHexString(processedQuery._id.toString());
            }
        }

        // Handle nested objects (for complex queries)
        for (const [key, value] of Object.entries(processedQuery)) {
            if (
                value && 
                typeof value === 'object' && 
                !Array.isArray(value) && 
                !(value instanceof ObjectId) &&
                !(value instanceof Date)  // ✅ Exclude Date objects
            ) {
                processedQuery[key] = this.processQuery(value);
            }
        }

        return processedQuery;
    }

    /**
     * Finds a document by its ID with automatic ObjectId conversion
     */
    async findById(collection: string, id: string | ObjectId): Promise<any> {
        await this.ensureConnected();
        try {
            let objectId;
            if (id instanceof ObjectId) {
                // If it's already an ObjectId, use it directly
                objectId = id;
            } else if (typeof id === 'string' && ObjectId.isValid(id)) {
                // If it's a valid hex string, convert it to ObjectId
                objectId = ObjectId.createFromHexString(id);
            } else {
                console.log(`[MongoDB] Invalid ObjectId: ${id}`);
                return null;
            }

            const result = await this.db.collection(collection).findOne({ _id: objectId });
            return result;
        } catch (error) {
            console.error(`Error finding document by ID in collection ${collection}:`, error);
            throw error;
        }
    }

    /**
     * Finds a single document in a collection
     */
    async findOne(collection: string, query: any): Promise<any> {
        await this.ensureConnected();
        try {
            const processedQuery = this.processQuery(query);
            const result = await this.db.collection(collection).findOne(processedQuery);
            return result;
        } catch (error) {
            console.error(`Error finding document in collection ${collection}:`, error);
            throw error;
        }
    }

    /**
     * Retrieves all documents from a collection
     */
    async findAll(collection: string): Promise<any> {
        await this.ensureConnected();
        try {
            const documents = await this.db.collection(collection).find().toArray();
            return documents;
        } catch (error: any) {
            console.error(`[MongoDB] Error in findAll for collection ${collection}:`, error.message);
            throw error;
        }
    }

    /**
     * Finds documents matching a query in a collection
     */
    async findQuery(collection: string, query: any): Promise<any> {
        await this.ensureConnected();
        try {
            const processedQuery = this.processQuery(query);
            const result = await this.db.collection(collection).find(processedQuery).toArray();
            return result;
        } catch (error: any) {
            console.error(`[MongoDB] Error in findQuery for collection ${collection}:`, error.message);
            throw error;
        }
    }

    /**
     * Creates a new document in a collection
     */
    async create(collection: string, data: any): Promise<any> {
        await this.ensureConnected();
        try {
            const convertedData = this.convertDatesToObjects(data);
            const result = await this.db.collection(collection).insertOne({
                ...convertedData,
                createdAt: new Date(),
                updatedAt: new Date()
            });
            const createdDoc = await this.db.collection(collection).findOne({ _id: result.insertedId });
            return createdDoc;
        } catch (error) {
            console.error(`Error creating document in collection ${collection}:`, error);
            throw error;
        }
    }

    /**
     * Updates a document in a collection
     */
    async update(collection: string, id: string | ObjectId, data: any): Promise<any> {
        await this.ensureConnected();
        console.log(`[MongoDBProvider] Update called with collection: ${collection}, id: ${id}, idType: ${typeof id}, idLength: ${id?.toString().length}`);
        
        try {
            const { _id, ...updateData } = data;
            const convertedData = this.convertDatesToObjects(updateData);
            
            let objectId;
            if (id instanceof ObjectId) {
                // If it's already an ObjectId, use it directly
                objectId = id;
            } else if (typeof id === 'string' && ObjectId.isValid(id)) {
                // If it's a valid hex string, convert it to ObjectId
                objectId = ObjectId.createFromHexString(id);
            } else {
                console.log(`[MongoDBProvider] Invalid ObjectId: ${id}`);
                return null;
            }
            
            const result = await this.db.collection(collection).findOneAndUpdate(
                { _id: objectId },
                { $set: { ...convertedData, updatedAt: new Date() } },
                { returnDocument: 'after' }
            );
            return result;
        } catch (error) {
            console.error(`Error updating document in collection ${collection}:`, error);
            throw error;
        }
    }

    /**
     * Deletes a document from a collection
     */
    async delete(collection: string, id: string | ObjectId): Promise<boolean> {
        await this.ensureConnected();
        try {
            let objectId;
            if (id instanceof ObjectId) {
                // If it's already an ObjectId, use it directly
                objectId = id;
            } else if (typeof id === 'string' && ObjectId.isValid(id)) {
                // If it's a valid hex string, convert it to ObjectId
                objectId = ObjectId.createFromHexString(id);
            } else {
                console.log(`[MongoDB] Invalid ObjectId for delete: ${id}`);
                return false;
            }

            const result = await this.db.collection(collection).deleteOne({ 
                _id: objectId 
            });
            return result.deletedCount > 0;
        } catch (error) {
            console.error(`Error deleting document from collection ${collection}:`, error);
            throw error;
        }
    }

    /**
     * Closes the MongoDB connection
     */
    async disconnect(): Promise<void> {
        try {
            await this.initPromise;
            await this.client.close();
            console.log('MongoDB connection closed');
        } catch (error) {
            console.error('Error disconnecting from MongoDB:', error);
            throw error;
        }
    }

    /**
     * Finds documents and populates foreign key references
     */
    async findWithPopulate(
        collection: string,
        query: any = {},
        populateConfig: {
            path: string;
            from: string;
            localField?: string;
            foreignField?: string;
            select?: string[];
            as?: string;
        } | Array<{
            path: string;
            from: string;
            localField?: string;
            foreignField?: string;
            select?: string[];
            as?: string;
        }>
    ): Promise<any[]> {
        await this.ensureConnected();

        const populateConfigs = Array.isArray(populateConfig) ? populateConfig : [populateConfig];

        try {
            const documents = await this.db.collection(collection).find(this.processQuery(query)).toArray();

            if (documents.length === 0) {
                return [];
            }

            let result = [...documents];

            for (const config of populateConfigs) {
                const {
                    path,
                    from,
                    localField = path,
                    foreignField = this.determineForeignField(path),
                    select,
                    as = this.determineAlias(path)
                } = config;

                const foreignKeyValues = result
                    .map(doc => this.getNestedValue(doc, localField))
                    .filter(val => val != null);

                if (foreignKeyValues.length === 0) {
                    result = result.map(doc => ({ ...doc, [as]: null }));
                    continue;
                }

                // ✅ Use createFromHexString for _id conversions (no deprecation warning)
                const processedForeignKeyValues = foreignField === '_id'
                    ? foreignKeyValues.map(val => {
                        if (typeof val === 'string' && ObjectId.isValid(val)) {
                            return ObjectId.createFromHexString(val);
                        }
                        return val;
                    })
                    : foreignKeyValues;

                const foreignQuery = { [foreignField]: { $in: processedForeignKeyValues } };

                let projection: any = {};
                if (select && select.length > 0) {
                    select.forEach(field => projection[field] = 1);
                    projection[foreignField] = 1;
                }

                const relatedDocs = await this.db.collection(from.toLowerCase())
                    .find(foreignQuery, Object.keys(projection).length > 0 ? { projection } : {})
                    .toArray();

                const lookupMap = new Map();
                relatedDocs.forEach(doc => {
                    const keyValue = foreignField === '_id'
                        ? doc[foreignField]?.toString()
                        : doc[foreignField]?.toString();
                    lookupMap.set(keyValue, doc);
                });

                result = result.map(doc => {
                    const foreignKeyValue = this.getNestedValue(doc, localField);
                    const relatedDoc = lookupMap.get(foreignKeyValue?.toString());

                    return {
                        ...doc,
                        [as]: relatedDoc || null
                    };
                });
            }

            return result;

        } catch (error: any) {
            console.error(`[MongoDB] Error in findWithPopulate for collection ${collection}:`, error.message);
            throw error;
        }
    }

    /**
     * Finds a single document by ID and populates foreign key references
     */
    async findByIdWithPopulate(
        collection: string,
        id: string | ObjectId,
        populateConfig: PopulateOptions
    ): Promise<any> {
        let objectId;
        if (id instanceof ObjectId) {
            // If it's already an ObjectId, use it directly
            objectId = id;
        } else if (typeof id === 'string' && ObjectId.isValid(id)) {
            // If it's a valid hex string, convert it to ObjectId
            objectId = ObjectId.createFromHexString(id);
        } else {
            console.log(`[MongoDB] Invalid ObjectId: ${id}`);
            return null;
        }

        // Use the objectId we created above
        const results = await this.findWithPopulate(
            collection,
            { _id: objectId },
            populateConfig
        );

        return results.length > 0 ? results[0] : null;
    }

    /**
     * Security-focused version that automatically excludes internal fields
     */
    async findWithPopulateSafe(
        collection: string,
        query: any = {},
        populateConfig: PopulateOptions,
        options: {
            excludeMainId?: boolean;
            excludePopulatedIds?: boolean;
            excludeFields?: string[];
        } = {}
    ): Promise<any[]> {
        const {
            excludeMainId = true,
            excludePopulatedIds = true,
            excludeFields = []
        } = options;

        const results = await this.findWithPopulate(collection, query, populateConfig);

        return results.map(doc => {
            const cleanDoc = { ...doc };

            if (excludeMainId && '_id' in cleanDoc) {
                delete cleanDoc._id;
            }

            if (excludePopulatedIds) {
                const configs = Array.isArray(populateConfig) ? populateConfig : [populateConfig];
                configs.forEach(config => {
                    const as = config.as || this.determineAlias(config.path);
                    if (cleanDoc[as] && typeof cleanDoc[as] === 'object' && '_id' in cleanDoc[as]) {
                        delete cleanDoc[as]._id;
                    }
                });
            }

            excludeFields.forEach(field => {
                if (field in cleanDoc) {
                    delete cleanDoc[field];
                }
            });

            return cleanDoc;
        });
    }

    private determineForeignField(localField: string): string {
        const fieldMappings: { [key: string]: string } = {
            'userId': 'userId',
            'teamId': 'teamId',
            'organizationId': 'organizationId',
            'createdBy': 'userId',
            'updatedBy': 'userId',
            'assignedTo': 'userId'
        };

        return fieldMappings[localField] || '_id';
    }

    private determineAlias(path: string): string {
        if (path.endsWith('Id')) {
            return path.slice(0, -2).toLowerCase();
        }
        return path.toLowerCase();
    }

    private getNestedValue(obj: any, path: string): any {
        return path.split('.').reduce((current, key) => {
            return current && current[key] !== undefined ? current[key] : undefined;
        }, obj);
    }

    /**
     * Advanced filtering with multiple conditions and operators
     */
    async findWithFilters(
        collection: string,
        filters: {
            field: string;
            operator: '$eq' | '$in' | '$gte' | '$lte' | '$ne' | '$exists';
            value: any;
        }[],
        options: {
            limit?: number;
            skip?: number;
            sort?: { [field: string]: 1 | -1 };
            projection?: { [field: string]: 0 | 1 };
        } = {}
    ): Promise<any[]> {
        await this.ensureConnected();

        try {
            const query: any = {};

            filters.forEach(filter => {
                const value = filter.value;

                if (filter.operator === '$eq') {
                    query[filter.field] = value;
                } else if (filter.operator === '$in') {
                    query[filter.field] = { $in: Array.isArray(value) ? value : [value] };
                } else if (filter.operator === '$gte') {
                    query[filter.field] = { ...query[filter.field], $gte: value };
                } else if (filter.operator === '$lte') {
                    query[filter.field] = { ...query[filter.field], $lte: value };
                } else if (filter.operator === '$ne') {
                    query[filter.field] = { $ne: value };
                } else if (filter.operator === '$exists') {
                    query[filter.field] = { $exists: value };
                }
            });

            const processedQuery = this.processQuery(query);

            let queryBuilder = this.db.collection(collection).find(processedQuery);

            if (options.projection) {
                queryBuilder = queryBuilder.project(options.projection);
            }

            if (options.sort) {
                queryBuilder = queryBuilder.sort(options.sort);
            }

            if (options.skip) {
                queryBuilder = queryBuilder.skip(options.skip);
            }

            if (options.limit) {
                queryBuilder = queryBuilder.limit(options.limit);
            }

            return await queryBuilder.toArray();
        } catch (error: any) {
            console.error(`[MongoDB] Error in findWithFilters for collection ${collection}:`, error.message);
            throw error;
        }
    }

    /**
     * Bulk insert multiple documents
     */
    async bulkInsert(
        collection: string,
        documents: any[],
        session?: ClientSession
    ): Promise<{ insertedIds: string[]; insertedCount: number }> {
        await this.ensureConnected();

        if (documents.length === 0) {
            return { insertedIds: [], insertedCount: 0 };
        }

        try {
            const documentsWithTimestamps = documents.map(doc => {
                const processed = JSON.parse(JSON.stringify(doc));

                // Force convert startTime
                if (processed.startTime) {
                    processed.startTime = new Date(processed.startTime);
                }

                // Force convert endTime
                if (processed.endTime) {
                    processed.endTime = new Date(processed.endTime);
                }

                // Force convert createdAt
                if (processed.createdAt) {
                    processed.createdAt = new Date(processed.createdAt);
                } else {
                    processed.createdAt = new Date();
                }

                // Force convert updatedAt
                if (processed.updatedAt) {
                    processed.updatedAt = new Date(processed.updatedAt);
                } else {
                    processed.updatedAt = new Date();
                }

                // Force convert recurrence dates
                if (processed.recurrence) {
                    if (processed.recurrence.startDate) {
                        processed.recurrence.startDate = new Date(processed.recurrence.startDate);
                    }
                    if (processed.recurrence.endDate) {
                        processed.recurrence.endDate = new Date(processed.recurrence.endDate);
                    }
                    if (processed.recurrence.exceptions && Array.isArray(processed.recurrence.exceptions)) {
                        processed.recurrence.exceptions = processed.recurrence.exceptions.map(
                            (exc: any) => new Date(exc)
                        );
                    }
                }

                // Note: Details are now stored separately and referenced by detailsId
                // Date conversion for details would need to be handled in the respective detail services

                return processed;
            });

            const options = session ? { session } : {};
            const result = await this.db.collection(collection).insertMany(
                documentsWithTimestamps,
                options
            );

            const insertedIds = Object.values(result.insertedIds).map(id => id.toString());

            return {
                insertedIds,
                insertedCount: result.insertedCount
            };
        } catch (error: any) {
            console.error(`[MongoDB] Error in bulkInsert for collection ${collection}:`, error.message);
            throw error;
        }
    }

    /**
     * Execute operations within a transaction
     */
    async withTransaction<T>(
        operations: (session: ClientSession) => Promise<T>
    ): Promise<T> {
        await this.ensureConnected();

        const session = this.client.startSession();

        try {
            session.startTransaction();

            const result = await operations(session);

            await session.commitTransaction();

            return result;
        } catch (error: any) {
            await session.abortTransaction();
            console.error('[MongoDB] Transaction failed:', error.message);
            throw error;
        } finally {
            await session.endSession();
        }
    }

    /**
     * Count documents matching a query
     */
    async count(collection: string, query: any = {}): Promise<number> {
        await this.ensureConnected();

        try {
            const processedQuery = this.processQuery(query);
            return await this.db.collection(collection).countDocuments(processedQuery);
        } catch (error: any) {
            console.error(`[MongoDB] Error in count for collection ${collection}:`, error.message);
            throw error;
        }
    }

    /**
     * Delete multiple documents matching a query
     */
    async deleteMany(
        collection: string,
        query: any,
        session?: ClientSession
    ): Promise<number> {
        await this.ensureConnected();

        try {
            const processedQuery = this.processQuery(query);
            const options = session ? { session } : {};
            const result = await this.db.collection(collection).deleteMany(processedQuery, options);
            return result.deletedCount;
        } catch (error: any) {
            console.error(`[MongoDB] Error in deleteMany for collection ${collection}:`, error.message);
            throw error;
        }
    }

    /**
     * Update multiple documents matching a query
     */
    async updateMany(
        collection: string,
        query: any,
        update: any,
        session?: ClientSession
    ): Promise<number> {
        await this.ensureConnected();

        try {
            const processedQuery = this.processQuery(query);
            const convertedUpdate = this.convertDatesToObjects(update);
            const options = session ? { session } : {};
            const result = await this.db.collection(collection).updateMany(
                processedQuery,
                { $set: { ...convertedUpdate, updatedAt: new Date() } },
                options
            );
            return result.modifiedCount;
        } catch (error: any) {
            console.error(`[MongoDB] Error in updateMany for collection ${collection}:`, error.message);
            throw error;
        }
    }

    /**
     * Check if a document exists with given query
     */
    async exists(collection: string, query: any): Promise<boolean> {
        await this.ensureConnected();

        try {
            const processedQuery = this.processQuery(query);
            const count = await this.db.collection(collection).countDocuments(processedQuery, { limit: 1 });
            return count > 0;
        } catch (error: any) {
            console.error(`[MongoDB] Error in exists for collection ${collection}:`, error.message);
            throw error;
        }
    }
}