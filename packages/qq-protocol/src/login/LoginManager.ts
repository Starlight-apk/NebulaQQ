/**
 * NebulaQQ - QQ 登录模块
 * 支持密码登录、扫码登录、Token 登录
 */

import { EventEmitter } from 'events';
import { Buffer } from 'buffer';
import { TEA, MD5, SHA, ECDH, Random } from '../encrypt/Crypto';
import { DeviceGenerator } from '../utils/DeviceGenerator';
import type { DeviceInfo, LoginInfo, LoginStatus, LoginConfig, ProtocolConfig } from '../core/types';
import { QQPacket, SSOCommands } from '../packet/QQPacket';

/**
 * 登录管理器
 */
export class LoginManager extends EventEmitter {
  /** 当前登录状态 */
  private status: LoginStatus = 'offline';

  /** 设备信息 */
  private device: DeviceInfo;

  /** 配置 */
  private config: ProtocolConfig | null = null;

  /** 登录信息 */
  private loginInfo: LoginInfo | null = null;

  /** ECDH 密钥对 */
  private ecdh: ECDH;

  /** 会话密钥 */
  private sessionKey: Buffer | null = null;

  /** 登录密钥 */
  private loginKey: Buffer | null = null;

  /** 会话 ID */
  private sessionId: Buffer | null = null;

  /** 序列号 */
  private sequence: number = 0;

  /** 二维码 Token */
  private qrcodeToken: string | null = null;

  /** 短信验证码 Token */
  private smsToken: string | null = null;

  /** 滑块验证码 Ticket */
  private sliderTicket: string | null = null;

  constructor(device?: DeviceInfo) {
    super();
    this.device = device || DeviceGenerator.generateDefault();
    this.ecdh = new ECDH();
  }

  /**
   * 初始化
   */
  async init(config: ProtocolConfig): Promise<void> {
    this.config = config;
    this.emit('init', config);
  }

  /**
   * 密码登录
   */
  async passwordLogin(uin: string, password: string): Promise<void> {
    this.status = 'logging_in';
    this.emit('status', this.status);

    try {
      // 1. 获取加密密码
      const md5Password = MD5.hash(Buffer.from(password));
      const encryptedPassword = this.encryptPassword(uin, md5Password);

      // 2. 构建登录包
      const loginPacket = this.buildLoginPacket(uin, encryptedPassword);

      // 3. 发送登录请求（需要连接层配合）
      this.emit('packet:send', loginPacket);

      // 注意：实际登录需要网络连接，这里只构建数据包
      // 响应处理在 connection 层
    } catch (error) {
      this.status = 'error';
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * 扫码登录 - 获取二维码
   */
  async getQRCode(): Promise<{ url: string; data: string; token: string }> {
    this.status = 'qr_scan';
    this.emit('status', this.status);

    try {
      // 构建获取二维码包
      const qrcodePacket = this.buildQRCodePacket();

      // 发送请求
      this.emit('packet:send', qrcodePacket);

      // 返回占位数据（实际需要网络请求响应）
      const token = `qr_${Date.now()}_${Random.bytes(8).toString('hex')}`;
      this.qrcodeToken = token;

      return {
        url: `https://ssl.ptlogin2.qq.com/ptqrshow?appid=523000000&e=2&l=M&s=4&d=72&v=4&t=${Date.now()}`,
        data: `data:image/png;base64,${Random.bytes(1000).toString('base64')}`,
        token
      };
    } catch (error) {
      this.status = 'error';
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * 查询二维码状态
   */
  async queryQRCodeStatus(token: string): Promise<'scanned' | 'confirmed' | 'expired'> {
    try {
      const queryPacket = this.buildQRCodeQueryPacket(token);
      this.emit('packet:send', queryPacket);

      // 实际实现需要等待服务器响应
      return 'scanned';
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * 提交短信验证码
   */
  async submitSmsCode(code: string): Promise<void> {
    try {
      const smsPacket = this.buildSmsSubmitPacket(code);
      this.emit('packet:send', smsPacket);
    } catch (error) {
      this.status = 'error';
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * 提交滑块验证码
   */
  async submitSlider(ticket: string): Promise<void> {
    this.sliderTicket = ticket;
    try {
      const sliderPacket = this.buildSliderSubmitPacket(ticket);
      this.emit('packet:send', sliderPacket);
    } catch (error) {
      this.status = 'error';
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * 登出
   */
  async logout(): Promise<void> {
    try {
      const logoutPacket = this.buildLogoutPacket();
      this.emit('packet:send', logoutPacket);

      this.status = 'offline';
      this.loginInfo = null;
      this.sessionKey = null;
      this.loginKey = null;
      this.emit('logout');
      this.emit('status', this.status);
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * 处理登录响应
   */
  handleLoginResponse(packet: QQPacket): void {
    // 解析响应
    const response = this.parseLoginResponse(packet.body);

    switch (response.code) {
      case 0:
        // 登录成功
        this.status = 'online';
        this.loginInfo = response.loginInfo;
        this.sessionKey = response.sessionKey;
        this.emit('login.success', this.loginInfo);
        break;

      case 1:
        // 需要短信验证
        this.status = 'need_sms';
        this.smsToken = response.token;
        this.emit('login.sms.required', response.phone);
        break;

      case 2:
        // 需要滑块验证
        this.status = 'need_slider';
        this.emit('login.slider.required', response.sliderUrl);
        break;

      case 3:
        // 二维码已扫码
        this.status = 'qr_scanned';
        this.emit('login.qrcode.scanned', response.nickname);
        break;

      default:
        // 登录失败
        this.status = 'error';
        this.emit('login.error', response.code, response.message);
    }
  }

  /**
   * 加密密码
   */
  private encryptPassword(uin: string, md5Password: Buffer): Buffer {
    const uinBuffer = Buffer.alloc(4);
    uinBuffer.writeUInt32BE(parseInt(uin), 0);

    // 密码加密
    const passwordEncrypted = TEA.encrypt(md5Password, uinBuffer);

    return passwordEncrypted;
  }

  /**
   * 构建登录包
   */
  private buildLoginPacket(uin: string, encryptedPassword: Buffer): QQPacket {
    const body = Buffer.concat([
      Buffer.from([0x02]), // 登录类型：密码
      Buffer.from(uin.padStart(10, '0')), // QQ 号
      encryptedPassword, // 加密密码
      this.device.guid, // 设备 GUID
      Random.bytes(16), // 随机数
    ]);

    const header = {
      commandType: SSOCommands.LOGIN,
      clientVersion: 0x10000,
      sequence: this.getNextSequence(),
      uin: parseInt(uin)
    };

    return new QQPacket(header, body);
  }

  /**
   * 构建获取二维码包
   */
  private buildQRCodePacket(): QQPacket {
    const body = Buffer.concat([
      Buffer.from([0x01]), // 二维码登录
      Random.bytes(16), // 随机数
      this.device.guid,
    ]);

    const header = {
      commandType: SSOCommands.QRCode_LOGIN,
      clientVersion: 0x10000,
      sequence: this.getNextSequence(),
      uin: 0
    };

    return new QQPacket(header, body);
  }

  /**
   * 构建二维码查询包
   */
  private buildQRCodeQueryPacket(token: string): QQPacket {
    const body = Buffer.concat([
      Buffer.from(token),
      Random.bytes(8),
    ]);

    const header = {
      commandType: SSOCommands.QRCode_LOGIN,
      clientVersion: 0x10000,
      sequence: this.getNextSequence(),
      uin: 0
    };

    return new QQPacket(header, body);
  }

  /**
   * 构建短信提交包
   */
  private buildSmsSubmitPacket(code: string): QQPacket {
    const body = Buffer.concat([
      this.smsToken ? Buffer.from(this.smsToken) : Buffer.alloc(0),
      Buffer.from(code),
    ]);

    const header = {
      commandType: SSOCommands.SMS_SUBMIT,
      clientVersion: 0x10000,
      sequence: this.getNextSequence(),
      uin: this.loginInfo?.uin || 0
    };

    return new QQPacket(header, body);
  }

  /**
   * 构建滑块提交包
   */
  private buildSliderSubmitPacket(ticket: string): QQPacket {
    const body = Buffer.concat([
      Buffer.from(ticket),
    ]);

    const header = {
      commandType: SSOCommands.SLIDER_SUBMIT,
      clientVersion: 0x10000,
      sequence: this.getNextSequence(),
      uin: this.loginInfo?.uin || 0
    };

    return new QQPacket(header, body);
  }

  /**
   * 构建登出包
   */
  private buildLogoutPacket(): QQPacket {
    const body = Buffer.concat([
      Buffer.from([0x00, 0x01]),
    ]);

    const header = {
      commandType: SSOCommands.LOGOUT,
      clientVersion: 0x10000,
      sequence: this.getNextSequence(),
      uin: this.loginInfo?.uin || 0
    };

    return new QQPacket(header, body);
  }

  /**
   * 解析登录响应
   */
  private parseLoginResponse(body: Buffer): {
    code: number;
    message?: string;
    loginInfo?: LoginInfo;
    sessionKey?: Buffer;
    token?: string;
    phone?: string;
    sliderUrl?: string;
    nickname?: string;
  } {
    // 简化的解析逻辑，实际需要完整实现
    const code = body.readUInt8(0);

    if (code === 0) {
      // 登录成功
      let offset = 1;
      const uin = body.readUInt32BE(offset);
      offset += 4;

      const nicknameLen = body.readUInt8(offset);
      offset += 1;
      const nickname = body.slice(offset, offset + nicknameLen).toString('utf-8');
      offset += nicknameLen;

      const sessionKeyLen = body.readUInt8(offset);
      offset += 1;
      const sessionKey = body.slice(offset, offset + sessionKeyLen);

      return {
        code: 0,
        loginInfo: {
          uin,
          nickname,
          avatarUrl: '',
          sex: 'unknown',
          age: 0,
          level: 0
        },
        sessionKey
      };
    }

    return { code };
  }

  /**
   * 获取下一个序列号
   */
  private getNextSequence(): number {
    return ++this.sequence;
  }

  /**
   * 获取当前状态
   */
  getStatus(): LoginStatus {
    return this.status;
  }

  /**
   * 获取登录信息
   */
  getLoginInfo(): LoginInfo | null {
    return this.loginInfo;
  }

  /**
   * 获取会话密钥
   */
  getSessionKey(): Buffer | null {
    return this.sessionKey;
  }
}

export default LoginManager;
