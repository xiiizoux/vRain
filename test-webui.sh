#!/bin/bash

# vRain WebUI 测试脚本
# 用于验证重构后的Docker构建和WebUI功能

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

# 检查Docker是否运行
check_docker() {
    if ! docker info >/dev/null 2>&1; then
        print_error "Docker未运行，请启动Docker"
        exit 1
    fi
    print_success "Docker检查通过"
}

# 清理旧容器
cleanup() {
    print_info "清理旧容器和镜像..."
    docker-compose down --remove-orphans 2>/dev/null || true
    docker system prune -f >/dev/null 2>&1 || true
    print_success "清理完成"
}

# 构建镜像
build_image() {
    print_info "构建vRain集成镜像..."
    if docker-compose build vrain; then
        print_success "镜像构建成功"
    else
        print_error "镜像构建失败"
        exit 1
    fi
}

# 启动服务
start_service() {
    print_info "启动vRain集成服务..."
    if docker-compose up -d vrain; then
        print_success "服务启动成功"
    else
        print_error "服务启动失败"
        exit 1
    fi
}

# 等待服务就绪
wait_for_service() {
    print_info "等待服务就绪..."
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f http://localhost:3012/health >/dev/null 2>&1; then
            print_success "服务就绪"
            return 0
        fi
        
        print_info "等待中... ($attempt/$max_attempts)"
        sleep 2
        attempt=$((attempt + 1))
    done
    
    print_error "服务启动超时"
    return 1
}

# 测试API接口
test_api() {
    print_info "测试API接口..."
    
    # 测试健康检查
    if curl -f http://localhost:3012/health >/dev/null 2>&1; then
        print_success "健康检查接口正常"
    else
        print_error "健康检查接口失败"
        return 1
    fi
    
    # 测试API基础接口
    if curl -f http://localhost:3012/api/health >/dev/null 2>&1; then
        print_success "API接口正常"
    else
        print_error "API接口失败"
        return 1
    fi
    
    # 测试书籍列表接口
    if curl -f http://localhost:3012/api/books >/dev/null 2>&1; then
        print_success "书籍列表接口正常"
    else
        print_warning "书籍列表接口可能需要数据初始化"
    fi
}

# 测试WebUI界面
test_webui() {
    print_info "测试WebUI界面..."
    
    # 测试主页
    if curl -f http://localhost:3012/ >/dev/null 2>&1; then
        print_success "WebUI主页正常"
    else
        print_error "WebUI主页访问失败"
        return 1
    fi
    
    # 测试静态资源
    local response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3012/)
    if [ "$response" = "200" ]; then
        print_success "WebUI响应正常 (HTTP $response)"
    else
        print_warning "WebUI响应异常 (HTTP $response)"
    fi
}

# 显示服务信息
show_service_info() {
    print_info "服务信息："
    echo "  WebUI地址: http://localhost:3012"
    echo "  API地址: http://localhost:3012/api"
    echo "  健康检查: http://localhost:3012/health"
    echo ""
    
    print_info "容器状态："
    docker-compose ps
    echo ""
    
    print_info "端口监听："
    netstat -tlnp 2>/dev/null | grep :3012 || echo "  端口3012未监听"
}

# 显示日志
show_logs() {
    print_info "最近的服务日志："
    docker-compose logs --tail=20 vrain
}

# 主函数
main() {
    print_success "=== vRain WebUI 测试开始 ==="
    
    check_docker
    cleanup
    build_image
    start_service
    
    if wait_for_service; then
        test_api
        test_webui
        show_service_info
        
        print_success "=== 测试完成 ==="
        print_info "WebUI已启动，访问 http://localhost:3012"
        print_info "使用 'docker-compose logs -f vrain' 查看日志"
        print_info "使用 'docker-compose down' 停止服务"
    else
        print_error "=== 测试失败 ==="
        show_logs
        exit 1
    fi
}

# 清理函数
cleanup_on_exit() {
    if [ "$1" != "keep" ]; then
        print_info "清理测试环境..."
        docker-compose down >/dev/null 2>&1 || true
    fi
}

# 设置退出处理
trap 'cleanup_on_exit' EXIT

# 检查参数
if [ "$1" = "--keep" ]; then
    trap 'cleanup_on_exit keep' EXIT
    print_info "测试完成后将保持服务运行"
fi

# 运行测试
main
