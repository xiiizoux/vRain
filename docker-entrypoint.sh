#!/bin/bash

# vRain Docker 入口脚本
# 提供便捷的命令行接口来使用vRain工具

set -e

# 显示帮助信息
show_help() {
    cat << EOF
vRain Docker 容器使用说明

基本用法:
  docker run --rm -v \$(pwd)/books:/app/books -v \$(pwd)/output:/app/output vrain [选项]

或使用 docker-compose:
  docker-compose run --rm vrain [选项]

vRain 主程序选项:
  --help, -h          显示vRain帮助信息
  --book, -b <ID>     指定书籍ID (必需)
  --from, -f <NUM>    起始文本序号 (默认: 1)
  --to, -t <NUM>      结束文本序号 (默认: 1)
  --compress, -c      压缩生成的PDF文件
  --test, -z <NUM>    测试模式，仅生成指定页数
  --verbose, -v       显示详细信息

工具命令:
  canvas <config>     生成背景图
    例: canvas 01_Black

  fontcheck [选项]    检查字体支持情况
    -f <NUM>          起始文本序号
    -t <NUM>          结束文本序号

  indentxt [选项]     文本缩进格式化
    -f <NUM>          起始文本序号  
    -t <NUM>          结束文本序号

  insertimg <PDF>     插入图片到PDF

示例:
  # 生成书籍 (书籍ID为01，文本1-3)
  docker-compose run --rm vrain -b 01 -f 1 -t 3 -c

  # 生成背景图
  docker-compose run --rm canvas-generator canvas 01_Black

  # 检查字体支持
  docker-compose run --rm vrain fontcheck -f 1 -t 1

  # 开发模式 (进入容器shell)
  docker-compose run --rm vrain-dev bash

EOF
}

# 处理特殊命令
case "$1" in
    --help|-h|help)
        show_help
        exit 0
        ;;
    canvas)
        shift
        cd /app/canvas
        if [ -z "$1" ]; then
            echo "错误: 请指定背景图配置ID"
            echo "用法: canvas <config_id>"
            echo "例如: canvas 01_Black"
            exit 1
        fi
        exec perl canvas.pl -c "$1"
        ;;
    canvas-vintage)
        shift
        cd /app/canvas
        if [ -z "$1" ]; then
            echo "错误: 请指定背景图配置ID"
            echo "用法: canvas-vintage <config_id>"
            exit 1
        fi
        exec perl canvas_vintage.pl -c "$1"
        ;;
    canvas-bamboo)
        shift
        cd /app/canvas
        if [ -z "$1" ]; then
            echo "错误: 请指定背景图配置ID"
            echo "用法: canvas-bamboo <config_id>"
            exit 1
        fi
        exec perl canvas_bamboo.pl -c "$1"
        ;;
    fontcheck)
        shift
        if [ ! -f "book.cfg" ]; then
            echo "错误: 当前目录下未找到 book.cfg 文件"
            echo "请确保在正确的书籍目录下运行此命令"
            exit 1
        fi
        cd /app/tools
        exec perl fontcheck.pl "$@"
        ;;
    indentxt)
        shift
        if [ ! -f "book.cfg" ]; then
            echo "错误: 当前目录下未找到 book.cfg 文件"
            echo "请确保在正确的书籍目录下运行此命令"
            exit 1
        fi
        cd /app/tools
        exec perl indentxt.pl "$@"
        ;;
    insertimg)
        shift
        if [ ! -f "book.cfg" ]; then
            echo "错误: 当前目录下未找到 book.cfg 文件"
            echo "请确保在正确的书籍目录下运行此命令"
            exit 1
        fi
        cd /app/tools
        exec perl insertimg.pl "$@"
        ;;
    bash|sh|shell)
        exec /bin/bash
        ;;
    *)
        # 默认运行vRain主程序
        exec perl /app/vrain.pl "$@"
        ;;
esac
