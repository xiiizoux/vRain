# vRain WebUI

现代化的vRain中文古籍刻本风格电子书制作工具Web界面。

## 功能特性

- 📚 **书籍管理** - 可视化管理书籍项目，支持创建、编辑、删除
- ⚙️ **配置编辑** - 图形化编辑书籍配置和背景图配置
- 🎨 **背景图生成** - 支持多种风格的背景图生成（普通、宣纸做旧、竹简）
- 📖 **电子书生成** - 一键生成PDF电子书，支持批量处理
- 📊 **任务监控** - 实时查看生成进度和日志
- 🔧 **工具集成** - 集成字体检查、文本格式化等工具

## 技术栈

### 前端
- **Vue.js 3** - 现代化的前端框架
- **Vite** - 快速的构建工具
- **Element Plus** - 优美的UI组件库
- **Pinia** - 状态管理
- **Vue Router** - 路由管理

### 后端
- **Express.js** - Node.js Web框架
- **Multer** - 文件上传处理
- **Socket.io** - 实时通信
- **Node.js** - 运行时环境

## 项目结构

```
webui/
├── frontend/          # 前端Vue.js应用
│   ├── src/
│   │   ├── components/    # 组件
│   │   ├── views/         # 页面
│   │   ├── stores/        # 状态管理
│   │   ├── router/        # 路由配置
│   │   └── utils/         # 工具函数
│   ├── public/            # 静态资源
│   └── package.json       # 前端依赖
├── backend/           # 后端Express.js API
│   ├── src/
│   │   ├── routes/        # API路由
│   │   ├── services/      # 业务逻辑
│   │   ├── middleware/    # 中间件
│   │   └── utils/         # 工具函数
│   └── package.json       # 后端依赖
├── shared/            # 共享类型定义和工具
└── docker-compose.webui.yml  # WebUI Docker配置
```

## 快速开始

### 使用Docker（推荐）

```bash
# 启动WebUI服务
docker-compose -f docker-compose.yml -f webui/docker-compose.webui.yml up -d

# 访问WebUI
open http://localhost:3000
```

### 本地开发

```bash
# 安装前端依赖
cd webui/frontend
npm install

# 安装后端依赖
cd ../backend
npm install

# 启动开发服务器
npm run dev:all  # 同时启动前后端
```

## 使用说明

1. **访问界面** - 在浏览器中打开 http://localhost:3000
2. **书籍管理** - 在书籍列表中查看、创建、编辑书籍项目
3. **配置编辑** - 点击书籍项目进入配置编辑界面
4. **生成电子书** - 配置完成后点击生成按钮开始制作
5. **查看结果** - 在输出目录中查看生成的PDF文件

## API接口

WebUI提供RESTful API接口，详见 `backend/docs/api.md`

## 开发指南

详见各子项目的README文件：
- [前端开发指南](frontend/README.md)
- [后端开发指南](backend/README.md)
