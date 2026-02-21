/**
 * NebulaQQ - OneBot 协议适配器
 *
 * 实现 OneBot v11 标准的 WebSocket 和 HTTP 通信
 */

import WebSocket from 'ws';
import { EventEmitter } from 'events';
import type { Event, MessageEvent, NoticeEvent, RequestEvent, MetaEvent, ApiResponse, ApiParams } from '@nebulaqq/core';
import type { Logger } from '@nebulaqq/core';

/** 适配器配置 */
export interface OneBotAdapterConfig {
  /** 连接类型 */
  type: 'websocket' | 'http' | 'websocket-reverse';
  /** 主机地址 */
  host: string;
  /** 端口 */
  port: number;
  /** 访问令牌 */
  token?: string;
  /** 重连间隔（毫秒） */
  reconnectInterval?: number;
  /** 心跳间隔（毫秒） */
  heartbeatInterval?: number;
}

/** 事件回调 */
export type EventCallback = (event: Event) => Promise<void> | void;

/**
 * OneBot 协议适配器
 * 
 * @example
 * ```typescript
 * const adapter = new OneBotAdapter({
 *   type: 'websocket',
 *   host: '127.0.0.1',
 *   port: 3000,
 *   token: 'your-token'
 * }, logger);
 * 
 * adapter.on('message', async (event) => {
 *   console.log('收到消息:', event);
 * });
 * 
 * await adapter.connect();
 * ```
 */
export class OneBotAdapter extends EventEmitter {
  private config: OneBotAdapterConfig;
  private logger: Logger;
  private ws: WebSocket | null = null;
  private connected = false;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private sequence = 0;
  private loginInfo?: { user_id: number; nickname: string };

  constructor(config: OneBotAdapterConfig, logger: Logger) {
    super();
    this.config = config;
    this.logger = logger.child('OneBotAdapter');
  }

  /**
   * 连接到 OneBot 服务
   */
  async connect(): Promise<void> {
    const { type, host, port, token } = this.config;
    
    if (type === 'websocket' || type === 'websocket-reverse') {
      await this.connectWebSocket(host, port, token);
    } else if (type === 'http') {
      this.logger.info('HTTP 模式已启动');
    }
  }

  /**
   * 连接 WebSocket
   */
  private async connectWebSocket(host: string, port: number, token?: string): Promise<void> {
    const url = `ws://${host}:${port}`;
    this.logger.info(`正在连接到 ${url}...`);

    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(url, {
          headers,
          handshakeTimeout: 10000
        });

        this.ws.on('open', () => {
          this.connected = true;
          this.logger.info('WebSocket 连接已建立');
          this.startHeartbeat();
          resolve();
        });

        this.ws.on('message', (data: Buffer) => {
          try {
            const payload = JSON.parse(data.toString());
            this.handlePayload(payload);
          } catch (error) {
            this.logger.error('解析消息失败:', error);
          }
        });

        this.ws.on('close', () => {
          this.connected = false;
          this.logger.warn('WebSocket 连接已关闭');
          this.stopHeartbeat();
          this.scheduleReconnect();
        });

        this.ws.on('error', (error) => {
          this.logger.error('WebSocket 错误:', error);
          if (!this.connected) {
            reject(error);
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * 处理接收到的数据
   */
  private handlePayload(payload: Record<string, unknown>): void {
    const { post_type, meta_event_type, notice_type, request_type, message_type } = payload;

    // 处理元事件
    if (post_type === 'meta_event') {
      if (meta_event_type === 'lifecycle' && payload['status'] === 'online') {
        this.logger.info('OneBot 服务已上线');
        this.fetchLoginInfo();
      }
      this.emit('meta_event', payload as MetaEvent);
      return;
    }

    // 处理通知事件
    if (post_type === 'notice') {
      this.emit('notice', payload as NoticeEvent);
      return;
    }

    // 处理请求事件
    if (post_type === 'request') {
      this.emit('request', payload as RequestEvent);
      return;
    }

    // 处理消息事件
    if (post_type === 'message') {
      this.emit('message', payload as MessageEvent);
      return;
    }

    this.logger.debug('收到未知类型的事件:', payload);
  }

  /**
   * 获取登录信息
   */
  private async fetchLoginInfo(): Promise<void> {
    try {
      const result = await this.callApi('get_login_info', {});
      this.loginInfo = result as { user_id: number; nickname: string };
      this.logger.info(`已登录：${this.loginInfo.nickname}(${this.loginInfo.user_id})`);
      this.emit('ready', this.loginInfo);
    } catch (error) {
      this.logger.error('获取登录信息失败:', error);
    }
  }

  /**
   * 开始心跳
   */
  private startHeartbeat(): void {
    const interval = this.config.heartbeatInterval || 30000;
    
    this.heartbeatTimer = setInterval(() => {
      this.sendHeartbeat();
    }, interval);
  }

  /**
   * 停止心跳
   */
  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  /**
   * 发送心跳
   */
  private async sendHeartbeat(): Promise<void> {
    try {
      await this.callApi('get_status', {});
      this.logger.debug('心跳正常');
    } catch (error) {
      this.logger.warn('心跳失败:', error);
    }
  }

  /**
   * 安排重连
   */
  private scheduleReconnect(): void {
    const interval = this.config.reconnectInterval || 5000;
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    this.logger.info(`将在 ${interval}ms 后重连...`);
    this.reconnectTimer = setTimeout(() => {
      this.logger.info('正在尝试重连...');
      this.connect().catch((err) => {
        this.logger.error('重连失败:', err);
      });
    }, interval);
  }

  /**
   * 调用 API
   */
  async callApi<T = unknown>(action: string, params: ApiParams = {}): Promise<T> {
    if (!this.ws || !this.connected) {
      throw new Error('WebSocket 未连接');
    }

    const sequence = ++this.sequence;
    const payload = {
      action,
      params,
      echo: sequence
    };

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`API 调用超时：${action}`));
      }, 30000);

      const handler = (data: Buffer) => {
        try {
          const response = JSON.parse(data.toString()) as ApiResponse<T>;
          
          if (response.echo === sequence) {
            clearTimeout(timeout);
            this.ws?.removeListener('message', handler);

            if (response.retcode === 0) {
              resolve(response.data);
            } else {
              reject(new Error(response.message || `API 返回错误：${response.retcode}`));
            }
          }
        } catch (error) {
          // 忽略解析错误
        }
      };

      this.ws?.on('message', handler);
      this.ws?.send(JSON.stringify(payload));
    });
  }

  /**
   * 发送消息
   */
  async sendMessage(messageType: 'private' | 'group', targetId: string, message: string | unknown[]): Promise<boolean> {
    try {
      const params: ApiParams = {
        message_type: messageType,
        [messageType === 'group' ? 'group_id' : 'user_id']: targetId,
        message
      };

      await this.callApi('send_msg', params);
      return true;
    } catch (error) {
      this.logger.error('发送消息失败:', error);
      return false;
    }
  }

  /**
   * 撤回消息
   */
  async recallMessage(messageId: string): Promise<boolean> {
    try {
      await this.callApi('delete_msg', { message_id: messageId });
      return true;
    } catch (error) {
      this.logger.error('撤回消息失败:', error);
      return false;
    }
  }

  /**
   * 获取登录信息
   */
  getLoginInfo(): { user_id: number; nickname: string } | undefined {
    return this.loginInfo;
  }

  /**
   * 是否已连接
   */
  isConnected(): boolean {
    return this.connected && this.ws?.readyState === WebSocket.OPEN;
  }

  /**
   * 断开连接
   */
  async disconnect(): Promise<void> {
    this.stopHeartbeat();
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.connected = false;
    this.logger.info('已断开连接');
  }
}
