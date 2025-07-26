#!/bin/bash

# vRain Docker构建测试脚本
# 用于验证Docker镜像构建和基本功能

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
    print_message "✓ $1" "$GREEN"
}

print_error() {
    print_message "✗ $1" "$RED"
}

print_warning() {
    print_message "⚠ $1" "$YELLOW"
}

print_info() {
    print_message "ℹ $1" "$BLUE"
}

# 清理函数
cleanup() {
    print_info "清理测试环境..."
    docker-compose down >/dev/null 2>&1 || true
    docker rmi vrain-test >/dev/null 2>&1 || true
}

# 设置清理陷阱
trap cleanup EXIT

# 构建测试
test_build() {
    print_info "开始构建测试..."
    
    # 构建主镜像
    print_info "构建主镜像 (Dockerfile)..."
    if docker build -t vrain-test -f Dockerfile .; then
        print_success "主镜像构建成功"
    else
        print_error "主镜像构建失败"
        return 1
    fi
    
    # 构建Alpine镜像
    print_info "构建Alpine镜像 (Dockerfile.alpine)..."
    if docker build -t vrain-alpine-test -f Dockerfile.alpine .; then
        print_success "Alpine镜像构建成功"
    else
        print_error "Alpine镜像构建失败"
        return 1
    fi
    
    return 0
}

# 依赖测试
test_dependencies() {
    print_info "测试依赖..."
    
    # 测试主镜像依赖
    print_info "测试主镜像依赖..."
    if docker run --rm vrain-test /app/docker/verify-dependencies.sh; then
        print_success "主镜像依赖验证通过"
    else
        print_error "主镜像依赖验证失败"
        return 1
    fi
    
    # 测试Alpine镜像依赖
    print_info "测试Alpine镜像依赖..."
    if docker run --rm vrain-alpine-test /app/docker/verify-dependencies.sh; then
        print_success "Alpine镜像依赖验证通过"
    else
        print_error "Alpine镜像依赖验证失败"
        return 1
    fi
    
    return 0
}

# 功能测试
test_functionality() {
    print_info "测试基本功能..."
    
    # 测试vRain帮助
    print_info "测试vRain帮助命令..."
    if docker run --rm vrain-test perl /app/vrain.pl --help >/dev/null 2>&1; then
        print_success "vRain帮助命令正常"
    else
        print_error "vRain帮助命令失败"
        return 1
    fi
    
    # 测试Perl模块加载
    print_info "测试Perl模块加载..."
    local modules=("PDF::Builder" "Font::FreeType" "Encode::HanConvert" "Image::Magick")
    
    for module in "${modules[@]}"; do
        if docker run --rm vrain-test perl -e "use $module; print 'OK\n';" >/dev/null 2>&1; then
            print_success "Perl模块 $module 加载正常"
        else
            print_error "Perl模块 $module 加载失败"
            return 1
        fi
    done
    
    # 测试ImageMagick
    print_info "测试ImageMagick..."
    if docker run --rm vrain-test convert -version >/dev/null 2>&1; then
        print_success "ImageMagick正常"
    else
        print_error "ImageMagick失败"
        return 1
    fi
    
    return 0
}

# WebUI测试
test_webui() {
    print_info "测试WebUI组件..."
    
    # 检查前端构建产物
    print_info "检查前端构建产物..."
    if docker run --rm vrain-test test -d /app/webui/frontend/dist; then
        print_success "前端构建产物存在"
    else
        print_error "前端构建产物不存在"
        return 1
    fi
    
    # 检查后端依赖
    print_info "检查后端依赖..."
    if docker run --rm vrain-test test -f /app/webui/backend/package.json; then
        print_success "后端package.json存在"
    else
        print_error "后端package.json不存在"
        return 1
    fi
    
    return 0
}

# 镜像大小检查
check_image_size() {
    print_info "检查镜像大小..."
    
    local main_size=$(docker images vrain-test --format "{{.Size}}")
    local alpine_size=$(docker images vrain-alpine-test --format "{{.Size}}")
    
    print_info "主镜像大小: $main_size"
    print_info "Alpine镜像大小: $alpine_size"
    
    # 检查镜像是否过大（超过2GB警告）
    local main_size_mb=$(docker images vrain-test --format "{{.Size}}" | sed 's/GB/000/g' | sed 's/MB//g' | cut -d'.' -f1)
    if [ "$main_size_mb" -gt 2000 ]; then
        print_warning "主镜像较大 ($main_size)，考虑优化"
    else
        print_success "主镜像大小合理 ($main_size)"
    fi
}

# 主测试函数
main() {
    print_info "=== vRain Docker构建测试开始 ==="
    echo
    
    local failed=0
    
    # 构建测试
    if ! test_build; then
        failed=1
    fi
    echo
    
    # 依赖测试
    if ! test_dependencies; then
        failed=1
    fi
    echo
    
    # 功能测试
    if ! test_functionality; then
        failed=1
    fi
    echo
    
    # WebUI测试
    if ! test_webui; then
        failed=1
    fi
    echo
    
    # 镜像大小检查
    check_image_size
    echo
    
    if [ $failed -eq 0 ]; then
        print_success "=== 所有测试通过！ ==="
        print_info "镜像已准备就绪，可以使用以下命令启动："
        print_info "  docker-compose up -d"
        exit 0
    else
        print_error "=== 测试失败，请检查上述错误信息 ==="
        exit 1
    fi
}

# 显示帮助
show_help() {
    cat << EOF
vRain Docker构建测试脚本

用法: $0 [选项]

选项:
  -h, --help     显示此帮助信息
  --build-only   仅执行构建测试
  --deps-only    仅执行依赖测试
  --func-only    仅执行功能测试
  --no-cleanup   测试完成后不清理镜像

示例:
  $0                # 运行完整测试
  $0 --build-only   # 仅测试构建
  $0 --deps-only    # 仅测试依赖
EOF
}

# 解析命令行参数
BUILD_ONLY=0
DEPS_ONLY=0
FUNC_ONLY=0
NO_CLEANUP=0

while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        --build-only)
            BUILD_ONLY=1
            shift
            ;;
        --deps-only)
            DEPS_ONLY=1
            shift
            ;;
        --func-only)
            FUNC_ONLY=1
            shift
            ;;
        --no-cleanup)
            NO_CLEANUP=1
            trap - EXIT
            shift
            ;;
        *)
            print_error "未知选项: $1"
            show_help
            exit 1
            ;;
    esac
done

# 根据参数执行相应测试
if [ $BUILD_ONLY -eq 1 ]; then
    test_build
elif [ $DEPS_ONLY -eq 1 ]; then
    test_dependencies
elif [ $FUNC_ONLY -eq 1 ]; then
    test_functionality
else
    main
fi
