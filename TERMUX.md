# Termux (ARM64) 安装指南

本指南介绍如何在 Termux (Android) 上安装和运行 NebulaQQ。

## 📱 前置要求

- Android 设备
- Termux 应用 (从 F-Droid 下载，不要从 Play Store 下载)
- 稳定的网络连接

## 🚀 快速开始

### 1. 安装 Termux 依赖

```bash
# 更新包列表
pkg update && pkg upgrade -y

# 安装 Node.js (>= 18)
pkg install nodejs -y

# 安装 Git (可选，用于克隆仓库)
pkg install git -y

# 验证安装
node -v
npm -v
```

### 2. 获取 NebulaQQ

**方式 A: 下载 ZIP (推荐)**

从 GitHub 下载 ZIP 文件并解压：

```bash
# 进入下载目录
cd ~/storage/downloads

# 解压 (假设已下载 NebulaQQ.zip)
unzip NebulaQQ.zip

# 进入项目目录
cd NebulaQQ
```

**方式 B: Git 克隆**

```bash
git clone https://github.com/NebulaQQ/NebulaQQ.git
cd NebulaQQ
```

### 3. 一键安装和运行

```bash
# 赋予脚本执行权限
chmod +x install.sh

# 运行安装脚本
./install.sh all
```

或者手动安装：

```bash
# 安装依赖
npm install --legacy-peer-deps

# 构建项目
npm run build

# 运行示例
cd examples/basic
npm install --legacy-peer-deps
npm run dev
```

## 📦 手动安装步骤

### 步骤 1: 安装全局依赖

```bash
# 安装 TypeScript 和 ts-node
npm install -g typescript ts-node

# 验证安装
tsc -v
ts-node -v
```

### 步骤 2: 构建核心模块

```bash
# 构建 @nebulaqq/core
cd packages/core
npm install
npm run build
cd ../..

# 构建 @nebulaqq/utils
cd packages/utils
npm install
npm run build
cd ../..

# 构建 @nebulaqq/network
cd packages/network
npm install
npm run build
cd ../..

# 构建 @nebulaqq/module-sdk
cd packages/module-sdk
npm install
npm run build
cd ../..

# 构建 @nebulaqq/theme-sdk
cd packages/theme-sdk
npm install
npm run build
cd ../..

# 构建 @nebulaqq/adapter-onebot
cd packages/adapter-onebot
npm install
npm run build
cd ../..
```

### 步骤 3: 运行示例

```bash
cd examples/basic

# 安装示例依赖
npm install --legacy-peer-deps

# 运行
npm run dev
```

## 🔧 配置 OneBot

在 Termux 上运行 NapCatQQ 可能比较困难，建议使用以下方案：

### 方案 A: 在 PC 上运行 NapCatQQ

1. 在 PC 上安装 NapCatQQ
2. 配置 WebSocket 服务端
3. 在 Termux 中配置 NebulaQQ 连接到 PC

```typescript
// examples/basic/index.ts
const bot = new NebulaBot({
  adapter: {
    type: 'websocket',
    host: '192.168.1.100',  // PC 的 IP 地址
    port: 3000
  }
});
```

### 方案 B: 使用其他 OneBot 实现

- [Lagrange.Core](https://github.com/LagrangeDev/Lagrange.Core) - 支持 Linux ARM64
- [OpenShamrock](https://github.com/whitechi73/OpenShamrock) - Magisk 模块

## 📝 创建自己的机器人

1. 复制示例项目：

```bash
cp -r examples/basic ~/my-bot
cd ~/my-bot
```

2. 编辑 `index.ts` 添加你的功能

3. 运行：

```bash
npm run dev
```

## ⚠️ 常见问题

### Q: 安装时遇到 `node-gyp` 错误

A: 某些 npm 包需要编译原生模块，安装构建工具：

```bash
pkg install build-essential python -y
```

### Q: 运行时提示 `Cannot find module`

A: 确保已构建所有包：

```bash
npm run build
```

### Q: 连接被拒绝

A: 检查：
1. OneBot 服务是否运行
2. IP 地址和端口是否正确
3. 防火墙设置
4. 如果在不同设备，确保在同一局域网

### Q: 内存不足

A: Termux 可能有内存限制，尝试：
1. 关闭其他应用
2. 增加设备 swap 空间 (需要 root)
3. 减少加载的插件数量

## 🎯 性能优化

### 限制日志输出

```typescript
const bot = new NebulaBot({
  logging: {
    level: 'warn',  // 只输出警告和错误
    colors: false   // 禁用彩色输出
  }
});
```

### 禁用不需要的功能

```typescript
const bot = new NebulaBot({
  // 不加载插件
  plugins: [],
  // 禁用统计
  enableStats: false
});
```

## 📚 相关资源

- [NebulaQQ 文档](../docs/README.md)
- [插件开发指南](../docs/plugins.md)
- [OneBot 协议](https://onebot.dev/)
- [Termux 官网](https://termux.dev/)

## 💡 提示

1. 使用 `tmux` 保持机器人后台运行：
   ```bash
   pkg install tmux -y
   tmux new -s bot
   # 运行机器人
   # Ctrl+B, D 分离会话
   # tmux attach -t bot 重新连接
   ```

2. 使用 Termux:Boot 开机自启

3. 定期清理缓存：
   ```bash
   npm cache clean --force
   ```

祝你使用愉快！🌌
