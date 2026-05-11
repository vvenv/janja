import type { CacheOptions } from './types';

interface CacheEntry<T> {
  value: T;

  timestamp: number;

  hits: number;
}

export class LRUCache<T> {
  private cache: Map<string, CacheEntry<T>>;

  private maxSize: number;

  private ttl: number;

  private stats: {
    hits: number;
    misses: number;
    evictions: number;
  };

  constructor(options: Required<CacheOptions>) {
    this.cache = new Map();
    this.maxSize = options.maxSize;
    this.ttl = options.ttl;
    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0,
    };
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      this.stats.misses++;

      return null;
    }

    // Check if entry has expired
    if (this.ttl > 0 && Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      this.stats.misses++;

      return null;
    }

    // Update LRU by moving to end
    this.cache.delete(key);
    this.cache.set(key, entry);
    entry.hits++;
    this.stats.hits++;

    return entry.value;
  }

  set(key: string, value: T): void {
    // Evict oldest if at capacity
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      const oldestKey = this.cache.keys().next().value;

      if (oldestKey !== undefined) {
        this.cache.delete(oldestKey);
        this.stats.evictions++;
      }
    }

    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      hits: 0,
    });
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);

    if (!entry) {
      return false;
    }

    // Check if entry has expired
    if (this.ttl > 0 && Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);

      return false;
    }

    return true;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0,
    };
  }

  invalidate(predicate?: (key: string) => boolean): void {
    if (!predicate) {
      this.clear();

      return;
    }

    for (const key of this.cache.keys()) {
      if (predicate(key)) {
        this.cache.delete(key);
      }
    }
  }

  getStats() {
    return {
      ...this.stats,
      size: this.cache.size,
      hitRate:
        this.stats.hits + this.stats.misses > 0
          ? this.stats.hits / (this.stats.hits + this.stats.misses)
          : 0,
    };
  }

  resetStats(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0,
    };
  }
}
