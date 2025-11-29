/**
 * Client-side Caching Service
 * Provides efficient caching for API responses and computed data
 */

interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

interface CacheConfig {
  defaultTTL: number;
  maxSize: number;
  enableCompression?: boolean;
}

class CacheService {
  private cache = new Map<string, CacheEntry>();
  private config: CacheConfig;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      defaultTTL: 5 * 60 * 1000, // 5 minutes default
      maxSize: 100, // Maximum 100 entries
      enableCompression: false,
      ...config
    };
  }

  /**
   * Set data in cache
   */
  set<T>(key: string, data: T, ttl?: number): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.config.defaultTTL
    };

    // Check if we need to evict old entries
    if (this.cache.size >= this.config.maxSize) {
      this.evictOldest();
    }

    this.cache.set(key, entry);
  }

  /**
   * Get data from cache
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;

    if (!entry) {
      return null;
    }

    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  /**
   * Check if key exists and is not expired
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Delete specific key from cache
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const now = Date.now();
    let validEntries = 0;
    let expiredEntries = 0;
    let totalSize = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        expiredEntries++;
      } else {
        validEntries++;
        totalSize += this.estimateSize(entry);
      }
    }

    return {
      totalEntries: this.cache.size,
      validEntries,
      expiredEntries,
      totalSize: `${(totalSize / 1024).toFixed(2)} KB`,
      hitRate: this.calculateHitRate()
    };
  }

  /**
   * Get or set with a fetcher function
   */
  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    let data = this.get<T>(key);
    if (data !== null) {
      return data;
    }

    data = await fetcher();
    this.set(key, data, ttl);
    return data;
  }

  /**
   * Set with automatic expiration based on patterns
   */
  setWithPattern(key: string, data: any, pattern?: string): void {
    let ttl = this.config.defaultTTL;

    // Adjust TTL based on data patterns
    if (pattern === 'static') {
      ttl = 30 * 60 * 1000; // 30 minutes for static data
    } else if (pattern === 'user') {
      ttl = 10 * 60 * 1000; // 10 minutes for user data
    } else if (pattern === 'volatile') {
      ttl = 1 * 60 * 1000; // 1 minute for volatile data
    }

    this.set(key, data, ttl);
  }

  /**
   * Clean up expired entries
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Evict oldest entries when cache is full
   */
  private evictOldest(): void {
    let oldestKey = '';
    let oldestTime = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  /**
   * Estimate memory size of cache entry
   */
  private estimateSize(entry: CacheEntry): number {
    const dataStr = JSON.stringify(entry);
    return dataStr.length * 2; // Rough estimate: 2 bytes per character
  }

  /**
   * Calculate cache hit rate (simplified)
   */
  private calculateHitRate(): string {
    // This is a simplified calculation
    // In a real implementation, you'd track hits/misses
    const validEntries = Array.from(this.cache.values())
      .filter(entry => Date.now() - entry.timestamp <= entry.ttl).length;

    const totalEntries = this.cache.size;
    if (totalEntries === 0) return '0%';

    return `${((validEntries / totalEntries) * 100).toFixed(1)}%`;
  }

  /**
   * Export cache data for debugging
   */
  exportData(): Record<string, any> {
    const data: Record<string, any> = {};
    for (const [key, entry] of this.cache.entries()) {
      data[key] = {
        data: entry.data,
        age: Date.now() - entry.timestamp,
        ttl: entry.ttl,
        expiresIn: entry.ttl - (Date.now() - entry.timestamp)
      };
    }
    return data;
  }
}

// Create different cache instances for different data types
export const apiCache = new CacheService({
  defaultTTL: 5 * 60 * 1000, // 5 minutes for API data
  maxSize: 50
});

export const staticCache = new CacheService({
  defaultTTL: 30 * 60 * 1000, // 30 minutes for static data
  maxSize: 25
});

export const userCache = new CacheService({
  defaultTTL: 10 * 60 * 1000, // 10 minutes for user data
  maxSize: 25
});

// Main cache service instance
export const cacheService = new CacheService();