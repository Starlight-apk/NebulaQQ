<div align="center">

# 🌌 NebulaQQ

**次世代 QQ ボットフレームワーク · インテリジェントなインタラクションを再定義**

[![ライセンス](https://img.shields.io/badge/ライセンス-MIT-blue.svg?style=for-the-badge)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-green.svg?style=for-the-badge)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)

**言語:** 
[🇨🇳 中文](../README.md) | [🇺🇸 English](../README.en.md) | [🇪🇸 Español](README.es.md) | [🇷🇺 Русский](README.ru.md) | [🇯🇵 日本語](README.ja.md) | [🇰🇷 한국어](README.ko.md)

</div>

---

## ✨ 機能

| 機能 | 説明 | ステータス |
|------|------|------|
| 🧩 **プラグインシステム** | 依存関係管理とホットリロード対応 | ✅ |
| 🔷 **モジュールシステム** | モジュール式アーキテクチャ、オンデマンド読み込み | ✅ |
| 🎨 **テーマシステム** | パーソナライズされたカスタムテーマ | ✅ |
| ⚡ **ハイパフォーマンス** | 最適化された接続プールとキャッシュ | ✅ |
| 🔌 **OneBot プロトコル** | OneBot v11 完全サポート | ✅ |
| 📦 **TypeScript** | 完全な型定義 | ✅ |
| 📱 **Termux サポート** | ARM64 完全サポート | ✅ |
| 🌐 **WebUI** | Material Design 3 + アークナイツ美学 | ✅ |
| 🌍 **i18n 対応** | 多言語サポート | ✅ |

---

## 🚀 クイックスタート

```bash
# リポジトリをクローン
git clone https://github.com/Starlight-apk/NebulaQQ.git
cd NebulaQQ

# 依存関係をインストール
npm install --legacy-peer-deps

# プロジェクトをビルド
npm run build

# WebUI を起動
npm run start:webui
```

---

## 💡 サンプル

```typescript
import { NebulaBot, definePlugin } from '@nebulaqq/core';

const plugin = definePlugin({
  manifest: {
    name: 'hello',
    version: '1.0.0',
    description: '挨拶プラグイン'
  },

  async onMessage(ctx) {
    if (ctx.message === 'こんにちは') {
      await ctx.reply('こんにちは！NebulaQQ へようこそ！🌌');
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

## 🌍 言語

NebulaQQ は複数の言語をサポートしています：

| 言語 | コード | 名前 |
|--------|------|------|
| 🇨🇳 简体中文 | zh-CN | 简体中文 |
| 🇺🇸 English | en-US | English |
| 🇪🇸 Español | es-ES | Español |
| 🇷🇺 Русский | ru-RU | Русский |
| 🇯🇵 日本語 | ja-JP | 日本語 |
| 🇰🇷 한국어 | ko-KR | 한국어 |

### 言語を切り替え

```typescript
import { i18n } from '@nebulaqq/core';

// 日本語に切り替え
i18n.setLanguage('ja-JP');

// テキストを翻訳
const greeting = i18n.t('hello'); // "こんにちは"
```

---

## 📖 ドキュメント

- [クイックスタート](../docs/getting-started.md)
- [プラグイン開発](../docs/plugins.md)
- [API リファレンス](../docs/api.md)
- [Wiki](../wiki/Home.md)

---

## 📄 ライセンス

MIT ライセンス - 詳細は [LICENSE](../LICENSE) ファイルをご覧ください。

---

<div align="center">

**Starlight-apk Team によって ❤️ を込めて作成**

⭐ このプロジェクトが役に立った場合は、スターをお願いします！

</div>
