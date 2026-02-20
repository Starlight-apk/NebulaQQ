# NebulaQQ WebUI 文档

## 🎨 概述

NebulaQQ WebUI 是一个基于 **Material Design 3** 和 **明日方舟美学** 设计的现代化 Web 控制面板。

### 特性

- ✨ Material Design 3 设计规范
- 🎨 明日方舟风格主题（深色/浅色/源石技艺）
- 📱 响应式设计，支持移动端
- 🔌 实时 WebSocket 通信
- 🛠️ 插件/模块管理
- 📊 实时监控和统计
- 💻 控制台命令执行

## 🚀 快速开始

### 安装依赖

```bash
cd packages/webui
npm install
```

### 开发模式

```bash
# 启动 Vite 开发服务器
npm run dev
```

访问 `http://localhost:5173`

### 构建生产版本

```bash
npm run build
```

### 启动 WebUI 服务器

```bash
cd packages/webui-server
npm install
npm run start
```

访问 `http://localhost:8080`

## 📁 目录结构

```
packages/webui/
├── src/
│   ├── components/        # Vue 组件
│   │   ├── Dashboard.vue  # 概览页面
│   │   ├── Plugins.vue    # 插件管理
│   │   ├── Modules.vue    # 模块管理
│   │   ├── Themes.vue     # 主题设置
│   │   ├── Console.vue    # 控制台
│   │   └── Settings.vue   # 设置
│   ├── styles/            # SCSS 样式
│   │   ├── variables.scss # 样式变量
│   │   ├── mixins.scss    # 样式混合
│   │   └── main.scss      # 主样式
│   ├── App.vue            # 根组件
│   ├── main.ts            # 入口文件
│   └── router.ts          # 路由配置
├── public/                # 静态资源
├── index.html             # HTML 模板
├── package.json
├── vite.config.ts         # Vite 配置
└── tsconfig.json

packages/webui-server/
├── src/
│   └── index.ts           # 服务器入口
├── package.json
└── tsconfig.json
```

## 🎨 主题系统

### 内置主题

1. **明日方舟·暗** (默认)
   - 深色背景
   - 源石风格装饰
   - 蓝色主色调

2. **罗德岛·光**
   - 明亮背景
   - 简洁清爽
   - 适合日间使用

3. **源石技艺**
   - 特殊渐变效果
   - 源石晶格装饰
   - 发光特效

### 自定义主题

在「主题设置」页面可以自定义：
- 主色调
- 强调色
- 背景色

## 📱 响应式设计

WebUI 支持各种屏幕尺寸：

| 断点 | 宽度 | 布局 |
|------|------|------|
| SM | < 576px | 单列，抽屉导航 |
| MD | < 768px | 双列，抽屉导航 |
| LG | < 992px | 三列，侧边导航 |
| XL | ≥ 992px | 四列，侧边导航 |

## 🔌 API 接口

WebUI 提供以下 REST API：

### GET /api/status
获取服务状态

```json
{
  "status": "ok",
  "version": "1.0.0",
  "uptime": 3600
}
```

### GET /api/plugins
获取插件列表

```json
{
  "plugins": [
    {
      "id": "1",
      "name": "AI 聊天",
      "version": "1.0.0",
      "enabled": true
    }
  ]
}
```

### GET /api/modules
获取模块列表

### GET /api/logs
获取日志

## 🔌 WebSocket 通信

连接 WebSocket：

```javascript
const ws = new WebSocket('ws://localhost:8080/ws');

ws.onopen = () => {
  console.log('已连接');
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('收到消息:', data);
};

// 发送消息
ws.send(JSON.stringify({
  type: 'command',
  payload: { command: 'reload' }
}));
```

### 消息类型

| 类型 | 方向 | 说明 |
|------|------|------|
| `ping` | 客户端→服务器 | 心跳请求 |
| `pong` | 服务器→客户端 | 心跳响应 |
| `command` | 客户端→服务器 | 执行命令 |
| `log` | 服务器→客户端 | 日志推送 |
| `status` | 服务器→客户端 | 状态更新 |

## 🎯 使用示例

### 在机器人中集成 WebUI

```typescript
import { NebulaBot } from '@nebulaqq/core';
import { WebUIServer } from '@nebulaqq/webui-server';

const bot = new NebulaBot({
  // ... 机器人配置
});

const webui = new WebUIServer({
  port: 8080,
  host: '0.0.0.0',
  token: 'your-secret-token'
});

// 启动
await bot.start();
await webui.start();

// 推送日志到 WebUI
bot.logger.on('log', (entry) => {
  webui.broadcast('log', {
    time: entry.time.toLocaleTimeString(),
    level: entry.level,
    message: entry.message
  });
});
```

## 🎨 样式变量

主要 SCSS 变量（位于 `src/styles/variables.scss`）：

```scss
// 主题色
$ark-primary: #0099cc;
$ark-secondary: #cc6699;
$ark-tertiary: #9966cc;

// 功能色
$ark-success: #00cc88;
$ark-warning: #ffaa00;
$ark-error: #ff4466;

// 深色主题
$ark-background-dark: #0a0a0f;
$ark-surface-dark: #1a1a2e;

// 圆角
$ark-radius-sm: 8px;
$ark-radius-md: 12px;
$ark-radius-lg: 16px;
```

## 📝 待办事项

- [ ] 实时日志推送
- [ ] 插件市场
- [ ] 配置文件编辑器
- [ ] 数据可视化图表
- [ ] 多用户权限管理
- [ ] 移动端优化

## 🙏 致谢

设计灵感来源于：
- Material Design 3
- 明日方舟 (Arknights)
- Material Web Components

---

**Made with ❤️ by Starlight-apk Team**
