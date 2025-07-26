# vRain WebUI 快速开始

## 🚀 一键启动

### 方式一：Docker 部署（推荐）

```bash
# 1. 启动vRain集成服务（包括WebUI）
make up

# 或者使用docker-compose
docker-compose up -d vrain

# 2. 访问WebUI
open http://localhost:3012
```

### 方式二：启动完整环境

```bash
# 启动所有服务（包括独立的背景图生成服务）
make up-all

# 访问WebUI
open http://localhost:3012
```

### 方式三：开发模式

```bash
# 启动WebUI开发环境
make webui-dev

# 或者手动启动
cd webui
./start.sh dev
```

## 📱 访问地址

- **WebUI集成服务**: http://localhost:3012
- **API接口**: http://localhost:3012/api
- **健康检查**: http://localhost:3012/health
- **开发环境前端**: http://localhost:3000 (仅开发模式)

## 🎯 快速体验

### 1. 创建第一个书籍项目

1. 打开 http://localhost:3012
2. 点击"新建书籍"
3. 填写书名和作者
4. 选择背景图模板
5. 点击"创建"

### 2. 上传文本文件

1. 进入书籍详情页
2. 点击"文本管理"
3. 上传 .txt 格式文件
4. 文件名建议：001.txt, 002.txt...

### 3. 生成电子书

1. 点击"生成"按钮
2. 设置页面范围
3. 开始生成
4. 查看进度和下载结果

## 🔧 常用命令

```bash
# 查看所有可用命令
make help

# 启动集成服务
make up

# 启动完整环境
make up-all

# 查看服务状态
make status

# 查看日志
make logs

# WebUI相关
make webui-logs    # 查看WebUI日志
make webui-dev     # 开发模式
make webui-shell   # 进入容器

# 传统命令行方式生成
make run BOOK=01 FROM=1 TO=2 COMPRESS=1
```

## 📁 项目结构

```
vRain/
├── webui/                 # WebUI源码
│   ├── frontend/          # Vue.js前端
│   ├── backend/           # Express.js后端
│   ├── start.sh           # 启动脚本
│   └── WEBUI_GUIDE.md     # 详细文档
├── books/                 # 书籍项目目录
├── canvas/                # 背景图模板
├── fonts/                 # 字体文件
├── output/                # 生成结果
├── docker-compose.yml     # Docker配置
└── Makefile              # 便捷命令
```

## 🆘 故障排除

### 端口冲突
```bash
# 检查端口占用
lsof -i :3012

# 修改端口（编辑docker-compose.yml中的ports配置）
```

### 容器启动失败
```bash
# 查看日志
make webui-logs

# 重新构建
make build
make up
```

### 无法访问WebUI
```bash
# 检查服务状态
make status

# 重启服务
make restart
```

## 📖 更多文档

- [WebUI详细使用指南](webui/WEBUI_GUIDE.md)
- [Docker部署文档](docker-README.md)
- [生产环境指南](PRODUCTION_GUIDE.md)

## 🎉 开始使用

现在您可以通过现代化的Web界面来制作中文古籍风格的电子书了！

访问 http://localhost:3012 开始您的古籍电子书制作之旅。
