#!/bin/bash

# vRain WebUI 启动脚本
# 用于快速启动WebUI开发或生产环境

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印带颜色的消息
print_message() {
    echo -e "${2}${1}${NC}"
}

print_success() {
    print_message "$1" "$GREEN"
}

print_error() {
    print_message "$1" "$RED"
}

print_warning() {
    print_message "$1" "$YELLOW"
}

print_info() {
    print_message "$1" "$BLUE"
}

# 检查Docker是否安装
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker未安装，请先安装Docker"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose未安装，请先安装Docker Compose"
        exit 1
    fi
}

# 检查Node.js是否安装（开发模式需要）
check_nodejs() {
    if ! command -v node &> /dev/null; then
        print_error "Node.js未安装，请先安装Node.js 18+"
        exit 1
    fi
    
    local node_version=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$node_version" -lt 18 ]; then
        print_error "Node.js版本过低，需要18+版本"
        exit 1
    fi
}

# 安装依赖
install_dependencies() {
    print_info "安装前端依赖..."
    cd frontend
    npm install
    cd ..
    
    print_info "安装后端依赖..."
    cd backend
    npm install
    cd ..
}

# 构建前端
build_frontend() {
    print_info "构建前端应用..."
    cd frontend
    npm run build
    cd ..
}

# 启动开发环境
start_dev() {
    print_info "启动开发环境..."
    
    check_nodejs
    
    # 检查是否已安装依赖
    if [ ! -d "frontend/node_modules" ] || [ ! -d "backend/node_modules" ]; then
        install_dependencies
    fi
    
    # 启动后端
    print_info "启动后端服务..."
    cd backend
    npm run dev &
    BACKEND_PID=$!
    cd ..
    
    # 等待后端启动
    sleep 3
    
    # 启动前端
    print_info "启动前端服务..."
    cd frontend
    npm run dev &
    FRONTEND_PID=$!
    cd ..
    
    print_success "开发环境已启动！"
    print_info "前端地址: http://localhost:3000"
    print_info "后端地址: http://localhost:3001"
    print_info "按 Ctrl+C 停止服务"
    
    # 等待用户中断
    trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT
    wait
}

# 启动生产环境
start_prod() {
    print_info "启动生产环境..."

    check_docker

    # 构建并启动服务
    cd ..
    docker-compose up -d vrain

    print_success "生产环境已启动！"
    print_info "WebUI地址: http://localhost:3012"
    print_info "API地址: http://localhost:3012/api"

    # 显示服务状态
    docker-compose ps vrain
}

# 停止服务
stop_services() {
    print_info "停止WebUI服务..."

    cd ..
    docker-compose stop vrain

    print_success "服务已停止"
}

# 查看日志
show_logs() {
    cd ..
    docker-compose logs -f vrain
}

# 重启服务
restart_services() {
    print_info "重启WebUI服务..."

    cd ..
    docker-compose restart vrain

    print_success "服务已重启"
}

# 显示帮助信息
show_help() {
    echo "vRain WebUI 启动脚本"
    echo ""
    echo "用法: $0 [命令]"
    echo ""
    echo "命令:"
    echo "  dev      启动开发环境（需要Node.js）"
    echo "  prod     启动生产环境（使用Docker）"
    echo "  stop     停止服务"
    echo "  restart  重启服务"
    echo "  logs     查看日志"
    echo "  build    构建前端应用"
    echo "  install  安装依赖"
    echo "  help     显示此帮助信息"
    echo ""
    echo "示例:"
    echo "  $0 dev      # 启动开发环境"
    echo "  $0 prod     # 启动生产环境"
    echo "  $0 logs     # 查看服务日志"
}

# 主函数
main() {
    case "${1:-help}" in
        "dev")
            start_dev
            ;;
        "prod")
            start_prod
            ;;
        "stop")
            stop_services
            ;;
        "restart")
            restart_services
            ;;
        "logs")
            show_logs
            ;;
        "build")
            build_frontend
            ;;
        "install")
            install_dependencies
            ;;
        "help"|*)
            show_help
            ;;
    esac
}

# 检查是否在webui目录中
if [ ! -f "README.md" ] || [ ! -d "frontend" ] || [ ! -d "backend" ]; then
    print_error "请在webui目录中运行此脚本"
    exit 1
fi

main "$@"
