/**
 * Cache Manager Utility
 * In-memory caching for API responses and expensive computations
 * Implements LRU cache with TTL support
 */

import React from 'react';

class CacheManager {
  constructor(maxSize = 100, defaultTTL = 5 * 60 * 1000) { // 5 min default
    this.cache = new Map();
    this.maxSize = maxSize;
    this.defaultTTL = defaultTTL;
  }

  /**
   * Generate cache key from function name and arguments
   */
  generateKey(namespace, args) {
    return `${namespace}:${JSON.stringify(args)}`;
  }

  /**
   * Get cached value if exists and not expired
   */
  get(key) {
    const cached = this.cache.get(key);
    
    if (!cached) return null;
    
    // Check if expired
    if (Date.now() > cached.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    // Move to end (LRU - most recently used)
    this.cache.delete(key);
    this.cache.set(key, cached);
    
    return cached.value;
  }

  /**
   * Set cache value with TTL
   */
  set(key, value, ttl = this.defaultTTL) {
    // Evict oldest if at capacity
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      value,
      expiry: Date.now() + ttl,
      createdAt: Date.now()
    });
  }

  /**
   * Clear specific key or entire cache
   */
  clear(key) {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const now = Date.now();
    let activeCount = 0;
    let expiredCount = 0;

    this.cache.forEach(({ expiry }) => {
      if (now > expiry) {
        expiredCount++;
      } else {
        activeCount++;
      }
    });

    return {
      total: this.cache.size,
      active: activeCount,
      expired: expiredCount,
      hitRate: this.hitRate || 0
    };
  }

  /**
   * Wrap async function with caching
   */
  async withCache(namespace, fn, args = [], ttl = this.defaultTTL) {
    const key = this.generateKey(namespace, args);
    
    // Check cache first
    const cached = this.get(key);
    if (cached !== null) {
      return cached;
    }

    // Execute function and cache result
    const result = await fn(...args);
    this.set(key, result, ttl);
    
    return result;
  }
}

// Global cache instance
export const globalCache = new CacheManager(200, 5 * 60 * 1000);

/**
 * React Hook for cached API calls
 */
export function useCachedQuery(key, queryFn, options = {}) {
  const [data, setData] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  
  const { ttl = 5 * 60 * 1000, enabled = true } = options;

  React.useEffect(() => {
    if (!enabled) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const result = await globalCache.withCache(key, queryFn, [], ttl);
        setData(result);
        setError(null);
      } catch (err) {
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [key, enabled]);

  const refetch = async () => {
    globalCache.clear(key);
    setIsLoading(true);
    try {
      const result = await queryFn();
      globalCache.set(key, result, ttl);
      setData(result);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  return { data, isLoading, error, refetch };
}

export default CacheManager;

/**
 * Example usage:
 * 
 * import { globalCache, useCachedQuery } from '@/components/performance/CacheManager';
 * 
 * // In component:
 * const { data, isLoading } = useCachedQuery(
 *   'courses-list',
 *   () => base44.entities.Course.list(),
 *   { ttl: 10 * 60 * 1000 } // 10 minutes
 * );
 */