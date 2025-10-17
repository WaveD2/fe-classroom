interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const cache = new Map<string, CacheEntry<any>>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const getCacheKey = (key: string, params?: Record<string, any>): string => {
  if (!params) return key;
  return `${key}-${JSON.stringify(params)}`;
};

const getFromCache = <T,>(key: string): T | null => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data as T;
  }
  cache.delete(key);
  return null;
};

const setToCache = <T,>(key: string, data: T): void => {
  cache.set(key, {
    data,
    timestamp: Date.now()
  });
};

const clearCacheByPrefix = (prefix: string): void => {
  const keys = Array.from(cache.keys());
  keys.forEach(key => {
    if (key.startsWith(prefix)) {
      cache.delete(key);
    }
  });
};

const deleteCacheByKey = (key: string): void => {
  cache.delete(key);
};

export { getCacheKey, getFromCache, setToCache, clearCacheByPrefix, deleteCacheByKey };