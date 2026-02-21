@echo off
chcp 65001 >nul
echo === 清理 pnpm 缓存和 node_modules ===

:: 删除 node_modules
if exist node_modules rmdir /s /q node_modules
for /d /r %%d in (node_modules) do @if exist "%%d" rmdir /s /q "%%d"

:: 删除 pnpm-lock.yaml
if exist pnpm-lock.yaml del /q pnpm-lock.yaml
for /d /r %%d in (pnpm-lock.yaml) do @if exist "%%d" del /q "%%d"

:: 删除 dist 目录
for /d /r %%d in (dist) do @if exist "%%d" rmdir /s /q "%%d"

:: 清理 pnpm 缓存
call pnpm store prune

echo === 清理完成 ===
echo === 开始安装依赖 ===

:: 使用国内镜像安装
call pnpm install --registry=https://registry.npmmirror.com/ --prefer-offline

echo === 安装完成 ===
pause
