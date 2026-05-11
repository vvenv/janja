import { describe, expect, it } from 'vitest';
import { LRUCache } from './cache';

describe('LRUCache', () => {
  it('should store and retrieve values', () => {
    const cache = new LRUCache<string>({
      enabled: true,
      maxSize: 10,
      ttl: 3600000,
    });

    cache.set('key1', 'value1');

    expect(cache.get('key1')).toBe('value1');
  });

  it('should return null for non-existent keys', () => {
    const cache = new LRUCache<string>({
      enabled: true,
      maxSize: 10,
      ttl: 3600000,
    });

    expect(cache.get('nonexistent')).toBeNull();
  });

  it('should evict oldest entries when at capacity', () => {
    const cache = new LRUCache<string>({
      enabled: true,
      maxSize: 3,
      ttl: 3600000,
    });

    cache.set('key1', 'value1');
    cache.set('key2', 'value2');
    cache.set('key3', 'value3');
    cache.set('key4', 'value4');

    expect(cache.get('key1')).toBeNull();
    expect(cache.get('key2')).toBe('value2');
    expect(cache.get('key3')).toBe('value3');
    expect(cache.get('key4')).toBe('value4');
  });

  it('should update LRU order on get', () => {
    const cache = new LRUCache<string>({
      enabled: true,
      maxSize: 3,
      ttl: 3600000,
    });

    cache.set('key1', 'value1');
    cache.set('key2', 'value2');
    cache.set('key3', 'value3');
    cache.get('key1');
    cache.set('key4', 'value4');

    expect(cache.get('key1')).toBe('value1');
    expect(cache.get('key2')).toBeNull();
    expect(cache.get('key3')).toBe('value3');
    expect(cache.get('key4')).toBe('value4');
  });

  it('should expire entries after TTL', () => {
    const cache = new LRUCache<string>({
      enabled: true,
      maxSize: 10,
      ttl: 100,
    });

    cache.set('key1', 'value1');
    expect(cache.get('key1')).toBe('value1');

    // Wait for expiration
    return new Promise((resolve) => {
      setTimeout(() => {
        expect(cache.get('key1')).toBeNull();
        resolve(undefined);
      }, 150);
    });
  });

  it('should track cache statistics', () => {
    const cache = new LRUCache<string>({
      enabled: true,
      maxSize: 10,
      ttl: 3600000,
    });

    cache.set('key1', 'value1');
    cache.get('key1');
    cache.get('key2');

    const stats = cache.getStats();

    expect(stats.hits).toBe(1);
    expect(stats.misses).toBe(1);
    expect(stats.size).toBe(1);
    expect(stats.hitRate).toBe(0.5);
  });

  it('should track evictions', () => {
    const cache = new LRUCache<string>({
      enabled: true,
      maxSize: 2,
      ttl: 3600000,
    });

    cache.set('key1', 'value1');
    cache.set('key2', 'value2');
    cache.set('key3', 'value3');

    const stats = cache.getStats();

    expect(stats.evictions).toBe(1);
  });

  it('should clear cache', () => {
    const cache = new LRUCache<string>({
      enabled: true,
      maxSize: 10,
      ttl: 3600000,
    });

    cache.set('key1', 'value1');
    cache.set('key2', 'value2');
    cache.clear();

    expect(cache.get('key1')).toBeNull();
    expect(cache.get('key2')).toBeNull();
    expect(cache.getStats().size).toBe(0);
  });

  it('should delete specific keys', () => {
    const cache = new LRUCache<string>({
      enabled: true,
      maxSize: 10,
      ttl: 3600000,
    });

    cache.set('key1', 'value1');
    cache.set('key2', 'value2');
    cache.delete('key1');

    expect(cache.get('key1')).toBeNull();
    expect(cache.get('key2')).toBe('value2');
  });

  it('should invalidate based on predicate', () => {
    const cache = new LRUCache<string>({
      enabled: true,
      maxSize: 10,
      ttl: 3600000,
    });

    cache.set('key1', 'value1');
    cache.set('key2', 'value2');
    cache.set('key3', 'value3');
    cache.invalidate((key) => key.startsWith('key1'));

    expect(cache.get('key1')).toBeNull();
    expect(cache.get('key2')).toBe('value2');
    expect(cache.get('key3')).toBe('value3');
  });

  it('should reset statistics', () => {
    const cache = new LRUCache<string>({
      enabled: true,
      maxSize: 10,
      ttl: 3600000,
    });

    cache.set('key1', 'value1');
    cache.get('key1');
    cache.get('key2');
    cache.resetStats();

    const stats = cache.getStats();

    expect(stats.hits).toBe(0);
    expect(stats.misses).toBe(0);
  });

  it('should check if key exists', () => {
    const cache = new LRUCache<string>({
      enabled: true,
      maxSize: 10,
      ttl: 3600000,
    });

    cache.set('key1', 'value1');

    expect(cache.has('key1')).toBe(true);
    expect(cache.has('key2')).toBe(false);
  });
});
