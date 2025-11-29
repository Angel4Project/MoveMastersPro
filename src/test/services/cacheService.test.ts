import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { cacheService, apiCache, staticCache, userCache } from '../../../services/cacheService';

// Import the CacheService class by accessing it from an instance
const CacheService = cacheService.constructor;

describe('CacheService', () => {
  let testCache: typeof cacheService;

  beforeEach(() => {
    // Create a fresh cache instance for each test
    testCache = new (CacheService as any)();

    // Clear all caches before each test
    cacheService.clear();
    apiCache.clear();
    staticCache.clear();
    userCache.clear();

    // Mock Date.now for consistent timestamps
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-01T00:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Basic Cache Operations', () => {
    it('should set and get values correctly', () => {
      const testData = { name: 'test', value: 123 };
      cacheService.set('test-key', testData);

      const retrieved = cacheService.get('test-key');
      expect(retrieved).toEqual(testData);
    });

    it('should return null for non-existent keys', () => {
      const result = cacheService.get('non-existent');
      expect(result).toBeNull();
    });

    it('should check if key exists', () => {
      cacheService.set('existing-key', 'value');
      expect(cacheService.has('existing-key')).toBe(true);
      expect(cacheService.has('non-existing')).toBe(false);
    });

    it('should delete keys correctly', () => {
      cacheService.set('delete-test', 'value');
      expect(cacheService.has('delete-test')).toBe(true);

      const deleted = cacheService.delete('delete-test');
      expect(deleted).toBe(true);
      expect(cacheService.has('delete-test')).toBe(false);
    });

    it('should clear all cache entries', () => {
      cacheService.set('key1', 'value1');
      cacheService.set('key2', 'value2');
      expect(cacheService.getStats().totalEntries).toBe(2);

      cacheService.clear();
      expect(cacheService.getStats().totalEntries).toBe(0);
    });
  });

  describe('TTL (Time To Live) Functionality', () => {
    it('should expire entries after TTL', () => {
      cacheService.set('ttl-test', 'value', 1000); // 1 second TTL

      // Immediately after setting
      expect(cacheService.get('ttl-test')).toBe('value');

      // Advance time by 1.5 seconds
      vi.advanceTimersByTime(1500);

      // Should be expired
      expect(cacheService.get('ttl-test')).toBeNull();
      expect(cacheService.has('ttl-test')).toBe(false);
    });

    it('should not expire entries before TTL', () => {
      cacheService.set('ttl-test', 'value', 2000); // 2 seconds TTL

      // Advance time by 1 second (still valid)
      vi.advanceTimersByTime(1000);

      expect(cacheService.get('ttl-test')).toBe('value');
    });
  });

  describe('Cache Statistics', () => {
    it('should provide accurate cache statistics', () => {
      cacheService.set('valid1', 'value1', 10000);
      cacheService.set('valid2', 'value2', 10000);
      cacheService.set('expired', 'value3', 1000);

      // Advance time to expire one entry
      vi.advanceTimersByTime(1500);

      const stats = cacheService.getStats();

      expect(stats.totalEntries).toBe(3);
      expect(stats.validEntries).toBe(2);
      expect(stats.expiredEntries).toBe(1);
      expect(stats.hitRate).toBe('66.7%');
    });

    it('should calculate hit rate correctly', () => {
      // Empty cache
      expect(cacheService.getStats().hitRate).toBe('0%');

      // Add some entries
      cacheService.set('key1', 'value1');
      cacheService.set('key2', 'value2');

      expect(cacheService.getStats().hitRate).toBe('100.0%');
    });
  });

  describe('Get or Set Functionality', () => {
    it('should return cached value if available', async () => {
      const fetcher = vi.fn().mockResolvedValue('fetched-value');
      cacheService.set('test-key', 'cached-value');

      const result = await cacheService.getOrSet('test-key', fetcher);

      expect(result).toBe('cached-value');
      expect(fetcher).not.toHaveBeenCalled();
    });

    it('should fetch and cache value if not available', async () => {
      const fetcher = vi.fn().mockResolvedValue('fetched-value');

      const result = await cacheService.getOrSet('new-key', fetcher);

      expect(result).toBe('fetched-value');
      expect(fetcher).toHaveBeenCalledTimes(1);
      expect(cacheService.get('new-key')).toBe('fetched-value');
    });

    it('should handle fetcher errors gracefully', async () => {
      const fetcher = vi.fn().mockRejectedValue(new Error('Fetch failed'));

      await expect(cacheService.getOrSet('error-key', fetcher)).rejects.toThrow('Fetch failed');
      expect(cacheService.has('error-key')).toBe(false);
    });
  });

  describe('Pattern-based TTL', () => {
    it('should set appropriate TTL for static data', () => {
      cacheService.setWithPattern('static-key', 'static-data', 'static');

      // Static data should have longer TTL (30 minutes)
      const stats = cacheService.getStats();
      expect(stats.validEntries).toBe(1);

      // Advance 25 minutes - should still be valid
      vi.advanceTimersByTime(25 * 60 * 1000);
      expect(cacheService.has('static-key')).toBe(true);

      // Advance another 10 minutes - should expire
      vi.advanceTimersByTime(10 * 60 * 1000);
      expect(cacheService.has('static-key')).toBe(false);
    });

    it('should set appropriate TTL for user data', () => {
      cacheService.setWithPattern('user-key', 'user-data', 'user');

      // Advance 5 minutes - should still be valid
      vi.advanceTimersByTime(5 * 60 * 1000);
      expect(cacheService.has('user-key')).toBe(true);

      // Advance another 5 minutes - should expire
      vi.advanceTimersByTime(5 * 60 * 1000);
      expect(cacheService.has('user-key')).toBe(false);
    });

    it('should set appropriate TTL for volatile data', () => {
      cacheService.setWithPattern('volatile-key', 'volatile-data', 'volatile');

      // Advance 30 seconds - should still be valid
      vi.advanceTimersByTime(30 * 1000);
      expect(cacheService.has('volatile-key')).toBe(true);

      // Advance another 30 seconds - should expire
      vi.advanceTimersByTime(30 * 1000);
      expect(cacheService.has('volatile-key')).toBe(false);
    });
  });

  describe('Cache Size Management', () => {
    it('should evict oldest entries when cache is full', () => {
      // Create cache with small max size
      const smallCache = new (CacheService as any)({
        defaultTTL: 10000,
        maxSize: 2
      });

      // Add entries with different timestamps
      vi.setSystemTime(new Date('2024-01-01T00:00:00Z'));
      smallCache.set('oldest', 'value1');

      vi.setSystemTime(new Date('2024-01-01T00:00:01Z'));
      smallCache.set('middle', 'value2');

      vi.setSystemTime(new Date('2024-01-01T00:00:02Z'));
      smallCache.set('newest', 'value3'); // This should evict 'oldest'

      expect(smallCache.has('oldest')).toBe(false);
      expect(smallCache.has('middle')).toBe(true);
      expect(smallCache.has('newest')).toBe(true);
    });
  });

  describe('Cleanup Functionality', () => {
    it('should remove expired entries during cleanup', () => {
      cacheService.set('valid', 'value', 10000);
      cacheService.set('expired1', 'value', 1000);
      cacheService.set('expired2', 'value', 2000);

      // Advance time to expire some entries
      vi.advanceTimersByTime(1500);

      cacheService.cleanup();

      expect(cacheService.has('valid')).toBe(true);
      expect(cacheService.has('expired1')).toBe(false);
      expect(cacheService.has('expired2')).toBe(false);
    });
  });

  describe('Export Functionality', () => {
    it('should export cache data correctly', () => {
      cacheService.set('key1', { data: 'value1' }, 10000);
      cacheService.set('key2', { data: 'value2' }, 5000);

      const exported = cacheService.exportData();

      expect(exported.key1.data).toEqual({ data: 'value1' });
      expect(exported.key1.age).toBe(0);
      expect(exported.key1.ttl).toBe(10000);
      expect(exported.key1.expiresIn).toBe(10000);
    });
  });

  describe('Different Cache Instances', () => {
    it('should maintain separate cache instances', () => {
      apiCache.set('api-key', 'api-value');
      staticCache.set('static-key', 'static-value');
      userCache.set('user-key', 'user-value');

      expect(apiCache.get('api-key')).toBe('api-value');
      expect(staticCache.get('static-key')).toBe('static-value');
      expect(userCache.get('user-key')).toBe('user-value');

      // Other caches should not have these keys
      expect(cacheService.get('api-key')).toBeNull();
      expect(apiCache.get('static-key')).toBeNull();
    });

    it('should apply different default TTLs', () => {
      apiCache.set('api-entry', 'value');
      staticCache.set('static-entry', 'value');
      userCache.set('user-entry', 'value');

      // API cache: 5 minutes default
      vi.advanceTimersByTime(4 * 60 * 1000); // 4 minutes
      expect(apiCache.has('api-entry')).toBe(true);

      vi.advanceTimersByTime(2 * 60 * 1000); // 6 minutes total
      expect(apiCache.has('api-entry')).toBe(false);

      // Static cache: 30 minutes default
      expect(staticCache.has('static-entry')).toBe(true);

      // User cache: 10 minutes default
      expect(userCache.has('user-entry')).toBe(true);
    });
  });

  describe('Memory Estimation', () => {
    it('should estimate memory usage correctly', () => {
      const entry = { data: 'test', timestamp: Date.now(), ttl: 1000 };
      const estimatedSize = (cacheService as any).estimateSize(entry);

      // Should be greater than 0
      expect(estimatedSize).toBeGreaterThan(0);
      expect(typeof estimatedSize).toBe('number');
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid TTL values gracefully', () => {
      cacheService.set('invalid-ttl', 'value', -1000);
      expect(cacheService.get('invalid-ttl')).toBe('value');
    });

    it('should handle null/undefined values', () => {
      cacheService.set('null-value', null);
      cacheService.set('undefined-value', undefined);

      expect(cacheService.get('null-value')).toBeNull();
      expect(cacheService.get('undefined-value')).toBeUndefined();
    });
  });
});