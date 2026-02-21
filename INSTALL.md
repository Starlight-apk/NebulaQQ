# NebulaQQ 安装指南

## 快速安装

### Linux/macOS

```bash
# 方式 1: 使用安装脚本（推荐）
chmod +x install.sh
./install.sh

# 方式 2: 手动安装
# 1. 清理缓存
rm -rf node_modules packages/*/node_modules pnpm-lock.yaml packages/*/dist
pnpm store prune

# 2. 配置国内镜像
echo "registry=https://registry.npmmirror.com/" > .npmrc

# 3. 安装依赖
pnpm install --prefer-offline
```

### Windows

```batch
:: 方式 1: 使用安装脚本（推荐）
install.bat

:: 方式 2: 手动安装
:: 1. 删除 node_modules 和 pnpm-lock.yaml
:: 2. 配置国内镜像（创建 .npmrc 文件）
:: 3. 运行 pnpm install
```

### Termux (Android)

```bash
# 1. 安装 Node.js 和 pnpm
pkg install nodejs
npm install -g pnpm

# 2. 配置国内镜像
pnpm config set registry https://registry.npmmirror.com/

# 3. 清理并安装
rm -rf node_modules packages/*/node_modules pnpm-lock.yaml
./install.sh
```

## 常见问题解决

### pnpm install 卡住/超时

**症状**: 卡在 "Progress: resolved X/X" 状态超过 30 分钟

**解决方案**:

1. **检查文件系统类型**
   ```bash
   # Linux
   df -T /storage/self/primary/Kaifa/NebulaQQ
   
   # 如果是 exFAT/vfat，建议复制到 ext4 分区
   # exFAT 不支持某些文件锁机制，会导致 pnpm 卡死
   ```

2. **更换镜像源**
   ```bash
   pnpm config set registry https://registry.npmmirror.com/
   ```

3. **清理缓存**
   ```bash
   pnpm store prune
   rm -rf ~/.local/share/pnpm/store  # Linux
   rm -rf ~/Library/pnpm/store      # macOS
   ```

4. **删除 lock 文件重试**
   ```bash
   rm -rf node_modules packages/*/node_modules pnpm-lock.yaml
   pnpm install --prefer-offline
   ```

5. **检查网络代理**
   ```bash
   # 如果有代理，取消代理
   unset http_proxy
   unset https_proxy
   
   # 或者设置正确的代理
   export http_proxy=http://your-proxy:port
   export https_proxy=http://your-proxy:port
   ```

6. **使用 npm 替代**
   ```bash
   # 如果 pnpm 持续失败，可以使用 npm
   npm install
   ```

### 构建失败

**症状**: `@nebulaqq/core` 构建失败

**解决方案**:

1. **确保先构建 qq-protocol 包**
   ```bash
   cd packages/qq-protocol && npm run build
   cd ../core && npm run build
   ```

2. **检查 TypeScript 版本**
   ```bash
   node -v  # 需要 >= 18.0.0
   npm list typescript  # 需要 >= 5.3.0
   ```

### better-sqlite3 安装失败

**症状**: `better-sqlite3` 编译失败

**解决方案**:

```bash
# 安装构建工具
# Ubuntu/Debian
sudo apt install python3 make g++

# Termux
pkg install python make clang

# 然后重新安装
pnpm install
```

## 验证安装

```bash
# 检查依赖是否安装完成
ls -la node_modules/@nebulaqq/

# 应该看到:
# core  qq-protocol  utils  network  module-sdk  adapter-onebot
```

## 手动安装步骤（如果脚本失败）

```bash
# 1. 创建 .npmrc 文件
cat > .npmrc << EOF
registry=https://registry.npmmirror.com/
loglevel=error
progress=false
disable-progress-bar=true
fetch-timeout=60000
optional=false
EOF

# 2. 清理旧文件
rm -rf node_modules packages/*/node_modules pnpm-lock.yaml packages/*/dist

# 3. 安装依赖
pnpm install --prefer-offline

# 4. 构建项目
npm run build
```
