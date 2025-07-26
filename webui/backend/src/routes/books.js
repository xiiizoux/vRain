import express from 'express'
import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'
import { BooksController } from '../controllers/booksController.js'
import { validateBook, validateBookConfig } from '../middleware/validation.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const router = express.Router()
const booksController = new BooksController()

// 配置文件上传
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const bookId = req.params.id
    const uploadPath = path.join(__dirname, '../../../..', 'books', bookId, 'text')
    cb(null, uploadPath)
  },
  filename: (req, file, cb) => {
    // 保持原文件名，确保是.txt格式
    const originalName = file.originalname
    const ext = path.extname(originalName)
    const name = path.basename(originalName, ext)
    cb(null, `${name}.txt`)
  }
})

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    // 只允许文本文件
    if (file.mimetype === 'text/plain' || path.extname(file.originalname) === '.txt') {
      cb(null, true)
    } else {
      cb(new Error('只允许上传.txt文本文件'))
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB限制
  }
})

// 书籍管理路由
router.get('/', booksController.getBooks.bind(booksController))
router.get('/:id', booksController.getBook.bind(booksController))
router.post('/', validateBook, booksController.createBook.bind(booksController))
router.put('/:id', validateBook, booksController.updateBook.bind(booksController))
router.delete('/:id', booksController.deleteBook.bind(booksController))

// 书籍配置管理
router.get('/:id/config', booksController.getBookConfig.bind(booksController))
router.put('/:id/config', validateBookConfig, booksController.updateBookConfig.bind(booksController))

// 文本文件管理
router.get('/:id/texts', booksController.getBookTexts.bind(booksController))
router.post('/:id/texts', upload.single('file'), booksController.uploadText.bind(booksController))
router.delete('/:id/texts/:filename', booksController.deleteText.bind(booksController))
router.get('/:id/texts/:filename', booksController.getTextContent.bind(booksController))
router.put('/:id/texts/:filename', booksController.updateTextContent.bind(booksController))

// 书籍生成
router.post('/:id/generate', booksController.generateBook.bind(booksController))
router.get('/:id/generate/status', booksController.getGenerateStatus.bind(booksController))
router.post('/:id/generate/cancel', booksController.cancelGenerate.bind(booksController))

// 书籍预览
router.get('/:id/preview', booksController.previewBook.bind(booksController))

// 书籍导出/导入
router.get('/:id/export', booksController.exportBook.bind(booksController))
router.post('/import', upload.single('file'), booksController.importBook.bind(booksController))

// 书籍统计
router.get('/:id/stats', booksController.getBookStats.bind(booksController))

export default router
