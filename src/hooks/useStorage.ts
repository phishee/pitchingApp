import { useState, useEffect, useCallback } from 'react';
import {
    IStorageService,
    StorageOptions,
    localStorageService,
    sessionStorageService
} from '@/services/storage';

type StorageType = 'local' | 'session';

interface UseStorageOptions<T> extends StorageOptions {
    storageType?: StorageType;
}

/**
 * Hook to use storage with reactivity.
 * Note: This hook currently does not sync across tabs or different hook instances automatically 
 * unless we implement a custom event system. For now, it syncs local state with storage.
 */
export function useStorage<T>(
    key: string,
    initialValue?: T,
    options: UseStorageOptions<T> = {}
) {
    const { storageType = 'local', collection, ttl } = options;

    const service: IStorageService = storageType === 'session'
        ? sessionStorageService
        : localStorageService;

    // State to hold the current value
    // We use a lazy initializer to avoid reading from storage on every render
    const [storedValue, setStoredValue] = useState<T | null>(() => {
        if (typeof window === 'undefined') {
            return initialValue || null;
        }
        try {
            const item = service.getItem<T>(key, collection);
            return item !== null ? item : (initialValue || null);
        } catch (error) {
            console.error(error);
            return initialValue || null;
        }
    });

    // Return a wrapped version of useState's setter function that ...
    // ... persists the new value to storage.
    const setValue = useCallback((value: T | ((val: T | null) => T)) => {
        try {
            // Allow value to be a function so we have same API as useState
            const valueToStore =
                value instanceof Function ? value(storedValue) : value;

            // Save state
            setStoredValue(valueToStore);

            // Save to storage
            if (valueToStore === null) {
                service.removeItem(key, collection);
            } else {
                service.setItem(key, valueToStore, { ttl, collection });
            }
        } catch (error) {
            console.error(error);
        }
    }, [key, collection, ttl, service, storedValue]);

    const removeValue = useCallback(() => {
        try {
            service.removeItem(key, collection);
            setStoredValue(null);
        } catch (error) {
            console.error(error);
        }
    }, [key, collection, service]);

    // Re-read from storage if key/collection changes
    useEffect(() => {
        const item = service.getItem<T>(key, collection);
        if (item !== null) {
            setStoredValue(item);
        } else if (initialValue !== undefined) {
            setStoredValue(initialValue);
        }
    }, [key, collection, service, initialValue]);

    return { value: storedValue, setValue, removeValue };
}

/**
 * Helper hook for Local Storage
 */
export function useLocalStorage<T>(key: string, initialValue?: T, options?: Omit<UseStorageOptions<T>, 'storageType'>) {
    return useStorage<T>(key, initialValue, { ...options, storageType: 'local' });
}

/**
 * Helper hook for Session Storage
 */
export function useSessionStorage<T>(key: string, initialValue?: T, options?: Omit<UseStorageOptions<T>, 'storageType'>) {
    return useStorage<T>(key, initialValue, { ...options, storageType: 'session' });
}
