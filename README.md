# 🌌 NebulaQQ

<div align="center">

**新一代现代化 QQ 机器人框架**

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![OneBot](https://img.shields.io/badge/OneBot-v11-orange.svg)](https://onebot.dev/)
[![Platform](https://img.shields.io/badge/platform-Linux%20%7C%20macOS%20%7C%20Windows%20%7C%20ARM64-lightgrey.svg)](https://nebulaqq.dev)

</div>

---

## ✨ 特性亮点

- 🧩 **插件系统** - 强大的插件机制，支持依赖管理和热重载
- 🔷 **模块系统** - 完全模块化的架构，按需加载，热插拔
- 🎨 **主题系统** - 支持自定义主题，打造个性化机器人体验
- ⚡ **高性能** - 优化的连接池和缓存机制，低延迟高吞吐
- 🔌 **OneBot 协议** - 完整支持 OneBot v11 标准协议
- 📦 **TypeScript** - 完整的类型定义，优秀的开发体验
- 📱 **Termux 支持** - 完美支持 ARM64 架构，可在手机上运行

## 🚀 快速开始

### 方式一：一键安装 (推荐)

```bash
# 克隆或下载项目后
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

## 🆚 与 NapCatQQ 对比

| 特性 | NapCatQQ | NebulaQQ |
|------|----------|----------|
| 插件系统 | ✅ | ✅ 增强版 (依赖管理) |
| 模块系统 | 部分 | ✅ 完整版 (热插拔) |
| 主题系统 | ❌ | ✅ 独家支持 |
| WebUI | ✅ | ❌ (精简核心) |
| 文件管理 | ✅ | ❌ (精简核心) |
| 接口调试 | ✅ | ❌ (精简核心) |
| 性能优化 | 标准 | ✅ 增强版 (连接池) |
| Termux 支持 | ⚠️ | ✅ 官方支持 |

## 💡 最小示例

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
bot.start();
```

## 📦 核心模块

| 模块 | 说明 |
|------|------|
| `@nebulaqq/core` | 核心模块 - 事件系统、消息处理 |
| `@nebulaqq/plugin-sdk` | 插件 SDK |
| `@nebulaqq/module-sdk` | 模块 SDK |
| `@nebulaqq/theme-sdk` | 主题 SDK |
| `@nebulaqq/adapter-onebot` | OneBot 协议适配器 |
| `@nebulaqq/network` | 网络模块 |
| `@nebulaqq/utils` | 工具函数库 |

## 🔧 可用命令

```bash
# 安装依赖
npm install

# 构建所有包
npm run build

# 运行示例
npm run dev

# 类型检查
npm run typecheck

# 清理构建产物
npm run clean
```

## 📖 文档

- [快速开始](./docs/getting-started.md)
- [插件开发指南](./docs/plugins.md)
- [API 参考](./docs/api.md)
- [Termux 指南](./TERMUX.md)
- [框架结构](./FRAMEWORK.md)

## 📄 开源协议

MIT License - 详见 [LICENSE](LICENSE) 文件

## 🤝 参与贡献

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 🙏 致谢

NebulaQQ 基于以下优秀项目构建：

- [NapCatQQ](https://github.com/NapNeko/NapCatQQ)
- [NapCatReforged](https://github.com/NapNeko/NapCatReforged)
- [OneBot](https://onebot.dev/)

---

<div align="center">

**Made with ❤️ by NebulaQQ Team**

⭐ 如果这个项目对你有帮助，请给我们一个 Star!

🌌 星云 QQ 机器人框架 - 支持 Linux | macOS | Windows | ARM64 | Termux

</div>
