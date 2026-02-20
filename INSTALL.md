# 🚀 NebulaQQ 一键安装说明

## 快速开始 (3 步完成)

### Linux / macOS / Termux 用户

```bash
# 步骤 1: 赋予脚本执行权限
chmod +x install.sh

# 步骤 2: 运行安装脚本
./install.sh all

# 步骤 3: 配置 OneBot 服务后，机器人即可运行!
```

### Windows 用户

```batch
# 双击运行即可
install.bat
```

---

## 安装脚本选项

```bash
# 完整流程：安装 + 构建 + 运行
./install.sh all

# 仅安装依赖
./install.sh install

# 仅构建项目
./install.sh build

# 仅运行示例
./install.sh run

# 清理构建产物
./install.sh clean

# 查看帮助
./install.sh help
```

---

## 环境要求

### 必需

- **Node.js** >= 18.0.0
- **npm** (随 Node.js 安装)

### 可选

- **Git** (用于克隆仓库)
- **TypeScript** (全局安装，用于开发)

---

## 平台特定说明

### Termux (ARM64)

```bash
# 先安装 Node.js
pkg update && pkg upgrade -y
pkg install nodejs -y

# 然后运行安装脚本
chmod +x install.sh
./install.sh all
```

详细指南请查看 [TERMUX.md](./TERMUX.md)

### Linux (x64/ARM64)

无需特殊配置，直接运行：

```bash
./install.sh all
```

### macOS (Intel/Apple Silicon)

无需特殊配置，直接运行：

```bash
./install.sh all
```

### Windows (x64/ARM64)

使用 `install.bat`：

```batch
install.bat
```

或在 Git Bash 中使用 `install.sh`：

```bash
chmod +x install.sh
./install.sh all
```

---

## 手动安装 (备选方案)

如果自动安装脚本失败，可以手动安装：

### 步骤 1: 安装全局依赖

```bash
npm install -g typescript ts-node
```

### 步骤 2: 构建各个包

```bash
# 核心模块
cd packages/core
npm install
npm run build
cd ../..

# 工具库
cd packages/utils
npm install
npm run build
cd ../..

# 网络模块
cd packages/network
npm install
npm run build
cd ../..

# 模块 SDK
cd packages/module-sdk
npm install
npm run build
cd ../..

# 主题 SDK
cd packages/theme-sdk
npm install
npm run build
cd ../..

# OneBot 适配器
cd packages/adapter-onebot
npm install
npm run build
cd ../..
```

### 步骤 3: 运行示例

```bash
cd examples/basic
npm install --legacy-peer-deps
npm run dev
```

---

## 验证安装

运行以下命令验证安装是否成功：

```bash
# 检查 Node.js 版本
node -v  # 应该 >= v18.0.0

# 检查 npm 版本
npm -v

# 检查 TypeScript
npx tsc -v

# 检查 ts-node
npx ts-node -v
```

---

## 常见问题

### Q: 安装时遇到权限错误

**A:** 使用 `sudo` 或在命令前加 `--unsafe-perm`：

```bash
npm install --unsafe-perm
```

### Q: 遇到 `node-gyp` 错误

**A:** 安装构建工具：

**Linux:**
```bash
sudo apt-get install build-essential python3
```

**Termux:**
```bash
pkg install build-essential python -y
```

### Q: 构建失败

**A:** 清理后重试：

```bash
npm run clean
npm install --legacy-peer-deps
npm run build
```

### Q: 运行时提示找不到模块

**A:** 确保已构建所有包：

```bash
npm run build
```

### Q: 连接 OneBot 失败

**A:** 检查：
1. OneBot 服务是否运行
2. 配置中的 IP 和端口是否正确
3. 防火墙设置

---

## 下一步

安装成功后，请查看：

1. [快速开始指南](./docs/getting-started.md)
2. [插件开发指南](./docs/plugins.md)
3. [API 参考](./docs/api.md)

祝你使用愉快！🌌
