import { IStorageService, IStorageItem, StorageOptions } from './IStorageService';

export abstract class BaseStorageService implements IStorageService {
    protected abstract storage: Storage;
    protected defaultCollection: string;
    protected useDataWrapper: boolean;

    constructor(defaultCollection: string = 'app', useDataWrapper: boolean = true) {
        this.defaultCollection = defaultCollection;
        this.useDataWrapper = useDataWrapper;
    }

    protected getFullKey(key: string, collection?: string): string {
        const namespace = collection || this.defaultCollection;
        return `${namespace}:${key}`;
    }

    protected isStorageAvailable(): boolean {
        try {
            const test = '__storage_test__';
            this.storage.setItem(test, test);
            this.storage.removeItem(test);
            return true;
        } catch (e) {
            console.warn('Storage is not available:', e);
            return false;
        }
    }

    getItem<T>(key: string, collection?: string): T | null {
        if (!this.isStorageAvailable()) return null;

        const fullKey = this.getFullKey(key, collection);
        const itemStr = this.storage.getItem(fullKey);

        if (!itemStr) return null;

        try {
            // If wrapper is disabled, just parse the value
            if (!this.useDataWrapper) {
                return JSON.parse(itemStr);
            }

            const item: IStorageItem<T> = JSON.parse(itemStr);

            // Check for expiration
            if (item.expiresAt && Date.now() > item.expiresAt) {
                this.removeItem(key, collection);
                return null;
            }

            return item.data;
        } catch (error) {
            console.error(`Error parsing storage item ${fullKey}:`, error);
            return null;
        }
    }

    setItem<T>(key: string, value: T, options?: StorageOptions): void {
        if (!this.isStorageAvailable()) return;

        const collection = options?.collection;
        const fullKey = this.getFullKey(key, collection);

        // If wrapper is disabled, just stringify the value
        if (!this.useDataWrapper) {
            try {
                this.storage.setItem(fullKey, JSON.stringify(value));
            } catch (error) {
                console.error(`Error setting storage item ${fullKey}:`, error);
            }
            return;
        }

        const now = Date.now();
        const expiresAt = options?.ttl ? now + options.ttl : undefined;

        const item: IStorageItem<T> = {
            data: value,
            timestamp: now,
            expiresAt,
        };

        try {
            this.storage.setItem(fullKey, JSON.stringify(item));
        } catch (error) {
            console.error(`Error setting storage item ${fullKey}:`, error);
        }
    }

    removeItem(key: string, collection?: string): void {
        if (!this.isStorageAvailable()) return;
        const fullKey = this.getFullKey(key, collection);
        this.storage.removeItem(fullKey);
    }

    removeItems(keys: string[], collection?: string): void {
        if (!this.isStorageAvailable()) return;
        keys.forEach(key => {
            const fullKey = this.getFullKey(key, collection);
            this.storage.removeItem(fullKey);
        });
    }

    clearCollection(collection: string): void {
        if (!this.isStorageAvailable()) return;

        const prefix = `${collection}:`;
        const keysToRemove: string[] = [];

        for (let i = 0; i < this.storage.length; i++) {
            const key = this.storage.key(i);
            if (key && key.startsWith(prefix)) {
                keysToRemove.push(key);
            }
        }

        keysToRemove.forEach(key => this.storage.removeItem(key));
    }

    clear(): void {
        if (!this.isStorageAvailable()) return;
        this.storage.clear();
    }

    has(key: string, collection?: string): boolean {
        return this.getItem(key, collection) !== null;
    }
}
