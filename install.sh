#!/bin/bash
# NebulaQQ 清理和安装脚本

echo "=== 清理 pnpm 缓存和 node_modules ==="

# 删除所有 node_modules
find . -type d -name "node_modules" -exec rm -rf {} + 2>/dev/null

# 删除所有 pnpm-lock.yaml
find . -name "pnpm-lock.yaml" -delete 2>/dev/null

# 删除所有 dist 目录
find . -type d -name "dist" -exec rm -rf {} + 2>/dev/null

# 清理 pnpm 全局缓存
pnpm store prune 2>/dev/null || true

echo "=== 清理完成 ==="
echo "=== 开始安装依赖 ==="

# 使用国内镜像安装
pnpm install --registry=https://registry.npmmirror.com/ --prefer-offline

echo "=== 安装完成 ==="
