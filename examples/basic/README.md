# My NebulaQQ Bot

## 快速开始

### 安装依赖

```bash
npm install
```

### 配置

编辑 `src/index.ts`，修改 OneBot 连接配置：

```typescript
const bot = new NebulaBot({
  adapter: {
    type: 'websocket',
    host: '127.0.0.1',  // OneBot 服务地址
    port: 3000,         // OneBot 服务端口
    // token: 'your-token'
  }
});
```

### 运行

```bash
# 开发模式
npm run dev

# 构建
npm run build

# 生产环境
npm start
```

## 开发插件

在 `src/index.ts` 中添加你的插件逻辑，或创建新的插件文件。

参考文档：
- [NebulaQQ 文档](https://github.com/Starlight-apk/NebulaQQ)
- [插件开发指南](../../docs/plugins.md)

## 许可证

MIT
