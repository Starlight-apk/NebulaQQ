/**
 * NebulaQQ - 缓存系统
 * 
 * 支持 LRU 淘汰、TTL 过期
 */

import { EventEmitter } from 'events';

/** 缓存项 */
interface CacheItem<T> {
  value: T;
  expireAt?: number;
  lastAccessed: number;
  accessCount: number;
}

/** 缓存配置 */
export interface CacheConfig {
  /** 最大缓存项数量 */
  maxSize?: number;
  /** 默认 TTL（毫秒） */
  defaultTtl?: number;
  /** 是否启用 LRU 淘汰 */
  lru?: boolean;
}

/**
 * 缓存系统
 */
export class Cache<K = string, V = unknown> extends EventEmitter {
  private items: Map<K, CacheItem<V>> = new Map();
  private config: CacheConfig;
  private cleanupTimer: NodeJS.Timeout | null = null;

  constructor(config: CacheConfig = {}) {
    super();
    this.config = {
      maxSize: config.maxSize || 1000,
      defaultTtl: config.defaultTtl,
      lru: config.lru ?? true
    };

    // 启动定期清理
    this.startCleanupTimer();
  }

  /**
   * 启动清理定时器
   */
  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, 60000); // 每分钟清理一次
  }

  /**
   * 停止清理定时器
   */
  private stopCleanupTimer(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
  }

  /**
   * 清理过期项
   */
  private cleanup(): void {
    const now = Date.now();
    const toDelete: K[] = [];

    for (const [key, item] of this.items.entries()) {
      if (item.expireAt && now > item.expireAt) {
        toDelete.push(key);
      }
    }

    // 如果启用 LRU 且超出容量，删除最少使用的项
    if (this.config.lru && this.items.size > this.config.maxSize!) {
      const sorted = Array.from(this.items.entries())
        .sort((a, b) => {
          // 按访问次数和时间排序
          const scoreA = a[1].accessCount * 1000 + a[1].lastAccessed;
          const scoreB = b[1].accessCount * 1000 + b[1].lastAccessed;
          return scoreA - scoreB;
        });

      const deleteCount = this.items.size - this.config.maxSize!;
      for (let i = 0; i < deleteCount; i++) {
        toDelete.push(sorted[i][0]);
      }
    }

    for (const key of toDelete) {
      this.items.delete(key);
      this.emit('evict', key);
    }

    if (toDelete.length > 0) {
      this.emit('cleanup', toDelete.length);
    }
  }

  /**
   * 设置缓存项
   */
  set(key: K, value: V, ttl?: number): void {
    // 检查是否需要淘汰
    if (this.items.size >= this.config.maxSize! && !this.items.has(key)) {
      this.cleanup();
    }

    const now = Date.now();
    const item: CacheItem<V> = {
      value,
      expireAt: ttl ? now + ttl : (this.config.defaultTtl ? now + this.config.defaultTtl : undefined),
      lastAccessed: now,
      accessCount: 0
    };

    this.items.set(key, item);
    this.emit('set', key, value);
  }

  /**
   * 获取缓存项
   */
  get(key: K): V | undefined {
    const item = this.items.get(key);
    
    if (!item) {
      return undefined;
    }

    // 检查是否过期
    if (item.expireAt && Date.now() > item.expireAt) {
      this.items.delete(key);
      this.emit('expire', key);
      return undefined;
    }

    // 更新访问信息
    item.lastAccessed = Date.now();
    item.accessCount++;

    this.emit('get', key, item.value);
    return item.value;
  }

  /**
   * 获取缓存项（带默认值）
   */
  getOrSet(key: K, defaultValue: V | (() => V), ttl?: number): V {
    const value = this.get(key);
    
    if (value !== undefined) {
      return value;
    }

    const newValue = typeof defaultValue === 'function' 
      ? (defaultValue as () => V)() 
      : defaultValue;
    
    this.set(key, newValue, ttl);
    return newValue;
  }

  /**
   * 异步获取或设置（支持异步工厂函数）
   */
  async getOrSetAsync(
    key: K, 
    factory: () => Promise<V> | V, 
    ttl?: number
  ): Promise<V> {
    const value = this.get(key);
    
    if (value !== undefined) {
      return value;
    }

    const newValue = await factory();
    this.set(key, newValue, ttl);
    return newValue;
  }

  /**
   * 检查缓存项是否存在
   */
  has(key: K): boolean {
    const item = this.items.get(key);
    
    if (!item) {
      return false;
    }

    if (item.expireAt && Date.now() > item.expireAt) {
      this.items.delete(key);
      return false;
    }

    return true;
  }

  /**
   * 删除缓存项
   */
  delete(key: K): boolean {
    const deleted = this.items.delete(key);
    if (deleted) {
      this.emit('delete', key);
    }
    return deleted;
  }

  /**
   * 清空缓存
   */
  clear(): void {
    this.items.clear();
    this.emit('clear');
  }

  /**
   * 获取缓存大小
   */
  size(): number {
    return this.items.size;
  }

  /**
   * 获取所有键
   */
  keys(): K[] {
    return Array.from(this.items.keys());
  }

  /**
   * 获取所有值
   */
  values(): V[] {
    return Array.from(this.items.values()).map(item => item.value);
  }

  /**
   * 获取所有条目
   */
  entries(): Array<[K, V]> {
    return Array.from(this.items.entries()).map(([key, item]) => [key, item.value]);
  }

  /**
   * 遍历缓存
   */
  forEach(callback: (value: V, key: K) => void): void {
    for (const [key, item] of this.items.entries()) {
      // 检查是否过期
      if (item.expireAt && Date.now() > item.expireAt) {
        continue;
      }
      callback(item.value, key);
    }
  }

  /**
   * 获取缓存统计信息
   */
  getStats(): {
    size: number;
    maxSize: number;
    defaultTtl?: number;
    lruEnabled: boolean;
  } {
    return {
      size: this.items.size,
      maxSize: this.config.maxSize!,
      defaultTtl: this.config.defaultTtl,
      lruEnabled: this.config.lru!
    };
  }

  /**
   * 销毁缓存
   */
  destroy(): void {
    this.stopCleanupTimer();
    this.clear();
  }
}
