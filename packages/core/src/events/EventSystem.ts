/**
 * NebulaQQ Core - 事件系统
 *
 * 高性能事件分发中心，支持事件过滤、优先级、中间件
 */

import { EventEmitter } from 'events';
import type { Event, MessageEvent, NoticeEvent, RequestEvent, MetaEvent } from '../types';

/** 事件处理器 */
export interface EventHandler {
  (event: Event): Promise<void> | void;
}

/** 事件过滤器 */
export interface EventFilter {
  (event: Event): boolean;
}

/** 事件中间件 */
export interface EventMiddleware {
  (event: Event, next: () => Promise<void>): Promise<void>;
}

/** 事件订阅选项 */
export interface EventSubscribeOptions {
  /** 优先级，数字越大优先级越高 */
  priority?: number;
  /** 事件过滤器 */
  filter?: EventFilter;
  /** 是否只执行一次 */
  once?: boolean;
}

/** 事件统计信息 */
export interface EventStats {
  totalEvents: number;
  eventsByType: Map<string, number>;
  avgProcessingTime: number;
  lastEventTime?: number;
}

/**
 * 事件系统核心类
 */
export class EventSystem extends EventEmitter {
  /** 事件处理器映射 */
  private handlers: Map<string, Set<EventHandler>> = new Map();

  /** 事件过滤器映射 */
  private filters: Map<string, Set<EventFilter>> = new Map();

  /** 事件中间件列表 */
  private middlewares: EventMiddleware[] = [];

  /** 事件统计 */
  private stats: EventStats = {
    totalEvents: 0,
    eventsByType: new Map(),
    avgProcessingTime: 0,
  };

  /** 处理时间记录 */
  private processingTimes: number[] = [];

  /**
   * 订阅事件
   */
  on(eventType: string, handler: EventHandler, options?: EventSubscribeOptions): this {
    const { filter, once = false } = options || {};

    if (once) {
      super.once(eventType, handler as any);
    } else {
      super.on(eventType, handler as any);
    }

    // 添加过滤器
    if (filter) {
      if (!this.filters.has(eventType)) {
        this.filters.set(eventType, new Set());
      }
      this.filters.get(eventType)!.add(filter);
    }

    return this;
  }

  /**
   * 订阅事件（只执行一次）
   */
  once(eventType: string, handler: EventHandler): this {
    return this.on(eventType, handler, { once: true });
  }

  /**
   * 取消订阅
   */
  off(eventType: string, handler?: EventHandler): this {
    if (handler) {
      super.off(eventType, handler as any);
    } else {
      super.removeAllListeners(eventType);
    }
    return this;
  }

  /**
   * 触发事件
   */
  emit(eventType: string, event: Event): boolean {
    const startTime = Date.now();
    this.stats.totalEvents++;
    this.stats.lastEventTime = startTime;

    // 更新事件类型统计
    const count = this.stats.eventsByType.get(eventType) || 0;
    this.stats.eventsByType.set(eventType, count + 1);

    // 应用过滤器
    const filters = this.filters.get(eventType);
    if (filters) {
      for (const filter of filters) {
        if (!filter(event)) {
          return false;
        }
      }
    }

    // 同步调用处理器（与 EventEmitter 保持一致）
    const listeners = this.listeners(eventType) as EventHandler[];
    for (const handler of listeners) {
      try {
        const result = handler(event);
        // 如果处理器返回 Promise，不等待但捕获错误
        if (result instanceof Promise) {
          result.catch(error => {
            console.error(`事件处理器错误 [${eventType}]:`, error);
          });
        }
      } catch (error) {
        console.error(`事件处理器错误 [${eventType}]:`, error);
      }
    }

    // 更新处理时间统计（异步更新）
    setImmediate(() => {
      const processingTime = Date.now() - startTime;
      this.processingTimes.push(processingTime);
      if (this.processingTimes.length > 100) {
        this.processingTimes.shift();
      }
      this.stats.avgProcessingTime =
        this.processingTimes.reduce((a, b) => a + b, 0) / this.processingTimes.length;
    });

    return super.emit(eventType, event);
  }

  /**
   * 运行中间件
   */
  private async runMiddlewares(
    event: Event,
    index: number,
    finalHandler: () => Promise<void>
  ): Promise<void> {
    if (index >= this.middlewares.length) {
      await finalHandler();
      return;
    }

    const middleware = this.middlewares[index];
    await middleware(event, () => this.runMiddlewares(event, index + 1, finalHandler));
  }

  /**
   * 添加中间件
   */
  use(middleware: EventMiddleware): void {
    this.middlewares.push(middleware);
  }

  /**
   * 获取事件统计
   */
  getStats(): EventStats {
    return { ...this.stats };
  }

  /**
   * 重置统计
   */
  resetStats(): void {
    this.stats = {
      totalEvents: 0,
      eventsByType: new Map(),
      avgProcessingTime: 0,
    };
    this.processingTimes = [];
  }

  /**
   * 监听消息事件
   */
  onMessage(handler: (event: MessageEvent) => Promise<void> | void): this {
    return this.on('message', handler as EventHandler);
  }

  /**
   * 监听通知事件
   */
  onNotice(handler: (event: NoticeEvent) => Promise<void> | void): this {
    return this.on('notice', handler as EventHandler);
  }

  /**
   * 监听请求事件
   */
  onRequest(handler: (event: RequestEvent) => Promise<void> | void): this {
    return this.on('request', handler as EventHandler);
  }

  /**
   * 监听元事件
   */
  onMetaEvent(handler: (event: MetaEvent) => Promise<void> | void): this {
    return this.on('meta_event', handler as EventHandler);
  }
}

export default EventSystem;
