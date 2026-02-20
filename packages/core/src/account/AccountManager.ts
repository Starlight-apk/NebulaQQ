/**
 * NebulaQQ - 账号管理器实现
 * 
 * 功能：
 * - 多账号管理
 * - 扫码登录
 * - 快捷登录（使用本地凭证）
 * - 账号配置持久化
 */

import * as fs from 'fs';
import * as path from 'path';
import { EventEmitter } from 'events';
import type { IAccountManager, AccountConfig, AccountInfo, LoginStatus, QRCodeResult } from './types';
import type { Logger } from '../logger/Logger';

/**
 * 账号管理器
 */
export class AccountManager extends EventEmitter implements IAccountManager {
  /** 账号配置存储 */
  private accounts: Map<string, AccountConfig> = new Map();
  
  /** 登录状态缓存 */
  private loginStatus: Map<string, LoginStatus> = new Map();
  
  /** 二维码缓存 */
  private qrCodeCache: Map<string, QRCodeResult> = new Map();
  
  /** 数据目录 */
  private readonly dataDir: string;
  
  /** 配置文件路径 */
  private readonly configPath: string;
  
  /** 日志器 */
  private logger: Logger | null = null;

  constructor(dataDir: string = './data/accounts') {
    super();
    this.dataDir = path.resolve(dataDir);
    this.configPath = path.join(this.dataDir, 'accounts.json');
    this.ensureDataDir();
    this.loadAccounts();
  }

  /**
   * 设置日志器
   */
  setLogger(logger: Logger): void {
    this.logger = logger;
  }

  /**
   * 确保数据目录存在
   */
  private ensureDataDir(): void {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
      this.log('info', `创建数据目录：${this.dataDir}`);
    }
  }

  /**
   * 加载账号配置
   */
  private loadAccounts(): void {
    try {
      if (fs.existsSync(this.configPath)) {
        const data = fs.readFileSync(this.configPath, 'utf-8');
        const configs: AccountConfig[] = JSON.parse(data);
        for (const config of configs) {
          this.accounts.set(config.id, config);
        }
        this.log('info', `加载了 ${this.accounts.size} 个账号配置`);
      }
    } catch (error) {
      this.log('error', '加载账号配置失败:', error);
    }
  }

  /**
   * 保存账号配置
   */
  private saveAccounts(): void {
    try {
      const configs = Array.from(this.accounts.values());
      fs.writeFileSync(this.configPath, JSON.stringify(configs, null, 2), 'utf-8');
      this.log('info', '账号配置已保存');
    } catch (error) {
      this.log('error', '保存账号配置失败:', error);
    }
  }

  /**
   * 获取账号凭证文件路径
   */
  private getCredentialPath(accountId: string): string {
    return path.join(this.dataDir, `${accountId}.credential.json`);
  }

  /**
   * 保存账号凭证
   */
  private saveCredential(accountId: string, credential: Record<string, unknown>): void {
    const credentialPath = this.getCredentialPath(accountId);
    fs.writeFileSync(credentialPath, JSON.stringify(credential, null, 2), 'utf-8');
    this.log('info', `账号 ${accountId} 凭证已保存`);
  }

  /**
   * 加载账号凭证
   */
  private loadCredential(accountId: string): Record<string, unknown> | null {
    const credentialPath = this.getCredentialPath(accountId);
    if (fs.existsSync(credentialPath)) {
      const data = fs.readFileSync(credentialPath, 'utf-8');
      return JSON.parse(data);
    }
    return null;
  }

  /**
   * 删除账号凭证
   */
  private deleteCredential(accountId: string): void {
    const credentialPath = this.getCredentialPath(accountId);
    if (fs.existsSync(credentialPath)) {
      fs.unlinkSync(credentialPath);
      this.log('info', `账号 ${accountId} 凭证已删除`);
    }
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
   * 获取所有账号
   */
  getAccounts(): AccountConfig[] {
    return Array.from(this.accounts.values());
  }

  /**
   * 添加账号
   */
  async addAccount(config: AccountConfig): Promise<void> {
    if (this.accounts.has(config.id)) {
      throw new Error(`账号 ${config.id} 已存在`);
    }
    
    this.accounts.set(config.id, config);
    this.saveAccounts();
    
    // 初始化登录状态
    this.loginStatus.set(config.id, {
      logged_in: false,
      status: 'offline'
    });
    
    this.log('info', `添加账号：${config.name}(${config.id})`);
    this.emit('account:added', config);
  }

  /**
   * 更新账号配置
   */
  async updateAccount(id: string, config: Partial<AccountConfig>): Promise<void> {
    const account = this.accounts.get(id);
    if (!account) {
      throw new Error(`账号 ${id} 不存在`);
    }
    
    const updated = { ...account, ...config };
    this.accounts.set(id, updated);
    this.saveAccounts();
    
    this.log('info', `更新账号配置：${id}`);
    this.emit('account:updated', updated);
  }

  /**
   * 删除账号
   */
  async removeAccount(id: string): Promise<void> {
    if (!this.accounts.has(id)) {
      throw new Error(`账号 ${id} 不存在`);
    }
    
    this.accounts.delete(id);
    this.loginStatus.delete(id);
    this.qrCodeCache.delete(id);
    this.deleteCredential(id);
    this.saveAccounts();
    
    this.log('info', `删除账号：${id}`);
    this.emit('account:removed', id);
  }

  /**
   * 获取账号配置
   */
  getAccount(id: string): AccountConfig | undefined {
    return this.accounts.get(id);
  }

  /**
   * 启用账号
   */
  async enableAccount(id: string): Promise<void> {
    await this.updateAccount(id, { enabled: true });
    this.log('info', `启用账号：${id}`);
  }

  /**
   * 禁用账号
   */
  async disableAccount(id: string): Promise<void> {
    await this.updateAccount(id, { enabled: false });
    this.log('info', `禁用账号：${id}`);
  }

  /**
   * 获取登录状态
   */
  async getLoginStatus(id: string): Promise<LoginStatus> {
    return this.loginStatus.get(id) || { logged_in: false, status: 'offline' };
  }

  /**
   * 更新登录状态
   */
  updateLoginStatus(id: string, status: Partial<LoginStatus>): void {
    const current = this.loginStatus.get(id) || { logged_in: false, status: 'offline' };
    const updated = { ...current, ...status };
    this.loginStatus.set(id, updated);
    this.emit('login:status', { accountId: id, ...updated });
  }

  /**
   * 获取二维码
   * 
   * 注意：实际实现需要调用 OneBot/NapCat 的 API
   */
  async getQRCode(id: string): Promise<QRCodeResult> {
    const account = this.accounts.get(id);
    if (!account) {
      throw new Error(`账号 ${id} 不存在`);
    }

    // TODO: 调用 OneBot API 获取二维码
    // 这里返回一个模拟的二维码数据
    const token = `qr_${id}_${Date.now()}`;
    const expiresAt = Date.now() + 300000; // 5 分钟过期
    
    const qrCodeResult: QRCodeResult = {
      qrcode: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==`,
      token,
      expires_at: expiresAt
    };
    
    this.qrCodeCache.set(token, qrCodeResult);
    this.log('info', `生成二维码：${id}`);
    
    return qrCodeResult;
  }

  /**
   * 扫码登录
   * 
   * 用户扫描二维码后，调用此方法完成登录
   */
  async qrCodeLogin(id: string, token: string): Promise<boolean> {
    const account = this.accounts.get(id);
    if (!account) {
      throw new Error(`账号 ${id} 不存在`);
    }

    const cached = this.qrCodeCache.get(token);
    if (!cached || cached.token !== token) {
      this.log('error', '无效的二维码 token');
      return false;
    }

    // TODO: 调用 OneBot API 确认登录
    // 模拟登录成功
    this.updateLoginStatus(id, {
      logged_in: true,
      status: 'online',
      account: {
        user_id: parseInt(id),
        nickname: `User${id}`,
        avatar_url: '',
        sex: 'unknown'
      }
    });
    
    this.qrCodeCache.delete(token);
    this.log('info', `扫码登录成功：${id}`);
    this.emit('login:success', id);
    
    return true;
  }

  /**
   * 快捷登录（使用本地凭证）
   * 
   * 使用之前保存的登录凭证快速登录
   */
  async quickLogin(id: string): Promise<boolean> {
    const account = this.accounts.get(id);
    if (!account) {
      throw new Error(`账号 ${id} 不存在`);
    }

    const credential = this.loadCredential(id);
    if (!credential) {
      this.log('warning', `账号 ${id} 没有保存的凭证，需要扫码登录`);
      return false;
    }

    // TODO: 使用凭证调用 OneBot API 登录
    // 模拟登录成功
    this.updateLoginStatus(id, {
      logged_in: true,
      status: 'online',
      account: {
        user_id: parseInt(id),
        nickname: `User${id}`,
        avatar_url: '',
        sex: 'unknown'
      }
    });
    
    this.log('info', `快捷登录成功：${id}`);
    this.emit('login:success', id);
    
    return true;
  }

  /**
   * 退出登录
   */
  async logout(id: string): Promise<void> {
    const account = this.accounts.get(id);
    if (!account) {
      throw new Error(`账号 ${id} 不存在`);
    }

    // TODO: 调用 OneBot API 退出登录
    // 清除凭证
    this.deleteCredential(id);
    
    this.updateLoginStatus(id, {
      logged_in: false,
      status: 'offline',
      account: undefined
    });
    
    this.log('info', `退出登录：${id}`);
    this.emit('login:logout', id);
  }

  /**
   * 保存登录凭证
   * 
   * 登录成功后调用此方法保存凭证，用于下次快捷登录
   */
  saveLoginCredential(id: string, credential: Record<string, unknown>): void {
    this.saveCredential(id, credential);
  }

  /**
   * 获取启用的账号
   */
  getEnabledAccounts(): AccountConfig[] {
    return Array.from(this.accounts.values()).filter(acc => acc.enabled);
  }

  /**
   * 批量登录所有启用的账号
   */
  async loginAllEnabled(): Promise<Map<string, boolean>> {
    const results = new Map<string, boolean>();
    const enabledAccounts = this.getEnabledAccounts();
    
    for (const account of enabledAccounts) {
      try {
        // 先尝试快捷登录
        let success = await this.quickLogin(account.id);
        
        // 如果没有凭证，需要扫码登录
        if (!success) {
          this.log('info', `账号 ${account.id} 需要扫码登录`);
          results.set(account.id, false); // 需要扫码
        } else {
          results.set(account.id, true);
        }
      } catch (error) {
        this.log('error', `登录账号 ${account.id} 失败:`, error);
        results.set(account.id, false);
      }
    }
    
    return results;
  }
}

export default AccountManager;
