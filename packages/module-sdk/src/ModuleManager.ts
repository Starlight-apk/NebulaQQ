/**
 * NebulaQQ - 模块管理器
 * 
 * 支持模块的热插拔、依赖管理、权限控制
 */

import { EventEmitter } from 'events';
import type { Module, ModuleContext, Command, ModuleConfigItem } from './Module';
import type { Logger } from '@nebulaqq/core';

/** 模块状态 */
export type ModuleStatus = 'pending' | 'enabled' | 'disabled' | 'error';

/** 模块包装器 */
export interface ModuleWrapper {
  module: Module;
  status: ModuleStatus;
  context?: ModuleContext;
  error?: Error;
  enabledTime?: number;
}

/** 模块管理器选项 */
export interface ModuleManagerOptions {
  /** 数据目录 */
  dataDir?: string;
  /** 日志器 */
  logger: Logger;
}

/**
 * 模块管理器
 */
export class ModuleManager extends EventEmitter {
  private modules: Map<string, ModuleWrapper> = new Map();
  private dataDir: string;
  private logger: Logger;
  private moduleConfigs: Map<string, Map<string, unknown>> = new Map();
  private commands: Map<string, Command> = new Map();
  private callApi?: <T = unknown>(action: string, params?: Record<string, unknown>) => Promise<T>;
  private sendMessage?: (targetType: 'private' | 'group', targetId: string, message: string | unknown[]) => Promise<boolean>;

  constructor(options: ModuleManagerOptions) {
    super();
    this.dataDir = options.dataDir || './data/modules';
    this.logger = options.logger.child('ModuleManager');
  }

  /**
   * 设置 API 调用和消息发送方法
   */
  setApiMethods(
    callApi: <T = unknown>(action: string, params?: Record<string, unknown>) => Promise<T>,
    sendMessage: (targetType: 'private' | 'group', targetId: string, message: string | unknown[]) => Promise<boolean>
  ): void {
    this.callApi = callApi;
    this.sendMessage = sendMessage;
  }

  /**
   * 注册模块
   */
  register(module: Module): void {
    const name = module.manifest.name;
    
    if (this.modules.has(name)) {
      this.logger.warn(`模块 ${name} 已注册，跳过`);
      return;
    }

    // 初始化模块配置
    const config = new Map<string, unknown>();
    if (module.configSchema) {
      for (const item of module.configSchema) {
        config.set(item.key, item.default);
      }
    }
    this.moduleConfigs.set(name, config);

    this.modules.set(name, {
      module,
      status: 'pending'
    });

    this.logger.debug(`模块 ${name} 已注册`);
    this.emit('module:registered', name);
  }

  /**
   * 启用模块
   */
  async enable(name: string): Promise<boolean> {
    const wrapper = this.modules.get(name);
    
    if (!wrapper) {
      this.logger.error(`模块 ${name} 未注册`);
      return false;
    }

    if (wrapper.status === 'enabled') {
      this.logger.debug(`模块 ${name} 已启用，跳过`);
      return true;
    }

    // 检查依赖
    if (wrapper.module.manifest.dependencies) {
      for (const dep of wrapper.module.manifest.dependencies) {
        const depWrapper = this.modules.get(dep);
        if (!depWrapper || depWrapper.status !== 'enabled') {
          this.logger.error(`模块 ${name} 依赖的模块 ${dep} 未启用`);
          return false;
        }
      }
    }

    try {
      // 创建模块上下文
      const context = this.createModuleContext(name);
      wrapper.context = context;

      // 调用初始化钩子
      if (wrapper.module.onInit) {
        await wrapper.module.onInit(context);
      }

      // 调用启用钩子
      if (wrapper.module.onEnable) {
        await wrapper.module.onEnable(context);
      }

      // 注册命令
      if (wrapper.module.commands) {
        for (const [cmdName, command] of wrapper.module.commands) {
          this.commands.set(`${name}:${cmdName}`, command);
          this.logger.debug(`注册命令：${name}:${cmdName}`);
        }
      }

      wrapper.status = 'enabled';
      wrapper.enabledTime = Date.now();
      
      this.logger.info(`模块 ${name} 已启用`);
      this.emit('module:enabled', name);
      
      return true;
    } catch (error) {
      wrapper.status = 'error';
      wrapper.error = error instanceof Error ? error : new Error(String(error));
      this.logger.error(`模块 ${name} 启用失败:`, error);
      this.emit('module:error', name, error);
      
      return false;
    }
  }

  /**
   * 禁用模块
   */
  async disable(name: string): Promise<boolean> {
    const wrapper = this.modules.get(name);
    
    if (!wrapper || wrapper.status !== 'enabled') {
      return false;
    }

    // 检查是否有其他模块依赖它
    for (const [moduleName, moduleWrapper] of this.modules) {
      if (moduleWrapper.module.manifest.dependencies?.includes(name)) {
        this.logger.warn(`模块 ${moduleName} 依赖 ${name}，无法禁用`);
        return false;
      }
    }

    try {
      // 调用禁用钩子
      if (wrapper.module.onDisable && wrapper.context) {
        await wrapper.module.onDisable(wrapper.context);
      }

      // 注销命令
      if (wrapper.module.commands) {
        for (const cmdName of wrapper.module.commands.keys()) {
          this.commands.delete(`${name}:${cmdName}`);
        }
      }

      wrapper.status = 'disabled';
      this.logger.info(`模块 ${name} 已禁用`);
      this.emit('module:disabled', name);
      
      return true;
    } catch (error) {
      this.logger.error(`模块 ${name} 禁用失败:`, error);
      return false;
    }
  }

  /**
   * 卸载模块
   */
  async unload(name: string): Promise<boolean> {
    const wrapper = this.modules.get(name);
    
    if (!wrapper) {
      return false;
    }

    // 先禁用
    if (wrapper.status === 'enabled') {
      await this.disable(name);
    }

    try {
      // 调用清理钩子
      if (wrapper.module.onCleanup && wrapper.context) {
        await wrapper.module.onCleanup(wrapper.context);
      }

      this.modules.delete(name);
      this.moduleConfigs.delete(name);
      
      this.logger.info(`模块 ${name} 已卸载`);
      this.emit('module:unloaded', name);
      
      return true;
    } catch (error) {
      this.logger.error(`模块 ${name} 卸载失败:`, error);
      return false;
    }
  }

  /**
   * 启用所有模块
   */
  async enableAll(): Promise<Map<string, boolean>> {
    const results = new Map<string, boolean>();
    const sorted = this.topologicalSort();
    
    for (const name of sorted) {
      const success = await this.enable(name);
      results.set(name, success);
    }
    
    return results;
  }

  /**
   * 禁用所有模块
   */
  async disableAll(): Promise<void> {
    const sorted = this.topologicalSort().reverse();
    
    for (const name of sorted) {
      await this.disable(name);
    }
  }

  /**
   * 拓扑排序
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
      
      const wrapper = this.modules.get(name);
      if (wrapper?.module.manifest.dependencies) {
        for (const dep of wrapper.module.manifest.dependencies) {
          if (!visit(dep)) return false;
        }
      }

      visiting.delete(name);
      visited.add(name);
      sorted.push(name);
      
      return true;
    };

    for (const name of this.modules.keys()) {
      visit(name);
    }

    return sorted;
  }

  /**
   * 创建模块上下文
   */
  private createModuleContext(name: string): ModuleContext {
    const config = this.moduleConfigs.get(name) || new Map();
    
    return {
      logger: this.logger.child(name),
      dataPath: `${this.dataDir}/${name}`,
      callApi: this.callApi || (async () => { throw new Error('API 未初始化') }),
      sendMessage: this.sendMessage || (async () => false),
      getConfig: <T = unknown>(key: string) => config.get(key) as T,
      setConfig: <T = unknown>(key: string, value: T) => {
        config.set(key, value);
        this.moduleConfigs.set(name, config);
      },
      registerCommand: (command: Command) => {
        this.commands.set(`${name}:${command.name}`, command);
      },
      onEvent: (eventType: string, handler: (event: unknown) => void) => {
        this.on(eventType, handler);
      }
    };
  }

  /**
   * 执行命令
   */
  async executeCommand(commandName: string, ctx: {
    userId: string;
    groupId?: string;
    rawMessage: string;
    args: string[];
    reply: (message: string) => Promise<void>;
  }): Promise<boolean> {
    const command = this.commands.get(commandName);
    
    if (!command) {
      return false;
    }

    try {
      await command.handler({
        command: commandName,
        args: ctx.args,
        rawMessage: ctx.rawMessage,
        userId: ctx.userId,
        groupId: ctx.groupId,
        reply: ctx.reply,
        callApi: this.callApi || (async () => { throw new Error('API 未初始化') })
      });
      return true;
    } catch (error) {
      this.logger.error(`执行命令 ${commandName} 失败:`, error);
      return false;
    }
  }

  /**
   * 获取模块
   */
  get(name: string): Module | undefined {
    return this.modules.get(name)?.module;
  }

  /**
   * 获取模块状态
   */
  getStatus(name: string): ModuleStatus | undefined {
    return this.modules.get(name)?.status;
  }

  /**
   * 获取所有模块
   */
  getAll(): Module[] {
    return Array.from(this.modules.values()).map(w => w.module);
  }

  /**
   * 获取已启用的模块
   */
  getEnabled(): Module[] {
    return Array.from(this.modules.values())
      .filter(w => w.status === 'enabled')
      .map(w => w.module);
  }

  /**
   * 获取模块列表
   */
  list(): Array<{ name: string; version: string; status: ModuleStatus; description?: string }> {
    return Array.from(this.modules.values()).map(w => ({
      name: w.module.manifest.name,
      version: w.module.manifest.version,
      status: w.status,
      description: w.module.manifest.description
    }));
  }

  /**
   * 获取模块配置
   */
  getModuleConfig<T = unknown>(moduleName: string, key: string): T | undefined {
    return this.moduleConfigs.get(moduleName)?.get(key) as T | undefined;
  }

  /**
   * 设置模块配置
   */
  setModuleConfig<T = unknown>(moduleName: string, key: string, value: T): void {
    const config = this.moduleConfigs.get(moduleName) || new Map();
    config.set(key, value);
    this.moduleConfigs.set(moduleName, config);
  }
}
