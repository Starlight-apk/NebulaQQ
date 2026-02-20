/**
 * NebulaQQ - QQ 协议数据包编解码
 */

import { Buffer } from 'buffer';
import { TEA, MD5, Random } from '../encrypt/Crypto';

/**
 * QQ 协议数据包
 */
export class QQPacket {
  /** 包头部 */
  header: PacketHeader;
  /** 包体数据 */
  body: Buffer;
  /** 加密密钥 */
  encryptKey?: Buffer;

  constructor(header: PacketHeader, body: Buffer) {
    this.header = header;
    this.body = body;
  }

  /**
   * 编码数据包
   */
  encode(): Buffer {
    const parts: Buffer[] = [];

    // 头部
    const headerBuf = this.encodeHeader();
    parts.push(headerBuf);

    // 包体（如果需要加密）
    let bodyBuf = this.body;
    if (this.encryptKey) {
      bodyBuf = this.encryptBody(bodyBuf, this.encryptKey);
    }

    // 添加包体长度
    const bodyLenBuf = Buffer.alloc(4);
    bodyLenBuf.writeUInt32BE(bodyBuf.length, 0);
    parts.push(bodyLenBuf);

    // 添加包体
    parts.push(bodyBuf);

    // 合并所有部分
    const packet = Buffer.concat(parts);

    // 添加包长度前缀
    const lenBuf = Buffer.alloc(4);
    lenBuf.writeUInt32BE(packet.length, 0);
    return Buffer.concat([lenBuf, packet]);
  }

  /**
   * 编码头部
   */
  private encodeHeader(): Buffer {
    const parts: Buffer[] = [];

    // 头部长度（固定 16 字节）
    const headerLen = 16;
    const headerLenBuf = Buffer.alloc(2);
    headerLenBuf.writeUInt16BE(headerLen, 0);
    parts.push(headerLenBuf);

    // 头部标识
    const flagBuf = Buffer.from([0x02, 0x0f]);
    parts.push(flagBuf);

    // 命令类型
    const cmdBuf = Buffer.alloc(2);
    cmdBuf.writeUInt16BE(this.header.commandType, 0);
    parts.push(cmdBuf);

    // 客户端版本
    const versionBuf = Buffer.alloc(2);
    versionBuf.writeUInt16BE(this.header.clientVersion, 0);
    parts.push(versionBuf);

    // 序列号
    const seqBuf = Buffer.alloc(4);
    seqBuf.writeUInt32BE(this.header.sequence, 0);
    parts.push(seqBuf);

    // UIN（QQ 号）
    const uinBuf = Buffer.alloc(4);
    uinBuf.writeUInt32BE(this.header.uin, 0);
    parts.push(uinBuf);

    return Buffer.concat(parts);
  }

  /**
   * 加密包体
   */
  private encryptBody(body: Buffer, key: Buffer): Buffer {
    // 添加随机填充
    const padding = Random.bytes(16);
    const paddedBody = Buffer.concat([padding, body]);

    // TEA 加密
    const encrypted = TEA.encrypt(paddedBody, key);

    // 添加校验
    const checksum = MD5.hash(Buffer.concat([encrypted, key])).slice(0, 4);

    return Buffer.concat([encrypted, checksum]);
  }

  /**
   * 解码数据包
   */
  static decode(buffer: Buffer, decryptKey?: Buffer): QQPacket {
    let offset = 0;

    // 读取包长度
    const packetLen = buffer.readUInt32BE(offset);
    offset += 4;

    // 读取头部长度
    const headerLen = buffer.readUInt16BE(offset);
    offset += 2;

    // 解码头部
    const header = this.decodeHeader(buffer.slice(offset, offset + headerLen));
    offset += headerLen;

    // 读取包体长度
    const bodyLen = buffer.readUInt32BE(offset);
    offset += 4;

    // 读取包体
    let body = buffer.slice(offset, offset + bodyLen);

    // 解密包体
    if (decryptKey) {
      body = this.decryptBody(body, decryptKey);
    }

    return new QQPacket(header, body);
  }

  /**
   * 解码头部
   */
  private static decodeHeader(buffer: Buffer): PacketHeader {
    let offset = 0;

    // 跳过头部长度（已读）
    offset += 2;

    // 头部标识
    const flag = buffer.slice(offset, offset + 2);
    offset += 2;

    // 命令类型
    const commandType = buffer.readUInt16BE(offset);
    offset += 2;

    // 客户端版本
    const clientVersion = buffer.readUInt16BE(offset);
    offset += 2;

    // 序列号
    const sequence = buffer.readUInt32BE(offset);
    offset += 4;

    // UIN
    const uin = buffer.readUInt32BE(offset);

    return {
      commandType,
      clientVersion,
      sequence,
      uin
    };
  }

  /**
   * 解密包体
   */
  private static decryptBody(body: Buffer, key: Buffer): Buffer {
    // 验证校验
    const checksum = body.slice(-4);
    const expectedChecksum = MD5.hash(Buffer.concat([body.slice(0, -4), key])).slice(0, 4);

    if (!checksum.equals(expectedChecksum)) {
      throw new Error('包体校验失败');
    }

    // TEA 解密
    const decrypted = TEA.decrypt(body.slice(0, -4), key);

    // 移除填充
    let paddingLen = 0;
    for (let i = 0; i < decrypted.length; i++) {
      if (decrypted[i] !== 0) {
        paddingLen = i;
        break;
      }
    }

    return decrypted.slice(paddingLen);
  }
}

/**
 * 数据包头部
 */
export interface PacketHeader {
  /** 命令类型 */
  commandType: number;
  /** 客户端版本 */
  clientVersion: number;
  /** 序列号 */
  sequence: number;
  /** UIN（QQ 号） */
  uin: number;
}

/**
 * SSO 命令
 */
export const SSOCommands = {
  // 登录相关
  LOGIN: 0x0801,
  LOGOUT: 0x0802,
  QRCode_LOGIN: 0x0810,
  SMS_REQUEST: 0x0803,
  SMS_SUBMIT: 0x0804,
  SLIDER_SUBMIT: 0x0805,

  // 消息相关
  SEND_MESSAGE: 0x00C8,
  RECALL_MESSAGE: 0x00CD,
  GET_MESSAGE: 0x00CE,

  // 好友相关
  GET_FRIEND_LIST: 0x0096,
  GET_FRIEND_INFO: 0x0097,
  ADD_FRIEND: 0x0098,
  HANDLE_FRIEND_REQUEST: 0x0099,

  // 群相关
  GET_GROUP_LIST: 0x00A0,
  GET_GROUP_INFO: 0x00A1,
  GET_GROUP_MEMBER_LIST: 0x00A2,
  SEND_GROUP_MESSAGE: 0x00A3,
  SET_GROUP_CARD: 0x00A4,
  MUTE_MEMBER: 0x00A5,
  KICK_MEMBER: 0x00A6,
  QUIT_GROUP: 0x00A7,
  HANDLE_GROUP_REQUEST: 0x00A8,

  // 心跳
  HEARTBEAT: 0x0014,

  // 其他
  GET_STATUS: 0x0015,
  GET_VERSION: 0x0016
};

/**
 * 服务命令
 */
export const ServiceCommands = {
  // 登录
  WTLogin: 'wtlogin.login',
  WTLoginQRCode: 'wtlogin.qrcode',
  WTLoginSMS: 'wtlogin.sms',
  WTLoginSlider: 'wtlogin.slider',

  // 消息
  SendMessage: 'MessageSvc.PbSendMsg',
  RecvMessage: 'MessageSvc.PushNotify',

  // 好友
  FriendList: 'friendlist.get_friend_group_list',
  FriendInfo: 'friendlist.get_friend_info',

  // 群
  GroupList: 'group.get_group_info_list',
  GroupInfo: 'group.get_group_info',
  GroupMemberList: 'group.get_group_member_list',

  // 心跳
  HeartBeat: 'HeartBeat.Alive',

  // 状态
  GetStatus: 'StatSvc.GetStatus',
  SetStatus: 'StatSvc.SetStatus'
};

export default QQPacket;
