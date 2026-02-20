/**
 * NebulaQQ - QQ 协议连接层
 * 管理与 QQ 服务器的网络连接
 */

import { EventEmitter } from 'events';
import WebSocket from 'ws';
import { Buffer } from 'buffer';
import type { ProtocolConfig, LoginStatus } from '../core/types';
import { QQPacket } from '../packet/QQPacket';
import { LoginManager } from '../login/LoginManager';

/**
 * 连接状态
 */
type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'error';

/**
 * QQ 协议连接管理器
 */
export class QQConnection extends EventEmitter {
  /** WebSocket 连接 */
  private ws: WebSocket | null = null;

  /** 连接状态 */
  private state: ConnectionState = 'disconnected';

  /** 配置 */
  private config: ProtocolConfig | null = null;

  /** 登录管理器 */
  private loginManager: LoginManager;

  /** 重连次数 */
  private reconnectAttempts = 0;

  /** 重连定时器 */
  private reconnectTimer: NodeJS.Timeout | null = null;

  /** 心跳定时器 */
  private heartbeatTimer: NodeJS.Timeout | null = null;

  /** 服务器地址列表 */
  private readonly servers = [
    'wss://connect.qq.com',
    'wss://ws.qq.com',
    'wss://ssl.qq.com',
  ];

  /** 当前服务器索引 */
  private currentServerIndex = 0;

  /** 接收缓冲区 */
  private receiveBuffer: Buffer = Buffer.alloc(0);

  constructor(loginManager: LoginManager) {
    super();
    this.loginManager = loginManager;

    // 绑定登录管理器的事件
    this.loginManager.on('packet:send', (packet: QQPacket) => {
      this.sendPacket(packet);
    });
  }

  /**
   * 初始化连接
   */
  async init(config: ProtocolConfig): Promise<void> {
    this.config = config;
    await this.loginManager.init(config);
    this.emit('init', config);
  }

  /**
   * 连接到服务器
   */
  async connect(): Promise<void> {
    if (this.state === 'connecting' || this.state === 'connected') {
      return;
    }

    this.state = 'connecting';
    this.emit('state', this.state);

    try {
      const server = this.servers[this.currentServerIndex];
      await this.connectToServer(server);
    } catch (error) {
      this.handleConnectionError(error);
    }
  }

  /**
   * 连接到指定服务器
   */
  private async connectToServer(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(url, {
          handshakeTimeout: 10000,
          maxPayload: 10 * 1024 * 1024,
        });

        this.ws.on('open', () => {
          this.state = 'connected';
          this.reconnectAttempts = 0;
          this.emit('state', this.state);
          this.emit('connected');
          this.startHeartbeat();
          resolve();
        });

        this.ws.on('message', (data: Buffer) => {
          this.handleMessage(data);
        });

        this.ws.on('close', (code: number, reason: Buffer) => {
          this.handleClose(code, reason);
        });

        this.ws.on('error', (error: Error) => {
          this.handleError(error);
          reject(error);
        });

        this.ws.on('ping', () => {
          this.ws?.pong();
        });

      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * 处理接收到的消息
   */
  private handleMessage(data: Buffer): void {
    // 添加到接收缓冲区
    this.receiveBuffer = Buffer.concat([this.receiveBuffer, data]);

    // 解析完整的数据包
    while (this.receiveBuffer.length >= 4) {
      const packetLen = this.receiveBuffer.readUInt32BE(0);

      if (this.receiveBuffer.length < packetLen + 4) {
        // 数据包不完整，等待更多数据
        break;
      }

      // 提取完整数据包
      const packetData = this.receiveBuffer.slice(4, packetLen + 4);
      this.receiveBuffer = this.receiveBuffer.slice(packetLen + 4);

      try {
        // 解码数据包
        const packet = QQPacket.decode(packetData, this.loginManager.getSessionKey() || undefined);

        // 处理数据包
        this.handlePacket(packet);
      } catch (error) {
        this.emit('error', error);
      }
    }
  }

  /**
   * 处理数据包
   */
  private handlePacket(packet: QQPacket): void {
    // 根据命令类型分发处理
    switch (packet.header.commandType) {
      case 0x0801: // 登录响应
        this.loginManager.handleLoginResponse(packet);
        break;

      case 0x00CE: // 收到消息
        this.handleMessagePacket(packet);
        break;

      case 0x0014: // 心跳响应
        this.handleHeartbeatResponse(packet);
        break;

      default:
        this.emit('packet:unknown', packet);
    }
  }

  /**
   * 处理消息包
   */
  private handleMessagePacket(packet: QQPacket): void {
    // 解析消息内容
    // 这里需要实现完整的消息解析逻辑
    this.emit('message', packet.body);
  }

  /**
   * 处理心跳响应
   */
  private handleHeartbeatResponse(packet: QQPacket): void {
    this.emit('heartbeat', packet.body);
  }

  /**
   * 发送数据包
   */
  sendPacket(packet: QQPacket): void {
    if (this.state !== 'connected' || !this.ws) {
      this.emit('error', new Error('连接未建立'));
      return;
    }

    try {
      const data = packet.encode();
      this.ws.send(data);
      this.emit('packet:sent', packet);
    } catch (error) {
      this.emit('error', error);
    }
  }

  /**
   * 发送心跳
   */
  sendHeartbeat(): void {
    if (this.state !== 'connected') {
      return;
    }

    // 构建心跳包
    const heartbeatPacket = new QQPacket(
      {
        commandType: 0x0014,
        clientVersion: 0x10000,
        sequence: this.loginManager['getNextSequence'](),
        uin: this.loginManager.getLoginInfo()?.uin || 0
      },
      Buffer.from([0x00, 0x01])
    );

    this.sendPacket(heartbeatPacket);
  }

  /**
   * 启动心跳
   */
  private startHeartbeat(): void {
    this.stopHeartbeat();

    const interval = (this.config?.heartbeatInterval || 30) * 1000;
    this.heartbeatTimer = setInterval(() => {
      this.sendHeartbeat();
    }, interval);
  }

  /**
   * 停止心跳
   */
  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  /**
   * 处理连接关闭
   */
  private handleClose(code: number, reason: Buffer): void {
    this.state = 'disconnected';
    this.stopHeartbeat();
    this.emit('state', this.state);
    this.emit('disconnected', { code, reason });

    // 尝试重连
    if (code !== 1000) { // 1000 表示正常关闭
      this.scheduleReconnect();
    }
  }

  /**
   * 处理连接错误
   */
  private handleError(error: Error): void {
    this.state = 'error';
    this.emit('state', this.state);
    this.emit('error', error);
  }

  /**
   * 处理连接失败
   */
  private handleConnectionError(error: Error): void {
    this.emit('error', error);

    // 尝试下一个服务器
    this.currentServerIndex = (this.currentServerIndex + 1) % this.servers.length;

    // 调度重连
    this.scheduleReconnect();
  }

  /**
   * 调度重连
   */
  private scheduleReconnect(): void {
    if (this.reconnectTimer) {
      return;
    }

    const maxAttempts = this.config?.maxReconnectAttempts || 5;
    if (this.reconnectAttempts >= maxAttempts) {
      this.emit('error', new Error('达到最大重连次数'));
      return;
    }

    this.state = 'reconnecting';
    this.emit('state', this.state);

    const delay = Math.min(
      (this.config?.reconnectInterval || 5) * 1000 * Math.pow(2, this.reconnectAttempts),
      60000 // 最多 60 秒
    );

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.reconnectAttempts++;
      this.connect().catch(() => {});
    }, delay);
  }

  /**
   * 断开连接
   */
  async disconnect(): Promise<void> {
    this.stopHeartbeat();

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      this.ws.close(1000);
      this.ws = null;
    }

    this.state = 'disconnected';
    this.emit('state', this.state);
    this.emit('disconnected');
  }

  /**
   * 销毁连接
   */
  async destroy(): Promise<void> {
    await this.disconnect();
    this.removeAllListeners();
  }

  /**
   * 获取连接状态
   */
  getState(): ConnectionState {
    return this.state;
  }

  /**
   * 检查是否已连接
   */
  isConnected(): boolean {
    return this.state === 'connected';
  }
}

export default QQConnection;
