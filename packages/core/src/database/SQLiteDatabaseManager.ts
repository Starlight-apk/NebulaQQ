/**
 * NebulaQQ - SQLite 数据库实现
 */

import * as fs from 'fs';
import * as path from 'path';
import { EventEmitter } from 'events';
import type { IDatabaseManager, DatabaseConfig, DatabaseQueryResult } from './types';
import type { Logger } from '../logger/Logger';

// 动态导入 better-sqlite3
let Database: any = null;

/**
 * SQLite 数据库管理器
 */
export class SQLiteDatabaseManager extends EventEmitter implements IDatabaseManager {
  private config: DatabaseConfig;
  private db: any = null;
  private logger: Logger | null = null;
  private connected: boolean = false;

  constructor(config: DatabaseConfig) {
    super();
    this.config = config;
  }

  /**
   * 设置日志器
   */
  setLogger(logger: Logger): void {
    this.logger = logger;
  }

  /**
   * 日志记录
   */
  private log(level: string, ...args: unknown[]): void {
    if (this.logger) {
      (this.logger as any)[level](...args);
    }
  }

  /**
   * 加载 SQLite 模块
   */
  private async loadSQLiteModule(): Promise<void> {
    if (!Database) {
      try {
        // 尝试动态导入
        const module = await import('better-sqlite3');
        Database = module.default;
      } catch (error) {
        this.log('warning', 'better-sqlite3 未安装，尝试使用 sql.js');
        // 可以降级到 sql.js
        throw new Error('请安装数据库依赖：npm install better-sqlite3');
      }
    }
  }

  /**
   * 初始化数据库
   */
  async init(): Promise<void> {
    await this.loadSQLiteModule();

    const dbPath = this.config.path || './data/nebula.db';
    const resolvedPath = path.resolve(dbPath);

    // 确保目录存在
    const dir = path.dirname(resolvedPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      this.log('info', `创建数据库目录：${dir}`);
    }

    try {
      this.db = new Database(resolvedPath);
      
      // 启用外键约束
      this.db.pragma('foreign_keys = ON');
      
      // 设置日志模式
      this.db.pragma('journal_mode = WAL');
      
      this.connected = true;
      this.log('info', `SQLite 数据库已连接：${resolvedPath}`);
      
      this.emit('connected');
    } catch (error) {
      this.log('error', '连接数据库失败:', error);
      throw error;
    }
  }

  /**
   * 执行查询
   */
  async query<T = any>(sql: string, params: any[] = []): Promise<DatabaseQueryResult<T>> {
    if (!this.db || !this.connected) {
      throw new Error('数据库未连接');
    }

    try {
      const stmt = this.db.prepare(sql);
      let result: any;

      // 判断查询类型
      const upperSql = sql.trim().toUpperCase();
      
      if (upperSql.startsWith('SELECT')) {
        // 查询操作
        if (params.length > 0) {
          result = stmt.all(...params);
        } else {
          result = stmt.all();
        }
        
        return {
          rows: result as T[],
          affectedRows: result.length
        };
      } else if (upperSql.startsWith('INSERT')) {
        // 插入操作
        if (params.length > 0) {
          result = stmt.run(...params);
        } else {
          result = stmt.run();
        }
        
        return {
          rows: [],
          affectedRows: result.changes,
          insertId: result.lastInsertRowid
        };
      } else if (upperSql.startsWith('UPDATE') || upperSql.startsWith('DELETE')) {
        // 更新/删除操作
        if (params.length > 0) {
          result = stmt.run(...params);
        } else {
          result = stmt.run();
        }
        
        return {
          rows: [],
          affectedRows: result.changes
        };
      } else {
        // 其他操作
        if (params.length > 0) {
          stmt.run(...params);
        } else {
          stmt.run();
        }
        
        return {
          rows: [],
          affectedRows: 0
        };
      }
    } catch (error) {
      this.log('error', '查询执行失败:', { sql, params, error });
      throw error;
    }
  }

  /**
   * 执行事务
   */
  async transaction<T>(callback: (db: IDatabaseManager) => Promise<T>): Promise<T> {
    if (!this.db || !this.connected) {
      throw new Error('数据库未连接');
    }

    try {
      // 开始事务
      this.db.exec('BEGIN TRANSACTION');
      
      // 执行回调
      const result = await callback(this);
      
      // 提交事务
      this.db.exec('COMMIT');
      
      return result;
    } catch (error) {
      // 回滚事务
      this.db.exec('ROLLBACK');
      this.log('error', '事务执行失败:', error);
      throw error;
    }
  }

  /**
   * 关闭数据库连接
   */
  async close(): Promise<void> {
    if (this.db) {
      this.db.close();
      this.db = null;
      this.connected = false;
      this.log('info', '数据库连接已关闭');
      this.emit('disconnected');
    }
  }

  /**
   * 检查连接是否正常
   */
  isConnected(): boolean {
    return this.connected && this.db !== null;
  }

  /**
   * 创建表（如果不存在）
   */
  async createTable(tableName: string, schema: Record<string, string>): Promise<void> {
    const columns = Object.entries(schema)
      .map(([name, type]) => `${name} ${type}`)
      .join(',\n');
    
    const sql = `
      CREATE TABLE IF NOT EXISTS ${tableName} (
        ${columns}
      )
    `;
    
    await this.query(sql);
    this.log('info', `创建表：${tableName}`);
  }

  /**
   * 插入数据
   */
  async insert<T = any>(tableName: string, data: Record<string, any>): Promise<number> {
    const columns = Object.keys(data).join(', ');
    const placeholders = Object.keys(data).map(() => '?').join(', ');
    const values = Object.values(data);
    
    const sql = `INSERT INTO ${tableName} (${columns}) VALUES (${placeholders})`;
    const result = await this.query<T>(sql, values);
    
    return result.insertId as number;
  }

  /**
   * 更新数据
   */
  async update(tableName: string, data: Record<string, any>, where: string, whereParams: any[] = []): Promise<number> {
    const setClause = Object.keys(data).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(data), ...whereParams];
    
    const sql = `UPDATE ${tableName} SET ${setClause} WHERE ${where}`;
    const result = await this.query(sql, values);
    
    return result.affectedRows || 0;
  }

  /**
   * 删除数据
   */
  async delete(tableName: string, where: string, params: any[] = []): Promise<number> {
    const sql = `DELETE FROM ${tableName} WHERE ${where}`;
    const result = await this.query(sql, params);
    
    return result.affectedRows || 0;
  }

  /**
   * 查询单条记录
   */
  async findOne<T = any>(tableName: string, where: string, params: any[] = []): Promise<T | null> {
    const sql = `SELECT * FROM ${tableName} WHERE ${where} LIMIT 1`;
    const result = await this.query<T>(sql, params);
    
    return result.rows[0] || null;
  }

  /**
   * 查询所有记录
   */
  async find<T = any>(tableName: string, where?: string, params: any[] = []): Promise<T[]> {
    let sql = `SELECT * FROM ${tableName}`;
    if (where) {
      sql += ` WHERE ${where}`;
    }
    
    const result = await this.query<T>(sql, params);
    return result.rows;
  }
}

export default SQLiteDatabaseManager;
