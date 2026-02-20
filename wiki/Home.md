# NebulaQQ Wiki 首页

欢迎使用 NebulaQQ Wiki！这里包含了 NebulaQQ 框架的完整文档和使用指南。

---

## 📚 快速导航

### 新手入门

| 文档 | 说明 | 预计时间 |
|------|------|---------|
| [什么是 NebulaQQ](./Home.md) | 了解框架的基本概念 | 5 分钟 |
| [快速开始](./Getting-Started.md) | 5 分钟快速上手 | 10 分钟 |
| [安装指南](./Installation.md) | 详细的安装步骤 | 15 分钟 |
| [第一个机器人](./First-Bot.md) | 创建你的第一个机器人 | 20 分钟 |

### 开发指南

| 文档 | 说明 | 难度 |
|------|------|------|
| [插件开发](./Plugin-Development.md) | 如何开发插件 | ⭐⭐ |
| [模块开发](./Module-Development.md) | 如何开发模块 | ⭐⭐⭐ |
| [主题开发](./Theme-Development.md) | 如何开发主题 | ⭐⭐ |
| [WebUI 开发](./WebUI-Development.md) | WebUI 定制开发 | ⭐⭐⭐⭐ |

### 进阶主题

| 文档 | 说明 | 难度 |
|------|------|------|
| [架构设计](./Architecture.md) | 框架架构详解 | ⭐⭐⭐⭐ |
| [事件系统](./Event-System.md) | 事件驱动架构 | ⭐⭐⭐ |
| [性能优化](./Performance.md) | 性能调优指南 | ⭐⭐⭐⭐ |
| [最佳实践](./Best-Practices.md) | 开发最佳实践 | ⭐⭐⭐ |

### 参考文档

| 文档 | 说明 |
|------|------|
| [API 参考](./API-Reference.md) | 完整 API 文档 |
| [配置说明](./Configuration.md) | 配置文件详解 |
| [常见问题](./FAQ.md) | 常见问题解答 |
| [更新日志](./Changelog.md) | 版本更新记录 |

---

## 🌟 框架特性

<div align="center">

| 🧩 插件系统 | 🔷 模块系统 | 🎨 主题系统 |
|:---:|:---:|:---:|
| 依赖管理<br/>热重载 | 按需加载<br/>热插拔 | 自定义主题<br/>个性化 |

| ⚡ 高性能 | 🔌 OneBot | 📦 TypeScript |
|:---:|:---:|:---:|
| 连接池优化<br/>缓存系统 | 完整协议支持<br/>v11 标准 | 完整类型定义<br/>开发体验 |

| 📱 Termux | 🌐 WebUI | 🛠️ CLI |
|:---:|:---:|:---:|
| ARM64 支持<br/>移动端运行 | MD3 设计<br/>明日方舟美学 | 快速创建<br/>一键部署 |

</div>

---

## 📦 核心模块

NebulaQQ 由以下核心模块组成：

```
NebulaQQ Framework
├── @nebulaqq/core           # 核心模块
├── @nebulaqq/plugin-sdk     # 插件开发工具包
├── @nebulaqq/module-sdk     # 模块开发工具包
├── @nebulaqq/theme-sdk      # 主题开发工具包
├── @nebulaqq/adapter-onebot # OneBot 协议适配器
├── @nebulaqq/network        # 网络模块
├── @nebulaqq/utils          # 工具函数库
├── @nebulaqq/webui          # WebUI 前端
└── @nebulaqq/webui-server   # WebUI 后端服务器
```

### 模块说明

| 模块 | 说明 | 必需 |
|------|------|:---:|
| `@nebulaqq/core` | 核心模块，包含事件系统、插件管理、日志系统、OneBot 适配器 | ✅ |
| `@nebulaqq/plugin-sdk` | 插件开发工具包，提供插件开发的完整 API | ✅ |
| `@nebulaqq/module-sdk` | 模块开发工具包，支持热插拔功能模块 | ✅ |
| `@nebulaqq/theme-sdk` | 主题开发工具包，支持自定义主题系统 | ✅ |
| `@nebulaqq/adapter-onebot` | OneBot v11 协议适配器，实现标准协议 | ✅ |
| `@nebulaqq/network` | 网络模块，提供 HTTP/WebSocket 服务器和连接池 | ✅ |
| `@nebulaqq/utils` | 工具函数库，包含 CQ 码、限流器、缓存等工具 | ✅ |
| `@nebulaqq/webui` | WebUI 前端，基于 Vue 3 + Vite + Material Design 3 | 🔌 |
| `@nebulaqq/webui-server` | WebUI 后端服务器，基于 Express + WebSocket | 🔌 |

---

## 🚀 快速开始

### 系统要求

- **Node.js**: >= 18.0.0
- **npm**: >= 8.0.0
- **操作系统**: Linux / macOS / Windows / Termux (ARM64)

### 安装

```bash
# 克隆项目
git clone https://github.com/Starlight-apk/NebulaQQ.git
cd NebulaQQ

# 安装依赖
npm install --legacy-peer-deps

# 构建项目
npm run build
```

### 创建第一个机器人

```bash
# 创建项目目录
mkdir my-bot && cd my-bot

# 初始化项目
npm init -y

# 安装 NebulaQQ
npm install @nebulaqq/core @nebulaqq/utils

# 创建机器人文件
# 编辑 src/index.ts
```

详细教程请查看 [快速开始](./Getting-Started.md)。

---

## 🌐 WebUI

NebulaQQ 内置精美的 Web 控制面板：

- **Material Design 3** 设计规范
- **明日方舟美学** 主题设计
- **实时日志** 查看
- **插件/模块** 管理
- **主题切换** (3 个内置主题)
- **响应式设计**

### 启动 WebUI

```bash
# 构建 WebUI
npm run build:webui

# 启动 WebUI 服务器
npm run start:webui

# 访问 http://localhost:8080
```

---

## 📱 平台支持

| 平台 | 架构 | 状态 | 说明 |
|------|------|:---:|------|
| Linux | x64/ARM64 | ✅ | 完整支持 |
| macOS | Intel/M1 | ✅ | 完整支持 |
| Windows | x64/ARM64 | ✅ | 完整支持 |
| Termux | ARM64 | ✅ | 完整支持 |

---

## 📖 文档导航

### 入门文档

1. [什么是 NebulaQQ](./Home.md)
2. [快速开始](./Getting-Started.md)
3. [安装指南](./Installation.md)
4. [配置说明](./Configuration.md)
5. [第一个机器人](./First-Bot.md)

### 开发文档

1. [插件开发指南](./Plugin-Development.md)
2. [模块开发指南](./Module-Development.md)
3. [主题开发指南](./Theme-Development.md)
4. [WebUI 开发指南](./WebUI-Development.md)
5. [API 参考](./API-Reference.md)

### 进阶文档

1. [架构设计](./Architecture.md)
2. [事件系统](./Event-System.md)
3. [消息处理](./Message-Handling.md)
4. [性能优化](./Performance.md)
5. [最佳实践](./Best-Practices.md)

### 其他文档

1. [常见问题](./FAQ.md)
2. [更新日志](./Changelog.md)
3. [迁移指南](./Migration.md)
4. [贡献指南](./Contributing.md)
5. [行为准则](./Code-of-Conduct.md)

---

## 🤝 参与贡献

我们欢迎各种形式的贡献：

- 📝 改进文档
- 🐛 报告 Bug
- 💡 提出新功能建议
- 🔧 提交代码修复
- 🎨 设计 UI/UX

详见 [贡献指南](./Contributing.md)。

---

## 📄 开源协议

NebulaQQ 采用 **MIT License** 开源。

详见 [许可协议](../LICENSE)。

---

## 🔗 相关链接

- **GitHub 仓库**: https://github.com/Starlight-apk/NebulaQQ
- **Issue 追踪**: https://github.com/Starlight-apk/NebulaQQ/issues
- **讨论区**: https://github.com/Starlight-apk/NebulaQQ/discussions
- **NPM**: https://www.npmjs.com/org/nebulaqq

---

## 📬 联系方式

- **GitHub**: https://github.com/Starlight-apk
- **邮箱**: starlight-apk@users.noreply.github.com

---

<div align="center">

**Made with ❤️ by Starlight-apk Team**

[GitHub](https://github.com/Starlight-apk/NebulaQQ) · [文档](./Home.md) · [社区](https://github.com/Starlight-apk/NebulaQQ/discussions)

⭐ 如果这个项目对你有帮助，请给我们一个 Star!

</div>
