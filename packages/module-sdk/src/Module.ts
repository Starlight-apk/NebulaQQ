/**
 * NebulaQQ - 模块定义
 */

import type { Logger } from '@nebulaqq/core';

/** 模块元数据 */
export interface ModuleManifest {
  /** 模块名称 */
  name: string;
  /** 模块版本 */
  version: string;
  /** 模块描述 */
  description?: string;
  /** 作者 */
  author?: string;
  /** 模块分类 */
  category?: string;
  /** 依赖的模块 */
  dependencies?: string[];
  /** 需要的权限 */
  permissions?: string[];
}

/** 模块配置项 */
export interface ModuleConfigItem<T = unknown> {
  key: string;
  label: string;
  default: T;
  description?: string;
  type: 'string' | 'number' | 'boolean' | 'select' | 'text';
  options?: { label: string; value: unknown }[];
  required?: boolean;
}

/** 模块上下文 */
export interface ModuleContext {
  /** 日志器 */
  logger: Logger;
  /** 模块数据目录 */
  dataPath: string;
  /** 调用 API */
  callApi: <T = unknown>(action: string, params?: Record<string, unknown>) => Promise<T>;
  /** 发送消息 */
  sendMessage: (targetType: 'private' | 'group', targetId: string, message: string | unknown[]) => Promise<boolean>;
  /** 获取配置 */
  getConfig: <T = unknown>(key: string) => T | undefined;
  /** 设置配置 */
  setConfig: <T = unknown>(key: string, value: T) => void;
  /** 注册命令 */
  registerCommand: (command: Command) => void;
  /** 注册事件监听 */
  onEvent: (eventType: string, handler: (event: unknown) => void) => void;
}

/** 命令定义 */
export interface Command {
  /** 命令名称 */
  name: string;
  /** 命令描述 */
  description?: string;
  /** 使用帮助 */
  usage?: string;
  /** 权限要求 */
  requiredPermissions?: string[];
  /** 命令处理器 */
  handler: (ctx: CommandContext) => Promise<void>;
}

/** 命令上下文 */
export interface CommandContext {
  /** 命令名称 */
  command: string;
  /** 命令参数 */
  args: string[];
  /** 原始消息 */
  rawMessage: string;
  /** 发送者 ID */
  userId: string;
  /** 群 ID */
  groupId?: string;
  /** 回复消息 */
  reply: (message: string) => Promise<void>;
  /** 调用 API */
  callApi: <T = unknown>(action: string, params?: Record<string, unknown>) => Promise<T>;
}

/** 模块接口 */
export interface Module {
  /** 模块元数据 */
  manifest: ModuleManifest;
  /** 配置项定义 */
  configSchema?: ModuleConfigItem[];
  /** 初始化钩子 */
  onInit?(ctx: ModuleContext): Promise<void> | void;
  /** 启用钩子 */
  onEnable?(ctx: ModuleContext): Promise<void> | void;
  /** 禁用钩子 */
  onDisable?(ctx: ModuleContext): Promise<void> | void;
  /** 清理钩子 */
  onCleanup?(ctx: ModuleContext): Promise<void> | void;
  /** 命令处理器映射 */
  commands?: Map<string, Command>;
  /** 事件处理器映射 */
  eventHandlers?: Map<string, (event: unknown) => void>;
}

/** 定义模块的辅助函数 */
export function defineModule(module: Module): Module {
  return module;
}
