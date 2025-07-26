# vRain 生产环境部署指南

## 🚀 一键启动生产环境

### 快速开始

```bash
# 1. 启动完整生产环境
docker-compose up -d

# 2. 检查服务状态
docker-compose ps

# 3. 开始使用
make run BOOK=01 FROM=1 TO=2 COMPRESS=1
```

## 📋 服务架构

生产环境包含两个核心服务：

### vrain 服务
- **功能**: 主要的电子书生成服务
- **容器名**: `vrain-app`
- **状态**: 持续运行，随时可用
- **健康检查**: 每30秒检查Perl环境

### canvas 服务
- **功能**: 背景图生成服务
- **容器名**: `vrain-canvas`
- **状态**: 持续运行，随时可用
- **健康检查**: 每30秒检查canvas目录

## 🛠️ 常用操作

### 生产环境管理

```bash
# 启动所有服务
make up
# 或
docker-compose up -d

# 停止所有服务
make down
# 或
docker-compose down

# 重启服务
make restart
# 或
docker-compose restart

# 查看服务状态
make status
# 或
docker-compose ps

# 查看服务日志
make logs
# 或
docker-compose logs -f
```

### 电子书生成

```bash
# 基本用法
make run BOOK=01 FROM=1 TO=2 COMPRESS=1

# 测试模式 (仅生成5页)
make test BOOK=01

# 详细模式
make run BOOK=01 FROM=1 TO=3 COMPRESS=1 VERBOSE=1

# 直接使用docker-compose
docker-compose exec vrain perl /app/vrain.pl -b 01 -f 1 -t 2 -c
```

### 背景图生成

```bash
# 生成标准背景图
make canvas CONFIG=01_Black

# 生成宣纸做旧风格
make canvas-vintage CONFIG=vintage

# 生成竹简风格
make canvas-bamboo CONFIG=bamboo

# 直接使用docker-compose
docker-compose exec canvas perl /app/canvas/canvas.pl -c 01_Black
```

### 工具命令

```bash
# 检查字体支持
make fontcheck BOOK=01

# 文本格式化
make indentxt BOOK=01

# 进入容器调试
make shell

# 查看vRain帮助
make vrain-help
```

## 📁 目录结构

确保您的项目目录结构如下：

```
vRain/
├── books/              # 书籍数据目录
│   ├── 01/            # 书籍ID目录
│   │   ├── book.cfg   # 书籍配置文件
│   │   ├── text/      # 文本文件目录
│   │   └── cover.jpg  # 封面图片
│   └── ...
├── fonts/             # 字体文件目录
├── canvas/            # 背景图配置目录
├── tools/             # 工具脚本目录
├── output/            # 输出目录 (自动创建)
├── docker-compose.yml # 生产环境配置
└── Makefile          # 便捷命令
```

## 🔧 配置说明

### 卷挂载

生产环境自动挂载以下目录：

- `./books:/app/books` - 书籍数据
- `./fonts:/app/fonts` - 字体文件
- `./canvas:/app/canvas` - 背景图配置
- `./tools:/app/tools` - 工具脚本
- `./output:/app/output` - 输出文件

### 环境变量

- `LANG=C.UTF-8` - 语言环境
- `LC_ALL=C.UTF-8` - 本地化设置

### 健康检查

- **检查间隔**: 30秒
- **超时时间**: 10秒
- **重试次数**: 3次

## 🚨 故障排除

### 常见问题

1. **服务启动失败**
   ```bash
   # 查看详细日志
   docker-compose logs vrain
   docker-compose logs canvas
   
   # 重新构建镜像
   docker-compose up -d --build
   ```

2. **权限问题**
   ```bash
   # 检查文件权限
   ls -la books/ fonts/ canvas/
   
   # 修复权限 (如果需要)
   chmod -R 755 books/ fonts/ canvas/
   ```

3. **字体文件缺失**
   ```bash
   # 检查字体目录
   ls fonts/
   
   # 确保字体文件存在且可读
   ```

4. **内存不足**
   ```bash
   # 检查系统资源
   docker stats
   
   # 如果需要，增加Docker内存限制
   ```

### 调试模式

```bash
# 进入容器进行调试
make shell

# 在容器内手动运行命令
perl vrain.pl -b 01 -f 1 -t 1 -v
perl canvas/canvas.pl -c 01_Black
```

## 📊 性能监控

### 资源使用

```bash
# 查看容器资源使用情况
docker stats vrain-app vrain-canvas

# 查看镜像大小
make size
```

### 日志监控

```bash
# 实时查看日志
make logs

# 查看特定服务日志
docker-compose logs -f vrain
docker-compose logs -f canvas
```

## 🔄 更新和维护

### 更新镜像

```bash
# 停止服务
make down

# 重新构建镜像
make build

# 启动服务
make up
```

### 清理资源

```bash
# 清理所有Docker资源
make clean

# 仅清理未使用的镜像
docker image prune -f
```

## 🎯 生产环境最佳实践

1. **定期备份**: 备份books目录和fonts目录
2. **监控日志**: 定期检查服务日志
3. **资源监控**: 监控CPU和内存使用情况
4. **更新策略**: 在非高峰时间进行更新
5. **测试验证**: 更新后进行功能测试

## 📞 技术支持

如果遇到问题，请：

1. 查看服务日志: `make logs`
2. 检查服务状态: `make status`
3. 尝试重启服务: `make restart`
4. 重新构建镜像: `make down && make build && make up`

---

**恭喜！您的vRain生产环境已经成功部署！** 🎉
