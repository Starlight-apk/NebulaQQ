/**
 * NebulaQQ QQ 协议核心类型定义
 */

/** QQ 客户端版本信息 */
export interface QQClientVersion {
  /** 主版本号 */
  major: number;
  /** 次版本号 */
  minor: number;
  /** 修订版本号 */
  revision: number;
  /** 构建号 */
  build: number;
}

/** 登录状态 */
export type LoginStatus = 
  | 'offline'      // 离线
  | 'logging_in'   // 登录中
  | 'qr_scan'      // 等待扫码
  | 'qr_scanned'   // 已扫码
  | 'need_sms'     // 需要短信验证
  | 'sms_sent'     // 短信已发送
  | 'online'       // 在线
  | 'error';       // 错误

/** 登录信息 */
export interface LoginInfo {
  /** 用户 ID */
  uin: number;
  /** 昵称 */
  nickname: string;
  /** 头像 URL */
  avatarUrl: string;
  /** 性别 */
  sex: 'male' | 'female' | 'unknown';
  /** 年龄 */
  age: number;
  /** 等级 */
  level: number;
}

/** 登录配置 */
export interface LoginConfig {
  /** QQ 号 */
  uin: string;
  /** 密码（可选，扫码登录不需要） */
  password?: string;
  /** 是否自动登录 */
  autoLogin: boolean;
  /** 登录方式 */
  loginType: 'password' | 'qrcode' | 'token';
  /** 设备信息 */
  device: DeviceInfo;
}

/** 设备信息 */
export interface DeviceInfo {
  /** 设备 ID */
  guid: Buffer;
  /** 设备名称 */
  modelName: string;
  /** 系统版本 */
  systemVersion: string;
  /** 客户端版本 */
  clientVersion: QQClientVersion;
  /** 设备类型 */
  deviceType: 'phone' | 'pad' | 'watch';
  /** 厂商 */
  vendor: string;
  /** 固件信息 */
  firmware: string;
  /** 基站信息 */
  baseStation: string;
  /** SIM 卡序列号 */
  sim: string;
  /** 安卓 ID */
  androidId: string;
  /** WiFi BSSID */
  wifiBssid: string;
  /** WiFi SSID */
  wifiSsid: string;
}

/** QQ 会话类型 */
export type ChatType = 'private' | 'group' | 'temp';

/** 私聊消息目标 */
export interface PrivateTarget {
  type: 'private';
  userId: number;
}

/** 群聊消息目标 */
export interface GroupTarget {
  type: 'group';
  groupId: number;
}

/** 临时会话目标 */
export interface TempTarget {
  type: 'temp';
  userId: number;
  groupId: number;
  sessionType: number;
}

/** 消息目标 */
export type MessageTarget = PrivateTarget | GroupTarget | TempTarget;

/** 消息元素类型 */
export type MessageElementType =
  | 'text'
  | 'image'
  | 'face'
  | 'at'
  | 'reply'
  | 'node'
  | 'xml'
  | 'json'
  | 'poke'
  | 'redbag'
  | 'music'
  | 'video'
  | 'file'
  | 'location';

/** 消息元素基类 */
export interface MessageElement {
  type: MessageElementType;
}

/** 文本消息元素 */
export interface TextElement extends MessageElement {
  type: 'text';
  content: string;
}

/** 图片消息元素 */
export interface ImageElement extends MessageElement {
  type: 'image';
  url?: string;
  file?: string;
  base64?: string;
  path?: string;
  cache?: boolean;
  timeout?: number;
}

/** 表情消息元素 */
export interface FaceElement extends MessageElement {
  type: 'face';
  id: number;
}

/** @消息元素 */
export interface AtElement extends MessageElement {
  type: 'at';
  userId: number | 'all';
  nickname?: string;
}

/** 回复消息元素 */
export interface ReplyElement extends MessageElement {
  type: 'reply';
  messageId: string;
}

/** 消息元素联合类型 */
export type MessageChainElement = TextElement | ImageElement | FaceElement | AtElement | ReplyElement;

/** 消息链 */
export type MessageChain = (string | MessageChainElement)[];

/** 发送的消息 */
export interface SendMessage {
  /** 消息目标 */
  target: MessageTarget;
  /** 消息链 */
  message: MessageChain;
  /** 是否自动分片 */
  autoSplit?: boolean;
}

/** 接收到的消息 */
export interface ReceivedMessage {
  /** 消息 ID */
  messageId: string;
  /** 消息类型 */
  chatType: ChatType;
  /** 发送者 ID */
  senderId: number;
  /** 发送者昵称 */
  senderName?: string;
  /** 群号（群聊时） */
  groupId?: number;
  /** 群名称（群聊时） */
  groupName?: string;
  /** 消息内容 */
  message: MessageChain;
  /** 原始消息数据 */
  raw: any;
  /** 时间戳 */
  timestamp: number;
  /** 是否来自自己 */
  fromSelf: boolean;
}

/** 好友信息 */
export interface FriendInfo {
  /** 用户 ID */
  userId: number;
  /** 昵称 */
  nickname: string;
  /** 备注 */
  remark?: string;
  /** 性别 */
  sex?: 'male' | 'female' | 'unknown';
  /** 年龄 */
  age?: number;
  /** 头像 URL */
  avatarUrl?: string;
  /** 是否在线 */
  online?: boolean;
}

/** 群成员信息 */
export interface GroupMemberInfo {
  /** 用户 ID */
  userId: number;
  /** 昵称 */
  nickname: string;
  /** 群名片 */
  card?: string;
  /** 性别 */
  sex?: 'male' | 'female' | 'unknown';
  /** 年龄 */
  age?: number;
  /** 头衔 */
  title?: string;
  /** 等级 */
  level?: number;
  /** 角色 */
  role: 'owner' | 'admin' | 'member';
  /** 禁言剩余时间 */
  muteDuration?: number;
  /** 加入群时间 */
  joinTime?: number;
  /** 最后发言时间 */
  lastSpeakTime?: number;
}

/** 群信息 */
export interface GroupInfo {
  /** 群号 */
  groupId: number;
  /** 群名称 */
  groupName: string;
  /** 群主 ID */
  ownerId: number;
  /** 群成员数 */
  memberCount: number;
  /** 最大成员数 */
  maxMemberCount: number;
  /** 群公告 */
  notice?: string;
  /** 群头像 URL */
  avatarUrl?: string;
  /** 群创建时间 */
  createTime?: number;
  /** 群等级 */
  level?: number;
  /** 是否被禁言 */
  muted?: boolean;
}

/** 群事件类型 */
export type GroupEventType = 
  | 'member_increase'    // 成员增加
  | 'member_decrease'    // 成员减少
  | 'member_ban'         // 成员禁言
  | 'member_unban'       // 成员解禁
  | 'admin_set'          // 管理员设置
  | 'admin_unset'        // 管理员取消
  | 'group_dismiss'      // 群解散
  | 'group_mute'         // 群禁言
  | 'group_unmute';      // 群解禁

/** 群事件 */
export interface GroupEvent {
  type: GroupEventType;
  groupId: number;
  operatorId?: number;
  targetId?: number;
  duration?: number;
  timestamp: number;
}

/** 好友事件类型 */
export type FriendEventType =
  | 'friend_add'         // 好友添加
  | 'friend_delete'      // 好友删除
  | 'friend_recall'      // 好友撤回
  | 'request_new';       // 好友请求

/** 好友事件 */
export interface FriendEvent {
  type: FriendEventType;
  userId?: number;
  requestId?: string;
  comment?: string;
  timestamp: number;
}

/** 协议配置 */
export interface ProtocolConfig {
  /** 设备信息 */
  device: DeviceInfo;
  /** 是否启用日志 */
  enableLog: boolean;
  /** 日志级别 */
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  /** 数据目录 */
  dataDir: string;
  /** 心跳间隔（秒） */
  heartbeatInterval: number;
  /** 重连间隔（秒） */
  reconnectInterval: number;
  /** 最大重连次数 */
  maxReconnectAttempts: number;
  /** 请求超时（毫秒） */
  requestTimeout: number;
}

/** 协议事件 */
export type ProtocolEvent =
  | { type: 'login.success'; info: LoginInfo }
  | { type: 'login.error'; code: number; message: string }
  | { type: 'login.qrcode'; url: string; data: string }
  | { type: 'login.qrcode.scanned'; nickname: string }
  | { type: 'login.sms.required' }
  | { type: 'login.slider.required'; url: string }
  | { type: 'logout'; reason: string }
  | { type: 'message'; message: ReceivedMessage }
  | { type: 'group'; event: GroupEvent }
  | { type: 'friend'; event: FriendEvent }
  | { type: 'heartbeat'; status: any }
  | { type: 'error'; error: Error };

/** 协议实例接口 */
export interface IQQProtocol {
  /** 初始化 */
  init(config: ProtocolConfig): Promise<void>;
  
  /** 登录 */
  login(config: LoginConfig): Promise<void>;
  
  /** 提交二维码状态 */
  submitQrcodeStatus(token: string, status: 'scanned' | 'confirmed'): Promise<void>;
  
  /** 提交短信验证码 */
  submitSmsCode(code: string): Promise<void>;
  
  /** 提交滑块验证码 */
  submitSlider(ticket: string): Promise<void>;
  
  /** 登出 */
  logout(): Promise<void>;
  
  /** 发送消息 */
  sendMessage(target: MessageTarget, message: MessageChain): Promise<string>;
  
  /** 撤回消息 */
  recallMessage(chatType: ChatType, targetId: number, messageId: string): Promise<void>;
  
  /** 获取好友列表 */
  getFriendList(): Promise<FriendInfo[]>;
  
  /** 获取群列表 */
  getGroupList(): Promise<GroupInfo[]>;
  
  /** 获取群成员列表 */
  getGroupMemberList(groupId: number): Promise<GroupMemberInfo[]>;
  
  /** 获取群信息 */
  getGroupInfo(groupId: number): Promise<GroupInfo>;
  
  /** 获取好友信息 */
  getFriendInfo(userId: number): Promise<FriendInfo>;
  
  /** 获取登录信息 */
  getLoginInfo(): Promise<LoginInfo>;
  
  /** 设置群名片 */
  setGroupCard(groupId: number, userId: number, card: string): Promise<void>;
  
  /** 禁言群成员 */
  muteMember(groupId: number, userId: number, duration: number): Promise<void>;
  
  /** 取消禁言 */
  unmuteMember(groupId: number, userId: number): Promise<void>;
  
  /** 禁言全员 */
  muteAll(groupId: number): Promise<void>;
  
  /** 取消全员禁言 */
  unmuteAll(groupId: number): Promise<void>;
  
  /** 退出群 */
  quitGroup(groupId: number): Promise<void>;
  
  /** 踢出群成员 */
  kickMember(groupId: number, userId: number, rejectForever: boolean): Promise<void>;
  
  /** 修改群名称 */
  setGroupName(groupId: number, name: string): Promise<void>;
  
  /** 设置群公告 */
  setGroupNotice(groupId: number, notice: string): Promise<void>;
  
  /** 处理加好友请求 */
  handleFriendRequest(requestId: string, approve: boolean, remark?: string): Promise<void>;
  
  /** 处理加群请求 */
  handleGroupRequest(requestId: string, approve: boolean, reason?: string): Promise<void>;
  
  /** 获取状态 */
  getStatus(): { online: boolean; status: LoginStatus };
  
  /** 销毁 */
  destroy(): Promise<void>;
}
