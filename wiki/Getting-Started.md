# 快速开始

本指南将帮助你在 10 分钟内创建第一个 NebulaQQ 机器人。

---

## 📋 前置要求

- **Node.js**: >= 18.0.0
- **npm**: >= 8.0.0
- **OneBot 服务**: 如 NapCatQQ、Lagrange 等

### 检查环境

```bash
# 检查 Node.js 版本
node -v  # 应该 >= v18.0.0

# 检查 npm 版本
npm -v   # 应该 >= 8.0.0
```

---

## 🚀 步骤 1：创建项目

### 创建项目目录

```bash
# 创建项目目录
mkdir my-first-bot
cd my-first-bot

# 初始化 npm 项目
npm init -y
```

### 安装依赖

```bash
# 安装 NebulaQQ 核心模块
npm install @nebulaqq/core @nebulaqq/utils

# 安装开发依赖
npm install -D typescript ts-node @types/node
```

### 创建 TypeScript 配置

创建 `tsconfig.json`：

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "skipLibCheck": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

---

## 📝 步骤 2：编写机器人代码

### 创建源文件

创建 `src/index.ts` 文件：

```typescript
import { NebulaBot, definePlugin } from '@nebulaqq/core';

// 定义一个简单的插件
const helloPlugin = definePlugin({
  manifest: {
    name: 'hello',
    version: '1.0.0',
    description: '问候插件'
  },

  async onMessage(ctx) {
    // 当收到 "hello" 或 "你好" 时回复
    if (ctx.message === 'hello' || ctx.message === '你好') {
      await ctx.reply('你好！欢迎使用 NebulaQQ! 🌌');
    }
    
    // 当收到 "帮助" 时显示可用命令
    if (ctx.message === '帮助' || ctx.message === 'help') {
      await ctx.reply(
        '可用命令：\n' +
        '- hello/你好：打招呼\n' +
        '- 帮助/help：查看帮助\n' +
        '- 时间：查看当前时间'
      );
    }
    
    // 当收到 "时间" 时显示当前时间
    if (ctx.message === '时间') {
      const now = new Date().toLocaleString('zh-CN');
      await ctx.reply(`现在的时间是：${now}`);
    }
  }
});

// 创建机器人实例
const bot = new NebulaBot({
  logging: {
    level: 'info',      // debug | info | warn | error
    colors: true        // 是否启用彩色日志
  },
  adapter: {
    type: 'websocket',  // websocket | http
    host: '127.0.0.1',  // OneBot 服务地址
    port: 3000          // OneBot 服务端口
    // token: 'your-token-here'  // 如果配置了令牌
  },
  plugins: [helloPlugin],  // 插件列表
  dataDir: './data'        // 数据目录
});

// 监听启动事件
bot.on('ready', (loginInfo) => {
  console.log(`✅ 机器人已就绪`);
  console.log(`   昵称：${loginInfo.nickname}`);
  console.log(`   QQ: ${loginInfo.user_id}`);
});

// 监听错误事件
bot.on('error', (error) => {
  console.error('❌ 错误:', error);
});

// 启动机器人
async function main() {
  try {
    await bot.start();
    console.log('🚀 NebulaQQ 启动成功');
    console.log('按 Ctrl+C 停止机器人\n');
    
    // 监听退出信号
    process.on('SIGINT', async () => {
      console.log('\n正在停止机器人...');
      await bot.stop();
      process.exit(0);
    });
    
    process.on('SIGTERM', async () => {
      await bot.stop();
      process.exit(0);
    });
    
  } catch (error) {
    console.error('❌ 启动失败:', error);
    process.exit(1);
  }
}

main();
```

---

## ⚙️ 步骤 3：配置 OneBot 服务

### 配置 NapCatQQ

1. 打开 NapCatQQ 配置
2. 启用 WebSocket 服务端
3. 设置端口为 `3000`
4. 设置访问令牌（可选）
5. 保存并重启 NapCatQQ

### 修改机器人配置

编辑 `src/index.ts` 中的配置：

```typescript
const bot = new NebulaBot({
  adapter: {
    type: 'websocket',
    host: '127.0.0.1',  // 如果 OneBot 在不同机器，修改为对应 IP
    port: 3000
    // token: 'your-token-here'  // 如果配置了令牌，取消注释
  }
});
```

---

## ▶️ 步骤 4：运行机器人

### 添加启动脚本

编辑 `package.json`，添加 scripts：

```json
{
  "scripts": {
    "dev": "node --loader ts-node/esm src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  }
}
```

### 启动机器人

```bash
# 开发模式（直接运行 TypeScript）
npm run dev

# 或先构建再运行
npm run build
npm start
```

### 预期输出

```
🚀 NebulaQQ 启动成功
按 Ctrl+C 停止机器人

✅ 机器人已就绪
   昵称：你的昵称
   QQ: 12345678
```

---

## 🧪 步骤 5：测试机器人

在 QQ 中向机器人发送以下消息：

| 发送 | 回复 |
|------|------|
| `hello` | `你好！欢迎使用 NebulaQQ! 🌌` |
| `你好` | `你好！欢迎使用 NebulaQQ! 🌌` |
| `帮助` | `可用命令：...` |
| `时间` | `现在的时间是：2024/2/20 12:00:00` |

---

## 🎯 下一步

恭喜你成功创建了第一个机器人！现在可以：

### 学习更多功能

1. [插件开发指南](./Plugin-Development.md) - 学习开发复杂插件
2. [消息处理](./Message-Handling.md) - 学习处理各种消息类型
3. [配置说明](./Configuration.md) - 了解所有配置选项
4. [API 参考](./API-Reference.md) - 查看完整 API 文档

### 扩展机器人功能

```typescript
// 添加更多插件
const plugins = [
  helloPlugin,
  adminPlugin,    // 群管理插件
  gamePlugin,     // 游戏插件
  aiPlugin        // AI 聊天插件
];

const bot = new NebulaBot({
  plugins: plugins,
  // ... 其他配置
});
```

### 使用高级功能

```typescript
// 使用缓存
import { Cache } from '@nebulaqq/utils';
const cache = new Cache({ maxSize: 1000 });

// 使用限流器
import { RateLimiter } from '@nebulaqq/utils';
const limiter = new RateLimiter({ capacity: 10, refillRate: 1 });

// 使用 CQ 码
import { CQ } from '@nebulaqq/utils';
await ctx.reply([CQ.at(userId), CQ.face(123)]);
```

---

## ❓ 常见问题

### Q: 机器人无法连接 OneBot？

**A:** 检查以下几点：
1. OneBot 服务是否已启动
2. IP 地址和端口是否正确
3. 防火墙是否阻止连接
4. 如果配置了 token，是否正确设置

### Q: 消息无法发送？

**A:** 检查：
1. 机器人是否已登录
2. 目标群聊或用户是否存在
3. 机器人是否有发送权限

### Q: 如何调试？

**A:** 将日志级别设置为 debug：

```typescript
const bot = new NebulaBot({
  logging: {
    level: 'debug',
    colors: true
  }
});
```

---

## 📚 相关文档

- [安装指南](./Installation.md) - 详细的安装步骤
- [配置说明](./Configuration.md) - 配置文件详解
- [插件开发](./Plugin-Development.md) - 插件开发指南
- [API 参考](./API-Reference.md) - 完整 API 文档

---

<div align="center">

**祝你使用愉快！🌌**

[返回 Wiki 首页](./Home.md)

</div>
