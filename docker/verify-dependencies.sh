#!/bin/bash

# vRain 依赖验证脚本
# 验证所有必需的依赖是否正确安装

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

# 验证系统工具
verify_system_tools() {
    print_info "验证系统工具..."
    
    local tools=("perl" "node" "npm" "convert" "gs" "curl" "nginx")
    local failed=0
    
    for tool in "${tools[@]}"; do
        if command -v "$tool" >/dev/null 2>&1; then
            print_success "$tool 已安装"
        else
            print_error "$tool 未找到"
            failed=1
        fi
    done
    
    return $failed
}

# 验证Perl模块
verify_perl_modules() {
    print_info "验证Perl模块..."
    
    local modules=(
        "PDF::Builder"
        "Font::FreeType"
        "Encode::HanConvert"
        "Image::Magick"
        "Getopt::Std"
        "POSIX"
        "Encode"
    )
    
    local failed=0
    
    for module in "${modules[@]}"; do
        if perl -e "use $module; print 'OK\n';" >/dev/null 2>&1; then
            print_success "Perl模块 $module 已安装"
        else
            print_error "Perl模块 $module 未找到或无法加载"
            failed=1
        fi
    done
    
    return $failed
}

# 验证ImageMagick配置
verify_imagemagick() {
    print_info "验证ImageMagick配置..."
    
    # 检查ImageMagick版本
    if convert -version >/dev/null 2>&1; then
        local version=$(convert -version | head -n1)
        print_success "ImageMagick: $version"
    else
        print_error "ImageMagick convert命令不可用"
        return 1
    fi
    
    # 检查PDF策略
    local policy_files=("/etc/ImageMagick-7/policy.xml" "/etc/ImageMagick-6/policy.xml")
    local pdf_allowed=0
    
    for policy_file in "${policy_files[@]}"; do
        if [ -f "$policy_file" ]; then
            if grep -q 'rights="read|write" pattern="PDF"' "$policy_file"; then
                print_success "PDF处理权限已配置: $policy_file"
                pdf_allowed=1
                break
            fi
        fi
    done
    
    if [ $pdf_allowed -eq 0 ]; then
        print_warning "PDF处理权限可能未正确配置"
    fi
    
    return 0
}

# 验证字体支持
verify_fonts() {
    print_info "验证字体支持..."
    
    # 检查fontconfig
    if fc-list >/dev/null 2>&1; then
        local font_count=$(fc-list | wc -l)
        print_success "fontconfig可用，发现 $font_count 个字体"
    else
        print_error "fontconfig不可用"
        return 1
    fi
    
    # 检查FreeType
    if pkg-config --exists freetype2; then
        local freetype_version=$(pkg-config --modversion freetype2)
        print_success "FreeType版本: $freetype_version"
    else
        print_warning "FreeType pkg-config信息不可用"
    fi
    
    return 0
}

# 验证Node.js环境
verify_nodejs() {
    print_info "验证Node.js环境..."
    
    # 检查Node.js版本
    if node --version >/dev/null 2>&1; then
        local node_version=$(node --version)
        print_success "Node.js版本: $node_version"
        
        # 检查版本是否满足要求（>=18）
        local major_version=$(echo "$node_version" | sed 's/v//' | cut -d'.' -f1)
        if [ "$major_version" -ge 18 ]; then
            print_success "Node.js版本满足要求 (>=18)"
        else
            print_error "Node.js版本过低，需要>=18，当前: $node_version"
            return 1
        fi
    else
        print_error "Node.js不可用"
        return 1
    fi
    
    # 检查npm
    if npm --version >/dev/null 2>&1; then
        local npm_version=$(npm --version)
        print_success "npm版本: $npm_version"
    else
        print_error "npm不可用"
        return 1
    fi
    
    return 0
}

# 验证目录结构
verify_directories() {
    print_info "验证目录结构..."
    
    local dirs=("/app/books" "/app/canvas" "/app/fonts" "/app/tools" "/app/output" "/app/logs")
    local failed=0
    
    for dir in "${dirs[@]}"; do
        if [ -d "$dir" ]; then
            print_success "目录存在: $dir"
        else
            print_warning "目录不存在: $dir"
        fi
    done
    
    return $failed
}

# 验证脚本权限
verify_script_permissions() {
    print_info "验证脚本权限..."
    
    local scripts=(
        "/app/vrain.pl"
        "/app/canvas/canvas.pl"
        "/app/canvas/canvas_vintage.pl"
        "/app/canvas/canvas_bamboo.pl"
        "/app/tools/fontcheck.pl"
        "/app/tools/indentxt.pl"
        "/app/tools/insertimg.pl"
        "/app/tools/chareplace.pl"
        "/app/tools/pdfcompress.pl"
    )
    
    local failed=0
    
    for script in "${scripts[@]}"; do
        if [ -f "$script" ] && [ -x "$script" ]; then
            print_success "脚本可执行: $script"
        elif [ -f "$script" ]; then
            print_warning "脚本存在但不可执行: $script"
        else
            print_warning "脚本不存在: $script"
        fi
    done
    
    return $failed
}

# 主验证函数
main() {
    print_info "=== vRain 依赖验证开始 ==="
    echo
    
    local total_failed=0
    
    verify_system_tools || total_failed=$((total_failed + 1))
    echo
    
    verify_perl_modules || total_failed=$((total_failed + 1))
    echo
    
    verify_imagemagick || total_failed=$((total_failed + 1))
    echo
    
    verify_fonts || total_failed=$((total_failed + 1))
    echo
    
    verify_nodejs || total_failed=$((total_failed + 1))
    echo
    
    verify_directories || total_failed=$((total_failed + 1))
    echo
    
    verify_script_permissions || total_failed=$((total_failed + 1))
    echo
    
    if [ $total_failed -eq 0 ]; then
        print_success "=== 所有依赖验证通过！ ==="
        exit 0
    else
        print_error "=== 发现 $total_failed 个问题，请检查上述错误信息 ==="
        exit 1
    fi
}

# 运行主函数
main "$@"
