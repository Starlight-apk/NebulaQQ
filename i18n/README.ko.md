<div align="center">

# 🌌 NebulaQQ

**차세대 QQ 봇 프레임워크 · 지능형 상호작용 재정의**

[![라이선스](https://img.shields.io/badge/라이선스-MIT-blue.svg?style=for-the-badge)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-green.svg?style=for-the-badge)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)

---

**🌍 언어 선택:**

[🇨🇳 简体中文](../README.md) · [🇺🇸 English](../README.en.md) · [🇪🇸 Español](README.es.md) · [🇷🇺 Русский](README.ru.md) · [🇯🇵 日本語](README.ja.md) · [🇰🇷 한국어](README.ko.md)

---

</div>

---

## ✨ 기능

| 기능 | 설명 | 상태 |
|------|------|------|
| 🧩 **플러그인 시스템** | 의존성 관리 및 핫리로드 지원 | ✅ |
| 🔷 **모듈 시스템** | 모듈식 아키텍처, 온디맨드 로딩 | ✅ |
| 🎨 **테마 시스템** | 맞춤형 커스텀 테마 | ✅ |
| ⚡ **고성능** | 최적화된 연결 풀 및 캐시 | ✅ |
| 🔌 **OneBot 프로토콜** | OneBot v11 완전 지원 | ✅ |
| 📦 **TypeScript** | 완전한 타입 정의 | ✅ |
| 📱 **Termux 지원** | ARM64 완벽 지원 | ✅ |
| 🌐 **WebUI** | 머티리얼 디자인 3 + 아크나イツ 미학 | ✅ |
| 🌍 **i18n 준비** | 다국어 지원 | ✅ |

---

## 🚀 빠른 시작

```bash
# 저장소 복제
git clone https://github.com/Starlight-apk/NebulaQQ.git
cd NebulaQQ

# 의존성 설치
npm install --legacy-peer-deps

# 프로젝트 빌드
npm run build

# WebUI 시작
npm run start:webui
```

---

## 💡 예제

```typescript
import { NebulaBot, definePlugin } from '@nebulaqq/core';

const plugin = definePlugin({
  manifest: {
    name: '인사',
    version: '1.0.0',
    description: '인사 플러그인'
  },

  async onMessage(ctx) {
    if (ctx.message === '안녕하세요') {
      await ctx.reply('안녕하세요! NebulaQQ 에 오신 것을 환영합니다! 🌌');
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

## 🌍 언어

NebulaQQ 는 여러 언어를 지원합니다：

| 언어 | 코드 | 이름 |
|--------|------|------|
| 🇨🇳 简体中文 | zh-CN | 简体中文 |
| 🇺🇸 English | en-US | English |
| 🇪🇸 Español | es-ES | Español |
| 🇷🇺 Русский | ru-RU | Русский |
| 🇯🇵 日本語 | ja-JP | 日本語 |
| 🇰🇷 한국어 | ko-KR | 한국어 |

### 언어 변경

```typescript
import { i18n } from '@nebulaqq/core';

// 한국어로 변경
i18n.setLanguage('ko-KR');

// 텍스트 번역
const greeting = i18n.t('hello'); // "안녕하세요"
```

---

## 📖 문서

- [빠른 시작](../docs/getting-started.md)
- [플러그인 개발](../docs/plugins.md)
- [API 참조](../docs/api.md)
- [Wiki](../wiki/Home.md)

---

## 📄 라이선스

MIT 라이선스 - 자세한 내용은 [LICENSE](../LICENSE) 파일을 참조하세요.

---

<div align="center">

**Starlight-apk Team 이 ❤️ 를 담아 제작**

⭐ 이 프로젝트가 도움이 되었다면 스타를 부탁드립니다!

</div>
