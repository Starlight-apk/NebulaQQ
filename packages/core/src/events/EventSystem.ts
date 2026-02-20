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
 * 
 * @example
 * ```typescript
 * const eventSystem = new EventSystem();
 * 
 * // 订阅消息事件
 * eventSystem.on('message', async (event) => {
 *   console.log('收到消息:', event);
 * });
 * 
 * // 带过滤器的订阅
 * eventSystem.on('message', async (event) => {
 *   console.log('群消息:', event);
 * }, {
 *   filter: (e) => e.message_type === 'group'
 * });
 * 
 * // 添加中间件
 * eventSystem.use(async (event, next) => {
 *   console.log('处理事件前');
 *   await next();
 *   console.log('处理事件后');
 * });
 * ```
 */
export class EventSystem extends EventEmitter {
  /** 事件中间件链 */
  private middlewares: EventMiddleware[] = [];
  
  /** 事件统计 */
  private stats: EventStats = {
    totalEvents: 0,
    eventsByType: new Map(),
    avgProcessingTime: 0,
    lastEventTime: undefined
  };
  
  /** 处理时间记录 */
  private processingTimes: number[] = [];
  
  /** 最大记录的处理时间数量 */
  private maxProcessingTimes = 100;
  
  /** 是否启用统计 */
  private enableStats = true;
  
  /**
   * 订阅事件
   * 
   * @param eventType 事件类型
   * @param handler 事件处理器
   * @param options 订阅选项
   */
  on(eventType: string, handler: EventHandler, options: EventSubscribeOptions = {}): this {
    const { priority = 0, filter, once = false } = options;
    
    // 创建包装的处理器
    const wrappedHandler = async (event: Event) => {
      // 应用过滤器
      if (filter && !filter(event)) {
        return;
      }
      
      // 执行处理器
      await handler(event);
    };
    
    // 存储优先级信息
    (wrappedHandler as any)._priority = priority;
    (wrappedHandler as any)._once = once;
    
    // 使用带优先级的订阅
    const subscribers = this.listeners(eventType) as EventHandler[];
    subscribers.push(wrappedHandler);
    
    // 按优先级排序
    subscribers.sort((a, b) => 
      ((b as any)._priority || 0) - ((a as any)._priority || 0)
    );
    
    // 重新注册排序后的处理器
    this.removeAllListeners(eventType);
    subscribers.forEach(sub => {
      if ((sub as any)._once) {
        this.once(eventType, sub);
      } else {
        this.addListener(eventType, sub);
      }
    });
    
    return this;
  }
  
  /**
   * 订阅事件（只执行一次）
   */
  once(eventType: string, handler: EventHandler, options: Omit<EventSubscribeOptions, 'once'> = {}): this {
    return this.on(eventType, handler, { ...options, once: true });
  }
  
  /**
   * 添加事件中间件
   * 
   * @param middleware 中间件函数
   */
  use(middleware: EventMiddleware): this {
    this.middlewares.push(middleware);
    return this;
  }
  
  /**
   * 移除事件中间件
   * 
   * @param middleware 中间件函数
   */
  unuse(middleware: EventMiddleware): this {
    const index = this.middlewares.indexOf(middleware);
    if (index !== -1) {
      this.middlewares.splice(index, 1);
    }
    return this;
  }
  
  /**
   * 发射事件（内部使用，带中间件处理）
   * 
   * @param eventType 事件类型
   * @param event 事件对象
   */
  async emit(eventType: string, event: Event): Promise<boolean> {
    const startTime = Date.now();
    
    // 更新统计
    if (this.enableStats) {
      this.stats.totalEvents++;
      this.stats.lastEventTime = startTime;
      
      const count = this.stats.eventsByType.get(eventType) || 0;
      this.stats.eventsByType.set(eventType, count + 1);
    }
    
    // 构建中间件链
    let index = 0;
    const handlers = this.listeners(eventType) as EventHandler[];
    
    const next = async (): Promise<void> => {
      if (index < this.middlewares.length) {
        const middleware = this.middlewares[index++];
        await middleware(event, next);
      } else {
        // 执行所有处理器
        await Promise.all(handlers.map(h => h(event)));
      }
    };
    
    try {
      await next();
      
      // 记录处理时间
      if (this.enableStats) {
        const processingTime = Date.now() - startTime;
        this.processingTimes.push(processingTime);
        
        if (this.processingTimes.length > this.maxProcessingTimes) {
          this.processingTimes.shift();
        }
        
        this.stats.avgProcessingTime = 
          this.processingTimes.reduce((a, b) => a + b, 0) / this.processingTimes.length;
      }
      
      return true;
    } catch (error) {
      console.error(`[EventSystem] 处理事件 ${eventType} 时发生错误:`, error);
      return false;
    }
  }
  
  /**
   * 获取事件统计信息
   */
  getStats(): EventStats {
    return { ...this.stats };
  }
  
  /**
   * 重置统计信息
   */
  resetStats(): void {
    this.stats = {
      totalEvents: 0,
      eventsByType: new Map(),
      avgProcessingTime: 0,
      lastEventTime: undefined
    };
    this.processingTimes = [];
  }
  
  /**
   * 启用/禁用统计
   */
  setStatsEnabled(enabled: boolean): void {
    this.enableStats = enabled;
  }
}

/**
 * 预定义的事件过滤器
 */
export const EventFilters = {
  /** 仅群消息 */
  isGroup: (event: Event): event is MessageEvent => 
    event.post_type === 'message' && (event as MessageEvent).message_type === 'group',
  
  /** 仅私聊消息 */
  isPrivate: (event: Event): event is MessageEvent => 
    event.post_type === 'message' && (event as MessageEvent).message_type === 'private',
  
  /** 仅管理员 */
  isAdmin: (event: Event): boolean => 
    event.post_type === 'message' && 
    ['admin', 'owner'].includes((event as MessageEvent).sender?.role || ''),
  
  /** 仅主人 */
  isOwner: (event: Event): boolean => 
    event.post_type === 'message' && 
    (event as MessageEvent).sender?.role === 'owner',
  
  /** 仅特定用户 */
  fromUser: (userId: string) => (event: Event): boolean =>
    (event as MessageEvent).user_id === userId,
  
  /** 仅特定群 */
  fromGroup: (groupId: string) => (event: Event): boolean =>
    (event as MessageEvent).group_id === groupId,
  
  /** 消息包含关键词 */
  containsKeyword: (...keywords: string[]) => (event: Event): boolean => {
    if (event.post_type !== 'message') return false;
    const message = (event as MessageEvent).raw_message || '';
    return keywords.some(kw => message.includes(kw));
  },
  
  /** 消息以特定前缀开头 */
  startsWith: (prefix: string) => (event: Event): boolean => {
    if (event.post_type !== 'message') return false;
    return (event as MessageEvent).raw_message?.startsWith(prefix) || false;
  }
};
