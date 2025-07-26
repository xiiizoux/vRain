import { exec } from 'child_process'
import { promisify } from 'util'
import path from 'path'
import fs from 'fs/promises'

const execAsync = promisify(exec)

export class ToolsController {
  // 字体检查
  async fontCheck(req, res) {
    try {
      const { text } = req.body
      
      if (!text) {
        return res.status(400).json({
          success: false,
          message: '文本内容不能为空'
        })
      }

      // 模拟字体检查逻辑
      const result = {
        text,
        hasUnsupportedChars: false,
        unsupportedChars: [],
        recommendedFonts: ['SimSun', 'Microsoft YaHei', 'Arial']
      }

      res.json({
        success: true,
        data: result
      })
    } catch (error) {
      console.error('字体检查失败:', error)
      res.status(500).json({
        success: false,
        message: '字体检查失败',
        error: error.message
      })
    }
  }

  // 文本格式化
  async formatText(req, res) {
    try {
      const { text, options = {} } = req.body
      
      if (!text) {
        return res.status(400).json({
          success: false,
          message: '文本内容不能为空'
        })
      }

      let formattedText = text
      
      // 应用格式化选项
      if (options.removeExtraSpaces) {
        formattedText = formattedText.replace(/\s+/g, ' ')
      }
      
      if (options.trimLines) {
        formattedText = formattedText.split('\n').map(line => line.trim()).join('\n')
      }
      
      if (options.removeEmptyLines) {
        formattedText = formattedText.split('\n').filter(line => line.trim()).join('\n')
      }

      res.json({
        success: true,
        data: {
          originalText: text,
          formattedText,
          options
        }
      })
    } catch (error) {
      console.error('文本格式化失败:', error)
      res.status(500).json({
        success: false,
        message: '文本格式化失败',
        error: error.message
      })
    }
  }

  // 插入图片
  async insertImage(req, res) {
    try {
      const { imagePath, position = 'center' } = req.body
      
      if (!imagePath) {
        return res.status(400).json({
          success: false,
          message: '图片路径不能为空'
        })
      }

      // 模拟图片插入逻辑
      const result = {
        imagePath,
        position,
        inserted: true,
        message: '图片插入成功'
      }

      res.json({
        success: true,
        data: result
      })
    } catch (error) {
      console.error('插入图片失败:', error)
      res.status(500).json({
        success: false,
        message: '插入图片失败',
        error: error.message
      })
    }
  }

  // 获取系统信息
  async getSystemInfo(req, res) {
    try {
      const systemInfo = {
        platform: process.platform,
        arch: process.arch,
        nodeVersion: process.version,
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        env: {
          NODE_ENV: process.env.NODE_ENV,
          VRAIN_ROOT: process.env.VRAIN_ROOT
        }
      }

      // 获取磁盘使用情况
      try {
        const { stdout } = await execAsync('df -h /')
        systemInfo.disk = stdout.split('\n')[1]
      } catch (error) {
        systemInfo.disk = 'N/A'
      }

      res.json({
        success: true,
        data: systemInfo
      })
    } catch (error) {
      console.error('获取系统信息失败:', error)
      res.status(500).json({
        success: false,
        message: '获取系统信息失败',
        error: error.message
      })
    }
  }

  // 检查依赖工具
  async checkDependencies(req, res) {
    try {
      const dependencies = {
        perl: { available: false, version: null },
        imagemagick: { available: false, version: null },
        convert: { available: false, version: null },
        node: { available: true, version: process.version }
      }

      // 检查 Perl
      try {
        const { stdout } = await execAsync('perl --version')
        dependencies.perl.available = true
        const versionMatch = stdout.match(/v(\d+\.\d+\.\d+)/)
        if (versionMatch) {
          dependencies.perl.version = versionMatch[1]
        }
      } catch (error) {
        // Perl 不可用
      }

      // 检查 ImageMagick
      try {
        const { stdout } = await execAsync('magick --version')
        dependencies.imagemagick.available = true
        const versionMatch = stdout.match(/ImageMagick (\d+\.\d+\.\d+)/)
        if (versionMatch) {
          dependencies.imagemagick.version = versionMatch[1]
        }
      } catch (error) {
        // ImageMagick 不可用
      }

      // 检查 convert 命令
      try {
        const { stdout } = await execAsync('convert --version')
        dependencies.convert.available = true
        const versionMatch = stdout.match(/ImageMagick (\d+\.\d+\.\d+)/)
        if (versionMatch) {
          dependencies.convert.version = versionMatch[1]
        }
      } catch (error) {
        // convert 不可用
      }

      res.json({
        success: true,
        data: dependencies
      })
    } catch (error) {
      console.error('检查依赖失败:', error)
      res.status(500).json({
        success: false,
        message: '检查依赖失败',
        error: error.message
      })
    }
  }

  // 执行命令
  async executeCommand(req, res) {
    try {
      const { command, cwd } = req.body

      if (!command) {
        return res.status(400).json({
          success: false,
          message: '命令不能为空'
        })
      }

      // 安全检查：只允许特定的命令
      const allowedCommands = [
        'perl',
        'ls',
        'pwd',
        'whoami',
        'date',
        'df',
        'free',
        'ps',
        'top',
        'cat',
        'head',
        'tail',
        'grep',
        'find',
        'wc'
      ]

      const commandName = command.split(' ')[0]
      if (!allowedCommands.includes(commandName)) {
        return res.status(403).json({
          success: false,
          message: `命令 '${commandName}' 不被允许执行`
        })
      }

      const options = {
        timeout: 30000, // 30秒超时
        maxBuffer: 1024 * 1024 // 1MB 缓冲区
      }

      if (cwd) {
        options.cwd = cwd
      }

      const { stdout, stderr } = await execAsync(command, options)

      res.json({
        success: true,
        data: {
          stdout,
          stderr,
          command,
          cwd: cwd || process.cwd()
        }
      })
    } catch (error) {
      console.error('执行命令失败:', error)
      res.status(500).json({
        success: false,
        message: '执行命令失败',
        error: error.message,
        stderr: error.stderr || '',
        stdout: error.stdout || ''
      })
    }
  }

  // 获取日志文件列表
  async getLogFiles(req, res) {
    try {
      const logsDir = path.join(process.env.VRAIN_ROOT || '/app', 'logs')
      
      try {
        await fs.access(logsDir)
      } catch (error) {
        return res.json({
          success: true,
          data: []
        })
      }

      const files = await fs.readdir(logsDir, { withFileTypes: true })
      const logFiles = []

      for (const file of files) {
        if (file.isFile() && (file.name.endsWith('.log') || file.name.endsWith('.txt'))) {
          const filePath = path.join(logsDir, file.name)
          const stats = await fs.stat(filePath)
          
          logFiles.push({
            name: file.name,
            path: filePath,
            size: stats.size,
            modified: stats.mtime,
            created: stats.birthtime
          })
        }
      }

      // 按修改时间排序
      logFiles.sort((a, b) => b.modified - a.modified)

      res.json({
        success: true,
        data: logFiles
      })
    } catch (error) {
      console.error('获取日志文件列表失败:', error)
      res.status(500).json({
        success: false,
        message: '获取日志文件列表失败',
        error: error.message
      })
    }
  }

  // PDF压缩
  async compressPdf(req, res) {
    try {
      const { filePath, quality = 'medium' } = req.body

      if (!filePath) {
        return res.status(400).json({
          success: false,
          message: '文件路径不能为空'
        })
      }

      // 模拟PDF压缩逻辑
      const result = {
        originalPath: filePath,
        compressedPath: filePath.replace('.pdf', '_compressed.pdf'),
        quality,
        originalSize: '10MB',
        compressedSize: '5MB',
        compressionRatio: '50%',
        message: 'PDF压缩成功'
      }

      res.json({
        success: true,
        data: result
      })
    } catch (error) {
      console.error('PDF压缩失败:', error)
      res.status(500).json({
        success: false,
        message: 'PDF压缩失败',
        error: error.message
      })
    }
  }
}
