import { TasksService } from './tasksService.js'
import { logger } from '../utils/logger.js'

let io = null
const tasksService = new TasksService()

// 设置Socket.IO
export function setupSocketIO(socketIO) {
  io = socketIO
  
  io.on('connection', (socket) => {
    logger.info(`WebSocket客户端连接: ${socket.id}`)
    
    // 发送当前任务状态
    socket.emit('tasks:list', tasksService.getTasks())
    
    // 监听任务更新
    const handleTaskUpdate = (task) => {
      socket.emit('task:updated', task)
    }
    
    tasksService.on('taskUpdated', handleTaskUpdate)
    
    // 客户端断开连接
    socket.on('disconnect', () => {
      logger.info(`WebSocket客户端断开: ${socket.id}`)
      tasksService.off('taskUpdated', handleTaskUpdate)
    })
    
    // 处理客户端请求
    socket.on('tasks:subscribe', (bookId) => {
      if (bookId) {
        socket.join(`book:${bookId}`)
        logger.debug(`客户端订阅书籍任务: ${bookId}`)
      }
    })
    
    socket.on('tasks:unsubscribe', (bookId) => {
      if (bookId) {
        socket.leave(`book:${bookId}`)
        logger.debug(`客户端取消订阅书籍任务: ${bookId}`)
      }
    })
    
    // 获取任务列表
    socket.on('tasks:list', (filter) => {
      const tasks = tasksService.getTasks(filter)
      socket.emit('tasks:list', tasks)
    })
    
    // 获取任务详情
    socket.on('task:get', (taskId) => {
      const task = tasksService.getTask(taskId)
      if (task) {
        socket.emit('task:detail', task)
      } else {
        socket.emit('error', { message: '任务不存在' })
      }
    })
    
    // 取消任务
    socket.on('task:cancel', async (taskId) => {
      try {
        const task = await tasksService.cancelTask(taskId)
        socket.emit('task:cancelled', task)
      } catch (error) {
        socket.emit('error', { message: error.message })
      }
    })
  })
  
  // 监听任务服务事件
  tasksService.on('taskUpdated', (task) => {
    // 广播任务更新
    io.emit('task:updated', task)
    
    // 向订阅特定书籍的客户端发送更新
    if (task.bookId) {
      io.to(`book:${task.bookId}`).emit('book:task:updated', task)
    }
  })
  
  logger.info('Socket.IO服务已启动')
}

// 发送任务更新通知
export function notifyTaskUpdate(task) {
  if (io) {
    io.emit('task:updated', task)
    
    if (task.bookId) {
      io.to(`book:${task.bookId}`).emit('book:task:updated', task)
    }
  }
}

// 发送系统通知
export function notifySystem(message, type = 'info') {
  if (io) {
    io.emit('system:notification', {
      message,
      type,
      timestamp: new Date().toISOString()
    })
  }
}

// 发送日志更新
export function notifyLogUpdate(logData) {
  if (io) {
    io.emit('logs:updated', logData)
  }
}

// 获取连接的客户端数量
export function getConnectedClients() {
  return io ? io.engine.clientsCount : 0
}
