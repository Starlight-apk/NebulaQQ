<div align="center">

# 🌌 NebulaQQ

**Framework Moderno para Bots de QQ · Redefiniendo la Interacción Inteligente**

[![Licencia](https://img.shields.io/badge/licencia-MIT-blue.svg?style=for-the-badge)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-green.svg?style=for-the-badge)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)

---

**🌍 Seleccionar Idioma:**

[🇨🇳 简体中文](../README.md) · [🇺🇸 English](../README.en.md) · [🇪🇸 Español](README.es.md) · [🇷🇺 Русский](README.ru.md) · [🇯🇵 日本語](README.ja.md) · [🇰🇷 한국어](README.ko.md)

---

</div>

---

## ✨ Características

| Característica | Descripción | Estado |
|------|------|------|
| 🧩 **Sistema de Plugins** | Mecanismo potente con gestión de dependencias y recarga en caliente | ✅ |
| 🔷 **Sistema de Módulos** | Arquitectura modular, carga bajo demanda | ✅ |
| 🎨 **Sistema de Temas** | Temas personalizados para experiencia única | ✅ |
| ⚡ **Alto Rendimiento** | Pool de conexiones optimizado y caché | ✅ |
| 🔌 **Protocolo OneBot** | Soporte completo para OneBot v11 | ✅ |
| 📦 **TypeScript** | Definiciones de tipo completas | ✅ |
| 📱 **Soporte Termux** | Soporte ARM64 perfecto | ✅ |
| 🌐 **WebUI** | Material Design 3 + Estética Arknights | ✅ |
| 🌍 **i18n Listo** | Soporte multi-idioma | ✅ |

---

## 🚀 Inicio Rápido

```bash
# Clonar repositorio
git clone https://github.com/Starlight-apk/NebulaQQ.git
cd NebulaQQ

# Instalar dependencias
npm install --legacy-peer-deps

# Construir proyecto
npm run build

# Iniciar WebUI
npm run start:webui
```

---

## 💡 Ejemplo

```typescript
import { NebulaBot, definePlugin } from '@nebulaqq/core';

const plugin = definePlugin({
  manifest: {
    name: 'hola',
    version: '1.0.0',
    description: 'Plugin de saludo'
  },

  async onMessage(ctx) {
    if (ctx.message === 'hola') {
      await ctx.reply('¡Hola! ¡Bienvenido a NebulaQQ! 🌌');
    }
  }
});

const bot = new NebulaBot({
  logging: { level: 'info', colors: true },
  adapter: {
    type: 'websocket',
    host: '127.0.0.1',
    port: 3000
  },
  plugins: [plugin]
});

await bot.start();
```

---

## 🌍 Idiomas

NebulaQQ soporta múltiples idiomas:

| Idioma | Código | Nombre Nativo |
|--------|------|---------------|
| 🇨🇳 简体中文 | zh-CN | 简体中文 |
| 🇺🇸 English | en-US | English |
| 🇪🇸 Español | es-ES | Español |
| 🇷🇺 Русский | ru-RU | Русский |
| 🇯🇵 日本語 | ja-JP | 日本語 |
| 🇰🇷 한국어 | ko-KR | 한국어 |

### Cambiar Idioma

```typescript
import { i18n } from '@nebulaqq/core';

// Cambiar a español
i18n.setLanguage('es-ES');

// Traducir texto
const saludo = i18n.t('hello'); // "Hola"
```

---

## 📖 Documentación

- [Inicio Rápido](../docs/getting-started.md)
- [Desarrollo de Plugins](../docs/plugins.md)
- [Referencia API](../docs/api.md)
- [Wiki](../wiki/Home.md)

---

## 📄 Licencia

Licencia MIT - Ver archivo [LICENSE](../LICENSE) para detalles.

---

<div align="center">

**Hecho con ❤️ por Starlight-apk Team**

⭐ ¡Si este proyecto te ayuda, por favor danos una Estrella!

</div>
