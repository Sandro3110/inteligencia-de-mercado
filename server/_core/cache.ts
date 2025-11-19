/**
 * Simple in-memory cache with TTL support
 * Used for caching expensive database queries
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

class InMemoryCache {
  private cache: Map<string, CacheEntry<any>> = new Map();

  /**
   * Get value from cache
   * Returns undefined if key doesn't exist or has expired
   */
  get<T>(key: string): T | undefined {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return undefined;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return undefined;
    }

    return entry.value as T;
  }

  /**
   * Set value in cache with TTL in seconds
   * @param key Cache key
   * @param value Value to cache
   * @param ttlSeconds Time to live in seconds (default: 300 = 5 minutes)
   */
  set<T>(key: string, value: T, ttlSeconds: number = 300): void {
    const expiresAt = Date.now() + (ttlSeconds * 1000);
    this.cache.set(key, { value, expiresAt });
  }

  /**
   * Delete specific key from cache
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Delete all keys matching a pattern
   * @param pattern Regex pattern or string prefix
   */
  invalidatePattern(pattern: string | RegExp): void {
    const regex = typeof pattern === 'string' ? new RegExp(`^${pattern}`) : pattern;
    
    const keys = Array.from(this.cache.keys());
    for (const key of keys) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const now = Date.now();
    let activeEntries = 0;
    let expiredEntries = 0;

    const entries = Array.from(this.cache.values());
    for (const entry of entries) {
      if (now > entry.expiresAt) {
        expiredEntries++;
      } else {
        activeEntries++;
      }
    }

    return {
      total: this.cache.size,
      active: activeEntries,
      expired: expiredEntries,
    };
  }

  /**
   * Clean up expired entries
   */
  cleanup(): void {
    const now = Date.now();
    
    const entries = Array.from(this.cache.entries());
    for (const [key, entry] of entries) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }
}

// Singleton instance
export const cache = new InMemoryCache();

// Auto cleanup every 10 minutes
setInterval(() => {
  cache.cleanup();
}, 10 * 60 * 1000);

/**
 * Helper function to wrap a function with caching
 */
export async function withCache<T>(
  key: string,
  fn: () => Promise<T>,
  ttlSeconds: number = 300
): Promise<T> {
  // Try to get from cache
  const cached = cache.get<T>(key);
  if (cached !== undefined) {
    return cached;
  }

  // Execute function and cache result
  const result = await fn();
  cache.set(key, result, ttlSeconds);
  
  return result;
}

/**
 * Invalidate cache for specific entity types
 */
export function invalidateEntityCache(entityType: 'mercados' | 'clientes' | 'concorrentes' | 'leads', projectId?: number) {
  if (projectId) {
    cache.invalidatePattern(`stats:totals:${projectId}`);
    cache.invalidatePattern(`${entityType}:${projectId}`);
  } else {
    cache.invalidatePattern(`stats:totals`);
    cache.invalidatePattern(`${entityType}:`);
  }
}
