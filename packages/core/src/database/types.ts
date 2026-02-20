/**
 * NebulaQQ - 数据库模块
 * 支持 SQLite 和 MySQL
 */

export interface DatabaseConfig {
  /** 数据库类型 */
  type: 'sqlite' | 'mysql';
  /** 数据库路径（SQLite） */
  path?: string;
  /** 主机（MySQL） */
  host?: string;
  /** 端口（MySQL） */
  port?: number;
  /** 用户名（MySQL） */
  username?: string;
  /** 密码（MySQL） */
  password?: string;
  /** 数据库名（MySQL） */
  database?: string;
  /** 连接池大小（MySQL） */
  poolSize?: number;
}

export interface DatabaseQueryResult<T = any> {
  /** 受影响的行数 */
  affectedRows?: number;
  /** 插入的 ID */
  insertId?: number;
  /** 查询结果 */
  rows: T[];
}

/**
 * 数据库管理器接口
 */
export interface IDatabaseManager {
  /** 初始化数据库 */
  init(): Promise<void>;
  
  /** 执行查询 */
  query<T = any>(sql: string, params?: any[]): Promise<DatabaseQueryResult<T>>;
  
  /** 执行事务 */
  transaction<T>(callback: (db: IDatabaseManager) => Promise<T>): Promise<T>;
  
  /** 关闭数据库连接 */
  close(): Promise<void>;
  
  /** 检查连接是否正常 */
  isConnected(): boolean;
}
