import path from 'path'
import fs from 'fs-extra'
import { BooksService } from '../services/booksService.js'
import { TasksService } from '../services/tasksService.js'
import { logger } from '../utils/logger.js'

export class BooksController {
  constructor() {
    this.booksService = new BooksService()
    this.tasksService = new TasksService()
  }

  // 获取书籍列表
  async getBooks(req, res, next) {
    try {
      const { page = 1, limit = 20, search, status } = req.query
      const books = await this.booksService.getBooks({
        page: parseInt(page),
        limit: parseInt(limit),
        search,
        status
      })
      
      res.json({
        success: true,
        data: books.data,
        pagination: books.pagination
      })
    } catch (error) {
      next(error)
    }
  }

  // 获取书籍详情
  async getBook(req, res, next) {
    try {
      const { id } = req.params
      const book = await this.booksService.getBook(id)
      
      if (!book) {
        return res.status(404).json({
          success: false,
          message: '书籍不存在'
        })
      }
      
      res.json({
        success: true,
        data: book
      })
    } catch (error) {
      next(error)
    }
  }

  // 创建书籍
  async createBook(req, res, next) {
    try {
      const bookData = req.body
      const book = await this.booksService.createBook(bookData)
      
      logger.info(`创建书籍: ${book.title} (ID: ${book.id})`)
      
      res.status(201).json({
        success: true,
        data: book,
        message: '书籍创建成功'
      })
    } catch (error) {
      next(error)
    }
  }

  // 更新书籍
  async updateBook(req, res, next) {
    try {
      const { id } = req.params
      const bookData = req.body
      
      const book = await this.booksService.updateBook(id, bookData)
      
      if (!book) {
        return res.status(404).json({
          success: false,
          message: '书籍不存在'
        })
      }
      
      logger.info(`更新书籍: ${book.title} (ID: ${book.id})`)
      
      res.json({
        success: true,
        data: book,
        message: '书籍更新成功'
      })
    } catch (error) {
      next(error)
    }
  }

  // 删除书籍
  async deleteBook(req, res, next) {
    try {
      const { id } = req.params
      
      const book = await this.booksService.getBook(id)
      if (!book) {
        return res.status(404).json({
          success: false,
          message: '书籍不存在'
        })
      }
      
      await this.booksService.deleteBook(id)
      
      logger.info(`删除书籍: ${book.title} (ID: ${book.id})`)
      
      res.json({
        success: true,
        message: '书籍删除成功'
      })
    } catch (error) {
      next(error)
    }
  }

  // 获取书籍配置
  async getBookConfig(req, res, next) {
    try {
      const { id } = req.params
      const config = await this.booksService.getBookConfig(id)
      
      res.json({
        success: true,
        data: config
      })
    } catch (error) {
      next(error)
    }
  }

  // 更新书籍配置
  async updateBookConfig(req, res, next) {
    try {
      const { id } = req.params
      const config = req.body
      
      const updatedConfig = await this.booksService.updateBookConfig(id, config)
      
      logger.info(`更新书籍配置: ${id}`)
      
      res.json({
        success: true,
        data: updatedConfig,
        message: '配置更新成功'
      })
    } catch (error) {
      next(error)
    }
  }

  // 获取文本文件列表
  async getBookTexts(req, res, next) {
    try {
      const { id } = req.params
      const texts = await this.booksService.getBookTexts(id)
      
      res.json({
        success: true,
        data: texts
      })
    } catch (error) {
      next(error)
    }
  }

  // 上传文本文件
  async uploadText(req, res, next) {
    try {
      const { id } = req.params
      const file = req.file
      
      if (!file) {
        return res.status(400).json({
          success: false,
          message: '请选择要上传的文件'
        })
      }
      
      const textFile = await this.booksService.addTextFile(id, file)
      
      logger.info(`上传文本文件: ${file.filename} 到书籍 ${id}`)
      
      res.json({
        success: true,
        data: textFile,
        message: '文件上传成功'
      })
    } catch (error) {
      next(error)
    }
  }

  // 删除文本文件
  async deleteText(req, res, next) {
    try {
      const { id, filename } = req.params
      
      await this.booksService.deleteTextFile(id, filename)
      
      logger.info(`删除文本文件: ${filename} 从书籍 ${id}`)
      
      res.json({
        success: true,
        message: '文件删除成功'
      })
    } catch (error) {
      next(error)
    }
  }

  // 获取文本内容
  async getTextContent(req, res, next) {
    try {
      const { id, filename } = req.params
      const content = await this.booksService.getTextContent(id, filename)
      
      res.json({
        success: true,
        data: { content }
      })
    } catch (error) {
      next(error)
    }
  }

  // 更新文本内容
  async updateTextContent(req, res, next) {
    try {
      const { id, filename } = req.params
      const { content } = req.body
      
      await this.booksService.updateTextContent(id, filename, content)
      
      logger.info(`更新文本内容: ${filename} 在书籍 ${id}`)
      
      res.json({
        success: true,
        message: '文本更新成功'
      })
    } catch (error) {
      next(error)
    }
  }

  // 生成书籍
  async generateBook(req, res, next) {
    try {
      const { id } = req.params
      const options = req.body
      
      const task = await this.tasksService.createGenerateTask(id, options)
      
      logger.info(`开始生成书籍: ${id}, 任务ID: ${task.id}`)
      
      res.json({
        success: true,
        data: task,
        message: '生成任务已创建'
      })
    } catch (error) {
      next(error)
    }
  }

  // 获取生成状态
  async getGenerateStatus(req, res, next) {
    try {
      const { id } = req.params
      const status = await this.tasksService.getBookGenerateStatus(id)
      
      res.json({
        success: true,
        data: status
      })
    } catch (error) {
      next(error)
    }
  }

  // 取消生成
  async cancelGenerate(req, res, next) {
    try {
      const { id } = req.params
      await this.tasksService.cancelBookGenerate(id)
      
      logger.info(`取消书籍生成: ${id}`)
      
      res.json({
        success: true,
        message: '生成任务已取消'
      })
    } catch (error) {
      next(error)
    }
  }

  // 预览书籍
  async previewBook(req, res, next) {
    try {
      const { id } = req.params
      const { pages = 5 } = req.query

      const task = await this.tasksService.createPreviewTask(id, { pages: parseInt(pages) })

      res.json({
        success: true,
        data: task,
        message: '预览任务已创建'
      })
    } catch (error) {
      next(error)
    }
  }

  // 获取生成的文件列表
  async getGeneratedFiles(req, res, next) {
    try {
      const { id } = req.params
      const files = await this.booksService.getGeneratedFiles(id)

      res.json({
        success: true,
        data: files
      })
    } catch (error) {
      next(error)
    }
  }

  // 下载生成的文件
  async downloadGeneratedFile(req, res, next) {
    try {
      const { id, filename } = req.params
      const filePath = path.join(this.booksService.booksRoot, id, filename)

      // 检查文件是否存在且是PDF文件
      if (!filename.endsWith('.pdf')) {
        return res.status(400).json({
          success: false,
          message: '只能下载PDF文件'
        })
      }

      // 检查文件是否存在
      if (!await fs.pathExists(filePath)) {
        return res.status(404).json({
          success: false,
          message: '文件不存在'
        })
      }

      // 设置下载头
      res.setHeader('Content-Type', 'application/pdf')
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`)

      // 发送文件
      res.sendFile(filePath)

      logger.info(`下载文件: ${id}/${filename}`)
    } catch (error) {
      next(error)
    }
  }

  // 导出书籍
  async exportBook(req, res, next) {
    try {
      const { id } = req.params
      const exportData = await this.booksService.exportBook(id)
      
      res.json({
        success: true,
        data: exportData
      })
    } catch (error) {
      next(error)
    }
  }

  // 导入书籍
  async importBook(req, res, next) {
    try {
      const file = req.file
      
      if (!file) {
        return res.status(400).json({
          success: false,
          message: '请选择要导入的文件'
        })
      }
      
      const book = await this.booksService.importBook(file)
      
      logger.info(`导入书籍: ${book.title} (ID: ${book.id})`)
      
      res.json({
        success: true,
        data: book,
        message: '书籍导入成功'
      })
    } catch (error) {
      next(error)
    }
  }

  // 获取书籍统计
  async getBookStats(req, res, next) {
    try {
      const { id } = req.params
      const stats = await this.booksService.getBookStats(id)
      
      res.json({
        success: true,
        data: stats
      })
    } catch (error) {
      next(error)
    }
  }
}
