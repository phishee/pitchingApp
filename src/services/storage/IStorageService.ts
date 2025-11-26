export interface IStorageItem<T> {
    data: T;
    timestamp: number;
    expiresAt?: number;
}

export interface StorageOptions {
    ttl?: number; // Time to live in milliseconds
    collection?: string; // Namespace/Collection name
}

export interface IStorageService {
    /**
     * Get an item from storage
     * @param key The key to retrieve
     * @param collection Optional collection (namespace) to override default
     */
    getItem<T>(key: string, collection?: string): T | null;

    /**
     * Set an item in storage
     * @param key The key to set
     * @param value The value to store
     * @param options Storage options (ttl, collection)
     */
    setItem<T>(key: string, value: T, options?: StorageOptions): void;

    /**
     * Remove an item from storage
     * @param key The key to remove
     * @param collection Optional collection (namespace)
     */
    removeItem(key: string, collection?: string): void;

    /**
     * Remove multiple items from storage
     * @param keys The list of keys to remove
     * @param collection Optional collection (namespace)
     */
    removeItems(keys: string[], collection?: string): void;

    /**
     * Clear all items in a specific collection
     * @param collection The collection to clear
     */
    clearCollection(collection: string): void;

    /**
     * Clear all items managed by this service
     */
    clear(): void;

    /**
     * Check if an item exists and is not expired
     */
    has(key: string, collection?: string): boolean;
}
