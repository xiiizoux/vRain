import express from 'express'
import { CanvasController } from '../controllers/canvasController.js'
import { validateCanvas, validateCanvasConfig } from '../middleware/validation.js'

const router = express.Router()
const canvasController = new CanvasController()

// 背景图管理路由
router.get('/', canvasController.getCanvases.bind(canvasController))
router.get('/:id', canvasController.getCanvas.bind(canvasController))
router.post('/', validateCanvas, canvasController.createCanvas.bind(canvasController))
router.put('/:id', validateCanvas, canvasController.updateCanvas.bind(canvasController))
router.delete('/:id', canvasController.deleteCanvas.bind(canvasController))

// 背景图配置管理
router.get('/:id/config', canvasController.getCanvasConfig.bind(canvasController))
router.put('/:id/config', validateCanvasConfig, canvasController.updateCanvasConfig.bind(canvasController))

// 背景图生成
router.post('/:id/generate', canvasController.generateCanvas.bind(canvasController))

// 背景图预览
router.get('/:id/preview', canvasController.previewCanvas.bind(canvasController))

export default router
