#!/bin/bash

# NebulaQQ 一键安装和启动脚本
# 支持 Linux、macOS、Windows (Git Bash)、Termux (ARM64)

set -e

# 获取脚本所在目录并切换过去
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印带颜色的消息
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检测系统架构
detect_arch() {
    ARCH=$(uname -m)
    case $ARCH in
        x86_64|amd64)
            ARCH_NAME="x64"
            ;;
        aarch64|arm64)
            ARCH_NAME="arm64"
            ;;
        armv7l|armhf)
            ARCH_NAME="arm"
            ;;
        *)
            ARCH_NAME="unknown"
            ;;
    esac
    print_info "检测到系统架构：$ARCH_NAME ($ARCH)"
}

# 检测 Node.js
check_node() {
    if ! command -v node &> /dev/null; then
        print_error "未检测到 Node.js，请先安装 Node.js >= 18.0.0"
        print_info "访问 https://nodejs.org/ 下载安装"
        print_info "Termux 用户请运行：pkg install nodejs"
        exit 1
    fi
    
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js 版本过低 ($NODE_VERSION)，需要 >= 18.0.0"
        exit 1
    fi
    
    print_success "Node.js 版本：$(node -v)"
}

# 检测包管理器
check_package_manager() {
    if command -v pnpm &> /dev/null; then
        PM="pnpm"
        print_success "使用 pnpm 作为包管理器"
    elif command -v npm &> /dev/null; then
        PM="npm"
        print_warning "未检测到 pnpm，使用 npm 作为包管理器（建议使用 pnpm）"
        print_info "安装 pnpm: npm install -g pnpm"
    else
        print_error "未检测到 npm 或 pnpm"
        exit 1
    fi
}

# 安装依赖
install_dependencies() {
    print_info "开始安装依赖..."

    # 清理旧的 node_modules (可选)
    if [ -d "node_modules" ]; then
        print_info "检测到旧的 node_modules，建议先清理"
        read -p "是否清理 node_modules? (y/N): " clean_choice
        if [ "$clean_choice" = "y" ] || [ "$clean_choice" = "Y" ]; then
            rm -rf node_modules package-lock.json pnpm-lock.yaml
            print_info "已清理旧的依赖"
        fi
    fi

    # 安装依赖
    print_info "运行 $PM install..."
    if [ "$PM" = "pnpm" ]; then
        $PM install --no-frozen-lockfile
    else
        $PM install --legacy-peer-deps
    fi

    print_success "依赖安装完成"
}

# 构建项目
build_project() {
    print_info "开始构建项目..."
    $PM run build
    print_success "项目构建完成"
}

# 创建示例项目
create_example() {
    print_info "准备运行示例..."
    
    cd examples/basic
    
    print_info "安装示例依赖..."
    $PM install --legacy-peer-deps
    
    cd ../..
}

# 运行示例
run_example() {
    print_info "启动 NebulaQQ 示例机器人..."
    print_warning "请确保已配置好 OneBot 服务 (如 NapCatQQ)"
    print_info "默认配置：ws://127.0.0.1:3000"
    
    cd examples/basic
    
    # 检查 ts-node
    if ! $PM list ts-node &> /dev/null 2>&1; then
        print_warning "安装 ts-node..."
        $PM install -D ts-node
    fi
    
    print_success "启动机器人..."
    print_info "按 Ctrl+C 停止机器人"
    
    node --loader ts-node/esm index.ts
}

# 显示使用说明
show_usage() {
    echo ""
    echo "========================================"
    echo "  NebulaQQ 一键安装和启动脚本"
    echo "========================================"
    echo ""
    echo "用法：$0 [选项]"
    echo ""
    echo "选项:"
    echo "  install     仅安装依赖"
    echo "  build       仅构建项目"
    echo "  run         运行示例机器人"
    echo "  all         安装 + 构建 + 运行 (默认)"
    echo "  clean       清理构建产物"
    echo "  help        显示此帮助信息"
    echo ""
    echo "示例:"
    echo "  $0          # 完整流程"
    echo "  $0 install  # 仅安装依赖"
    echo "  $0 run      # 运行示例"
    echo ""
    echo "Termux (ARM64) 用户:"
    echo "  1. 先安装 Node.js: pkg install nodejs"
    echo "  2. 然后运行：$0 all"
    echo ""
}

# 清理构建产物
clean() {
    print_info "清理构建产物..."
    
    for dir in packages/*/dist; do
        if [ -d "$dir" ]; then
            rm -rf "$dir"
            print_info "清理：$dir"
        fi
    done
    
    # 清理 node_modules (可选)
    read -p "是否清理 node_modules? (y/N): " clean_choice
    if [ "$clean_choice" = "y" ] || [ "$clean_choice" = "Y" ]; then
        rm -rf node_modules package-lock.json packages/*/node_modules examples/*/node_modules
        print_success "已清理所有 node_modules"
    fi
    
    print_success "清理完成"
}

# 主函数
main() {
    echo ""
    echo "🌌 NebulaQQ - 新一代 QQ 机器人框架"
    echo "========================================"
    echo ""
    
    # 解析参数
    case "${1:-all}" in
        install)
            detect_arch
            check_node
            check_package_manager
            install_dependencies
            ;;
        build)
            detect_arch
            check_node
            check_package_manager
            build_project
            ;;
        run)
            detect_arch
            check_node
            check_package_manager
            create_example
            run_example
            ;;
        all)
            detect_arch
            check_node
            check_package_manager
            install_dependencies
            build_project
            create_example
            run_example
            ;;
        clean)
            clean
            ;;
        help|--help|-h)
            show_usage
            ;;
        *)
            print_error "未知选项：$1"
            show_usage
            exit 1
            ;;
    esac
}

# 运行主函数
main "$@"
