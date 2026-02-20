/**
 * NebulaQQ - 插件系统
 *
 * 支持插件依赖管理、热重载、生命周期管理
 */

import { EventEmitter } from 'events';
import type { MessageEvent, PluginContext, MessageSegment } from '../types';
import type { Logger } from '../logger/Logger';

/** 插件元数据 */
export interface PluginManifest {
  /** 插件名称 */
  name: string;
  /** 插件版本 */
  version: string;
  /** 插件描述 */
  description?: string;
  /** 作者 */
  author?: string;
  /** 插件主页 */
  homepage?: string;
  /** 依赖的插件 */
  dependencies?: string[];
  /** 最低框架版本要求 */
  minVersion?: string;
  /** 插件标签 */
  tags?: string[];
}

/** 插件定义 */
export interface Plugin {
  /** 插件元数据 */
  manifest: PluginManifest;
  /** 初始化钩子 */
  onInit?(ctx: PluginContext): Promise<void> | void;
  /** 消息事件处理器 */
  onMessage?(ctx: MessageContext): Promise<void> | void;
  /** 通知事件处理器 */
  onNotice?(ctx: NoticeContext): Promise<void> | void;
  /** 请求事件处理器 */
  onRequest?(ctx: RequestContext): Promise<void> | void;
  /** 清理钩子 */
  onCleanup?(): Promise<void> | void;
  /** 插件配置 Schema 构建器 */
  buildConfigSchema?(ctx: PluginContext): unknown;
}

/** 消息上下文 */
export interface MessageContext {
  /** 事件对象 */
  event: MessageEvent;
  /** 消息内容 */
  message: string;
  /** 发送者 ID */
  userId: number;
  /** 群 ID（如果是群消息） */
  groupId?: number;
  /** 回复消息 */
  reply: (message: string | MessageSegment[]) => Promise<boolean>;
  /** 发送消息 */
  send: (message: string | MessageSegment[]) => Promise<boolean>;
  /** 撤回消息 */
  recall: () => Promise<boolean>;
  /** 调用底层 API */
  callApi: <T = unknown>(action: string, params?: Record<string, unknown>) => Promise<T>;
}

/** 消息段 */
export interface MessageSegment {
  type: string;
  data?: Record<string, unknown>;
  [key: string]: unknown;
}

/** 通知上下文 */
export interface NoticeContext {
  event: Record<string, unknown>;
  callApi: <T = unknown>(action: string, params?: Record<string, unknown>) => Promise<T>;
}

/** 请求上下文 */
export interface RequestContext {
  event: Record<string, unknown>;
  approve: (approve?: boolean) => Promise<void>;
  reject: (reason?: string) => Promise<void>;
  callApi: <T = unknown>(action: string, params?: Record<string, unknown>) => Promise<T>;
}

/** 插件状态 */
export type PluginStatus = 'pending' | 'loading' | 'loaded' | 'error' | 'disabled';

/** 插件包装器 */
export interface PluginWrapper {
  plugin: Plugin;
  status: PluginStatus;
  error?: Error;
  loadTime: number;
}

/** 插件管理器选项 */
export interface PluginManagerOptions {
  /** 插件目录 */
  pluginDir?: string;
  /** 数据目录 */
  dataDir?: string;
  /** 是否自动加载插件 */
  autoLoad?: boolean;
  /** 日志器 */
  logger: Logger;
}

/**
 * 插件管理器
 * 
 * @example
 * ```typescript
 * const manager = new PluginManager({
 *   pluginDir: './plugins',
 *   dataDir: './data',
 *   logger
 * });
 * 
 * // 注册插件
 * manager.register(myPlugin);
 * 
 * // 加载所有插件
 * await manager.loadAll();
 * 
 * // 卸载插件
 * await manager.unload('plugin-name');
 * ```
 */
export class PluginManager extends EventEmitter {
  private plugins: Map<string, PluginWrapper> = new Map();
  private pluginDir: string;
  private dataDir: string;
  private logger: Logger;
  private context?: PluginContext;

  constructor(options: PluginManagerOptions) {
    super();
    this.pluginDir = options.pluginDir || './plugins';
    this.dataDir = options.dataDir || './data';
    this.logger = options.logger.child('PluginManager');
  }

  /**
   * 设置插件上下文
   */
  setContext(ctx: PluginContext): void {
    this.context = ctx;
  }

  /**
   * 注册插件
   */
  register(plugin: Plugin): void {
    const name = plugin.manifest.name;
    
    if (this.plugins.has(name)) {
      this.logger.warn(`插件 ${name} 已注册，跳过`);
      return;
    }

    // 检查依赖
    if (plugin.manifest.dependencies) {
      const missingDeps = plugin.manifest.dependencies.filter(
        dep => !this.plugins.has(dep)
      );
      if (missingDeps.length > 0) {
        this.logger.warn(`插件 ${name} 缺少依赖：${missingDeps.join(', ')}`);
      }
    }

    this.plugins.set(name, {
      plugin,
      status: 'pending',
      loadTime: 0
    });

    this.logger.debug(`插件 ${name} 已注册`);
    this.emit('plugin:registered', name);
  }

  /**
   * 加载插件
   */
  async load(name: string): Promise<boolean> {
    const wrapper = this.plugins.get(name);
    
    if (!wrapper) {
      this.logger.error(`插件 ${name} 未注册`);
      return false;
    }

    if (wrapper.status === 'loaded') {
      this.logger.debug(`插件 ${name} 已加载，跳过`);
      return true;
    }

    // 检查依赖
    if (wrapper.plugin.manifest.dependencies) {
      for (const dep of wrapper.plugin.manifest.dependencies) {
        const depWrapper = this.plugins.get(dep);
        if (!depWrapper || depWrapper.status !== 'loaded') {
          this.logger.error(`插件 ${name} 依赖的插件 ${dep} 未加载`);
          return false;
        }
      }
    }

    wrapper.status = 'loading';
    const startTime = Date.now();

    try {
      // 调用初始化钩子
      if (wrapper.plugin.onInit && this.context) {
        await wrapper.plugin.onInit(this.context);
      }

      wrapper.status = 'loaded';
      wrapper.loadTime = Date.now() - startTime;
      
      this.logger.info(`插件 ${name} 加载完成 (${wrapper.loadTime}ms)`);
      this.emit('plugin:loaded', name);
      
      return true;
    } catch (error) {
      wrapper.status = 'error';
      wrapper.error = error instanceof Error ? error : new Error(String(error));
      this.logger.error(`插件 ${name} 加载失败:`, error);
      this.emit('plugin:error', name, error);
      
      return false;
    }
  }

  /**
   * 卸载插件
   */
  async unload(name: string): Promise<boolean> {
    const wrapper = this.plugins.get(name);
    
    if (!wrapper) {
      this.logger.error(`插件 ${name} 不存在`);
      return false;
    }

    // 检查是否有其他插件依赖它
    for (const [pluginName, pluginWrapper] of this.plugins) {
      if (pluginWrapper.plugin.manifest.dependencies?.includes(name)) {
        this.logger.warn(`插件 ${pluginName} 依赖 ${name}，无法卸载`);
        return false;
      }
    }

    try {
      // 调用清理钩子
      if (wrapper.plugin.onCleanup) {
        await wrapper.plugin.onCleanup();
      }

      this.plugins.delete(name);
      this.logger.info(`插件 ${name} 已卸载`);
      this.emit('plugin:unloaded', name);
      
      return true;
    } catch (error) {
      this.logger.error(`插件 ${name} 卸载失败:`, error);
      return false;
    }
  }

  /**
   * 禁用插件
   */
  disable(name: string): boolean {
    const wrapper = this.plugins.get(name);
    
    if (!wrapper || wrapper.status !== 'loaded') {
      return false;
    }

    wrapper.status = 'disabled';
    this.logger.info(`插件 ${name} 已禁用`);
    this.emit('plugin:disabled', name);
    
    return true;
  }

  /**
   * 启用插件
   */
  async enable(name: string): Promise<boolean> {
    const wrapper = this.plugins.get(name);
    
    if (!wrapper || wrapper.status !== 'disabled') {
      return false;
    }

    return await this.load(name);
  }

  /**
   * 加载所有插件
   */
  async loadAll(): Promise<Map<string, boolean>> {
    const results = new Map<string, boolean>();
    
    // 按依赖关系排序
    const sorted = this.topologicalSort();
    
    for (const name of sorted) {
      const success = await this.load(name);
      results.set(name, success);
    }
    
    return results;
  }

  /**
   * 拓扑排序（按依赖关系）
   */
  private topologicalSort(): string[] {
    const sorted: string[] = [];
    const visited = new Set<string>();
    const visiting = new Set<string>();

    const visit = (name: string): boolean => {
      if (visited.has(name)) return true;
      if (visiting.has(name)) {
        this.logger.error(`检测到循环依赖：${name}`);
        return false;
      }

      visiting.add(name);
      
      const wrapper = this.plugins.get(name);
      if (wrapper?.plugin.manifest.dependencies) {
        for (const dep of wrapper.plugin.manifest.dependencies) {
          if (!visit(dep)) return false;
        }
      }

      visiting.delete(name);
      visited.add(name);
      sorted.push(name);
      
      return true;
    };

    for (const name of this.plugins.keys()) {
      visit(name);
    }

    return sorted;
  }

  /**
   * 获取插件
   */
  get(name: string): Plugin | undefined {
    return this.plugins.get(name)?.plugin;
  }

  /**
   * 获取插件状态
   */
  getStatus(name: string): PluginStatus | undefined {
    return this.plugins.get(name)?.status;
  }

  /**
   * 获取所有插件
   */
  getAll(): Plugin[] {
    return Array.from(this.plugins.values()).map(w => w.plugin);
  }

  /**
   * 获取已加载的插件
   */
  getLoaded(): Plugin[] {
    return Array.from(this.plugins.values())
      .filter(w => w.status === 'loaded')
      .map(w => w.plugin);
  }

  /**
   * 获取插件列表
   */
  list(): Array<{ name: string; version: string; status: PluginStatus }> {
    return Array.from(this.plugins.values()).map(w => ({
      name: w.plugin.manifest.name,
      version: w.plugin.manifest.version,
      status: w.status
    }));
  }
}

/**
 * 定义插件的辅助函数
 */
export function definePlugin(plugin: Plugin): Plugin {
  return plugin;
}
