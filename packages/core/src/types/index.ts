/**
 * NebulaQQ Core - 类型定义
 * 
 * @packageDocumentation
 */

/** 事件类型枚举 */
export enum EventType {
  META = 'meta_event',
  REQUEST = 'request',
  NOTICE = 'notice',
  MESSAGE = 'message',
  MESSAGE_SENT = 'message_sent'
}

/** 消息类型 */
export type MessageType = 'private' | 'group' | 'discuss';

/** 消息段类型 */
export interface MessageSegment {
  type: string;
  data?: Record<string, unknown>;
  [key: string]: unknown;
}

/** 发送者信息 */
export interface Sender {
  user_id: number;
  nickname: string;
  sex?: 'male' | 'female' | 'unknown';
  age?: number;
  card?: string;
  area?: string;
  level?: string;
  role?: 'owner' | 'admin' | 'member';
  title?: string;
}

/** 基础事件接口 */
export interface BaseEvent {
  time: number;
  self_id: number;
  post_type: string;
}

/** 消息事件 */
export interface MessageEvent extends BaseEvent {
  post_type: 'message';
  message_type: MessageType;
  sub_type?: 'friend' | 'group' | 'normal';
  message_id: number;
  user_id: number;
  sender: Sender;
  message: string | MessageSegment[];
  raw_message: string;
  font: number;
  group_id?: number;
  anonymous?: {
    id: number;
    name: string;
    flag: string;
  };
}

/** 私聊消息事件 */
export interface PrivateMessageEvent extends MessageEvent {
  message_type: 'private';
  sub_type: 'friend' | 'group' | 'normal';
}

/** 群聊消息事件 */
export interface GroupMessageEvent extends MessageEvent {
  message_type: 'group';
  group_id: number;
}

/** 通知事件类型 */
export type NoticeType =
  | 'group_upload'
  | 'group_admin'
  | 'group_decrease'
  | 'group_increase'
  | 'group_ban'
  | 'friend_add'
  | 'group_recall'
  | 'friend_recall'
  | 'notify'
  | 'essence';

/** 通知事件 */
export interface NoticeEvent extends BaseEvent {
  post_type: 'notice';
  notice_type: NoticeType;
  user_id: number;
  group_id?: number;
  [key: string]: unknown;
}

/** 请求事件类型 */
export type RequestType = 'friend' | 'group';

/** 请求事件 */
export interface RequestEvent extends BaseEvent {
  post_type: 'request';
  request_type: RequestType;
  user_id: number;
  comment: string;
  flag: string;
  group_id?: number;
}

/** 元事件类型 */
export type MetaEventType = 'lifecycle' | 'heartbeat';

/** 元事件 */
export interface MetaEvent extends BaseEvent {
  post_type: 'meta_event';
  meta_event_type: MetaEventType;
  status?: Record<string, unknown>;
  interval?: number;
}

/** 联合事件类型 */
export type Event = MessageEvent | NoticeEvent | RequestEvent | MetaEvent;

/** API 请求参数 */
export interface ApiParams {
  [key: string]: unknown;
}

/** API 响应 */
export interface ApiResponse<T = unknown> {
  status: string;
  retcode: number;
  data: T;
  message?: string;
  wording?: string;
  echo?: unknown;
}

/** 动作调用接口 */
export interface ActionHandler {
  (params: ApiParams): Promise<ApiResponse>;
}

/** 日志级别 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/** 日志器接口 */
export interface Logger {
  debug(...args: unknown[]): void;
  info(...args: unknown[]): void;
  warn(...args: unknown[]): void;
  error(...args: unknown[]): void;
  setLevel(level: LogLevel): void;
}

/** 配置项定义 */
export interface ConfigItem<T = unknown> {
  key: string;
  label: string;
  default: T;
  description?: string;
  type: 'string' | 'number' | 'boolean' | 'select' | 'text' | 'html';
  options?: { label: string; value: unknown }[];
}

/** 插件上下文接口 */
export interface PluginContext {
  logger: Logger;
  actions: {
    call: ActionHandler;
  };
  adapterName: string;
  dataPath: string;
  pluginManager: {
    config: Record<string, unknown>;
  };
}

/** 消息上下文接口 */
export interface MessageContext {
  event: MessageEvent;
  reply: (message: string | MessageSegment[]) => Promise<boolean>;
  send: (message: string | MessageSegment[]) => Promise<boolean>;
  recall: () => Promise<boolean>;
  kick: (reason?: 'add_friend' | 'not_friend') => Promise<boolean>;
  ban: (duration: number) => Promise<boolean>;
}
