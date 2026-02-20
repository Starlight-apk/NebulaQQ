# 插件开发指南

本指南将详细介绍如何开发 NebulaQQ 插件。

---

## 📋 目录

1. [插件基础](#插件基础)
2. [插件结构](#插件结构)
3. [生命周期](#生命周期)
4. [消息处理](#消息处理)
5. [调用 API](#调用-api)
6. [数据存储](#数据存储)
7. [配置管理](#配置管理)
8. [完整示例](#完整示例)

---

## 插件基础

### 什么是插件？

插件是 NebulaQQ 的功能扩展单元，每个插件实现特定的功能。插件系统支持：

- ✅ 依赖管理
- ✅ 热重载
- ✅ 生命周期钩子
- ✅ 配置管理
- ✅ 数据存储

### 插件 vs 模块

| 特性 | 插件 | 模块 |
|------|------|------|
| 用途 | 完整功能 | 单一功能 |
| 依赖 | 可依赖其他插件 | 可依赖模块 |
| 热重载 | ✅ | ✅ |
| 配置 | 独立配置 | 共享配置 |
| 复杂度 | 高 | 低 |

---

## 插件结构

### 基本结构

```typescript
import { definePlugin } from '@nebulaqq/core';

export const myPlugin = definePlugin({
  // 1. 插件元数据
  manifest: {
    name: 'my-plugin',
    version: '1.0.0',
    description: '我的插件',
    author: 'Your Name',
    dependencies: ['other-plugin'], // 可选
    tags: ['工具', '娱乐']
  },

  // 2. 生命周期钩子
  async onInit(ctx) {
    // 插件初始化
  },

  async onMessage(ctx) {
    // 处理消息
  },

  async onNotice(ctx) {
    // 处理通知
  },

  async onRequest(ctx) {
    // 处理请求
  },

  async onCleanup() {
    // 插件清理
  }
});
```

### 元数据字段

| 字段 | 说明 | 必需 |
|------|------|:---:|
| `name` | 插件名称（唯一标识） | ✅ |
| `version` | 版本号 | ✅ |
| `description` | 插件描述 | ❌ |
| `author` | 作者 | ❌ |
| `dependencies` | 依赖的插件列表 | ❌ |
| `tags` | 标签 | ❌ |

---

## 生命周期

### onInit - 初始化

```typescript
async onInit(ctx) {
  // ctx: PluginContext
  // - logger: 日志器
  // - actions: API 调用
  // - dataPath: 数据目录
  // - adapterName: 适配器名称
  
  ctx.logger.info('插件已初始化');
  
  // 加载配置
  await this.loadConfig(ctx);
  
  // 初始化资源
  this.timer = setInterval(() => {
    // 定时任务
  }, 60000);
}
```

### onMessage - 消息处理

```typescript
async onMessage(ctx) {
  // ctx: MessageContext
  // - event: 事件对象
  // - message: 消息内容
  // - userId: 发送者 ID
  // - groupId: 群 ID（如果是群消息）
  // - reply: 回复消息
  // - send: 发送消息
  // - recall: 撤回消息
  // - callApi: 调用 API
  
  if (ctx.message === 'hello') {
    await ctx.reply('你好！');
  }
}
```

### onNotice - 通知处理

```typescript
async onNotice(ctx) {
  // 群成员增加
  if (ctx.event.notice_type === 'group_increase') {
    const userId = ctx.event.user_id;
    const groupId = ctx.event.group_id;
    
    await ctx.callApi('send_group_msg', {
      group_id: groupId,
      message: `欢迎新成员！`
    });
  }
}
```

### onRequest - 请求处理

```typescript
async onRequest(ctx) {
  // 好友请求
  if (ctx.event.request_type === 'friend') {
    // 自动同意好友请求
    await ctx.approve();
  }
}
```

### onCleanup - 清理

```typescript
async onCleanup() {
  // 清理定时器
  if (this.timer) {
    clearInterval(this.timer);
  }
  
  // 保存数据
  await this.saveData();
  
  // 关闭连接
  await this.closeConnection();
}
```

---

## 消息处理

### 文本消息

```typescript
async onMessage(ctx) {
  const message = ctx.message.trim();
  
  // 精确匹配
  if (message === 'hello') {
    await ctx.reply('你好！');
  }
  
  // 命令前缀
  if (message.startsWith('#')) {
    const [command, ...args] = message.slice(1).split(' ');
    await this.handleCommand(ctx, command, args);
  }
  
  // 正则匹配
  if (/^时间$/.test(message)) {
    await ctx.reply(new Date().toLocaleString());
  }
}
```

### 富文本消息

```typescript
import { CQ } from '@nebulaqq/utils';

async onMessage(ctx) {
  // 检查是否包含图片
  if (Array.isArray(ctx.event.message)) {
    for (const segment of ctx.event.message) {
      if (segment.type === 'image') {
        ctx.logger.info('收到图片消息');
        await ctx.reply([CQ.face(123), ' 收到你的图片了！']);
      }
    }
  }
  
  // 检查是否被 @
  const isAt = Array.isArray(ctx.event.message) && 
    ctx.event.message.some(s => 
      s.type === 'at' && s.data.qq === ctx.event.self_id
    );
  
  if (isAt) {
    await ctx.reply([CQ.at(ctx.userId), ' 你 @ 我有什么事吗？']);
  }
  
  // 发送富文本消息
  await ctx.reply([
    CQ.face(1),
    ' 你好 ',
    CQ.at(ctx.userId),
    CQ.image('https://example.com/image.jpg')
  ]);
}
```

### 命令处理

```typescript
class CommandHandler {
  private commands = new Map();
  
  register(name, handler) {
    this.commands.set(name, handler);
  }
  
  async execute(ctx, name, args) {
    const handler = this.commands.get(name);
    if (handler) {
      await handler(ctx, args);
    } else {
      await ctx.reply(`未知命令：${name}`);
    }
  }
}

const commands = new CommandHandler();

commands.register('help', async (ctx, args) => {
  await ctx.reply('可用命令：help, info, test');
});

commands.register('info', async (ctx, args) => {
  await ctx.reply(`当前用户：${ctx.userId}`);
});

// 在插件中使用
async onMessage(ctx) {
  if (ctx.message.startsWith('#')) {
    const [command, ...args] = ctx.message.slice(1).split(' ');
    await commands.execute(ctx, command, args);
  }
}
```

---

## 调用 API

### 基础 API 调用

```typescript
async onMessage(ctx) {
  // 获取群信息
  const groupInfo = await ctx.callApi('get_group_info', {
    group_id: ctx.groupId
  });
  
  // 获取成员信息
  const memberInfo = await ctx.callApi('get_group_member_info', {
    group_id: ctx.groupId,
    user_id: ctx.userId
  });
  
  // 发送群公告
  await ctx.callApi('send_group_notice', {
    group_id: ctx.groupId,
    content: '这是一条群公告'
  });
  
  // 禁言成员
  await ctx.callApi('set_group_ban', {
    group_id: ctx.groupId,
    user_id: '123456',
    duration: 600 // 秒
  });
  
  // 踢出成员
  await ctx.callApi('set_group_kick', {
    group_id: ctx.groupId,
    user_id: '123456'
  });
}
```

### 常用 API

```typescript
// 发送消息
await ctx.callApi('send_msg', {
  message_type: 'group', // 或 'private'
  group_id: '123456',
  message: 'Hello'
});

// 撤回消息
await ctx.callApi('delete_msg', {
  message_id: '123456'
});

// 获取好友列表
const friends = await ctx.callApi('get_friend_list', {});

// 获取群列表
const groups = await ctx.callApi('get_group_list', {});

// 获取验证码
const image = await ctx.callApi('get_image', {
  file: 'image.jpg'
});

// 获取录音
const record = await ctx.callApi('get_record', {
  file: 'record.amr',
  out_format: 'mp3'
});
```

---

## 数据存储

### 使用数据目录

```typescript
import fs from 'fs/promises';
import path from 'path';

class DataStore {
  private dataPath: string;
  
  constructor(ctx) {
    this.dataPath = ctx.dataPath;
  }
  
  async save<T>(key: string, data: T): Promise<void> {
    const filePath = path.join(this.dataPath, `${key}.json`);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  }
  
  async load<T>(key: string, defaultValue: T): Promise<T> {
    const filePath = path.join(this.dataPath, `${key}.json`);
    try {
      const data = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(data) as T;
    } catch {
      return defaultValue;
    }
  }
}

// 在插件中使用
const store = new DataStore(ctx);

await store.save('config', { enabled: true });
const config = await store.load('config', { enabled: false });
```

### 使用缓存

```typescript
import { Cache } from '@nebulaqq/utils';

const cache = new Cache({
  maxSize: 1000,      // 最大缓存项
  defaultTtl: 3600000 // 默认 TTL (1 小时)
});

// 设置缓存
await cache.set('key', 'value');

// 获取缓存
const value = await cache.get('key');

// 获取或设置
const result = await cache.getOrSetAsync(
  'user:123456',
  async () => {
    // 从 API 获取数据
    return await fetchUserData('123456');
  },
  1800000 // 30 分钟 TTL
);
```

---

## 配置管理

### 定义配置 Schema

```typescript
interface PluginConfig {
  enabled: boolean;
  commandPrefix: string;
  cooldownSeconds: number;
  blacklistQqs: string[];
}

const DEFAULT_CONFIG: PluginConfig = {
  enabled: true,
  commandPrefix: '#',
  cooldownSeconds: 10,
  blacklistQqs: []
};
```

### 加载和保存配置

```typescript
class ConfigManager {
  private config: PluginConfig = { ...DEFAULT_CONFIG };
  private configPath: string;
  
  constructor(dataPath: string) {
    this.configPath = path.join(dataPath, 'config.json');
  }
  
  async load(): Promise<void> {
    try {
      const data = await fs.readFile(this.configPath, 'utf-8');
      this.config = { ...DEFAULT_CONFIG, ...JSON.parse(data) };
    } catch {
      this.config = { ...DEFAULT_CONFIG };
      await this.save();
    }
  }
  
  async save(): Promise<void> {
    await fs.writeFile(
      this.configPath,
      JSON.stringify(this.config, null, 2)
    );
  }
  
  get<K extends keyof PluginConfig>(key: K): PluginConfig[K] {
    return this.config[key];
  }
  
  set<K extends keyof PluginConfig>(key: K, value: PluginConfig[K]): void {
    this.config[key] = value;
    this.save();
  }
}
```

---

## 完整示例

```typescript
import { definePlugin } from '@nebulaqq/core';
import { Cache, RateLimiter, CQ } from '@nebulaqq/utils';

interface Config {
  enabled: boolean;
  commandPrefix: string;
  welcomeMessage: string;
}

const DEFAULT_CONFIG: Config = {
  enabled: true,
  commandPrefix: '#',
  welcomeMessage: '欢迎 {nickname} 加入群聊！🎉'
};

export const welcomePlugin = definePlugin({
  manifest: {
    name: 'welcome',
    version: '1.0.0',
    description: '新人欢迎插件',
    author: 'NebulaQQ Team',
    tags: ['管理', '欢迎']
  },

  config: { ...DEFAULT_CONFIG },
  cache: null,
  limiter: null,

  async onInit(ctx) {
    ctx.logger.info('WelcomePlugin 已加载');
    
    // 初始化缓存
    this.cache = new Cache({ maxSize: 100, defaultTtl: 600000 });
    
    // 初始化限流器
    this.limiter = new RateLimiter({ capacity: 10, refillRate: 1 });
    
    // 加载配置
    await this.loadConfig(ctx.dataPath);
  },

  async onMessage(ctx) {
    if (!this.config.enabled) return;
    
    const message = ctx.message.trim();
    
    // 命令：设置欢迎语
    if (message.startsWith(`${this.config.commandPrefix}setwelcome`)) {
      const newMessage = message.slice(`${this.config.commandPrefix}setwelcome`.length).trim();
      if (newMessage) {
        this.config.welcomeMessage = newMessage;
        await this.saveConfig(ctx.dataPath);
        await ctx.reply('欢迎语已更新！');
      }
      return;
    }
    
    // 命令：测试欢迎语
    if (message === `${this.config.commandPrefix}testwelcome`) {
      const testMessage = this.config.welcomeMessage.replace(
        '{nickname}',
        ctx.event.sender.nickname
      );
      await ctx.reply(testMessage);
      return;
    }
  },

  async onNotice(ctx) {
    if (!this.config.enabled) return;
    
    const event = ctx.event as Record<string, unknown>;
    
    // 群成员增加
    if (event.notice_type === 'group_increase') {
      const userId = event.user_id as string;
      const groupId = event.group_id as string;
      
      // 检查冷却时间
      const key = `welcome:${groupId}:${userId}`;
      if (!this.cache.has(key)) {
        this.cache.set(key, true);
        
        // 获取成员信息
        const memberInfo = await ctx.callApi('get_group_member_info', {
          group_id: groupId,
          user_id: userId
        }) as { nickname: string } | undefined;
        
        const nickname = memberInfo?.nickname || '新成员';
        const message = this.config.welcomeMessage.replace('{nickname}', nickname);
        
        // 发送欢迎消息
        await ctx.callApi('send_group_msg', {
          group_id: groupId,
          message: [CQ.at(userId), message]
        });
      }
    }
  },

  async onCleanup() {
    ctx.logger.info('WelcomePlugin 已卸载');
  },

  async loadConfig(dataPath: string) {
    try {
      const data = await fs.readFile(path.join(dataPath, 'welcome.json'), 'utf-8');
      this.config = { ...DEFAULT_CONFIG, ...JSON.parse(data) };
    } catch {
      this.config = { ...DEFAULT_CONFIG };
    }
  },

  async saveConfig(dataPath: string) {
    await fs.writeFile(
      path.join(dataPath, 'welcome.json'),
      JSON.stringify(this.config, null, 2)
    );
  }
});
```

---

## 📚 相关文档

- [API 参考](./API-Reference.md)
- [消息处理](./Message-Handling.md)
- [配置说明](./Configuration.md)
- [最佳实践](./Best-Practices.md)

---

<div align="center">

[返回 Wiki 首页](./Home.md)

</div>
