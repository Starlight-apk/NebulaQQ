<div align="center">

<img src="https://image.pollinations.ai/prompt/Epic%20futuristic%20QQ%20robot%20framework%20banner%2C%20nebula%20galaxy%20background%2C%20purple%20and%20blue%20gradient%2C%20cyberpunk%20city%20skyline%2C%20material%20design%203%2C%20Arknights%20game%20aesthetic%2C%20glowing%20crystal%20elements%2C%20particle%20effects%2C%20bokeh%2C%20cinematic%20lighting%2C%20ultra%20detailed%2C%20digital%20art%2C%201920x600?width=1920&height=600&seed=12345&nologo=true" alt="NebulaQQ Banner" width="100%" />

# 🌌 NebulaQQ

**Next-Generation Modern QQ Robot Framework · Redefining Intelligent Interaction**

[![License](https://img.shields.io/badge/license-MIT-blue.svg?style=for-the-badge)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-green.svg?style=for-the-badge)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![OneBot](https://img.shields.io/badge/OneBot-v11-orange.svg?style=for-the-badge)](https://onebot.dev/)
[![Platform](https://img.shields.io/badge/platform-Linux%20%7C%20macOS%20%7C%20Windows%20%7C%20ARM64-lightgrey.svg?style=for-the-badge)](https://nebulaqq.dev)
[![WebUI](https://img.shields.io/badge/WebUI-MD3%20%7C%20Arknights-purple.svg?style=for-the-badge)](./packages/webui)
[![GitHub Stars](https://img.shields.io/github/stars/Starlight-apk/NebulaQQ?style=for-the-badge&logo=github)](https://github.com/Starlight-apk/NebulaQQ)

[![GitHub issues](https://img.shields.io/github/issues/Starlight-apk/NebulaQQ?style=for-the-badge&logo=github)](https://github.com/Starlight-apk/NebulaQQ/issues)
[![GitHub forks](https://img.shields.io/github/forks/Starlight-apk/NebulaQQ?style=for-the-badge&logo=github)](https://github.com/Starlight-apk/NebulaQQ/network)
[![GitHub license](https://img.shields.io/github/license/Starlight-apk/NebulaQQ?style=for-the-badge&logo=github)](https://github.com/Starlight-apk/NebulaQQ/blob/main/LICENSE)

[📖 Languages](#-languages) · [🚀 Quick Start](#-quick-start) · [📦 Modules](#-core-modules) · [🌐 WebUI](#-webui) · [📚 Docs](#-documentation)

**Languages:** 
[🇨🇳 中文](README.md) | [🇺🇸 English](README.en.md) | [🇪🇸 Español](i18n/README.es.md) | [🇷🇺 Русский](i18n/README.ru.md) | [🇯🇵 日本語](i18n/README.ja.md) | [🇰🇷 한국어](i18n/README.ko.md)

</div>

---

## ✨ Features

| Feature | Description | Status |
|------|------|------|
| 🧩 **Plugin System** | Powerful plugin mechanism with dependency management & hot reload | ✅ |
| 🔷 **Module System** | Fully modular architecture, on-demand loading, hot swappable | ✅ |
| 🎨 **Theme System** | Custom themes for personalized robot experience | ✅ |
| ⚡ **High Performance** | Optimized connection pool & cache, low latency | ✅ |
| 🔌 **OneBot Protocol** | Full support for OneBot v11 standard | ✅ |
| 📦 **TypeScript** | Complete type definitions, excellent DX | ✅ |
| 📱 **Termux Support** | Perfect ARM64 support, runs on mobile | ✅ |
| 🌐 **WebUI** | Material Design 3 + Arknights aesthetic dashboard | ✅ |
| 🌍 **i18n Ready** | Multi-language support out of the box | ✅ |

---

## 🚀 Quick Start

### Method 1: One-Click Install (Recommended)

```bash
# Clone the repository
git clone https://github.com/Starlight-apk/NebulaQQ.git
cd NebulaQQ

# Linux/macOS/Termux
chmod +x install.sh
./install.sh all

# Windows
install.bat
```

### Method 2: Manual Install

```bash
# 1. Install dependencies
npm install --legacy-peer-deps

# 2. Build the project
npm run build

# 3. Run example
cd examples/basic
npm install --legacy-peer-deps
npm run dev
```

### Method 3: Create New Project

```bash
# Using CLI tool
npx create-nebulaqq my-bot
cd my-bot
npm install
npm run dev
```

### Start WebUI

```bash
# Build WebUI
npm run build:webui

# Start WebUI server
npm run start:webui

# Visit http://localhost:8080
```

---

## 📦 Core Modules

| Module | Description | Required |
|------|------|:---:|
| `@nebulaqq/core` | Core module - Event system, message handling | ✅ |
| `@nebulaqq/plugin-sdk` | Plugin SDK - Development toolkit | ✅ |
| `@nebulaqq/module-sdk` | Module SDK - Hot-swappable modules | ✅ |
| `@nebulaqq/theme-sdk` | Theme SDK - Custom theme system | ✅ |
| `@nebulaqq/adapter-onebot` | OneBot v11 protocol adapter | ✅ |
| `@nebulaqq/network` | Network module - HTTP/WebSocket | ✅ |
| `@nebulaqq/utils` | Utility library - CQCode, RateLimiter, Cache | ✅ |
| `@nebulaqq/webui` | WebUI Frontend - Vue 3 + Vite | 🔌 |
| `@nebulaqq/webui-server` | WebUI Backend - Express + WebSocket | 🔌 |

---

## 🌐 WebUI

<div align="center">

<img src="https://image.pollinations.ai/prompt/Beautiful%20web%20dashboard%20UI%20design%20mockup%2C%20Material%20Design%203%2C%20dark%20theme%20with%20purple%20blue%20accents%2C%20Arknights%20game%20UI%20style%2C%20data%20visualization%20charts%2C%20real-time%20logs%2C%20plugin%20management%20panel%2C%20modern%20clean%20interface%2C%20glassmorphism%2C%20high%20quality%2C%201920x1080?width=1920&height=1080&seed=34567&nologo=true" alt="WebUI Dashboard" width="100%" />

**NebulaQQ WebUI - Material Design 3 × Arknights Aesthetic**

</div>

### WebUI Features

- 🎨 **Material Design 3** design system
- 🌸 **Arknights Aesthetic** theme design
- 📊 **Real-time logs** viewer
- 🔌 **Plugin/Module** management
- 🎭 **Theme switching** (3 built-in themes)
- 📱 **Responsive design**

### Built-in Themes

| Theme | Description | Preview |
|------|------|:---:|
| Arknights Dark | Dark theme, Originium style | 🌑 |
| Rhodes Island Light | Light theme, clean design | ☀️ |
| Originium Arts | Special gradient, glow effects | 💎 |

---

## 💡 Example Code

### Basic Bot

```typescript
import { NebulaBot, definePlugin } from '@nebulaqq/core';

// Define a plugin
const helloPlugin = definePlugin({
  manifest: {
    name: 'hello',
    version: '1.0.0',
    description: 'Greeting plugin'
  },

  async onMessage(ctx) {
    if (ctx.message === 'hello') {
      await ctx.reply('Hello! Welcome to NebulaQQ! 🌌');
    }
  }
});

// Create bot
const bot = new NebulaBot({
  logging: { level: 'info', colors: true },
  adapter: {
    type: 'websocket',
    host: '127.0.0.1',
    port: 3000
  },
  plugins: [helloPlugin]
});

// Start
await bot.start();
```

### Using i18n

```typescript
import { i18n } from '@nebulaqq/core';

// Set language
i18n.setLanguage('en-US');

// Translate text
const greeting = i18n.t('hello'); // "Hello"

// Translate with parameters
const cooldown = i18n.t('command_cooldown', { seconds: 10 });
// "Command on cooldown, please try again in 10 seconds"

// Available languages
const languages = i18n.getSupportedLanguages();
// ['zh-CN', 'en-US', 'es-ES', 'ru-RU', 'ja-JP', 'ko-KR']
```

---

## 🌍 Languages

NebulaQQ supports multiple languages out of the box:

| Language | Code | Native Name | Status |
|----------|------|-------------|:---:|
| 🇨🇳 简体中文 | zh-CN | 简体中文 | ✅ |
| 🇺🇸 English | en-US | English | ✅ |
| 🇪🇸 Español | es-ES | Español | ✅ |
| 🇷🇺 Русский | ru-RU | Русский | ✅ |
| 🇯🇵 日本語 | ja-JP | 日本語 | ✅ |
| 🇰🇷 한국어 | ko-KR | 한국어 | ✅ |

### Change Language

```typescript
import { i18n } from '@nebulaqq/core';

// Change to English
i18n.setLanguage('en-US');

// Change to Spanish
i18n.setLanguage('es-ES');

// Change to Russian
i18n.setLanguage('ru-RU');

// Get current language
const currentLang = i18n.getLanguage();
```

---

## 📱 Platform Support

| Platform | Architecture | Status |
|----------|-------------|:---:|
| 🐧 Linux | x64/ARM64 | ✅ |
| 🍎 macOS | Intel/M1 | ✅ |
| 🪟 Windows | x64/ARM64 | ✅ |
| 📱 Termux | ARM64 | ✅ |

---

## 📖 Documentation

| Document | Description |
|----------|-------------|
| [Getting Started](./docs/getting-started.md) | 5-minute quick start |
| [Plugin Development](./docs/plugins.md) | Plugin development guide |
| [API Reference](./docs/api.md) | Complete API documentation |
| [Termux Guide](./TERMUX.md) | ARM64 deployment |
| [Framework Structure](./FRAMEWORK.md) | Architecture details |
| [WebUI Docs](./packages/webui/README.md) | WebUI documentation |
| [Wiki](./wiki/Home.md) | Complete wiki |

---

## 🔧 Available Commands

```bash
# Install dependencies
npm install

# Build all packages
npm run build

# Run example
npm run dev

# Start WebUI
npm run dev:webui
npm run start:webui

# Type check
npm run typecheck

# Clean build artifacts
npm run clean
```

---

## 🤝 Contributing

We welcome all forms of contributions!

1. ⭐ **Fork** this repository
2. 🌿 Create your feature branch `git checkout -b feature/AmazingFeature`
3. 💾 Commit your changes `git commit -m 'Add some AmazingFeature'`
4. 🚀 Push to the branch `git push origin feature/AmazingFeature`
5. 🔄 Open a **Pull Request**

### Contributing Guidelines

- 📝 Improve documentation
- 🐛 Report bugs
- 💡 Suggest new features
- 🔧 Submit code fixes
- 🌍 Help with translations

See [Contributing Guide](./wiki/Contributing.md) for details.

---

## 📄 License

MIT License - See [LICENSE](LICENSE) file for details.

The license includes:
- ✅ Free to use for personal and commercial purposes
- ✅ Modify and distribute
- ✅ No warranty provided
- ✅ Full legal terms (5000+ words)

---

## 🙏 Acknowledgments

NebulaQQ is built upon these excellent projects:

- [NapCatQQ](https://github.com/NapNeko/NapCatQQ) - Inspiration
- [NapCatReforged](https://github.com/NapNeko/NapCatReforged) - Modular design
- [OneBot](https://onebot.dev/) - Protocol standard
- [Material Design](https://m3.material.io/) - Design system
- [Arknights](https://ak.hypergryph.com/) - Aesthetic inspiration
- [Pollinations.AI](https://pollinations.ai/) - Image generation

---

<div align="center">

<img src="https://image.pollinations.ai/prompt/Social%20media%20share%20card%2C%20NebulaQQ%20framework%20announcement%2C%20modern%20gradient%20background%2C%20purple%20blue%2C%20key%20features%20highlights%2C%20professional%20design%2C%201200x630?width=1200&height=630&seed=11223&nologo=true" alt="Footer" width="100%" />

### 🌌 NebulaQQ Framework

**Redefining QQ Robot Development Experience**

[GitHub](https://github.com/Starlight-apk/NebulaQQ) · [Docs](#-documentation) · [Examples](#-example-code) · [Discussions](https://github.com/Starlight-apk/NebulaQQ/discussions)

---

**Made with ❤️ by Starlight-apk Team**

[![License](https://img.shields.io/badge/license-MIT-blue.svg?style=for-the-badge&logo=github)](LICENSE)
[![GitHub Stars](https://img.shields.io/github/stars/Starlight-apk/NebulaQQ?style=for-the-badge&logo=github)](https://github.com/Starlight-apk/NebulaQQ)

⭐ If this project helps you, please give us a Star!

🌌 Nebula QQ Robot Framework - Supporting Linux | macOS | Windows | ARM64 | Termux

</div>
