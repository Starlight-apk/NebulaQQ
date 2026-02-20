# 快速开始

本指南将帮助你在 5 分钟内创建一个 QQ 机器人。

## 前置要求

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- 一个已登录的 QQ 账号
- OneBot 兼容的 QQ 客户端（如 NapCatQQ）

## 步骤 1: 创建项目

使用 CLI 工具快速创建项目：

```bash
# 使用 pnpm (推荐)
pnpm create nebulaqq my-bot

# 或使用 npm
npm create nebulaqq@latest my-bot

# 进入项目目录
cd my-bot
```

## 步骤 2: 安装依赖

```bash
pnpm install
```

## 步骤 3: 配置 OneBot

确保你已经部署了 OneBot 兼容的 QQ 客户端，并配置好 WebSocket 连接。

以 NapCatQQ 为例：
1. 打开 NapCatQQ 配置
2. 启用 WebSocket 服务端
3. 设置端口（如 3000）
4. 设置访问令牌（可选）

## 步骤 4: 修改配置

编辑 `src/index.ts`，修改 OneBot 连接配置：

```typescript
const bot = new NebulaBot({
  adapter: {
    type: 'websocket',
    host: '127.0.0.1',  // OneBot 服务地址
    port: 3000,         // OneBot 服务端口
    // token: 'your-token'  // 如果配置了令牌
  },
  // ... 其他配置
});
```

## 步骤 5: 运行机器人

```bash
# 开发模式
pnpm dev

# 或构建后运行
pnpm build
pnpm start
```

如果一切正常，你将看到类似输出：

```
🌌 NebulaQQ 基础示例

[INFO] 正在连接到 ws://127.0.0.1:3000...
[INFO] WebSocket 连接已建立
[INFO] 机器人已就绪：你的昵称 (12345678)
✅ 机器人已就绪
   昵称：你的昵称
   QQ: 12345678

已加载插件:
   - hello v1.0.0 [loaded]
   - admin v1.0.0 [loaded]
   - repeat v1.0.0 [loaded]

🚀 NebulaQQ 启动成功，按 Ctrl+C 停止
```

## 步骤 6: 测试机器人

在 QQ 中向机器人发送以下消息：

- `hello` - 机器人会回复问候
- `你好` - 中文问候
- `时间` - 查看当前时间
- `帮助` - 查看可用命令

## 下一步

现在你已经成功运行了第一个机器人，可以：

1. 📖 阅读 [插件开发指南](./plugins.md) 学习如何开发自定义插件
2. 🔧 查看 [配置说明](./config.md) 了解所有配置选项
3. 💡 浏览 [示例代码](../examples) 获取更多灵感
4. 🎨 查看 [主题系统](./themes.md) 自定义机器人外观

## 常见问题

### 连接失败怎么办？

1. 检查 OneBot 服务是否已启动
2. 确认端口配置正确
3. 检查防火墙设置
4. 查看日志输出获取详细错误信息

### 如何调试？

将日志级别设置为 `debug`：

```typescript
const bot = new NebulaBot({
  logging: {
    level: 'debug',
    colors: true
  },
  // ...
});
```

### 如何添加更多功能？

查看 [插件开发指南](./plugins.md) 学习如何：
- 创建自定义命令
- 处理群消息
- 调用 OneBot API
- 管理插件配置

## 获取帮助

- 📚 查看 [完整文档](./README.md)
- 💬 加入 QQ 交流群
- 🐛 提交 [Issue](https://github.com/NebulaQQ/NebulaQQ/issues)

祝你使用愉快！🌌
