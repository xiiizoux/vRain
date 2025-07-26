import { TasksService } from '../services/tasksService.js'
import { logger } from '../utils/logger.js'

export class TasksController {
  constructor() {
    this.tasksService = new TasksService()
  }

  // 获取任务列表
  async getTasks(req, res, next) {
    try {
      const { bookId, type, status, page = 1, limit = 20 } = req.query
      
      const filter = {}
      if (bookId) filter.bookId = bookId
      if (type) filter.type = type
      if (status) filter.status = status
      
      const tasks = this.tasksService.getTasks(filter)
      
      // 分页
      const startIndex = (parseInt(page) - 1) * parseInt(limit)
      const endIndex = startIndex + parseInt(limit)
      const paginatedTasks = tasks.slice(startIndex, endIndex)
      
      res.json({
        success: true,
        data: paginatedTasks,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: tasks.length,
          pages: Math.ceil(tasks.length / parseInt(limit))
        }
      })
    } catch (error) {
      next(error)
    }
  }

  // 获取任务详情
  async getTask(req, res, next) {
    try {
      const { id } = req.params
      const task = this.tasksService.getTask(id)
      
      if (!task) {
        return res.status(404).json({
          success: false,
          message: '任务不存在'
        })
      }
      
      res.json({
        success: true,
        data: task
      })
    } catch (error) {
      next(error)
    }
  }

  // 取消任务
  async cancelTask(req, res, next) {
    try {
      const { id } = req.params
      const task = await this.tasksService.cancelTask(id)
      
      logger.info(`取消任务: ${id}`)
      
      res.json({
        success: true,
        data: task,
        message: '任务已取消'
      })
    } catch (error) {
      next(error)
    }
  }

  // 获取任务日志
  async getTaskLogs(req, res, next) {
    try {
      const { id } = req.params
      const { limit = 100 } = req.query
      
      const task = this.tasksService.getTask(id)
      
      if (!task) {
        return res.status(404).json({
          success: false,
          message: '任务不存在'
        })
      }
      
      const logs = task.logs.slice(-parseInt(limit))
      
      res.json({
        success: true,
        data: logs
      })
    } catch (error) {
      next(error)
    }
  }

  // 获取任务统计
  async getTaskStats(req, res, next) {
    try {
      const tasks = this.tasksService.getTasks()
      
      const stats = {
        total: tasks.length,
        running: tasks.filter(t => t.status === 'running').length,
        completed: tasks.filter(t => t.status === 'completed').length,
        failed: tasks.filter(t => t.status === 'failed').length,
        cancelled: tasks.filter(t => t.status === 'cancelled').length,
        byType: {},
        recent: tasks.slice(0, 10)
      }
      
      // 按类型统计
      for (const task of tasks) {
        if (!stats.byType[task.type]) {
          stats.byType[task.type] = 0
        }
        stats.byType[task.type]++
      }
      
      res.json({
        success: true,
        data: stats
      })
    } catch (error) {
      next(error)
    }
  }
}
