import { IDatabase, PopulateOptions } from "../interfaces/database/IDatabase";
import { MongoClient, Db, ObjectId, Collection, MongoClientOptions, Document } from "mongodb";
import { injectable } from "inversify";

@injectable()
export class MongoDBProvider implements IDatabase {
    private db!: Db;
    private client: MongoClient;
    private initPromise: Promise<void>; // Add promise for initialization
    private readonly MAX_RETRIES = 5;
    private readonly RETRY_DELAY = 2000; // 2 seconds

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
     * @param name - The name of the collection to retrieve
     * @returns A typed MongoDB collection
     */
    getCollection<T extends Document>(name: string): Collection<T> {
        return this.db.collection<T>(name);
    }

    /**
     * Initializes the MongoDB connection with retry logic
     * @param retryCount - Current retry attempt number
     * @throws Error if connection fails after max retries
     */
    private async initializeWithRetry(retryCount = 0): Promise<void> {
        try {
            console.log(`[MongoDB] Attempting connection (attempt ${retryCount + 1}/${this.MAX_RETRIES})...`);

            // Test the connection before using it
            await this.client.connect();
            const dbName = process.env.DB_NAME || "bible";
            console.log(`[MongoDB] Connected to server, using database: ${dbName}`);

            this.db = this.client.db(dbName);

            // Verify the connection with a ping
            await this.db.command({ ping: 1 });
            console.log('[MongoDB] Ping successful');

            // List collections to verify database access
            const collections = await this.db.listCollections().toArray();
            console.log(`[MongoDB] Available collections: ${collections.map(c => c.name).join(', ')}`);

        } catch (error: any) {
            console.error(`[MongoDB] Connection failed (attempt ${retryCount + 1}/${this.MAX_RETRIES}):`, error.message);

            // Close any existing connection before retrying
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
     * @throws Error if connection cannot be established
     */
    private async ensureConnected(): Promise<void> {
        try {
            await this.initPromise;
            // Verify the connection is still alive
            await this.db.command({ ping: 1 });
        } catch (error: any) {
            console.error('[MongoDB] Connection error:', error.message);
            // Attempt to reconnect
            this.initPromise = this.initializeWithRetry();
            await this.initPromise;
        }
    }

    /**
     * Converts query object to handle ObjectId conversion for _id fields
     * @param query - The query object
     * @returns The processed query with ObjectId conversion
     */
    private processQuery(query: any): any {
        if (!query || typeof query !== 'object') {
            return query;
        }

        const processedQuery = { ...query };

        // Handle _id field conversion
        if (processedQuery._id) {
            if (typeof processedQuery._id === 'string' && ObjectId.isValid(processedQuery._id)) {
                // Create a fresh ObjectId instance
                processedQuery._id = new ObjectId(processedQuery._id);
            } else if (processedQuery._id && typeof processedQuery._id === 'object' && processedQuery._id._bsontype === 'ObjectID') {
                // If it's already an ObjectId, ensure it's properly formatted
                processedQuery._id = new ObjectId(processedQuery._id.toString());
            }
        }

        // Handle nested objects (for complex queries)
        for (const [key, value] of Object.entries(processedQuery)) {
            if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof ObjectId)) {
                processedQuery[key] = this.processQuery(value);
            }
        }

        return processedQuery;
    }

    /**
     * Finds a document by its ID with automatic ObjectId conversion
     * @param collection - The collection to search in
     * @param id - The document ID (string)
     * @returns The found document or null
     */
    async findById(collection: string, id: string): Promise<any> {
        await this.ensureConnected();
        try {
            if (!ObjectId.isValid(id)) {
                console.log(`[MongoDB] Invalid ObjectId: ${id}`);
                return null;
            }

            const objectId = new ObjectId(id);
            const result = await this.db.collection(collection).findOne({ _id: objectId });
            return result;
        } catch (error) {
            console.error(`Error finding document by ID in collection ${collection}:`, error);
            throw error;
        }
    }

    /**
     * Finds a single document in a collection
     * @param collection - The collection to search in
     * @param query - The query criteria
     * @returns The found document or null
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
     * @param collection - The collection to retrieve from
     * @returns Array of all documents in the collection
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
     * @param collection - The collection to search in
     * @param query - The query criteria
     * @returns Array of matching documents
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
     * @param collection - The collection to create in
     * @param data - The document data to insert
     * @returns The created document
     */
    async create(collection: string, data: any): Promise<any> {
        await this.ensureConnected();
        try {
            const result = await this.db.collection(collection).insertOne({
                ...data,
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
     * @param collection - The collection containing the document
     * @param id - The ID of the document to update
     * @param data - The new document data
     * @returns The updated document or null if ID is invalid
     */
    async update(collection: string, id: string, data: any): Promise<any> {
        await this.ensureConnected();
        if (!ObjectId.isValid(id)) return null;
        try {
            const { _id, ...updateData } = data;
            const result = await this.db.collection(collection).findOneAndUpdate(
                { _id: new ObjectId(id) },
                { $set: { ...updateData, updatedAt: new Date() } },
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
     * @param collection - The collection containing the document
     * @param id - The ID of the document to delete
     * @returns True if document was deleted, false if ID is invalid
     */
    async delete(collection: string, id: string): Promise<boolean> {
        await this.ensureConnected();
        if (!ObjectId.isValid(id)) return false;
        try {
            const result = await this.db.collection(collection).deleteOne({ _id: new ObjectId(id) });
            return result.deletedCount > 0;
        } catch (error) {
            console.error(`Error deleting document from collection ${collection}:`, error);
            throw error;
        }
    }

    /**
     * Closes the MongoDB connection
     * @throws Error if disconnection fails
     */
    async disconnect(): Promise<void> {
        // Wait for initialization before disconnecting
        try {
            await this.initPromise;
            await this.client.close();
            console.log('MongoDB connection closed');
        } catch (error) {
            console.error('Error disconnecting from MongoDB:', error);
            throw error;
        }
    }

    // Add these CORE methods to your MongoDBProvider class - they work with any collection

/**
 * Finds documents and populates foreign key references with data from other collections
 * @param collection - The primary collection to search in
 * @param query - The query criteria for the primary collection
 * @param populateConfig - Configuration for population (single object or array of objects)
 * @returns Array of documents with populated references
 */
async findWithPopulate(
    collection: string, 
    query: any = {}, 
    populateConfig: {
        path: string;           // Field to populate (e.g., 'userId')
        from: string;           // Collection to populate from (e.g., 'User')
        localField?: string;    // Local field name (defaults to path)
        foreignField?: string;  // Foreign field name (defaults to 'userId' or '_id')
        select?: string[];      // Fields to select from populated document
        as?: string;            // Alias for populated field (defaults to path without 'Id')
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
    
    // Normalize populateConfig to always be an array
    const populateConfigs = Array.isArray(populateConfig) ? populateConfig : [populateConfig];
    
    try {
        // Step 1: Get the main documents
        const documents = await this.db.collection(collection).find(this.processQuery(query)).toArray();
        
        if (documents.length === 0) {
            return [];
        }

        // Step 2: Process each populate configuration
        let result = [...documents]; // Start with a copy of original documents
        
        for (const config of populateConfigs) {
            const {
                path,
                from,
                localField = path,
                foreignField = this.determineForeignField(path),
                select,
                as = this.determineAlias(path)
            } = config;

            // Extract foreign key values for this populate
            const foreignKeyValues = result
                .map(doc => doc[localField])
                .filter(val => val != null);

            if (foreignKeyValues.length === 0) {
                // Add null value for this population
                result = result.map(doc => ({ ...doc, [as]: null }));
                continue;
            }

            // Convert to ObjectId if the foreign field is _id
            const processedForeignKeyValues = foreignField === '_id' 
                ? foreignKeyValues.map(val => {
                    if (typeof val === 'string' && ObjectId.isValid(val)) {
                        return new ObjectId(val);
                    }
                    return val;
                  })
                : foreignKeyValues;

            // Fetch related documents for this populate
            const foreignQuery = { [foreignField]: { $in: processedForeignKeyValues } };
            
            let projection: any = {};
            if (select && select.length > 0) {
                select.forEach(field => projection[field] = 1);
                projection[foreignField] = 1; // Always include the join field
            }

            const relatedDocs = await this.db.collection(from.toLowerCase())
                .find(foreignQuery, Object.keys(projection).length > 0 ? { projection } : {})
                .toArray();

            // Create lookup map for this populate
            const lookupMap = new Map();
            relatedDocs.forEach(doc => {
                const keyValue = foreignField === '_id' 
                    ? doc[foreignField]?.toString() 
                    : doc[foreignField]?.toString();
                lookupMap.set(keyValue, doc);
            });

            // Apply this population to all documents
            result = result.map(doc => {
                const foreignKeyValue = doc[localField];
                const relatedDoc = lookupMap.get(foreignKeyValue?.toString());
                
                return {
                    ...doc,
                    [as]: relatedDoc || null
                };
            });
        }

        // Step 3: Return results with BOTH original foreign keys AND populated objects
        return result;

    } catch (error: any) {
        console.error(`[MongoDB] Error in findWithPopulate for collection ${collection}:`, error.message);
        throw error;
    }
}

/**
 * Finds a single document by ID and populates foreign key references
 * @param collection - The primary collection to search in
 * @param id - The document ID to find
 * @param populateConfig - Configuration for population
 * @returns Single document with populated references or null
 */
async findByIdWithPopulate(
    collection: string,
    id: string,
    populateConfig: PopulateOptions
): Promise<any> {
    if (!ObjectId.isValid(id)) {
        console.log(`[MongoDB] Invalid ObjectId: ${id}`);
        return null;
    }

    const results = await this.findWithPopulate(
        collection,
        { _id: new ObjectId(id) },
        populateConfig
    );

    return results.length > 0 ? results[0] : null;
}

/**
 * Security-focused version that automatically excludes internal fields
 * @param collection - The primary collection to search in
 * @param query - The query criteria for the primary collection
 * @param populateConfig - Configuration for population
 * @param options - Security options
 * @returns Array of documents with populated references (no internal IDs)
 */
async findWithPopulateSafe(
    collection: string, 
    query: any = {}, 
    populateConfig: PopulateOptions,
    options: {
        excludeMainId?: boolean;     // Exclude _id from main documents (default: true)
        excludePopulatedIds?: boolean; // Exclude _id from populated documents (default: true)
        excludeFields?: string[];    // Additional fields to exclude
    } = {}
): Promise<any[]> {
    const { 
        excludeMainId = true, 
        excludePopulatedIds = true,
        excludeFields = []
    } = options;

    // Get the populated results
    const results = await this.findWithPopulate(collection, query, populateConfig);

    // Remove sensitive fields
    return results.map(doc => {
        const cleanDoc = { ...doc };
        
        // Remove main document _id if requested
        if (excludeMainId && '_id' in cleanDoc) {
            delete cleanDoc._id;
        }

        // Remove _id from populated objects if requested
        if (excludePopulatedIds) {
            const configs = Array.isArray(populateConfig) ? populateConfig : [populateConfig];
            configs.forEach(config => {
                const as = config.as || this.determineAlias(config.path);
                if (cleanDoc[as] && typeof cleanDoc[as] === 'object' && '_id' in cleanDoc[as]) {
                    delete cleanDoc[as]._id;
                }
            });
        }

        // Remove additional excluded fields
        excludeFields.forEach(field => {
            if (field in cleanDoc) {
                delete cleanDoc[field];
            }
        });

        return cleanDoc;
    });
}
private determineForeignField(localField: string): string {
    // Common patterns for foreign key relationships
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

/**
 * Helper method to determine alias for populated field
 */
private determineAlias(path: string): string {
    // Remove 'Id' suffix and lowercase
    if (path.endsWith('Id')) {
        return path.slice(0, -2).toLowerCase();
    }
    return path.toLowerCase();
}
    //
}

