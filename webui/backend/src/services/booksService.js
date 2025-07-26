import fs from 'fs-extra'
import path from 'path'
import { fileURLToPath } from 'url'
import { v4 as uuidv4 } from 'uuid'
import { logger } from '../utils/logger.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export class BooksService {
  constructor() {
    this.booksRoot = path.join(__dirname, '../../../..', 'books')
    this.ensureBooksDirectory()
  }

  // 确保books目录存在
  async ensureBooksDirectory() {
    await fs.ensureDir(this.booksRoot)
  }

  // 获取书籍列表
  async getBooks(options = {}) {
    const { page = 1, limit = 20, search, status } = options
    
    try {
      const bookDirs = await fs.readdir(this.booksRoot)
      const books = []
      
      for (const dir of bookDirs) {
        const bookPath = path.join(this.booksRoot, dir)
        const stat = await fs.stat(bookPath)
        
        if (stat.isDirectory()) {
          try {
            const book = await this.loadBookInfo(dir)
            if (book) {
              books.push(book)
            }
          } catch (error) {
            logger.warn(`加载书籍信息失败: ${dir}`, error)
          }
        }
      }
      
      // 过滤
      let filteredBooks = books
      
      if (search) {
        const searchLower = search.toLowerCase()
        filteredBooks = books.filter(book => 
          book.title.toLowerCase().includes(searchLower) ||
          book.author.toLowerCase().includes(searchLower)
        )
      }
      
      if (status) {
        filteredBooks = filteredBooks.filter(book => book.status === status)
      }
      
      // 排序（按更新时间倒序）
      filteredBooks.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      
      // 分页
      const total = filteredBooks.length
      const startIndex = (page - 1) * limit
      const endIndex = startIndex + limit
      const paginatedBooks = filteredBooks.slice(startIndex, endIndex)
      
      return {
        data: paginatedBooks,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    } catch (error) {
      logger.error('获取书籍列表失败', error)
      throw error
    }
  }

  // 获取书籍详情
  async getBook(id) {
    try {
      return await this.loadBookInfo(id)
    } catch (error) {
      logger.error(`获取书籍详情失败: ${id}`, error)
      return null
    }
  }

  // 创建书籍
  async createBook(bookData) {
    const id = bookData.id || this.generateBookId()
    const bookPath = path.join(this.booksRoot, id)
    
    try {
      // 检查ID是否已存在
      if (await fs.pathExists(bookPath)) {
        throw new Error('书籍ID已存在')
      }
      
      // 创建目录结构
      await fs.ensureDir(bookPath)
      await fs.ensureDir(path.join(bookPath, 'text'))
      
      // 创建书籍配置文件
      const config = this.createDefaultConfig(bookData)
      await this.saveBookConfig(id, config)
      
      // 创建书籍信息文件
      const bookInfo = {
        id,
        title: bookData.title,
        author: bookData.author,
        description: bookData.description || '',
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...bookData
      }
      
      await this.saveBookInfo(id, bookInfo)
      
      return bookInfo
    } catch (error) {
      // 清理已创建的目录
      if (await fs.pathExists(bookPath)) {
        await fs.remove(bookPath)
      }
      throw error
    }
  }

  // 更新书籍
  async updateBook(id, bookData) {
    try {
      const existingBook = await this.loadBookInfo(id)
      if (!existingBook) {
        return null
      }
      
      const updatedBook = {
        ...existingBook,
        ...bookData,
        id, // 确保ID不被修改
        updatedAt: new Date().toISOString()
      }
      
      await this.saveBookInfo(id, updatedBook)
      return updatedBook
    } catch (error) {
      logger.error(`更新书籍失败: ${id}`, error)
      throw error
    }
  }

  // 删除书籍
  async deleteBook(id) {
    const bookPath = path.join(this.booksRoot, id)
    
    try {
      if (await fs.pathExists(bookPath)) {
        await fs.remove(bookPath)
      }
    } catch (error) {
      logger.error(`删除书籍失败: ${id}`, error)
      throw error
    }
  }

  // 获取书籍配置
  async getBookConfig(id) {
    const configPath = path.join(this.booksRoot, id, 'book.cfg')
    
    try {
      if (await fs.pathExists(configPath)) {
        const content = await fs.readFile(configPath, 'utf-8')
        return this.parseConfig(content)
      }
      return this.createDefaultConfig()
    } catch (error) {
      logger.error(`获取书籍配置失败: ${id}`, error)
      throw error
    }
  }

  // 更新书籍配置
  async updateBookConfig(id, config) {
    try {
      await this.saveBookConfig(id, config)
      
      // 更新书籍信息的更新时间
      const bookInfo = await this.loadBookInfo(id)
      if (bookInfo) {
        bookInfo.updatedAt = new Date().toISOString()
        await this.saveBookInfo(id, bookInfo)
      }
      
      return config
    } catch (error) {
      logger.error(`更新书籍配置失败: ${id}`, error)
      throw error
    }
  }

  // 获取文本文件列表
  async getBookTexts(id) {
    const textPath = path.join(this.booksRoot, id, 'text')
    
    try {
      if (!await fs.pathExists(textPath)) {
        return []
      }
      
      const files = await fs.readdir(textPath)
      const textFiles = []
      
      for (const file of files) {
        if (path.extname(file) === '.txt') {
          const filePath = path.join(textPath, file)
          const stat = await fs.stat(filePath)
          
          textFiles.push({
            filename: file,
            name: path.basename(file, '.txt'),
            size: stat.size,
            modifiedAt: stat.mtime.toISOString()
          })
        }
      }
      
      // 按文件名排序
      textFiles.sort((a, b) => a.filename.localeCompare(b.filename))
      
      return textFiles
    } catch (error) {
      logger.error(`获取文本文件列表失败: ${id}`, error)
      throw error
    }
  }

  // 添加文本文件
  async addTextFile(id, file) {
    const textFile = {
      filename: file.filename,
      name: path.basename(file.filename, '.txt'),
      size: file.size,
      modifiedAt: new Date().toISOString()
    }
    
    // 更新书籍信息
    const bookInfo = await this.loadBookInfo(id)
    if (bookInfo) {
      bookInfo.updatedAt = new Date().toISOString()
      await this.saveBookInfo(id, bookInfo)
    }
    
    return textFile
  }

  // 删除文本文件
  async deleteTextFile(id, filename) {
    const filePath = path.join(this.booksRoot, id, 'text', filename)
    
    try {
      if (await fs.pathExists(filePath)) {
        await fs.remove(filePath)
      }
      
      // 更新书籍信息
      const bookInfo = await this.loadBookInfo(id)
      if (bookInfo) {
        bookInfo.updatedAt = new Date().toISOString()
        await this.saveBookInfo(id, bookInfo)
      }
    } catch (error) {
      logger.error(`删除文本文件失败: ${id}/${filename}`, error)
      throw error
    }
  }

  // 获取文本内容
  async getTextContent(id, filename) {
    const filePath = path.join(this.booksRoot, id, 'text', filename)
    
    try {
      if (await fs.pathExists(filePath)) {
        return await fs.readFile(filePath, 'utf-8')
      }
      throw new Error('文件不存在')
    } catch (error) {
      logger.error(`获取文本内容失败: ${id}/${filename}`, error)
      throw error
    }
  }

  // 更新文本内容
  async updateTextContent(id, filename, content) {
    const filePath = path.join(this.booksRoot, id, 'text', filename)
    
    try {
      await fs.writeFile(filePath, content, 'utf-8')
      
      // 更新书籍信息
      const bookInfo = await this.loadBookInfo(id)
      if (bookInfo) {
        bookInfo.updatedAt = new Date().toISOString()
        await this.saveBookInfo(id, bookInfo)
      }
    } catch (error) {
      logger.error(`更新文本内容失败: ${id}/${filename}`, error)
      throw error
    }
  }

  // 生成书籍ID
  generateBookId() {
    return uuidv4().replace(/-/g, '').substring(0, 8)
  }

  // 加载书籍信息
  async loadBookInfo(id) {
    const infoPath = path.join(this.booksRoot, id, 'book.json')
    const configPath = path.join(this.booksRoot, id, 'book.cfg')
    
    try {
      let bookInfo = {}
      
      // 尝试加载JSON信息文件
      if (await fs.pathExists(infoPath)) {
        const content = await fs.readFile(infoPath, 'utf-8')
        bookInfo = JSON.parse(content)
      }
      
      // 如果没有JSON文件，从配置文件中提取信息
      if (!bookInfo.title && await fs.pathExists(configPath)) {
        const configContent = await fs.readFile(configPath, 'utf-8')
        const config = this.parseConfig(configContent)
        bookInfo = {
          id,
          title: config.title || id,
          author: config.author || '未知作者',
          status: 'draft',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        
        // 保存提取的信息
        await this.saveBookInfo(id, bookInfo)
      }
      
      // 获取文本文件数量
      const texts = await this.getBookTexts(id)
      bookInfo.textCount = texts.length
      
      return bookInfo.title ? bookInfo : null
    } catch (error) {
      logger.error(`加载书籍信息失败: ${id}`, error)
      return null
    }
  }

  // 保存书籍信息
  async saveBookInfo(id, bookInfo) {
    const infoPath = path.join(this.booksRoot, id, 'book.json')
    await fs.writeFile(infoPath, JSON.stringify(bookInfo, null, 2), 'utf-8')
  }

  // 保存书籍配置
  async saveBookConfig(id, config) {
    const configPath = path.join(this.booksRoot, id, 'book.cfg')
    const content = this.stringifyConfig(config)
    await fs.writeFile(configPath, content, 'utf-8')
  }

  // 解析配置文件
  parseConfig(content) {
    const config = {}
    const lines = content.split('\n')
    
    for (const line of lines) {
      const trimmed = line.trim()
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=')
        if (key && valueParts.length > 0) {
          config[key.trim()] = valueParts.join('=').trim()
        }
      }
    }
    
    return config
  }

  // 配置转字符串
  stringifyConfig(config) {
    const lines = []
    
    for (const [key, value] of Object.entries(config)) {
      if (value !== undefined && value !== null) {
        lines.push(`${key}=${value}`)
      }
    }
    
    return lines.join('\n')
  }

  // 创建默认配置
  createDefaultConfig(bookData = {}) {
    return {
      title: bookData.title || '新书籍',
      author: bookData.author || '未知作者',
      canvas_id: bookData.canvas_id || '01_Black',
      row_num: bookData.row_num || 24,
      row_delta_y: bookData.row_delta_y || 13,
      font1: bookData.font1 || 'qiji-combo.ttf',
      font2: bookData.font2 || 'HanaMinA.ttf',
      font3: bookData.font3 || 'HanaMinB.ttf',
      try_st: bookData.try_st || 0,
      text_font1_size: bookData.text_font1_size || 60,
      text_font2_size: bookData.text_font2_size || 55,
      text_font3_size: bookData.text_font3_size || 55,
      text_font_color: bookData.text_font_color || 'black',
      comment_font1_size: bookData.comment_font1_size || 40,
      comment_font2_size: bookData.comment_font2_size || 35,
      comment_font3_size: bookData.comment_font3_size || 35,
      comment_font_color: bookData.comment_font_color || 'black',
      cover_title_font_size: bookData.cover_title_font_size || 120,
      cover_title_y: bookData.cover_title_y || 200,
      cover_author_font_size: bookData.cover_author_font_size || 60,
      cover_author_y: bookData.cover_author_y || 600,
      cover_font_color: bookData.cover_font_color || 'black',
      if_tpcenter: bookData.if_tpcenter || 1,
      title_font_size: bookData.title_font_size || 80,
      title_font_color: bookData.title_font_color || 'black',
      title_y: bookData.title_y || 1200,
      title_postfix: bookData.title_postfix || '卷X',
      title_directory: bookData.title_directory || 1
    }
  }
}
