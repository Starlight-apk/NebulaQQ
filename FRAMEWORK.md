# 🌌 NebulaQQ 框架结构

## 项目概览

**NebulaQQ** 是一个新一代现代化 QQ 机器人框架，基于 NapCatQQ 的设计理念，进行了全面优化和功能扩展。

## 核心特性

| 特性 | 说明 | 状态 |
|------|------|------|
| 插件系统 | 强大的插件机制，支持依赖管理和热重载 | ✅ |
| 模块系统 | 完全模块化的架构，按需加载，热插拔 | ✅ |
| 主题系统 | 支持自定义主题，打造个性化机器人体验 | ✅ |
| OneBot 协议 | 完整支持 OneBot v11 标准协议 | ✅ |
| TypeScript | 完整的类型定义，优秀的开发体验 | ✅ |
| 高性能 | 优化的连接池和缓存机制 | ✅ |
| CLI 工具 | 开箱即用的命令行工具 | ✅ |

## 与 NapCatQQ 的对比

### 精简的核心
- ❌ 剔除 WebUI（可选 CLI/Dashboard）
- ❌ 剔除文件管理（简化核心功能）
- ❌ 剔除接口调试（专注核心功能）

### 增强的功能
- ✅ 完整的模块系统（NapCatReforged 启发）
- ✅ 独家主题系统
- ✅ 增强的插件依赖管理
- ✅ 优化的连接池和缓存
- ✅ 更完善的类型定义

## 目录结构

```
NebulaQQ/
├── packages/                    # 核心包
│   ├── core/                    # 核心模块
│   │   ├── src/
│   │   │   ├── types/           # 类型定义
│   │   │   │   └── index.ts
│   │   │   ├── events/          # 事件系统
│   │   │   │   └── EventSystem.ts
│   │   │   ├── logger/          # 日志系统
│   │   │   │   └── Logger.ts
│   │   │   ├── plugin/          # 插件管理
│   │   │   │   └── PluginManager.ts
│   │   │   ├── adapter/         # 协议适配器
│   │   │   │   └── OneBotAdapter.ts
│   │   │   ├── NebulaBot.ts     # 机器人主类
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── plugin-sdk/              # 插件 SDK（待创建）
│   │
│   ├── module-sdk/              # 模块 SDK
│   │   ├── src/
│   │   │   ├── Module.ts        # 模块定义
│   │   │   ├── ModuleManager.ts # 模块管理器
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── theme-sdk/               # 主题 SDK
│   │   ├── src/
│   │   │   ├── Theme.ts         # 主题定义
│   │   │   ├── ThemeManager.ts  # 主题管理器
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── adapter-onebot/          # OneBot 适配器
│   │   ├── src/
│   │   │   ├── OneBotAdapter.ts
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── network/                 # 网络模块
│   │   ├── src/
│   │   │   ├── HttpServer.ts    # HTTP 服务器
│   │   │   ├── WebSocketServer.ts # WebSocket 服务器
│   │   │   ├── ConnectionPool.ts # 连接池
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── utils/                   # 工具库
│       ├── src/
│       │   ├── helpers.ts       # 辅助函数
│       │   ├── CQCode.ts        # CQ 码处理
│       │   ├── RateLimiter.ts   # 限流器
│       │   ├── Cache.ts         # 缓存系统
│       │   └── index.ts
│       ├── package.json
│       └── tsconfig.json
│
├── cli/                         # CLI 工具
│   ├── src/
│   │   └── cli.ts
│   ├── package.json
│   └── tsconfig.json
│
├── examples/                    # 示例代码
│   ├── basic/                   # 基础示例
│   │   ├── index.ts
│   │   └── package.json
│   └── plugin-template/         # 插件模板
│       ├── index.ts
│       └── package.json
│
├── docs/                        # 文档
│   ├── README.md                # 文档首页
│   ├── getting-started.md       # 快速开始
│   ├── plugins.md               # 插件开发指南
│   └── api.md                   # API 参考
│
├── package.json                 # 项目配置
├── pnpm-workspace.yaml          # pnpm 工作区
├── tsconfig.base.json           # TypeScript 基础配置
├── README.md                    # 项目说明
├── LICENSE                      # MIT 许可证
└── .gitignore
```

## 核心模块说明

### @nebulaqq/core
核心模块，包含：
- **NebulaBot**: 机器人主类
- **EventSystem**: 事件系统（支持优先级、中间件）
- **PluginManager**: 插件管理器（支持依赖管理、热重载）
- **Logger**: 日志系统（支持多级别、彩色输出）
- **OneBotAdapter**: OneBot 协议适配器

### @nebulaqq/module-sdk
模块 SDK，用于开发可热插拔的功能模块：
- **ModuleManager**: 模块管理器
- **Module**: 模块定义接口
- 支持命令注册、配置管理

### @nebulaqq/theme-sdk
主题 SDK，用于自定义机器人外观和交互：
- **ThemeManager**: 主题管理器
- **Theme**: 主题定义接口
- 支持颜色方案、表情符号集、响应模板

### @nebulaqq/adapter-onebot
OneBot v11 协议适配器：
- WebSocket 连接管理
- HTTP API 调用
- 自动重连、心跳

### @nebulaqq/network
网络模块：
- **HttpServer**: HTTP 服务器
- **WebSocketServer**: WebSocket 服务器
- **ConnectionPool**: 连接池（优化性能）

### @nebulaqq/utils
工具函数库：
- **CQCode**: CQ 码解析和生成
- **RateLimiter**: 限流器（令牌桶算法）
- **Cache**: 缓存系统（LRU 淘汰、TTL 过期）
- **helpers**: 常用辅助函数

## 使用示例

### 快速开始

```bash
# 创建项目
pnpm create nebulaqq my-bot
cd my-bot

# 安装依赖
pnpm install

# 运行
pnpm dev
```

### 基础插件

```typescript
import { definePlugin } from '@nebulaqq/core';

export const helloPlugin = definePlugin({
  manifest: {
    name: 'hello',
    version: '1.0.0',
    description: '问候插件'
  },

  async onMessage(ctx) {
    if (ctx.message === 'hello') {
      await ctx.reply('你好！欢迎使用 NebulaQQ! 🌌');
    }
  }
});
```

### 使用模块

```typescript
import { defineModule } from '@nebulaqq/module-sdk';

export const diceModule = defineModule({
  manifest: {
    name: 'dice',
    version: '1.0.0',
    category: '娱乐'
  },

  commands: new Map([
    ['dice', {
      name: 'dice',
      description: '掷骰子',
      handler: async (ctx) => {
        const result = Math.floor(Math.random() * 6) + 1;
        await ctx.reply(`你掷出了 ${result} 点！`);
      }
    }]
  ])
});
```

### 使用主题

```typescript
import { defineTheme, createDefaultThemeConfig } from '@nebulaqq/theme-sdk';

export const cuteTheme = defineTheme({
  manifest: {
    name: 'cute',
    version: '1.0.0',
    description: '可爱主题'
  },

  config: {
    ...createDefaultThemeConfig(),
    emojis: {
      happy: ['(≧∇≦) ﾉ', '(✿◡‿◡)', '(◕‿◕✿)'],
      wave: ['(挥手)', '(打招呼)']
    },
    templates: {
      welcome: '(欢迎) {user} 加入大家庭！~',
      goodbye: '(挥手) 下次再见哦~'
    }
  }
});
```

## 技术栈

- **运行时**: Node.js >= 18.0.0
- **语言**: TypeScript 5.3+
- **包管理**: pnpm (Monorepo)
- **协议**: OneBot v11
- **WebSocket**: ws
- **构建**: TypeScript Compiler

## 性能优化

1. **连接池**: 复用 HTTP 连接，减少握手开销
2. **缓存系统**: LRU 淘汰 + TTL 过期
3. **限流器**: 令牌桶算法，防止 API 滥用
4. **事件系统**: 优先级队列，关键事件优先处理

## 开发路线图

- [x] 核心模块
- [x] 插件系统
- [x] 模块系统
- [x] 主题系统
- [x] 网络模块
- [x] CLI 工具
- [x] 文档和示例
- [ ] 插件市场
- [ ] Dashboard (可选)
- [ ] 更多内置插件

## 许可证

MIT License - 详见 LICENSE 文件

## 致谢

NebulaQQ 的设计灵感来源于：
- [NapCatQQ](https://github.com/NapNeko/NapCatQQ)
- [NapCatReforged](https://github.com/NapNeko/NapCatReforged)
- [OneBot](https://onebot.dev/)

---

<div align="center">

**Made with ❤️ by NebulaQQ Team**

🌌 星云 QQ 机器人框架

</div>
