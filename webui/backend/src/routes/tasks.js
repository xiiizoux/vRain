import express from 'express'
import { TasksController } from '../controllers/tasksController.js'

const router = express.Router()
const tasksController = new TasksController()

// 任务管理路由
router.get('/', tasksController.getTasks.bind(tasksController))
router.get('/:id', tasksController.getTask.bind(tasksController))
router.post('/:id/cancel', tasksController.cancelTask.bind(tasksController))
router.get('/:id/logs', tasksController.getTaskLogs.bind(tasksController))

// 任务统计
router.get('/stats/summary', tasksController.getTaskStats.bind(tasksController))

export default router
