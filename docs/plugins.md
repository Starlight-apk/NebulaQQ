# 插件开发指南

NebulaQQ 的插件系统是其核心特性之一。本指南将详细介绍如何开发一个功能完整的插件。

## 插件结构

一个完整的插件包含以下部分：

```typescript
import { definePlugin, type MessageContext, type PluginContext } from '@nebulaqq/core';

export const myPlugin = definePlugin({
  // 1. 插件元数据
  manifest: {
    name: 'my-plugin',
    version: '1.0.0',
    description: '我的插件',
    author: 'Your Name',
    dependencies: ['other-plugin'], // 可选：依赖其他插件
    tags: ['工具', '娱乐']
  },

  // 2. 生命周期钩子
  async onInit(ctx: PluginContext) {
    // 插件初始化时调用
  },

  async onMessage(ctx: MessageContext) {
    // 收到消息时调用
  },

  async onNotice(ctx) {
    // 收到通知时调用
  },

  async onRequest(ctx) {
    // 收到请求时调用
  },

  async onCleanup() {
    // 插件卸载时调用
  }
});
```

## 消息处理

### 基础消息处理

```typescript
async onMessage(ctx: MessageContext) {
  const { message, userId, groupId } = ctx;
  
  // 简单回复
  if (message === 'hello') {
    await ctx.reply('你好！');
  }
}
```

### 命令处理

```typescript
async onMessage(ctx: MessageContext) {
  const message = ctx.message.trim();
  
  // 命令前缀
  if (!message.startsWith('#')) return;
  
  // 解析命令
  const [command, ...args] = message.slice(1).split(' ');
  
  switch (command.toLowerCase()) {
    case 'help':
      await ctx.reply('可用命令：help, info, test');
      break;
    case 'info':
      await ctx.reply(`当前用户：${ctx.userId}`);
      break;
    case 'test':
      await ctx.reply('测试成功！');
      break;
  }
}
```

### 消息段处理

```typescript
import { CQ, parseMessage } from '@nebulaqq/utils';

async onMessage(ctx: MessageContext) {
  const event = ctx.event;
  
  // 检查是否有图片
  if (Array.isArray(event.message)) {
    for (const segment of event.message) {
      if (segment.type === 'image') {
        ctx.logger.info('收到图片消息');
        await ctx.reply([CQ.face(123), ' 收到你的图片了！']);
      }
    }
  }
  
  // 检查是否被 @
  const isAt = Array.isArray(event.message) && 
    event.message.some(s => s.type === 'at' && s.data.qq === ctx.event.self_id);
  
  if (isAt) {
    await ctx.reply([CQ.at(ctx.userId), ' 你 @ 我有什么事吗？']);
  }
}
```

## 调用 API

```typescript
async onMessage(ctx: MessageContext) {
  // 发送群公告
  await ctx.callApi('send_group_notice', {
    group_id: ctx.groupId,
    content: '这是一条群公告'
  });
  
  // 获取群信息
  const groupInfo = await ctx.callApi('get_group_info', {
    group_id: ctx.groupId
  });
  
  // 禁言成员
  await ctx.callApi('set_group_ban', {
    group_id: ctx.groupId,
    user_id: '123456',
    duration: 600
  });
  
  // 撤回消息
  await ctx.recall();
}
```

## 插件配置

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

class PluginState {
  config: PluginConfig = { ...DEFAULT_CONFIG };
  
  async loadConfig(ctx: PluginContext) {
    // 从文件加载配置
    const configPath = path.join(ctx.dataPath, 'config.json');
    try {
      const data = await fs.readFile(configPath, 'utf-8');
      this.config = { ...DEFAULT_CONFIG, ...JSON.parse(data) };
    } catch {
      this.config = { ...DEFAULT_CONFIG };
    }
  }
  
  async saveConfig(ctx: PluginContext) {
    const configPath = path.join(ctx.dataPath, 'config.json');
    await fs.writeFile(configPath, JSON.stringify(this.config, null, 2));
  }
}
```

## 冷却时间和限流

```typescript
class CooldownManager {
  private cooldowns = new Map<string, number>();
  
  check(userId: string, cooldownMs: number): boolean {
    const now = Date.now();
    const lastUse = this.cooldowns.get(userId) || 0;
    
    if (now - lastUse < cooldownMs) {
      return false;
    }
    
    this.cooldowns.set(userId, now);
    return true;
  }
}

const cooldownManager = new CooldownManager();

async onMessage(ctx: MessageContext) {
  if (!cooldownManager.check(ctx.userId, 10000)) {
    await ctx.reply('命令冷却中，请 10 秒后再试');
    return;
  }
  
  // 处理命令...
}
```

## 数据存储

```typescript
import fs from 'fs/promises';
import path from 'path';

class DataStore {
  private dataPath: string;
  
  constructor(ctx: PluginContext) {
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
```

## 完整示例

```typescript
import { definePlugin, type MessageContext, type PluginContext } from '@nebulaqq/core';
import { CQ } from '@nebulaqq/utils';
import fs from 'fs/promises';

interface Config {
  enabled: boolean;
  welcomeMessage: string;
}

class PluginState {
  config: Config = {
    enabled: true,
    welcomeMessage: '欢迎 {nickname} 加入群聊！🎉'
  };
  
  ctx?: PluginContext;
  
  init(ctx: PluginContext) {
    this.ctx = ctx;
  }
}

const state = new PluginState();

export const welcomePlugin = definePlugin({
  manifest: {
    name: 'welcome',
    version: '1.0.0',
    description: '新人欢迎插件',
    author: 'NebulaQQ Team'
  },

  async onInit(ctx: PluginContext) {
    state.init(ctx);
    ctx.logger.info('WelcomePlugin 已加载');
  },

  async onMessage(ctx: MessageContext) {
    if (!state.config.enabled) return;
    
    const message = ctx.message.trim();
    
    if (message === '测试欢迎') {
      const msg = state.config.welcomeMessage.replace('{nickname}', ctx.event.sender.nickname);
      await ctx.reply(msg);
    }
  },

  async onNotice(ctx) {
    if (!state.config.enabled) return;
    
    const event = ctx.event as Record<string, unknown>;
    
    // 群成员增加
    if (event.notice_type === 'group_increase') {
      const userId = event.user_id as string;
      const groupId = event.group_id as string;
      
      // 获取成员信息
      const memberInfo = await ctx.callApi('get_group_member_info', {
        group_id: groupId,
        user_id: userId
      }) as { nickname: string } | undefined;
      
      const nickname = memberInfo?.nickname || '新成员';
      const message = state.config.welcomeMessage.replace('{nickname}', nickname);
      
      await ctx.callApi('send_group_msg', {
        group_id: groupId,
        message: [CQ.at(userId), message]
      });
    }
  },

  async onCleanup() {
    state.ctx?.logger.info('WelcomePlugin 已卸载');
  }
});
```

## 最佳实践

1. **错误处理**: 始终捕获并记录错误
2. **日志输出**: 使用 `ctx.logger` 记录重要事件
3. **配置验证**: 验证用户输入的配置文件
4. **资源清理**: 在 `onCleanup` 中清理定时器和资源
5. **依赖检查**: 检查依赖插件是否已加载

## 发布插件

1. 创建 `package.json` 定义插件元数据
2. 编写 `README.md` 说明使用方法
3. 发布到 npm 或 GitHub

```json
{
  "name": "nebulaqq-plugin-welcome",
  "version": "1.0.0",
  "keywords": ["nebulaqq", "plugin", "welcome"],
  "peerDependencies": {
    "@nebulaqq/core": "^1.0.0"
  }
}
```

祝你开发愉快！🌌
