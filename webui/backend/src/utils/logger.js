import fs from 'fs-extra'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

class Logger {
  constructor() {
    this.logDir = path.join(__dirname, '../../../..', 'logs', 'webui')
    this.ensureLogDirectory()
  }

  async ensureLogDirectory() {
    await fs.ensureDir(this.logDir)
  }

  formatMessage(level, message, meta = {}) {
    const timestamp = new Date().toISOString()
    const metaStr = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : ''
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}`
  }

  async writeToFile(level, message, meta = {}) {
    try {
      const date = new Date().toISOString().split('T')[0]
      const logFile = path.join(this.logDir, `${date}.log`)
      const formattedMessage = this.formatMessage(level, message, meta)
      
      await fs.appendFile(logFile, formattedMessage + '\n')
    } catch (error) {
      console.error('写入日志文件失败:', error)
    }
  }

  log(level, message, meta = {}) {
    const formattedMessage = this.formatMessage(level, message, meta)
    
    // 控制台输出
    switch (level) {
      case 'error':
        console.error(formattedMessage)
        break
      case 'warn':
        console.warn(formattedMessage)
        break
      case 'info':
        console.info(formattedMessage)
        break
      case 'debug':
        if (process.env.NODE_ENV === 'development') {
          console.debug(formattedMessage)
        }
        break
      default:
        console.log(formattedMessage)
    }
    
    // 写入文件
    this.writeToFile(level, message, meta)
  }

  error(message, meta = {}) {
    this.log('error', message, meta)
  }

  warn(message, meta = {}) {
    this.log('warn', message, meta)
  }

  info(message, meta = {}) {
    this.log('info', message, meta)
  }

  debug(message, meta = {}) {
    this.log('debug', message, meta)
  }

  // 获取日志文件列表
  async getLogFiles() {
    try {
      const files = await fs.readdir(this.logDir)
      return files.filter(file => file.endsWith('.log')).sort().reverse()
    } catch (error) {
      this.error('获取日志文件列表失败', { error: error.message })
      return []
    }
  }

  // 读取日志文件内容
  async readLogFile(filename, lines = 100) {
    try {
      const logFile = path.join(this.logDir, filename)
      
      if (!await fs.pathExists(logFile)) {
        throw new Error('日志文件不存在')
      }
      
      const content = await fs.readFile(logFile, 'utf-8')
      const logLines = content.split('\n').filter(line => line.trim())
      
      // 返回最后N行
      return logLines.slice(-lines)
    } catch (error) {
      this.error('读取日志文件失败', { filename, error: error.message })
      throw error
    }
  }

  // 清理旧日志文件
  async cleanupOldLogs(daysToKeep = 30) {
    try {
      const files = await this.getLogFiles()
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)
      
      let deletedCount = 0
      
      for (const file of files) {
        const match = file.match(/^(\d{4}-\d{2}-\d{2})\.log$/)
        if (match) {
          const fileDate = new Date(match[1])
          if (fileDate < cutoffDate) {
            await fs.remove(path.join(this.logDir, file))
            deletedCount++
          }
        }
      }
      
      if (deletedCount > 0) {
        this.info(`清理了 ${deletedCount} 个旧日志文件`)
      }
    } catch (error) {
      this.error('清理旧日志文件失败', { error: error.message })
    }
  }
}

export const logger = new Logger()
