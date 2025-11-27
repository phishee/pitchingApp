/**
 * Creates a wrapper around an async function that deduplicates concurrent calls.
 * 
 * @param fn The async function to deduplicate
 * @param options Configuration options
 * @returns A wrapped function that shares promises for identical arguments
 */
export function createDeduplicator<T, A extends any[]>(
    fn: (...args: A) => Promise<T>,
    options: {
        keyGenerator?: (...args: A) => string,
        ttl?: number
    } = {}
) {
    const cache = new Map<string, Promise<T>>();

    return async (...args: A): Promise<T> => {
        // Generate cache key (default to stringifying args if no generator provided)
        const key = options.keyGenerator ? options.keyGenerator(...args) : JSON.stringify(args);

        if (cache.has(key)) {
            return cache.get(key)!;
        }

        const promise = fn(...args).finally(() => {
            // Clear cache after TTL
            setTimeout(() => {
                cache.delete(key);
            }, options.ttl || 2000);
        });

        cache.set(key, promise);
        return promise;
    };
}
