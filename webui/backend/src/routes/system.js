import express from 'express'
import { SystemController } from '../controllers/systemController.js'

const router = express.Router()
const systemController = new SystemController()

// 系统信息路由
router.get('/info', systemController.getSystemInfo.bind(systemController))
router.get('/logs', systemController.getLogs.bind(systemController))
router.get('/settings', systemController.getSettings.bind(systemController))
router.put('/settings', systemController.updateSettings.bind(systemController))

export default router
