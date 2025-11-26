import { BaseStorageService } from './StorageService';

export class SessionStorageService extends BaseStorageService {
    protected get storage(): Storage {
        if (typeof window !== 'undefined') {
            return window.sessionStorage;
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
        super(defaultCollection);
    }
}

// Export a singleton instance for general use
export const sessionStorageService = new SessionStorageService();
