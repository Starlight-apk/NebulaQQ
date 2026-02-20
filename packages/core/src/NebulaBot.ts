/**
 * NebulaQQ - 机器人主类
 * 
 * 整合事件系统、插件管理、协议适配器的核心类
 */

import { EventEmitter } from 'events';
import { EventSystem, EventFilters } from '../events/EventSystem';
import { PluginManager, definePlugin, type Plugin, type MessageContext, type MessageSegment } from '../plugin/PluginManager';
import { OneBotAdapter, type OneBotAdapterConfig } from '../adapter/OneBotAdapter';
import { Logger, LoggerManager, type Logger as ILogger, type LogLevel } from '../logger/Logger';
import type { Event, MessageEvent, NoticeEvent, RequestEvent, ApiParams } from '../types';

/** 机器人配置 */
export interface NebulaBotConfig {
  /** 日志配置 */
  logging?: {
    level?: LogLevel;
    colors?: boolean;
  };
  /** OneBot 适配器配置 */
  adapter: OneBotAdapterConfig;
  /** 插件列表 */
  plugins?: Plugin[];
  /** 插件目录 */
  pluginDir?: string;
  /** 数据目录 */
  dataDir?: string;
  /** 主人 QQ 列表 */
  masterQqs?: string[];
  /** 黑名单 QQ 列表 */
  blacklistQqs?: string[];
}

/** 机器人状态 */
export type BotStatus = 'idle' | 'starting' | 'running' | 'stopping' | 'stopped';

/**
 * NebulaQQ 机器人主类
 * 
 * @example
 * ```typescript
 * const bot = new NebulaBot({
 *   logging: { level: 'info', colors: true },
 *   adapter: {
 *     type: 'websocket',
 *     host: '127.0.0.1',
 *     port: 3000
 *   },
 *   plugins: [myPlugin],
 *   masterQqs: ['12345678']
 * });
 * 
 * bot.on('ready', () => {
 *   console.log('机器人已就绪');
 * });
 * 
 * await bot.start();
 * ```
 */
export class NebulaBot extends EventEmitter {
  /** 机器人配置 */
  readonly config: NebulaBotConfig;
  
  /** 日志管理器 */
  readonly loggerManager: LoggerManager;
  
  /** 主日志器 */
  readonly logger: ILogger;
  
  /** 事件系统 */
  readonly eventSystem: EventSystem;
  
  /** 插件管理器 */
  readonly pluginManager: PluginManager;
  
  /** OneBot 适配器 */
  private adapter: OneBotAdapter | null = null;
  
  /** 机器人状态 */
  private status: BotStatus = 'idle';
  
  /** 机器人 QQ 号 */
  private selfId: string | null = null;
  
  /** 机器人昵称 */
  private nickname: string | null = null;

  constructor(config: NebulaBotConfig) {
    super();
    this.config = config;
    
    // 初始化日志系统
    this.loggerManager = new LoggerManager({
      level: config.logging?.level || 'info',
      colors: config.logging?.colors ?? true,
      timestamp: true
    });
    this.logger = this.loggerManager.get('NebulaBot');
    
    // 初始化事件系统
    this.eventSystem = new EventSystem();
    
    // 初始化插件管理器
    this.pluginManager = new PluginManager({
      pluginDir: config.pluginDir,
      dataDir: config.dataDir,
      logger: this.logger
    });
    
    // 设置插件上下文
    this.pluginManager.setContext({
      logger: this.logger,
      actions: {
        call: async (params: ApiParams) => {
          return await this.callApi(params.action as string, params.params);
        }
      },
      adapterName: 'onebot',
      dataPath: config.dataDir || './data',
      pluginManager: { config: {} }
    });
    
    this.setupEventHandlers();
  }

  /**
   * 设置事件处理器
   */
  private setupEventHandlers(): void {
    // 消息事件
    this.eventSystem.on('message', async (event) => {
      await this.handleMessage(event as MessageEvent);
    });

    // 通知事件
    this.eventSystem.on('notice', async (event) => {
      await this.handleNotice(event as NoticeEvent);
    });

    // 请求事件
    this.eventSystem.on('request', async (event) => {
      await this.handleRequest(event as RequestEvent);
    });

    // 元事件
    this.eventSystem.on('meta_event', async (event) => {
      const metaEvent = event as MetaEvent;
      if (metaEvent.meta_event_type === 'lifecycle') {
        this.logger.info('机器人生命周期事件:', metaEvent);
      }
    });
  }

  /**
   * 处理消息事件
   */
  private async handleMessage(event: MessageEvent): Promise<void> {
    const messageCtx = await this.createMessageContext(event);
    
    // 检查黑名单
    if (this.config.blacklistQqs?.includes(event.user_id)) {
      this.logger.debug(`用户 ${event.user_id} 在黑名单中，忽略消息`);
      return;
    }

    // 调用插件处理器
    const plugins = this.pluginManager.getLoaded();
    for (const plugin of plugins) {
      if (plugin.onMessage) {
        try {
          await plugin.onMessage(messageCtx);
        } catch (error) {
          this.logger.error(`插件 ${plugin.manifest.name} 处理消息失败:`, error);
        }
      }
    }
  }

  /**
   * 处理通知事件
   */
  private async handleNotice(event: NoticeEvent): Promise<void> {
    const noticeCtx = {
      event,
      callApi: async <T = unknown>(action: string, params?: Record<string, unknown>) => {
        return await this.callApi<T>(action, params);
      }
    };

    const plugins = this.pluginManager.getLoaded();
    for (const plugin of plugins) {
      if (plugin.onNotice) {
        try {
          await plugin.onNotice(noticeCtx);
        } catch (error) {
          this.logger.error(`插件 ${plugin.manifest.name} 处理通知失败:`, error);
        }
      }
    }
  }

  /**
   * 处理请求事件
   */
  private async handleRequest(event: RequestEvent): Promise<void> {
    const requestCtx = {
      event,
      approve: async (approve = true) => {
        await this.callApi('set_friend_add_request', {
          flag: event.flag,
          approve,
          sub_type: event.request_type
        });
      },
      reject: async (reason?: string) => {
        await this.callApi('set_friend_add_request', {
          flag: event.flag,
          approve: false,
          reason,
          sub_type: event.request_type
        });
      },
      callApi: async <T = unknown>(action: string, params?: Record<string, unknown>) => {
        return await this.callApi<T>(action, params);
      }
    };

    const plugins = this.pluginManager.getLoaded();
    for (const plugin of plugins) {
      if (plugin.onRequest) {
        try {
          await plugin.onRequest(requestCtx);
        } catch (error) {
          this.logger.error(`插件 ${plugin.manifest.name} 处理请求失败:`, error);
        }
      }
    }
  }

  /**
   * 创建消息上下文
   */
  private async createMessageContext(event: MessageEvent): Promise<MessageContext> {
    const message = typeof event.message === 'string' 
      ? event.message 
      : event.message.map(s => (s as MessageSegment).data?.text || '').join('');

    return {
      event,
      message,
      userId: event.user_id,
      groupId: (event as MessageEvent).group_id,
      reply: async (msg: string | MessageSegment[]) => {
        if (!this.adapter) return false;
        const targetType = event.message_type === 'group' ? 'group' : 'private';
        const targetId = event.message_type === 'group' 
          ? String(event.group_id) 
          : String(event.user_id);
        return await this.adapter.sendMessage(targetType, targetId, msg);
      },
      send: async (msg: string | MessageSegment[]) => {
        if (!this.adapter) return false;
        const targetType = event.message_type === 'group' ? 'group' : 'private';
        const targetId = event.message_type === 'group' 
          ? String(event.group_id) 
          : String(event.user_id);
        return await this.adapter.sendMessage(targetType, targetId, msg);
      },
      recall: async () => {
        if (!this.adapter) return false;
        return await this.adapter.recallMessage(event.message_id);
      },
      callApi: async <T = unknown>(action: string, params?: Record<string, unknown>) => {
        return await this.callApi<T>(action, params);
      }
    };
  }

  /**
   * 调用 API
   */
  async callApi<T = unknown>(action: string, params?: Record<string, unknown>): Promise<T> {
    if (!this.adapter) {
      throw new Error('适配器未初始化');
    }
    return await this.adapter.callApi<T>(action, params);
  }

  /**
   * 发送消息
   */
  async sendMessage(targetType: 'private' | 'group', targetId: string, message: string | MessageSegment[]): Promise<boolean> {
    if (!this.adapter) return false;
    return await this.adapter.sendMessage(targetType, targetId, message);
  }

  /**
   * 发送私聊消息
   */
  async sendPrivateMessage(userId: string, message: string | MessageSegment[]): Promise<boolean> {
    return this.sendMessage('private', userId, message);
  }

  /**
   * 发送群消息
   */
  async sendGroupMessage(groupId: string, message: string | MessageSegment[]): Promise<boolean> {
    return this.sendMessage('group', groupId, message);
  }

  /**
   * 获取登录信息
   */
  getLoginInfo(): { user_id: number; nickname: string } | null {
    return this.adapter?.getLoginInfo() || null;
  }

  /**
   * 获取机器人 QQ 号
   */
  getSelfId(): string | null {
    return this.selfId;
  }

  /**
   * 检查是否为主人
   */
  isMaster(userId: string): boolean {
    return this.config.masterQqs?.includes(userId) || false;
  }

  /**
   * 启动机器人
   */
  async start(): Promise<void> {
    if (this.status !== 'idle') {
      this.logger.warn(`机器人状态为 ${this.status}，无法启动`);
      return;
    }

    this.status = 'starting';
    this.logger.info('正在启动 NebulaQQ...');

    try {
      // 创建适配器
      this.adapter = new OneBotAdapter(this.config.adapter, this.logger);
      
      // 设置适配器事件监听
      this.adapter.on('ready', (loginInfo) => {
        this.selfId = String(loginInfo.user_id);
        this.nickname = loginInfo.nickname;
        this.status = 'running';
        this.logger.info(`机器人已就绪：${loginInfo.nickname}(${loginInfo.user_id})`);
        this.emit('ready', loginInfo);
      });

      this.adapter.on('message', (event) => {
        this.eventSystem.emit('message', event);
      });

      this.adapter.on('notice', (event) => {
        this.eventSystem.emit('notice', event);
      });

      this.adapter.on('request', (event) => {
        this.eventSystem.emit('request', event);
      });

      this.adapter.on('meta_event', (event) => {
        this.eventSystem.emit('meta_event', event);
      });

      // 注册内置插件
      if (this.config.plugins) {
        for (const plugin of this.config.plugins) {
          this.pluginManager.register(plugin);
        }
      }

      // 加载所有插件
      await this.pluginManager.loadAll();

      // 连接 OneBot
      await this.adapter.connect();

    } catch (error) {
      this.status = 'stopped';
      this.logger.error('启动失败:', error);
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * 停止机器人
   */
  async stop(): Promise<void> {
    if (this.status !== 'running') {
      this.logger.warn(`机器人状态为 ${this.status}，无法停止`);
      return;
    }

    this.status = 'stopping';
    this.logger.info('正在停止 NebulaQQ...');

    try {
      // 卸载所有插件
      const plugins = this.pluginManager.list();
      for (const plugin of plugins) {
        await this.pluginManager.unload(plugin.name);
      }

      // 断开适配器
      if (this.adapter) {
        await this.adapter.disconnect();
        this.adapter = null;
      }

      this.status = 'stopped';
      this.logger.info('NebulaQQ 已停止');
      this.emit('stopped');

    } catch (error) {
      this.status = 'stopped';
      this.logger.error('停止失败:', error);
      this.emit('error', error);
    }
  }

  /**
   * 获取机器人状态
   */
  getStatus(): BotStatus {
    return this.status;
  }

  /**
   * 检查是否正在运行
   */
  isRunning(): boolean {
    return this.status === 'running';
  }
}

export { definePlugin };
export type { Plugin, PluginManifest, PluginContext, MessageSegment };
