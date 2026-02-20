# 🌌 NebulaQQ

<div align="center">

![NebulaQQ Banner](https://image.pollinations.ai/prompt/Futuristic%20QQ%20robot%20framework%20logo%2C%20nebula%20galaxy%20theme%2C%20purple%20and%20blue%20gradient%2C%20cyberpunk%20style%2C%20material%20design%2C%20Arknights%20aesthetic%2C%20crystal%20elements%2C%20glowing%20effects%2C%20high%20quality%2C%20digital%20art%2C%201920x1080?width=1920&height=600&seed=42&nologo=true)

**新一代现代化 QQ 机器人框架**

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![OneBot](https://img.shields.io/badge/OneBot-v11-orange.svg)](https://onebot.dev/)
[![Platform](https://img.shields.io/badge/platform-Linux%20%7C%20macOS%20%7C%20Windows%20%7C%20ARM64-lightgrey.svg)](https://nebulaqq.dev)
[![WebUI](https://img.shields.io/badge/WebUI-MD3%20%7C%20Arknights-purple.svg)](./packages/webui)
[![GitHub Stars](https://img.shields.io/github/stars/Starlight-apk/NebulaQQ?style=flat&logo=github)](https://github.com/Starlight-apk/NebulaQQ)

[![GitHub issues](https://img.shields.io/github/issues/Starlight-apk/NebulaQQ)](https://github.com/Starlight-apk/NebulaQQ/issues)
[![GitHub forks](https://img.shields.io/github/forks/Starlight-apk/NebulaQQ)](https://github.com/Starlight-apk/NebulaQQ/network)
[![GitHub license](https://img.shields.io/github/license/Starlight-apk/NebulaQQ)](https://github.com/Starlight-apk/NebulaQQ/blob/main/LICENSE)

[文档](#-文档) | [快速开始](#-快速开始) | [WebUI](#-webui) | [示例](#-示例代码) | [讨论区](https://github.com/Starlight-apk/NebulaQQ/discussions)

</div>

---

## 📖 目录

- [特性亮点](#-特性亮点)
- [快速开始](#-快速开始)
- [核心模块](#-核心模块)
- [WebUI](#-webui)
- [架构设计](#-架构设计)
- [示例代码](#-示例代码)
- [文档](#-文档)
- [参与贡献](#-参与贡献)

---

## ✨ 特性亮点

<div align="center">

![Features](https://image.pollinations.ai/prompt/Modern%20software%20framework%20features%20illustration%2C%20plugin%20system%20module%20system%20theme%20system%20icons%2C%20isometric%20design%2C%20purple%20blue%20gradient%2C%20futuristic%20technology%20style%2C%20clean%20minimal%2C%203d%20render%2C%201200x400?width=1200&height=400&seed=42&nologo=true)

</div>

| 特性 | 描述 | 状态 |
|------|------|------|
| 🧩 **插件系统** | 强大的插件机制，支持依赖管理和热重载 | ✅ |
| 🔷 **模块系统** | 完全模块化的架构，按需加载，热插拔 | ✅ |
| 🎨 **主题系统** | 支持自定义主题，打造个性化机器人体验 | ✅ |
| ⚡ **高性能** | 优化的连接池和缓存机制，低延迟高吞吐 | ✅ |
| 🔌 **OneBot 协议** | 完整支持 OneBot v11 标准协议 | ✅ |
| 📦 **TypeScript** | 完整的类型定义，优秀的开发体验 | ✅ |
| 📱 **Termux 支持** | 完美支持 ARM64 架构，可在手机上运行 | ✅ |
| 🌐 **WebUI** | Material Design 3 + 明日方舟美学控制面板 | ✅ |

---

## 🚀 快速开始

### 方式一：一键安装 (推荐)

```bash
# 克隆项目
git clone https://github.com/Starlight-apk/NebulaQQ.git
cd NebulaQQ

# Linux/macOS/Termux 用户
chmod +x install.sh
./install.sh all

# Windows 用户
install.bat
```

### 方式二：手动安装

```bash
# 1. 安装依赖
npm install --legacy-peer-deps

# 2. 构建项目
npm run build

# 3. 运行示例
cd examples/basic
npm install --legacy-peer-deps
npm run dev
```

### 方式三：创建新项目

```bash
# 使用 CLI 工具
npx create-nebulaqq my-bot
cd my-bot
npm install
npm run dev
```

### 启动 WebUI

```bash
# 构建 WebUI
npm run build:webui

# 启动 WebUI 服务器
npm run start:webui

# 访问 http://localhost:8080
```

---

## 📦 核心模块

<div align="center">

![Architecture](https://image.pollinations.ai/prompt/Software%20architecture%20diagram%2C%20modern%20clean%20design%2C%20purple%20blue%20gradient%2C%20isometric%20view%2C%20microservices%2C%20cloud%20native%2C%20futuristic%20technology%2C%20minimal%20vector%20illustration%2C%201600x600?width=1600&height=600&seed=42&nologo=true)

</div>

| 模块 | 说明 | 状态 |
|------|------|------|
| `@nebulaqq/core` | 核心模块 - 事件系统、消息处理 | ✅ |
| `@nebulaqq/plugin-sdk` | 插件 SDK | 🔄 |
| `@nebulaqq/module-sdk` | 模块 SDK | ✅ |
| `@nebulaqq/theme-sdk` | 主题 SDK | ✅ |
| `@nebulaqq/adapter-onebot` | OneBot 协议适配器 | ✅ |
| `@nebulaqq/network` | 网络模块 | ✅ |
| `@nebulaqq/utils` | 工具函数库 | ✅ |
| `@nebulaqq/webui` | WebUI 前端 | ✅ |
| `@nebulaqq/webui-server` | WebUI 后端服务器 | ✅ |

---

## 🌐 WebUI

<div align="center">

![WebUI Preview](https://image.pollinations.ai/prompt/Modern%20web%20dashboard%20UI%20design%2C%20Material%20Design%203%2C%20dark%20theme%2C%20purple%20blue%20accent%20colors%2C%20Arknights%20game%20aesthetic%2C%20clean%20interface%2C%20data%20visualization%2C%20analytics%20dashboard%2C%20high%20quality%20mockup%2C%201920x800?width=1920&height=800&seed=42&nologo=true)

*NebulaQQ WebUI - Material Design 3 + 明日方舟美学*

</div>

### WebUI 特性

- 🎨 **Material Design 3** 设计规范
- 🌸 **明日方舟美学** 主题设计
- 📊 **实时日志** 查看
- 🔌 **插件/模块** 管理
- 🎭 **主题切换** (3 个内置主题)
- 📱 **响应式设计**

```bash
# 开发模式
npm run dev:webui

# 生产构建
npm run build:webui

# 启动服务器
npm run start:webui
```

### 内置主题

| 主题 | 说明 | 预览 |
|------|------|------|
| 明日方舟·暗 | 深色主题，源石风格 | 🌑 |
| 罗德岛·光 | 明亮主题，简洁清爽 | ☀️ |
| 源石技艺 | 特殊渐变，发光特效 | 💎 |

---

## 🏗️ 架构设计

```
┌─────────────────────────────────────────────────────────┐
│                    NebulaQQ Framework                    │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Plugin     │  │   Module     │  │   Theme      │  │
│  │   System     │  │   System     │  │   System     │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │              Core Event System                    │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   OneBot     │  │   Network    │  │   Utils      │  │
│  │  Adapter     │  │   Module     │  │   Library    │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │           WebUI (MD3 + Arknights)                 │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 💡 示例代码

### 基础机器人

```typescript
import { NebulaBot, definePlugin } from '@nebulaqq/core';

// 定义插件
const helloPlugin = definePlugin({
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

// 创建机器人
const bot = new NebulaBot({
  logging: { level: 'info', colors: true },
  adapter: {
    type: 'websocket',
    host: '127.0.0.1',
    port: 3000
  },
  plugins: [helloPlugin]
});

// 启动
await bot.start();
```

### 高级功能

```typescript
// 使用缓存
import { Cache } from '@nebulaqq/utils';

const cache = new Cache({ maxSize: 1000, defaultTtl: 3600000 });

// 使用限流器
import { RateLimiter } from '@nebulaqq/utils';

const limiter = new RateLimiter({ capacity: 10, refillRate: 1 });

// 使用 CQ 码
import { CQ } from '@nebulaqq/utils';

await ctx.reply([CQ.at(userId), CQ.face(123)]);
```

---

## 📱 Termux (ARM64) 用户

```bash
# 1. 安装 Node.js
pkg update && pkg upgrade -y
pkg install nodejs -y

# 2. 获取项目
cd ~/storage/downloads
# 下载并解压 NebulaQQ.zip

# 3. 安装和运行
cd NebulaQQ
chmod +x install.sh
./install.sh all
```

详细指南请查看 [TERMUX.md](./TERMUX.md)

---

## 🆚 与 NapCatQQ 对比

| 特性 | NapCatQQ | NebulaQQ |
|------|----------|----------|
| 插件系统 | ✅ | ✅ 增强版 (依赖管理) |
| 模块系统 | 部分 | ✅ 完整版 (热插拔) |
| 主题系统 | ❌ | ✅ 独家支持 |
| WebUI | ✅ (基础) | ✅ (MD3 + 明日方舟) |
| 文件管理 | ✅ | ❌ (精简核心) |
| 接口调试 | ✅ | ❌ (精简核心) |
| 性能优化 | 标准 | ✅ 增强版 (连接池) |
| Termux 支持 | ⚠️ | ✅ 官方支持 |

---

## 📖 文档

| 文档 | 说明 |
|------|------|
| [快速开始](./docs/getting-started.md) | 5 分钟快速上手 |
| [插件开发](./docs/plugins.md) | 插件开发指南 |
| [API 参考](./docs/api.md) | 完整 API 文档 |
| [Termux 指南](./TERMUX.md) | ARM64 部署 |
| [框架结构](./FRAMEWORK.md) | 架构详解 |
| [WebUI 文档](./packages/webui/README.md) | WebUI 使用 |

---

## 🔧 可用命令

```bash
# 安装依赖
npm install

# 构建所有包
npm run build

# 运行示例
npm run dev

# 启动 WebUI
npm run dev:webui
npm run start:webui

# 类型检查
npm run typecheck

# 清理
npm run clean
```

---

## 🤝 参与贡献

我们欢迎各种形式的贡献！

1. ⭐ Fork 本仓库
2. 🌿 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 💾 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 🚀 推送到分支 (`git push origin feature/AmazingFeature`)
5. 🔄 开启 Pull Request

### 贡献者

<div align="center">

[![Contributors](https://contrib.rocks/image?repo=Starlight-apk/NebulaQQ)](https://github.com/Starlight-apk/NebulaQQ/graphs/contributors)

</div>

---

## 📄 开源协议

MIT License - 详见 [LICENSE](LICENSE) 文件

---

## 🙏 致谢

NebulaQQ 基于以下优秀项目构建：

- [NapCatQQ](https://github.com/NapNeko/NapCatQQ)
- [NapCatReforged](https://github.com/NapNeko/NapCatReforged)
- [OneBot](https://onebot.dev/)
- [Material Design](https://m3.material.io/)
- [明日方舟](https://ak.hypergryph.com/)
- [Pollinations.AI](https://pollinations.ai/) (图片生成)

---

<div align="center">

### 🌌 NebulaQQ Framework

**Made with ❤️ by Starlight-apk Team**

[GitHub](https://github.com/Starlight-apk/NebulaQQ) · [文档](#-文档) · [示例](#-示例代码)

⭐ 如果这个项目对你有帮助，请给我们一个 Star!

🌌 星云 QQ 机器人框架 - 支持 Linux | macOS | Windows | ARM64 | Termux

</div>
