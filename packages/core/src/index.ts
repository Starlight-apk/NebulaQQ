/**
 * NebulaQQ Core
 *
 * @packageDocumentation
 */

// 类型定义
export * from './types';

// 事件系统
export * from './events/EventSystem';

// NebulaBot 主类
export { NebulaBot } from './NebulaBot';
export type { NebulaBotConfig, BotStatus } from './NebulaBot';

// 插件管理器
export { PluginManager, definePlugin } from './plugin/PluginManager';
export type {
  Plugin,
  PluginManifest,
  MessageContext,
  MessageSegment,
  NoticeContext,
  RequestContext,
  PluginManagerOptions
} from './plugin/PluginManager';

// 日志器（精确导出避免与 types 冲突）
export { Logger, LogLevel, LoggerManager, get, loggerManager } from './logger/Logger';
export type { LoggerOptions, LogEntry } from './logger/Logger';

// 国际化
export * from './i18n';

// 账号管理
export * from './account/types';
export { AccountManager } from './account/AccountManager';

// 数据库
export * from './database/types';
export { SQLiteDatabaseManager } from './database/SQLiteDatabaseManager';
