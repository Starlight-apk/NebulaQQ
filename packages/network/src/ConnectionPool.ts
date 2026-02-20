/**
 * NebulaQQ - 连接池
 * 
 * 管理 HTTP 连接，支持连接复用和自动清理
 */

import { EventEmitter } from 'events';
import http from 'http';
import https from 'https';

/** 连接配置 */
export interface ConnectionConfig {
  /** 最大空闲时间（毫秒） */
  maxIdleTime?: number;
  /** 最大连接数 */
  maxConnections?: number;
  /** 连接超时（毫秒） */
  timeout?: number;
}

/** 连接包装器 */
interface ConnectionWrapper {
  request: http.ClientRequest;
  lastUsed: number;
  inUse: boolean;
}

/**
 * 连接池
 */
export class ConnectionPool extends EventEmitter {
  private config: ConnectionConfig;
  private connections: Map<string, ConnectionWrapper> = new Map();
  private pendingRequests: Array<{
    key: string;
    options: http.RequestOptions;
    callback: (request: http.ClientRequest) => void;
  }> = [];
  private cleanupTimer: NodeJS.Timeout | null = null;

  constructor(config: ConnectionConfig = {}) {
    super();
    this.config = {
      maxIdleTime: config.maxIdleTime || 60000,
      maxConnections: config.maxConnections || 50,
      timeout: config.timeout || 30000
    };

    this.startCleanupTimer();
  }

  /**
   * 启动清理定时器
   */
  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.config.maxIdleTime);
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
   * 清理空闲连接
   */
  private cleanup(): void {
    const now = Date.now();
    
    for (const [key, conn] of this.connections.entries()) {
      if (!conn.inUse && now - conn.lastUsed > this.config.maxIdleTime!) {
        conn.request.destroy();
        this.connections.delete(key);
        this.emit('connection:closed', key);
      }
    }
  }

  /**
   * 生成连接键
   */
  private getConnectionKey(options: http.RequestOptions): string {
    const protocol = options.protocol || 'http:';
    const host = options.hostname || options.host || 'localhost';
    const port = options.port || (protocol === 'https:' ? 443 : 80);
    return `${protocol}//${host}:${port}`;
  }

  /**
   * 获取连接
   */
  acquire(options: http.RequestOptions): Promise<http.ClientRequest> {
    return new Promise((resolve, reject) => {
      const key = this.getConnectionKey(options);
      const timeout = this.config.timeout || 30000;

      // 检查是否有空闲连接
      for (const [connKey, conn] of this.connections.entries()) {
        if (connKey === key && !conn.inUse) {
          conn.inUse = true;
          conn.lastUsed = Date.now();
          resolve(conn.request);
          return;
        }
      }

      // 检查连接数限制
      if (this.connections.size >= this.config.maxConnections!) {
        // 加入等待队列
        this.pendingRequests.push({
          key,
          options,
          callback: resolve
        });
        return;
      }

      // 创建新连接
      const request = (options.protocol === 'https:' ? https : http).request(options);
      
      request.setTimeout(timeout, () => {
        request.destroy(new Error('Connection timeout'));
      });

      request.on('close', () => {
        this.connections.delete(key);
        this.emit('connection:closed', key);
      });

      request.on('error', (error) => {
        this.connections.delete(key);
        this.emit('connection:error', key, error);
      });

      const wrapper: ConnectionWrapper = {
        request,
        lastUsed: Date.now(),
        inUse: true
      };

      this.connections.set(key, wrapper);
      this.emit('connection:created', key);
      resolve(request);
    });
  }

  /**
   * 释放连接
   */
  release(request: http.ClientRequest): void {
    for (const [key, conn] of this.connections.entries()) {
      if (conn.request === request) {
        conn.inUse = false;
        conn.lastUsed = Date.now();

        // 处理等待队列
        if (this.pendingRequests.length > 0) {
          const pending = this.pendingRequests.shift()!;
          conn.inUse = true;
          pending.callback(conn.request);
        }

        return;
      }
    }
  }

  /**
   * 关闭所有连接
   */
  close(): void {
    this.stopCleanupTimer();

    for (const [key, conn] of this.connections.entries()) {
      conn.request.destroy();
    }

    this.connections.clear();
    this.pendingRequests = [];
    this.emit('pool:closed');
  }

  /**
   * 获取连接数统计
   */
  getStats(): { total: number; inUse: number; idle: number; pending: number } {
    let inUse = 0;
    let idle = 0;

    for (const conn of this.connections.values()) {
      if (conn.inUse) {
        inUse++;
      } else {
        idle++;
      }
    }

    return {
      total: this.connections.size,
      inUse,
      idle,
      pending: this.pendingRequests.length
    };
  }
}
