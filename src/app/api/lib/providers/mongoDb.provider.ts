import { IDatabase } from "../interfaces/database/IDatabase";
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
        
        console.log('Initializing MongoDB with URI:', uri.replace(/\/\/[^@]*@/, '//****:****@'));
        
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
                processedQuery._id = new ObjectId(processedQuery._id);
            }
        }

        // Handle nested objects (for complex queries)
        for (const [key, value] of Object.entries(processedQuery)) {
            if (value && typeof value === 'object' && !Array.isArray(value)) {
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
            console.log(`[MongoDB] findById for ${collection}:`, objectId.toString());
            const result = await this.db.collection(collection).findOne({ _id: objectId });
            console.log(`[MongoDB] findById result for ${collection}:`, result ? 'Found' : 'Not found');
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
            console.log(`[MongoDB] findOne query for ${collection}:`, JSON.stringify(processedQuery));
            const result = await this.db.collection(collection).findOne(processedQuery);
            console.log(`[MongoDB] findOne result for ${collection}:`, result ? 'Found' : 'Not found');
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
        console.log(`[MongoDB] findAll called for collection: ${collection}`);
        await this.ensureConnected();
        try {
            console.log(`[MongoDB] Executing find() on collection: ${collection}`);
            const documents = await this.db.collection(collection).find().toArray();
            console.log(`[MongoDB] Found ${documents.length} documents in collection ${collection}`);
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
            console.log(`[MongoDB] findQuery for ${collection}:`, JSON.stringify(processedQuery));
            const result = await this.db.collection(collection).find(processedQuery).toArray();
            console.log(`[MongoDB] findQuery result for ${collection}: Found ${result.length} documents`);
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
}

