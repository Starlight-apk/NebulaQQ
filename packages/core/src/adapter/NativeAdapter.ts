/**
 * NebulaQQ - 原生 QQ 协议适配器
 * 直接使用 QQ 协议层，无需 OneBot 中转
 *
 * 注意：此适配器需要 @nebulaqq/qq-protocol 包
 */

import { EventEmitter } from 'events';
import { Logger, type Logger as ILogger } from '../logger/Logger';

// 从外部包导入（构建时需要先构建 qq-protocol 包）
import type {
  ProtocolConfig,
  LoginConfig,
  LoginInfo,
  MessageTarget,
  MessageChain,
  ReceivedMessage,
  FriendInfo,
  GroupInfo,
  GroupMemberInfo
} from '../../qq-protocol';
import { QQProtocol, DeviceGenerator } from '../../qq-protocol';

/** 原生协议适配器配置 */
export interface NativeAdapterConfig {
  /** 登录方式 */
  loginType: 'password' | 'qrcode' | 'token';
  /** QQ 号 */
  uin?: string;
  /** 密码（密码登录时必需） */
  password?: string;
  /** 设备类型 */
  deviceType?: 'phone' | 'pad' | 'watch';
  /** 心跳间隔（秒） */
  heartbeatInterval?: number;
  /** 重连间隔（秒） */
  reconnectInterval?: number;
  /** 最大重连次数 */
  maxReconnectAttempts?: number;
  /** 数据目录 */
  dataDir?: string;
}

/**
 * 原生 QQ 协议适配器
 */
export class NativeAdapter extends EventEmitter {
  /** 配置 */
  private config: NativeAdapterConfig;

  /** QQ 协议实例 */
  private protocol: QQProtocol;

  /** 日志器 */
  private logger: ILogger;

  /** 登录信息 */
  private loginInfo: LoginInfo | null = null;

  /** 是否已连接 */
  private connected = false;

  constructor(config: NativeAdapterConfig, logger: Logger) {
    super();
    this.config = config;
    this.logger = logger.child('NativeAdapter');
    this.protocol = new QQProtocol();

    this.setupProtocolHandlers();
  }

  /**
   * 设置协议事件处理器
   */
  private setupProtocolHandlers(): void {
    // 初始化事件
    this.protocol.on('init', () => {
      this.logger.debug('协议已初始化');
    });

    // 连接事件
    this.protocol.on('connected', () => {
      this.connected = true;
      this.logger.info('已连接到 QQ 服务器');
    });

    this.protocol.on('disconnected', () => {
      this.connected = false;
      this.logger.warn('与 QQ 服务器断开连接');
    });

    // 登录事件
    this.protocol.on('login.success', (data: any) => {
      this.loginInfo = data.info;
      this.logger.info(`登录成功：${data.info.nickname}(${data.info.uin})`);
      this.emit('ready', data.info);
    });

    this.protocol.on('login.error', (data: any) => {
      this.logger.error(`登录失败：${data.code} - ${data.message}`);
      this.emit('error', new Error(`登录失败：${data.message}`));
    });

    this.protocol.on('login.qrcode', (data: any) => {
      this.logger.info('请扫描二维码登录');
      this.emit('qrcode', data.url, data.data);
    });

    this.protocol.on('login.qrcode.scanned', (data: any) => {
      this.logger.info(`二维码已扫描：${data.nickname}`);
      this.emit('qrcode:scanned', data.nickname);
    });

    this.protocol.on('login.sms.required', (data: any) => {
      this.logger.warn(`需要短信验证：${data.phone}`);
      this.emit('sms:required', data.phone);
    });

    this.protocol.on('login.slider.required', (data: any) => {
      this.logger.warn(`需要滑块验证：${data.url}`);
      this.emit('slider:required', data.url);
    });

    // 消息事件
    this.protocol.on('message', (data: any) => {
      this.handleMessage(data.message);
    });

    // 心跳事件
    this.protocol.on('heartbeat', (data: any) => {
      this.logger.debug('心跳响应:', data.status);
      this.emit('heartbeat', data.status);
    });

    // 错误事件
    this.protocol.on('error', (data: any) => {
      this.logger.error('协议错误:', data.error);
      this.emit('error', data.error);
    });
  }

  /**
   * 处理接收到的消息
   */
  private handleMessage(raw: any): void {
    // 转换消息格式
    const message: ReceivedMessage = {
      messageId: raw.messageId || `msg_${Date.now()}`,
      chatType: raw.chatType || 'private',
      senderId: raw.senderId,
      senderName: raw.senderName,
      groupId: raw.groupId,
      groupName: raw.groupName,
      message: raw.message || [],
      raw,
      timestamp: Date.now(),
      fromSelf: false
    };

    // 转换为一消息事件
    const event = {
      time: message.timestamp,
      self_id: this.loginInfo?.uin || 0,
      post_type: 'message',
      message_type: message.chatType === 'group' ? 'group' : 'private',
      sub_type: 'normal',
      message_id: message.messageId,
      user_id: message.senderId,
      message: message.message,
      raw_message: JSON.stringify(raw),
      font: 0,
      sender: {
        user_id: message.senderId,
        nickname: message.senderName,
        sex: 'unknown',
        age: 0
      }
    };

    if (message.chatType === 'group') {
      (event as any).group_id = message.groupId;
      (event as any).group_name = message.groupName;
    }

    this.emit('message', event);
  }

  /**
   * 获取协议配置
   */
  private getProtocolConfig(): ProtocolConfig {
    return {
      device: DeviceGenerator.generate({
        deviceType: this.config.deviceType || 'phone'
      }),
      enableLog: true,
      logLevel: 'debug',
      dataDir: this.config.dataDir || './data',
      heartbeatInterval: this.config.heartbeatInterval || 30,
      reconnectInterval: this.config.reconnectInterval || 5,
      maxReconnectAttempts: this.config.maxReconnectAttempts || 5,
      requestTimeout: 10000
    };
  }

  /**
   * 获取登录配置
   */
  private getLoginConfig(): LoginConfig {
    return {
      uin: this.config.uin || '',
      password: this.config.password,
      autoLogin: true,
      loginType: this.config.loginType,
      device: DeviceGenerator.generateDefault()
    };
  }

  /**
   * 连接
   */
  async connect(): Promise<void> {
    this.logger.info('正在连接 QQ 协议...');

    try {
      // 初始化协议
      await this.protocol.init(this.getProtocolConfig());

      // 登录
      await this.protocol.login(this.getLoginConfig());

      this.logger.info('QQ 协议连接成功');
    } catch (error) {
      this.logger.error('QQ 协议连接失败:', error);
      throw error;
    }
  }

  /**
   * 断开连接
   */
  async disconnect(): Promise<void> {
    this.logger.info('正在断开 QQ 协议连接...');

    try {
      await this.protocol.destroy();
      this.connected = false;
      this.loginInfo = null;
      this.logger.info('QQ 协议已断开');
    } catch (error) {
      this.logger.error('断开连接失败:', error);
      throw error;
    }
  }

  /**
   * 发送消息
   */
  async sendMessage(targetType: 'private' | 'group', targetId: string, message: any): Promise<boolean> {
    if (!this.connected) {
      this.logger.warn('连接未建立，无法发送消息');
      return false;
    }

    try {
      const target: MessageTarget = targetType === 'group'
        ? { type: 'group', groupId: parseInt(targetId) }
        : { type: 'private', userId: parseInt(targetId) };

      const messageChain = this.convertMessage(message);
      await this.protocol.sendMessage(target, messageChain);

      this.logger.debug(`消息已发送：${targetType}:${targetId}`);
      return true;
    } catch (error) {
      this.logger.error('发送消息失败:', error);
      return false;
    }
  }

  /**
   * 转换消息格式
   */
  private convertMessage(message: any): MessageChain {
    if (typeof message === 'string') {
      return [{ type: 'text', content: message }];
    }

    if (Array.isArray(message)) {
      return message.map(item => {
        if (typeof item === 'string') {
          return { type: 'text', content: item };
        }
        return item;
      });
    }

    return [message];
  }

  /**
   * 撤回消息
   */
  async recallMessage(messageId: string): Promise<boolean> {
    // TODO: 实现撤回消息
    this.logger.debug('撤回消息:', messageId);
    return true;
  }

  /**
   * 调用 API
   */
  async callApi<T = unknown>(action: string, params?: Record<string, unknown>): Promise<T> {
    this.logger.debug('调用 API:', action, params);

    // 根据 action 调用相应的协议方法
    switch (action) {
      case 'get_login_info':
        return this.protocol.getLoginInfo() as unknown as T;

      case 'get_friend_list':
        return this.protocol.getFriendList() as unknown as T;

      case 'get_group_list':
        return this.protocol.getGroupList() as unknown as T;

      case 'get_group_info':
        return this.protocol.getGroupInfo(params?.group_id as number) as unknown as T;

      case 'get_group_member_list':
        return this.protocol.getGroupMemberList(params?.group_id as number) as unknown as T;

      case 'set_group_card':
        await this.protocol.setGroupCard(
          params?.group_id as number,
          params?.user_id as number,
          params?.card as string
        );
        return {} as T;

      case 'set_group_kick':
        await this.protocol.kickMember(
          params?.group_id as number,
          params?.user_id as number,
          params?.reject_add_request as boolean
        );
        return {} as T;

      case 'set_group_ban':
        await this.protocol.muteMember(
          params?.group_id as number,
          params?.user_id as number,
          params?.duration as number
        );
        return {} as T;

      case 'set_group_whole_ban':
        if (params?.enable) {
          await this.protocol.muteAll(params?.group_id as number);
        } else {
          await this.protocol.unmuteAll(params?.group_id as number);
        }
        return {} as T;

      case 'set_group_name':
        await this.protocol.setGroupName(
          params?.group_id as number,
          params?.name as string
        );
        return {} as T;

      case 'set_group_notice':
        await this.protocol.setGroupNotice(
          params?.group_id as number,
          params?.content as string
        );
        return {} as T;

      case 'set_group_leave':
        await this.protocol.quitGroup(params?.group_id as number);
        return {} as T;

      default:
        this.logger.warn('未实现的 API:', action);
        return {} as T;
    }
  }

  /**
   * 获取登录信息
   */
  getLoginInfo(): LoginInfo | null {
    return this.loginInfo;
  }

  /**
   * 检查是否已连接
   */
  isConnected(): boolean {
    return this.connected;
  }
}

export default NativeAdapter;
