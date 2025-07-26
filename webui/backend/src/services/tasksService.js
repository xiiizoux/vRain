import { spawn } from 'child_process'
import path from 'path'
import { fileURLToPath } from 'url'
import { v4 as uuidv4 } from 'uuid'
import { EventEmitter } from 'events'
import { logger } from '../utils/logger.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export class TasksService extends EventEmitter {
  constructor() {
    super()
    this.tasks = new Map()
    this.vrainRoot = path.join(__dirname, '../../../..')
  }

  // 创建生成任务
  async createGenerateTask(bookId, options = {}) {
    const taskId = uuidv4()
    const task = {
      id: taskId,
      type: 'generate',
      bookId,
      status: 'pending',
      progress: 0,
      options,
      createdAt: new Date().toISOString(),
      startedAt: null,
      completedAt: null,
      logs: [],
      error: null
    }
    
    this.tasks.set(taskId, task)
    
    // 立即开始执行任务
    this.executeGenerateTask(task)
    
    return task
  }

  // 创建预览任务
  async createPreviewTask(bookId, options = {}) {
    const taskId = uuidv4()
    const task = {
      id: taskId,
      type: 'preview',
      bookId,
      status: 'pending',
      progress: 0,
      options: { ...options, test: true },
      createdAt: new Date().toISOString(),
      startedAt: null,
      completedAt: null,
      logs: [],
      error: null
    }
    
    this.tasks.set(taskId, task)
    
    // 立即开始执行任务
    this.executeGenerateTask(task)
    
    return task
  }

  // 执行生成任务
  async executeGenerateTask(task) {
    try {
      task.status = 'running'
      task.startedAt = new Date().toISOString()
      this.updateTask(task)
      
      const args = this.buildVrainArgs(task)
      
      logger.info(`开始执行vRain任务: ${task.id}`, { bookId: task.bookId, args })
      
      const process = spawn('perl', ['vrain.pl', ...args], {
        cwd: this.vrainRoot,
        stdio: ['pipe', 'pipe', 'pipe']
      })
      
      task.process = process
      
      // 处理输出
      process.stdout.on('data', (data) => {
        const output = data.toString()
        task.logs.push({
          type: 'stdout',
          message: output,
          timestamp: new Date().toISOString()
        })
        
        // 解析进度
        this.parseProgress(task, output)
        this.updateTask(task)
      })
      
      process.stderr.on('data', (data) => {
        const output = data.toString()
        task.logs.push({
          type: 'stderr',
          message: output,
          timestamp: new Date().toISOString()
        })
        this.updateTask(task)
      })
      
      process.on('close', (code) => {
        task.completedAt = new Date().toISOString()
        
        if (code === 0) {
          task.status = 'completed'
          task.progress = 100
          logger.info(`vRain任务完成: ${task.id}`)
        } else {
          task.status = 'failed'
          task.error = `进程退出，代码: ${code}`
          logger.error(`vRain任务失败: ${task.id}`, { code })
        }
        
        delete task.process
        this.updateTask(task)
      })
      
      process.on('error', (error) => {
        task.status = 'failed'
        task.error = error.message
        task.completedAt = new Date().toISOString()
        delete task.process
        
        logger.error(`vRain任务错误: ${task.id}`, error)
        this.updateTask(task)
      })
      
    } catch (error) {
      task.status = 'failed'
      task.error = error.message
      task.completedAt = new Date().toISOString()
      
      logger.error(`执行vRain任务失败: ${task.id}`, error)
      this.updateTask(task)
    }
  }

  // 构建vRain命令参数
  buildVrainArgs(task) {
    const args = []
    const { bookId, options } = task
    
    // 书籍ID
    args.push('-b', bookId)
    
    // 起始和结束页
    if (options.from) args.push('-f', options.from.toString())
    if (options.to) args.push('-t', options.to.toString())
    
    // 压缩选项
    if (options.compress) args.push('-c')
    
    // 测试模式（预览）
    if (options.test || task.type === 'preview') {
      const pages = options.pages || 5
      args.push('-z', pages.toString())
    }
    
    // 详细输出
    if (options.verbose) args.push('-v')
    
    return args
  }

  // 解析进度
  parseProgress(task, output) {
    // 根据vRain的输出解析进度
    // 这里需要根据实际的vRain输出格式来实现
    
    if (output.includes('读取书籍排版配置文件')) {
      task.progress = 10
    } else if (output.includes('读取背景图配置文件')) {
      task.progress = 20
    } else if (output.includes('读取该书籍全部文本文件')) {
      task.progress = 30
    } else if (output.includes('生成PDF文件')) {
      task.progress = 80
    } else if (output.includes('完成！')) {
      task.progress = 100
    }
  }

  // 更新任务
  updateTask(task) {
    this.tasks.set(task.id, task)
    this.emit('taskUpdated', task)
  }

  // 获取任务
  getTask(taskId) {
    return this.tasks.get(taskId)
  }

  // 获取所有任务
  getTasks(filter = {}) {
    const tasks = Array.from(this.tasks.values())
    
    let filteredTasks = tasks
    
    if (filter.bookId) {
      filteredTasks = filteredTasks.filter(task => task.bookId === filter.bookId)
    }
    
    if (filter.type) {
      filteredTasks = filteredTasks.filter(task => task.type === filter.type)
    }
    
    if (filter.status) {
      filteredTasks = filteredTasks.filter(task => task.status === filter.status)
    }
    
    // 按创建时间倒序排列
    filteredTasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    
    return filteredTasks
  }

  // 取消任务
  async cancelTask(taskId) {
    const task = this.tasks.get(taskId)
    
    if (!task) {
      throw new Error('任务不存在')
    }
    
    if (task.status === 'running' && task.process) {
      task.process.kill('SIGTERM')
      task.status = 'cancelled'
      task.completedAt = new Date().toISOString()
      delete task.process
      
      logger.info(`取消任务: ${taskId}`)
      this.updateTask(task)
    }
    
    return task
  }

  // 获取书籍生成状态
  async getBookGenerateStatus(bookId) {
    const tasks = this.getTasks({ bookId, type: 'generate' })
    const runningTask = tasks.find(task => task.status === 'running')
    
    return {
      isGenerating: !!runningTask,
      currentTask: runningTask,
      recentTasks: tasks.slice(0, 5)
    }
  }

  // 取消书籍生成
  async cancelBookGenerate(bookId) {
    const tasks = this.getTasks({ bookId, type: 'generate', status: 'running' })
    
    for (const task of tasks) {
      await this.cancelTask(task.id)
    }
  }

  // 清理旧任务
  cleanupOldTasks(maxAge = 24 * 60 * 60 * 1000) { // 默认24小时
    const now = Date.now()
    const tasksToDelete = []
    
    for (const [taskId, task] of this.tasks) {
      const taskAge = now - new Date(task.createdAt).getTime()
      
      if (taskAge > maxAge && ['completed', 'failed', 'cancelled'].includes(task.status)) {
        tasksToDelete.push(taskId)
      }
    }
    
    for (const taskId of tasksToDelete) {
      this.tasks.delete(taskId)
    }
    
    if (tasksToDelete.length > 0) {
      logger.info(`清理了 ${tasksToDelete.length} 个旧任务`)
    }
  }
}
