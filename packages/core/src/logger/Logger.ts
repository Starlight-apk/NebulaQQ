/**
 * NebulaQQ - 日志系统
 * 
 * 支持多级别日志、彩色输出、日志文件写入
 */

import { EventEmitter } from 'events';
import { inspect } from 'util';

/** 日志级别 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/** 日志级别数值映射 */
const LogLevelNum: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3
};

/** 日志颜色配置 */
const LogColors = {
  debug: '\x1b[36m',    // Cyan
  info: '\x1b[32m',     // Green
  warn: '\x1b[33m',     // Yellow
  error: '\x1b[31m',    // Red
  reset: '\x1b[0m',
  time: '\x1b[90m',     // Gray
  module: '\x1b[35m'    // Purple
};

/** 日志选项 */
export interface LoggerOptions {
  /** 日志级别 */
  level?: LogLevel;
  /** 模块名称 */
  module?: string;
  /** 是否启用彩色输出 */
  colors?: boolean;
  /** 是否输出时间戳 */
  timestamp?: boolean;
  /** 自定义输出流 */
  outputStream?: NodeJS.WritableStream;
  /** 错误输出流 */
  errorStream?: NodeJS.WritableStream;
}

/** 日志事件接口 */
export interface LogEntry {
  level: LogLevel;
  message: string;
  module?: string;
  time: Date;
  data?: unknown[];
}

/**
 * 日志系统核心类
 * 
 * @example
 * ```typescript
 * const logger = new Logger({ module: 'MyPlugin', level: 'debug' });
 * 
 * logger.debug('调试信息');
 * logger.info('普通信息');
 * logger.warn('警告信息');
 * logger.error('错误信息');
 * ```
 */
export class Logger extends EventEmitter {
  private level: LogLevel;
  private module?: string;
  private colors: boolean;
  private timestamp: boolean;
  private outputStream: NodeJS.WritableStream;
  private errorStream: NodeJS.WritableStream;
  
  /** 日志历史 */
  private history: LogEntry[] = [];
  private maxHistory = 1000;

  constructor(options: LoggerOptions = {}) {
    super();
    const {
      level = 'info',
      module,
      colors = true,
      timestamp = true,
      outputStream = process.stdout,
      errorStream = process.stderr
    } = options;
    
    this.level = level;
    this.module = module;
    this.colors = colors && outputStream === process.stdout;
    this.timestamp = timestamp;
    this.outputStream = outputStream;
    this.errorStream = errorStream;
  }

  /**
   * 格式化日志消息
   */
  private format(level: LogLevel, message: string, data?: unknown[]): string {
    const parts: string[] = [];
    
    // 时间戳
    if (this.timestamp) {
      const time = new Date().toLocaleTimeString('zh-CN', { hour12: false });
      if (this.colors) {
        parts.push(`${LogColors.time}[${time}]${LogColors.reset}`);
      } else {
        parts.push(`[${time}]`);
      }
    }
    
    // 日志级别
    if (this.colors) {
      parts.push(`${LogColors[level]}[${level.toUpperCase()}]${LogColors.reset}`);
    } else {
      parts.push(`[${level.toUpperCase()}]`);
    }
    
    // 模块名
    if (this.module) {
      if (this.colors) {
        parts.push(`${LogColors.module}[${this.module}]${LogColors.reset}`);
      } else {
        parts.push(`[${this.module}]`);
      }
    }
    
    // 消息内容
    parts.push(message);
    
    // 附加数据
    if (data && data.length > 0) {
      const formattedData = data.map(d => 
        typeof d === 'object' ? inspect(d, { colors: this.colors, depth: 3 }) : d
      ).join(' ');
      parts.push(formattedData);
    }
    
    return parts.join(' ');
  }

  /**
   * 记录日志
   */
  private log(level: LogLevel, message: string, ...data: unknown[]): void {
    // 检查日志级别
    if (LogLevelNum[level] < LogLevelNum[this.level]) {
      return;
    }
    
    const formatted = this.format(level, message, data);
    const stream = level === 'error' ? this.errorStream : this.outputStream;
    
    // 输出日志
    stream.write(formatted + '\n');
    
    // 记录到历史
    const entry: LogEntry = {
      level,
      message,
      module: this.module,
      time: new Date(),
      data
    };
    
    this.history.push(entry);
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    }
    
    // 发射事件
    this.emit('log', entry);
  }

  /**
   * 调试日志
   */
  debug(message: string, ...data: unknown[]): void {
    this.log('debug', message, ...data);
  }

  /**
   * 信息日志
   */
  info(message: string, ...data: unknown[]): void {
    this.log('info', message, ...data);
  }

  /**
   * 警告日志
   */
  warn(message: string, ...data: unknown[]): void {
    this.log('warn', message, ...data);
  }

  /**
   * 错误日志
   */
  error(message: string, ...data: unknown[]): void {
    this.log('error', message, ...data);
  }

  /**
   * 设置日志级别
   */
  setLevel(level: LogLevel): void {
    this.level = level;
  }

  /**
   * 获取日志级别
   */
  getLevel(): LogLevel {
    return this.level;
  }

  /**
   * 获取日志历史
   */
  getHistory(since?: Date): LogEntry[] {
    if (!since) return [...this.history];
    return this.history.filter(entry => entry.time >= since);
  }

  /**
   * 清空日志历史
   */
  clearHistory(): void {
    this.history = [];
  }

  /**
   * 创建子日志器
   */
  child(module: string): Logger {
    return new Logger({
      level: this.level,
      module: `${this.module || 'NebulaQQ'}/${module}`,
      colors: this.colors,
      timestamp: this.timestamp,
      outputStream: this.outputStream,
      errorStream: this.errorStream
    });
  }
}

/**
 * 日志管理器
 */
export class LoggerManager {
  private loggers: Map<string, Logger> = new Map();
  private defaultOptions: LoggerOptions;

  constructor(defaultOptions: LoggerOptions = {}) {
    this.defaultOptions = defaultOptions;
  }

  /**
   * 获取或创建日志器
   */
  get(module: string): Logger {
    if (!this.loggers.has(module)) {
      const logger = new Logger({
        ...this.defaultOptions,
        module
      });
      this.loggers.set(module, logger);
    }
    return this.loggers.get(module)!;
  }

  /**
   * 设置所有日志器的级别
   */
  setLevel(level: LogLevel): void {
    this.loggers.forEach(logger => logger.setLevel(level));
    this.defaultOptions.level = level;
  }

  /**
   * 获取所有日志器
   */
  getAll(): Logger[] {
    return Array.from(this.loggers.values());
  }
}

/**
 * 全局日志器管理器实例
 */
export const loggerManager = new LoggerManager();

/**
 * 获取日志器的快捷方法
 */
export function get(module: string): Logger {
  return loggerManager.get(module);
}
