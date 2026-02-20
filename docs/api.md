# API 参考

NebulaQQ 核心 API 完整参考文档。

## 核心类

### NebulaBot

机器人主类。

#### 构造函数选项

```typescript
interface NebulaBotConfig {
  logging?: {
    level?: 'debug' | 'info' | 'warn' | 'error';
    colors?: boolean;
  };
  adapter: OneBotAdapterConfig;
  plugins?: Plugin[];
  pluginDir?: string;
  dataDir?: string;
  masterQqs?: string[];
  blacklistQqs?: string[];
}
```

#### 方法

```typescript
// 启动机器人
await bot.start(): Promise<void>

// 停止机器人
await bot.stop(): Promise<void>

// 发送私聊消息
await bot.sendPrivateMessage(userId: string, message: string | MessageSegment[]): Promise<boolean>

// 发送群消息
await bot.sendGroupMessage(groupId: string, message: string | MessageSegment[]): Promise<boolean>

// 调用 API
await bot.callApi<T>(action: string, params?: Record<string, unknown>): Promise<T>

// 获取登录信息
bot.getLoginInfo(): { user_id: number; nickname: string } | null

// 获取机器人 QQ 号
bot.getSelfId(): string | null

// 检查是否为主人
bot.isMaster(userId: string): boolean

// 获取状态
bot.getStatus(): BotStatus

// 是否正在运行
bot.isRunning(): boolean
```

#### 事件

```typescript
bot.on('ready', (loginInfo) => { ... })
bot.on('error', (error) => { ... })
bot.on('stopped', () => { ... })
```

### PluginManager

插件管理器。

#### 方法

```typescript
// 注册插件
manager.register(plugin: Plugin): void

// 加载插件
await manager.load(name: string): Promise<boolean>

// 卸载插件
await manager.unload(name: string): Promise<boolean>

// 禁用插件
manager.disable(name: string): boolean

// 启用插件
await manager.enable(name: string): Promise<boolean>

// 加载所有插件
await manager.loadAll(): Promise<Map<string, boolean>>

// 获取插件
manager.get(name: string): Plugin | undefined

// 获取已加载的插件
manager.getLoaded(): Plugin[]

// 获取插件列表
manager.list(): Array<{ name: string; version: string; status: PluginStatus }>
```

### EventSystem

事件系统。

#### 方法

```typescript
// 订阅事件
eventSystem.on(eventType: string, handler: EventHandler, options?: EventSubscribeOptions): this

// 订阅一次
eventSystem.once(eventType: string, handler: EventHandler, options?: EventSubscribeOptions): this

// 添加中间件
eventSystem.use(middleware: EventMiddleware): this

// 发射事件
await eventSystem.emit(eventType: string, event: Event): Promise<boolean>

// 获取统计
eventSystem.getStats(): EventStats
```

### Logger

日志器。

#### 方法

```typescript
logger.debug(message: string, ...data: unknown[]): void
logger.info(message: string, ...data: unknown[]): void
logger.warn(message: string, ...data: unknown[]): void
logger.error(message: string, ...data: unknown[]): void
logger.setLevel(level: LogLevel): void
logger.child(module: string): Logger
```

## 工具函数

### CQCode

CQ 码处理。

```typescript
import { CQ, parseCQCode, stringifyCQCode } from '@nebulaqq/utils';

// 创建 CQ 码
CQ.at(qq: string | number): CQCode
CQ.face(id: string | number): CQCode
CQ.image(file: string, type?: string): CQCode
CQ.record(file: string): CQCode
CQ.video(file: string): CQCode
CQ.share(url: string, title: string, content?: string, image?: string): CQCode
CQ.music(type: string, id: string): CQCode
CQ.reply(id: string): CQCode
CQ.poke(qq: string | number): CQCode

// 解析 CQ 码
parseCQCode(cqCode: string): CQCode | null
stringifyCQCode(cqCode: CQCode): string
parseMessage(message: string): (string | CQCode)[]
stringifyMessage(parts: (string | CQCode)[]): string
```

### RateLimiter

限流器。

```typescript
import { RateLimiter, RateLimiterManager } from '@nebulaqq/utils';

const limiter = new RateLimiter({
  capacity: 10,      // 桶容量
  refillRate: 1      // 每秒补充令牌数
});

// 尝试获取令牌
limiter.tryAcquire(): boolean

// 等待获取令牌
await limiter.acquire(): Promise<void>

// 获取令牌数
limiter.getTokens(): number

// 管理器
const manager = new RateLimiterManager({ capacity: 10, refillRate: 1 });
manager.tryAcquire(key: string): boolean
await manager.acquire(key: string): Promise<void>
```

### Cache

缓存系统。

```typescript
import { Cache } from '@nebulaqq/utils';

const cache = new Cache({
  maxSize: 1000,     // 最大缓存项
  defaultTtl: 3600000, // 默认 TTL (1 小时)
  lru: true          // 启用 LRU 淘汰
});

// 设置缓存
cache.set(key: string, value: unknown, ttl?: number): void

// 获取缓存
cache.get(key: string): unknown | undefined

// 获取或设置
cache.getOrSet(key: string, defaultValue: unknown, ttl?: number): unknown

// 异步获取或设置
await cache.getOrSetAsync(key: string, factory: () => Promise<unknown>, ttl?: number): Promise<unknown>

// 检查存在
cache.has(key: string): boolean

// 删除
cache.delete(key: string): boolean

// 清空
cache.clear(): void
```

### 辅助函数

```typescript
import { 
  sleep, 
  generateId, 
  uuid,
  deepClone,
  deepMerge,
  debounce,
  throttle,
  formatBytes,
  formatDuration,
  parseDuration,
  randomChoice,
  shuffle,
  chunk,
  unique
} from '@nebulaqq/utils';

// 休眠
await sleep(1000): Promise<void>

// 生成 ID
generateId(length?: number): string
uuid(): string

// 对象操作
deepClone<T>(obj: T): T
deepMerge<T>(target: T, source: Partial<T>): T

// 函数装饰
debounce<T extends Function>(func: T, wait: number): T
throttle<T extends Function>(func: T, limit: number): T

// 格式化
formatBytes(bytes: number, decimals?: number): string
formatDuration(ms: number): string
parseDuration(str: string): number

// 数组操作
randomChoice<T>(arr: T[]): T | undefined
shuffle<T>(arr: T[]): T[]
chunk<T>(arr: T[], size: number): T[][]
unique<T>(arr: T[]): T[]
```

## OneBot API

通过 `callApi` 方法调用所有 OneBot v11 标准 API：

```typescript
// 发送消息
await ctx.callApi('send_msg', {
  message_type: 'group' | 'private',
  group_id?: string,
  user_id?: string,
  message: string | MessageSegment[]
});

// 获取信息
await ctx.callApi('get_login_info', {});
await ctx.callApi('get_group_info', { group_id: string });
await ctx.callApi('get_group_member_info', { group_id: string, user_id: string });

// 群管理
await ctx.callApi('set_group_ban', { group_id: string, user_id: string, duration: number });
await ctx.callApi('set_group_kick', { group_id: string, user_id: string });
await ctx.callApi('set_group_admin', { group_id: string, user_id: string, enable: boolean });
await ctx.callApi('set_group_card', { group_id: string, user_id: string, card: string });

// 消息操作
await ctx.callApi('delete_msg', { message_id: string });
await ctx.callApi('send_group_forward_msg', { group_id: string, messages: MessageSegment[] });
```

完整 API 列表参考 [OneBot v11 规范](https://github.com/botuniverse/onebot-11)。
