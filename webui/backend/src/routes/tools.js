import express from 'express'
import { ToolsController } from '../controllers/toolsController.js'

const router = express.Router()
const toolsController = new ToolsController()

// 工具路由
router.post('/fontcheck', toolsController.fontCheck.bind(toolsController))
router.post('/format', toolsController.formatText.bind(toolsController))
router.post('/insertimg', toolsController.insertImage.bind(toolsController))
router.post('/compress', toolsController.compressPdf.bind(toolsController))

export default router
