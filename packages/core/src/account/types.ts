/**
 * NebulaQQ - 账号管理模块
 * 支持多账号管理、扫码登录、快捷登录等功能
 */

export interface AccountInfo {
  /** 用户 ID */
  user_id: number;
  /** 昵称 */
  nickname: string;
  /** 头像 URL */
  avatar_url?: string;
  /** 性别 */
  sex?: 'male' | 'female' | 'unknown';
  /** 年龄 */
  age?: number;
  /** 等级 */
  level?: number;
}

export interface LoginStatus {
  /** 是否已登录 */
  logged_in: boolean;
  /** 账号信息 */
  account?: AccountInfo;
  /** 登录状态 */
  status: 'online' | 'offline' | 'busy' | 'away';
}

export interface QRCodeResult {
  /** 二维码数据 URL */
  qrcode: string;
  /** 二维码 token */
  token: string;
  /** 过期时间（毫秒） */
  expires_at: number;
}

export interface AccountConfig {
  /** 账号 ID */
  id: string;
  /** 账号名称 */
  name: string;
  /** 是否启用 */
  enabled: boolean;
  /** 自动登录 */
  autoLogin: boolean;
  /** 心跳间隔（秒） */
  heartbeatInterval: number;
  /** 重连间隔（秒） */
  reconnectInterval: number;
  /** 最大重试次数 */
  maxRetries: number;
  /** 数据目录 */
  dataDir: string;
  /** 日志级别 */
  logLevel: 'debug' | 'info' | 'warning' | 'error';
}

/**
 * 账号管理器接口
 */
export interface IAccountManager {
  /** 获取所有账号 */
  getAccounts(): AccountConfig[];
  
  /** 添加账号 */
  addAccount(config: AccountConfig): Promise<void>;
  
  /** 更新账号配置 */
  updateAccount(id: string, config: Partial<AccountConfig>): Promise<void>;
  
  /** 删除账号 */
  removeAccount(id: string): Promise<void>;
  
  /** 获取账号配置 */
  getAccount(id: string): AccountConfig | undefined;
  
  /** 启用账号 */
  enableAccount(id: string): Promise<void>;
  
  /** 禁用账号 */
  disableAccount(id: string): Promise<void>;
  
  /** 获取登录状态 */
  getLoginStatus(id: string): Promise<LoginStatus>;
  
  /** 获取二维码 */
  getQRCode(id: string): Promise<QRCodeResult>;
  
  /** 扫码登录 */
  qrCodeLogin(id: string, token: string): Promise<boolean>;
  
  /** 快捷登录（使用本地凭证） */
  quickLogin(id: string): Promise<boolean>;
  
  /** 退出登录 */
  logout(id: string): Promise<void>;
}
