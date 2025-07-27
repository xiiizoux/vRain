import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import compression from 'compression'
import rateLimit from 'express-rate-limit'
import { createServer } from 'http'
import { Server } from 'socket.io'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

// 导入路由
import booksRouter from './routes/books.js'
import canvasRouter from './routes/canvas.js'
import tasksRouter from './routes/tasks.js'
import toolsRouter from './routes/tools.js'
import systemRouter from './routes/system.js'

// 导入中间件
import errorHandler from './middleware/errorHandler.js'
import { setupSocketIO } from './services/socketService.js'

// 配置环境变量
dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const server = createServer(app)
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
})

// 基础中间件
app.use(helmet({
  contentSecurityPolicy: false, // 开发环境下禁用CSP
}))

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}))

app.use(compression())
app.use(morgan('combined'))
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))

// 速率限制
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 1000, // 限制每个IP 15分钟内最多1000个请求
  message: {
    error: '请求过于频繁，请稍后再试'
  }
})
app.use('/api', limiter)

// 静态文件服务
app.use('/static/output', express.static(path.join(__dirname, '../../..', 'output')))
app.use('/static/books', express.static(path.join(__dirname, '../../..', 'books')))
app.use('/static/canvas', express.static(path.join(__dirname, '../../..', 'canvas')))

// API路由
app.use('/api/books', booksRouter)
app.use('/api/canvas', canvasRouter)
app.use('/api/tasks', tasksRouter)
app.use('/api/tools', toolsRouter)
app.use('/api/system', systemRouter)

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  })
})

// 根路径
app.get('/', (req, res) => {
  res.json({
    name: 'vRain WebUI Backend',
    version: process.env.npm_package_version || '1.0.0',
    description: '中文古籍电子书制作工具后端API服务',
    endpoints: {
      health: '/api/health',
      books: '/api/books',
      canvas: '/api/canvas',
      tasks: '/api/tasks',
      tools: '/api/tools',
      system: '/api/system'
    }
  })
})

// 404处理
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'API endpoint not found',
    path: req.originalUrl,
    method: req.method
  })
})

// 错误处理中间件
app.use(errorHandler)

// 设置Socket.IO
setupSocketIO(io)

// 启动服务器
const PORT = process.env.PORT || 3001
const HOST = process.env.HOST || '0.0.0.0'

server.listen(PORT, HOST, () => {
  console.log(`🚀 vRain WebUI Backend Server running on http://${HOST}:${PORT}`)
  console.log(`📚 Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`)
  console.log(`📁 vRain Root: ${path.resolve(__dirname, '../../..')}`)
})

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully')
  server.close(() => {
    console.log('Process terminated')
  })
})

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully')
  server.close(() => {
    console.log('Process terminated')
  })
})

export default app
