import { useState, useEffect, useCallback } from 'react';

interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresAt?: number;
}

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  prefix?: string; // Key prefix for namespacing
}

interface UseCacheReturn<T> {
  get: (key: string) => T | null;
  set: (key: string, data: T, options?: CacheOptions) => void;
  delete: (key: string) => void;
  clear: () => void;
  has: (key: string) => boolean;
  isExpired: (key: string) => boolean;
  getWithTTL: (key: string) => { data: T | null; ttl: number | null };
  keys: () => string[];
  size: () => number;
}

// Global cache manager
class SessionCacheManager {
  private prefix: string;

  constructor(prefix: string = 'app_cache') {
    this.prefix = prefix;
  }

  private getFullKey(key: string): string {
    return `${this.prefix}_${key}`;
  }

  private isStorageAvailable(): boolean {
    try {
      const test = '__storage_test__';
      sessionStorage.setItem(test, test);
      sessionStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  get<T>(key: string): T | null {
    if (!this.isStorageAvailable()) return null;

    try {
      const fullKey = this.getFullKey(key);
      const item = sessionStorage.getItem(fullKey);
      
      if (!item) return null;

      const parsed: CacheItem<T> = JSON.parse(item);
      
      // Check if expired
      if (parsed.expiresAt && Date.now() > parsed.expiresAt) {
        this.delete(key);
        return null;
      }

      return parsed.data;
    } catch (error) {
      console.error('Error reading from cache:', error);
      return null;
    }
  }

  set<T>(key: string, data: T, options: CacheOptions = {}): void {
    if (!this.isStorageAvailable()) return;

    try {
      const fullKey = this.getFullKey(key);
      const now = Date.now();
      const expiresAt = options.ttl ? now + options.ttl : undefined;

      const cacheItem: CacheItem<T> = {
        data,
        timestamp: now,
        expiresAt
      };

      sessionStorage.setItem(fullKey, JSON.stringify(cacheItem));
    } catch (error) {
      console.error('Error writing to cache:', error);
    }
  }

  delete(key: string): void {
    if (!this.isStorageAvailable()) return;

    try {
      const fullKey = this.getFullKey(key);
      sessionStorage.removeItem(fullKey);
    } catch (error) {
      console.error('Error deleting from cache:', error);
    }
  }

  clear(): void {
    if (!this.isStorageAvailable()) return;

    try {
      const keys = Object.keys(sessionStorage);
      keys.forEach(key => {
        if (key.startsWith(this.prefix)) {
          sessionStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }

  has(key: string): boolean {
    if (!this.isStorageAvailable()) return false;

    try {
      const fullKey = this.getFullKey(key);
      return sessionStorage.getItem(fullKey) !== null;
    } catch {
      return false;
    }
  }

  isExpired(key: string): boolean {
    if (!this.isStorageAvailable()) return true;

    try {
      const fullKey = this.getFullKey(key);
      const item = sessionStorage.getItem(fullKey);
      
      if (!item) return true;

      const parsed: CacheItem<any> = JSON.parse(item);
      return parsed.expiresAt ? Date.now() > parsed.expiresAt : false;
    } catch {
      return true;
    }
  }

  getWithTTL<T>(key: string): { data: T | null; ttl: number | null } {
    if (!this.isStorageAvailable()) return { data: null, ttl: null };

    try {
      const fullKey = this.getFullKey(key);
      const item = sessionStorage.getItem(fullKey);
      
      if (!item) return { data: null, ttl: null };

      const parsed: CacheItem<T> = JSON.parse(item);
      
      if (parsed.expiresAt && Date.now() > parsed.expiresAt) {
        this.delete(key);
        return { data: null, ttl: null };
      }

      const ttl = parsed.expiresAt ? parsed.expiresAt - Date.now() : null;
      return { data: parsed.data, ttl };
    } catch (error) {
      console.error('Error reading TTL from cache:', error);
      return { data: null, ttl: null };
    }
  }

  keys(): string[] {
    if (!this.isStorageAvailable()) return [];

    try {
      const allKeys = Object.keys(sessionStorage);
      return allKeys
        .filter(key => key.startsWith(this.prefix))
        .map(key => key.replace(`${this.prefix}_`, ''));
    } catch {
      return [];
    }
  }

  size(): number {
    return this.keys().length;
  }

  // Clean up expired items
  cleanup(): void {
    if (!this.isStorageAvailable()) return;

    const keys = this.keys();
    keys.forEach(key => {
      if (this.isExpired(key)) {
        this.delete(key);
      }
    });
  }
}

// Global cache instances
const defaultCache = new SessionCacheManager();
const exerciseCache = new SessionCacheManager('exercises');
const userCache = new SessionCacheManager('user');

// Generic cache hook
export function useCache<T>(namespace?: string): UseCacheReturn<T> {
  const cache = namespace ? new SessionCacheManager(namespace) : defaultCache;
  const [, forceUpdate] = useState({});

  // Force re-render when cache changes
  const triggerUpdate = useCallback(() => {
    forceUpdate({});
  }, []);

  // Cleanup expired items on mount
  useEffect(() => {
    cache.cleanup();
  }, [cache]);

  const get = useCallback((key: string): T | null => {
    return cache.get<T>(key);
  }, [cache]);

  const set = useCallback((key: string, data: T, options: CacheOptions = {}): void => {
    cache.set(key, data, options);
    triggerUpdate();
  }, [cache, triggerUpdate]);

  const deleteKey = useCallback((key: string): void => {
    cache.delete(key);
    triggerUpdate();
  }, [cache, triggerUpdate]);

  const clear = useCallback((): void => {
    cache.clear();
    triggerUpdate();
  }, [cache, triggerUpdate]);

  const has = useCallback((key: string): boolean => {
    return cache.has(key);
  }, [cache]);

  const isExpired = useCallback((key: string): boolean => {
    return cache.isExpired(key);
  }, [cache]);

  const getWithTTL = useCallback((key: string): { data: T | null; ttl: number | null } => {
    return cache.getWithTTL<T>(key);
  }, [cache]);

  const keys = useCallback((): string[] => {
    return cache.keys();
  }, [cache]);

  const size = useCallback((): number => {
    return cache.size();
  }, [cache]);

  return {
    get,
    set,
    delete: deleteKey,
    clear,
    has,
    isExpired,
    getWithTTL,
    keys,
    size
  };
}

// Specialized hooks for common use cases
export function useExerciseCache() {
  return useCache('exercises');
}

export function useUserCache() {
  return useCache('user');
}

export function useAppCache() {
  return useCache('app');
}

// Hook for cache statistics
export function useCacheStats() {
  const [stats, setStats] = useState({
    totalKeys: 0,
    exerciseKeys: 0,
    userKeys: 0,
    appKeys: 0
  });

  useEffect(() => {
    const updateStats = () => {
      setStats({
        totalKeys: defaultCache.size(),
        exerciseKeys: exerciseCache.size(),
        userKeys: userCache.size(),
        appKeys: defaultCache.size()
      });
    };

    updateStats();
    const interval = setInterval(updateStats, 1000);
    return () => clearInterval(interval);
  }, []);

  return stats;
}
