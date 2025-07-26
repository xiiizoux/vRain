# vRain Docker 生产环境使用指南

本文档介绍如何使用Docker运行vRain中文古籍刻本风格电子书制作工具的生产环境。

## 🚀 一键启动生产环境

### 最简单的方式

```bash
# 一键启动完整生产环境
docker-compose up -d

# 或使用Makefile
make up
```

这将自动：
- 构建优化的Alpine镜像 (382MB)
- 启动vRain主服务
- 启动背景图生成服务
- 配置所有必要的卷挂载
- 设置健康检查

## 服务架构

生产环境包含两个核心服务：

1. **vrain** - 主要的电子书生成服务
2. **canvas** - 背景图生成服务

## 快速开始

### 1. 启动生产环境

```bash
# 启动所有服务
make up

# 检查服务状态
make status

# 查看服务日志
make logs
```

### 2. 电子书生成

#### 使用Makefile (推荐)

```bash
# 生成电子书 (基本用法)
make run BOOK=01 FROM=1 TO=2 COMPRESS=1

# 测试模式 (仅生成5页)
make test BOOK=01

# 生成背景图
make canvas CONFIG=01_Black

# 检查字体支持
make fontcheck BOOK=01

# 进入容器调试
make shell
```

#### 使用Docker Compose

```bash
# 生成电子书
docker-compose exec vrain perl /app/vrain.pl -b 01 -f 1 -t 2 -c

# 生成背景图
docker-compose exec canvas perl /app/canvas/canvas.pl -c 01_Black

# 检查字体支持
docker-compose exec vrain perl /app/tools/fontcheck.pl -f 1 -t 1
```

## 详细功能

### 主要命令

1. **生成电子书**
   ```bash
   docker-compose run --rm vrain -b <书籍ID> -f <起始> -t <结束> [选项]
   ```

2. **生成背景图**
   ```bash
   # 普通背景图
   docker-compose run --rm canvas-generator canvas <配置ID>
   
   # 宣纸做旧风格
   docker-compose run --rm canvas-generator canvas-vintage <配置ID>
   
   # 竹简风格  
   docker-compose run --rm canvas-generator canvas-bamboo <配置ID>
   ```

3. **字体检查工具**
   ```bash
   docker-compose run --rm vrain fontcheck -f 1 -t 1
   ```

4. **文本格式化工具**
   ```bash
   docker-compose run --rm vrain indentxt -f 1 -t 1
   ```

### 目录结构

确保您的项目目录结构如下：

```
vRain/
├── books/           # 书籍目录
│   ├── 01/         # 书籍ID目录
│   │   ├── book.cfg    # 书籍配置
│   │   ├── text/       # 文本文件
│   │   └── cover.jpg   # 封面图片
│   └── ...
├── fonts/          # 字体文件
├── canvas/         # 背景图配置和生成
├── tools/          # 工具脚本
├── output/         # 输出目录 (可选)
└── docker-compose.yml
```

### 环境配置

#### 服务说明

- **vrain**: 主要的电子书生成服务
- **vrain-dev**: 开发环境，可进入容器进行调试
- **canvas-generator**: 背景图生成服务

#### 卷挂载

- `./books:/app/books` - 书籍数据
- `./fonts:/app/fonts` - 字体文件
- `./canvas:/app/canvas` - 背景图配置
- `./tools:/app/tools` - 工具脚本
- `./output:/app/output` - 输出目录

## 使用示例

### 完整的电子书制作流程

```bash
# 1. 生成背景图
docker-compose run --rm canvas-generator canvas 01_Black

# 2. 检查字体支持情况 (可选)
docker-compose run --rm vrain fontcheck -f 1 -t 3

# 3. 生成电子书
docker-compose run --rm vrain -b 01 -f 1 -t 3 -c

# 4. 查看生成的PDF文件
ls books/01/*.pdf
```

### 测试模式

```bash
# 仅生成前5页用于测试排版参数
docker-compose run --rm vrain -b 01 -f 1 -t 1 -z 5
```

### 开发调试

```bash
# 进入开发容器
docker-compose run --rm vrain-dev bash

# 在容器内可以直接运行Perl脚本
perl vrain.pl -h
perl canvas/canvas.pl -c 01_Black
```

## 故障排除

### 常见问题

1. **权限问题**
   ```bash
   # 确保脚本有执行权限
   chmod +x docker-entrypoint.sh
   ```

2. **字体文件缺失**
   ```bash
   # 确保fonts目录包含所需字体文件
   ls fonts/
   ```

3. **ImageMagick PDF策略问题**
   - Docker镜像已自动配置PDF处理权限

4. **中文编码问题**
   - 容器已设置UTF-8编码环境

### 查看日志

```bash
# 查看详细输出
docker-compose run --rm vrain -b 01 -f 1 -t 1 -v
```

## 性能优化

1. **使用.dockerignore**减少构建上下文
2. **挂载卷**避免重复复制大文件
3. **多阶段构建**可进一步减小镜像大小

## 注意事项

1. 确保书籍配置文件`book.cfg`正确设置
2. 文本文件需要UTF-8编码
3. 字体文件路径要与配置文件匹配
4. 生成的PDF文件会保存在对应的书籍目录下
