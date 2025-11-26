import { BaseStorageService } from './StorageService';

export class LocalStorageService extends BaseStorageService {
    protected get storage(): Storage {
        if (typeof window !== 'undefined') {
            return window.localStorage;
        }
        // Return a dummy storage for SSR to prevent errors
        return {
            getItem: () => null,
            setItem: () => { },
            removeItem: () => { },
            clear: () => { },
            key: () => null,
            length: 0,
        } as unknown as Storage;
    }

    constructor(defaultCollection: string = 'app') {
        super(defaultCollection, false); // Disable data wrapper for localStorage
    }
}

// Export a singleton instance for general use
export const localStorageService = new LocalStorageService();
