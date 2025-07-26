#!/bin/bash

# vRain 集成启动脚本
# 启动vRain核心服务和WebUI

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

# 检查环境变量
check_env() {
    print_info "检查环境变量..."
    
    # 设置默认值
    export NODE_ENV=${NODE_ENV:-production}
    export WEBUI_PORT=${WEBUI_PORT:-3001}
    export NGINX_PORT=${NGINX_PORT:-3012}
    export VRAIN_ROOT=${VRAIN_ROOT:-/app}
    
    print_info "NODE_ENV: $NODE_ENV"
    print_info "WEBUI_PORT: $WEBUI_PORT"
    print_info "NGINX_PORT: $NGINX_PORT"
    print_info "VRAIN_ROOT: $VRAIN_ROOT"
}

# 初始化目录
init_directories() {
    print_info "初始化目录结构..."
    
    mkdir -p /app/logs/webui
    mkdir -p /app/output
    mkdir -p /var/log/nginx
    mkdir -p /var/lib/nginx/tmp
    mkdir -p /run/nginx
    
    # 设置权限
    chown -R nginx:nginx /var/log/nginx
    chown -R nginx:nginx /var/lib/nginx
    chown -R nginx:nginx /run/nginx
}

# 启动WebUI后端
start_webui_backend() {
    print_info "启动WebUI后端服务..."
    
    cd /app/webui/backend
    
    # 设置环境变量
    export PORT=$WEBUI_PORT
    export HOST=127.0.0.1
    export VRAIN_ROOT=/app
    
    # 启动后端服务
    node src/app.js &
    WEBUI_PID=$!
    
    print_success "WebUI后端服务已启动 (PID: $WEBUI_PID)"
    
    # 等待服务启动
    sleep 3
    
    # 检查服务是否正常启动
    if ! curl -f http://127.0.0.1:$WEBUI_PORT/api/health >/dev/null 2>&1; then
        print_warning "WebUI后端服务启动检查失败，继续启动..."
    else
        print_success "WebUI后端服务健康检查通过"
    fi
}

# 启动Nginx
start_nginx() {
    print_info "启动Nginx服务..."
    
    # 测试nginx配置
    if ! nginx -t; then
        print_error "Nginx配置测试失败"
        exit 1
    fi
    
    # 启动nginx
    nginx -g "daemon off;" &
    NGINX_PID=$!
    
    print_success "Nginx服务已启动 (PID: $NGINX_PID)"
    
    # 等待服务启动
    sleep 2
    
    # 检查服务是否正常启动
    if ! curl -f http://127.0.0.1:$NGINX_PORT/health >/dev/null 2>&1; then
        print_warning "Nginx服务启动检查失败，继续启动..."
    else
        print_success "Nginx服务健康检查通过"
    fi
}

# 信号处理
cleanup() {
    print_info "正在停止服务..."
    
    if [ ! -z "$NGINX_PID" ]; then
        kill $NGINX_PID 2>/dev/null || true
        print_info "Nginx服务已停止"
    fi
    
    if [ ! -z "$WEBUI_PID" ]; then
        kill $WEBUI_PID 2>/dev/null || true
        print_info "WebUI后端服务已停止"
    fi
    
    print_success "所有服务已停止"
    exit 0
}

# 设置信号处理
trap cleanup SIGTERM SIGINT

# 主函数
main() {
    print_success "=== vRain 集成服务启动 ==="
    
    check_env
    init_directories
    start_webui_backend
    start_nginx
    
    print_success "=== 所有服务启动完成 ==="
    print_info "WebUI访问地址: http://localhost:$NGINX_PORT"
    print_info "API地址: http://localhost:$NGINX_PORT/api"
    print_info "按 Ctrl+C 停止所有服务"
    
    # 保持脚本运行
    while true; do
        # 检查进程是否还在运行
        if [ ! -z "$WEBUI_PID" ] && ! kill -0 $WEBUI_PID 2>/dev/null; then
            print_error "WebUI后端服务异常退出"
            cleanup
        fi
        
        if [ ! -z "$NGINX_PID" ] && ! kill -0 $NGINX_PID 2>/dev/null; then
            print_error "Nginx服务异常退出"
            cleanup
        fi
        
        sleep 10
    done
}

# 如果是传统vRain命令，直接执行
if [ "$1" = "vrain" ] || [ "$1" = "perl" ]; then
    print_info "执行vRain命令: $@"
    exec "$@"
elif [ "$1" = "bash" ] || [ "$1" = "sh" ]; then
    print_info "启动Shell: $@"
    exec "$@"
else
    # 启动集成服务
    main
fi
