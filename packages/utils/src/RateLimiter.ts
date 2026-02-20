/**
 * NebulaQQ - 限流器
 * 
 * 令牌桶算法实现速率限制
 */

import { EventEmitter } from 'events';

/** 限流器配置 */
export interface RateLimiterConfig {
  /** 令牌桶容量 */
  capacity: number;
  /** 每秒补充的令牌数 */
  refillRate: number;
}

/**
 * 限流器
 */
export class RateLimiter extends EventEmitter {
  private config: RateLimiterConfig;
  private tokens: number;
  private lastRefill: number;

  constructor(config: RateLimiterConfig) {
    super();
    this.config = config;
    this.tokens = config.capacity;
    this.lastRefill = Date.now();
  }

  /**
   * 补充令牌
   */
  private refill(): void {
    const now = Date.now();
    const elapsed = (now - this.lastRefill) / 1000;
    const tokensToAdd = elapsed * this.config.refillRate;
    
    this.tokens = Math.min(this.config.capacity, this.tokens + tokensToAdd);
    this.lastRefill = now;
  }

  /**
   * 尝试获取令牌
   * 
   * @returns 是否成功获取令牌
   */
  tryAcquire(): boolean {
    this.refill();
    
    if (this.tokens >= 1) {
      this.tokens -= 1;
      return true;
    }
    
    return false;
  }

  /**
   * 获取令牌（等待直到有可用令牌）
   */
  async acquire(): Promise<void> {
    while (!this.tryAcquire()) {
      // 计算需要等待的时间
      const tokensNeeded = 1 - this.tokens;
      const waitTime = (tokensNeeded / this.config.refillRate) * 1000;
      
      await new Promise(resolve => setTimeout(resolve, Math.min(waitTime, 100)));
      this.refill();
    }
  }

  /**
   * 批量获取令牌
   */
  async acquireMany(count: number): Promise<void> {
    while (this.tokens < count) {
      const tokensNeeded = count - this.tokens;
      const waitTime = (tokensNeeded / this.config.refillRate) * 1000;
      
      await new Promise(resolve => setTimeout(resolve, Math.min(waitTime, 100)));
      this.refill();
    }
    
    this.tokens -= count;
  }

  /**
   * 获取当前可用令牌数
   */
  getTokens(): number {
    this.refill();
    return Math.floor(this.tokens);
  }

  /**
   * 检查是否有可用令牌
   */
  canAcquire(): boolean {
    this.refill();
    return this.tokens >= 1;
  }

  /**
   * 获取等待时间估算（毫秒）
   */
  getEstimatedWaitTime(): number {
    this.refill();
    
    if (this.tokens >= 1) {
      return 0;
    }
    
    const tokensNeeded = 1 - this.tokens;
    return (tokensNeeded / this.config.refillRate) * 1000;
  }

  /**
   * 重置限流器
   */
  reset(): void {
    this.tokens = this.config.capacity;
    this.lastRefill = Date.now();
    this.emit('reset');
  }
}

/**
 * 限流器管理器
 * 
 * 为不同的键（如用户 ID、群 ID）维护独立的限流器
 */
export class RateLimiterManager extends EventEmitter {
  private limiters: Map<string, RateLimiter> = new Map();
  private defaultConfig: RateLimiterConfig;

  constructor(defaultConfig: RateLimiterConfig) {
    super();
    this.defaultConfig = defaultConfig;
  }

  /**
   * 获取或创建限流器
   */
  getLimiter(key: string, config?: RateLimiterConfig): RateLimiter {
    if (!this.limiters.has(key)) {
      const limiter = new RateLimiter(config || this.defaultConfig);
      this.limiters.set(key, limiter);
    }
    return this.limiters.get(key)!;
  }

  /**
   * 尝试获取令牌
   */
  tryAcquire(key: string): boolean {
    const limiter = this.getLimiter(key);
    return limiter.tryAcquire();
  }

  /**
   * 获取令牌（等待）
   */
  async acquire(key: string): Promise<void> {
    const limiter = this.getLimiter(key);
    await limiter.acquire();
  }

  /**
   * 移除限流器
   */
  remove(key: string): void {
    this.limiters.delete(key);
  }

  /**
   * 清理所有限流器
   */
  clear(): void {
    this.limiters.clear();
  }

  /**
   * 获取所有键
   */
  getKeys(): string[] {
    return Array.from(this.limiters.keys());
  }

  /**
   * 获取限流器数量
   */
  getSize(): number {
    return this.limiters.size;
  }
}
