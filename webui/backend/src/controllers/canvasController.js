import { exec } from 'child_process'
import { promisify } from 'util'
import path from 'path'
import fs from 'fs/promises'

const execAsync = promisify(exec)

export class CanvasController {
  // 获取背景图列表
  async getCanvases(req, res) {
    try {
      const canvasDir = path.join(process.env.VRAIN_ROOT || '/app', 'canvas')
      
      // 读取canvas目录下的所有.pl文件
      const files = await fs.readdir(canvasDir)
      const canvasFiles = files.filter(file => file.endsWith('.pl'))
      
      const canvases = await Promise.all(
        canvasFiles.map(async (file) => {
          const filePath = path.join(canvasDir, file)
          const stats = await fs.stat(filePath)
          const id = path.basename(file, '.pl')
          
          // 尝试读取文件内容获取描述信息
          let description = ''
          let name = id
          try {
            const content = await fs.readFile(filePath, 'utf-8')
            const descMatch = content.match(/# Description: (.+)/i)
            const nameMatch = content.match(/# Name: (.+)/i)
            if (descMatch) description = descMatch[1].trim()
            if (nameMatch) name = nameMatch[1].trim()
          } catch (error) {
            // 忽略读取错误
          }
          
          return {
            id,
            name,
            description,
            type: 'canvas',
            status: 'ready',
            createdAt: stats.birthtime,
            updatedAt: stats.mtime,
            size: stats.size
          }
        })
      )
      
      res.json({
        success: true,
        data: canvases
      })
    } catch (error) {
      console.error('获取背景图列表失败:', error)
      res.status(500).json({
        success: false,
        message: '获取背景图列表失败',
        error: error.message
      })
    }
  }

  // 获取单个背景图详情
  async getCanvas(req, res) {
    try {
      const { id } = req.params
      const canvasDir = path.join(process.env.VRAIN_ROOT || '/app', 'canvas')
      const filePath = path.join(canvasDir, `${id}.pl`)
      
      // 检查文件是否存在
      try {
        await fs.access(filePath)
      } catch (error) {
        return res.status(404).json({
          success: false,
          message: '背景图不存在'
        })
      }
      
      const stats = await fs.stat(filePath)
      const content = await fs.readFile(filePath, 'utf-8')
      
      // 解析文件内容获取配置信息
      let description = ''
      let name = id
      const descMatch = content.match(/# Description: (.+)/i)
      const nameMatch = content.match(/# Name: (.+)/i)
      if (descMatch) description = descMatch[1].trim()
      if (nameMatch) name = nameMatch[1].trim()
      
      res.json({
        success: true,
        data: {
          id,
          name,
          description,
          type: 'canvas',
          status: 'ready',
          createdAt: stats.birthtime,
          updatedAt: stats.mtime,
          size: stats.size,
          content
        }
      })
    } catch (error) {
      console.error('获取背景图详情失败:', error)
      res.status(500).json({
        success: false,
        message: '获取背景图详情失败',
        error: error.message
      })
    }
  }

  // 创建背景图
  async createCanvas(req, res) {
    try {
      const { name, description, content } = req.body
      
      if (!name || !content) {
        return res.status(400).json({
          success: false,
          message: '名称和内容不能为空'
        })
      }
      
      const id = name.replace(/[^a-zA-Z0-9_-]/g, '_')
      const canvasDir = path.join(process.env.VRAIN_ROOT || '/app', 'canvas')
      const filePath = path.join(canvasDir, `${id}.pl`)
      
      // 检查文件是否已存在
      try {
        await fs.access(filePath)
        return res.status(409).json({
          success: false,
          message: '背景图已存在'
        })
      } catch (error) {
        // 文件不存在，可以创建
      }
      
      // 添加头部注释
      const fileContent = `#!/usr/bin/perl
# Name: ${name}
# Description: ${description || ''}
# Created: ${new Date().toISOString()}

${content}
`
      
      await fs.writeFile(filePath, fileContent, 'utf-8')
      await fs.chmod(filePath, 0o755) // 设置可执行权限
      
      const stats = await fs.stat(filePath)
      
      res.status(201).json({
        success: true,
        data: {
          id,
          name,
          description,
          type: 'canvas',
          status: 'ready',
          createdAt: stats.birthtime,
          updatedAt: stats.mtime,
          size: stats.size
        }
      })
    } catch (error) {
      console.error('创建背景图失败:', error)
      res.status(500).json({
        success: false,
        message: '创建背景图失败',
        error: error.message
      })
    }
  }

  // 更新背景图
  async updateCanvas(req, res) {
    try {
      const { id } = req.params
      const { name, description, content } = req.body
      
      const canvasDir = path.join(process.env.VRAIN_ROOT || '/app', 'canvas')
      const filePath = path.join(canvasDir, `${id}.pl`)
      
      // 检查文件是否存在
      try {
        await fs.access(filePath)
      } catch (error) {
        return res.status(404).json({
          success: false,
          message: '背景图不存在'
        })
      }
      
      // 读取现有内容
      const existingContent = await fs.readFile(filePath, 'utf-8')
      
      // 更新内容
      let newContent = content || existingContent
      if (name || description) {
        // 更新头部注释
        const lines = newContent.split('\n')
        const headerLines = []
        headerLines.push('#!/usr/bin/perl')
        if (name) headerLines.push(`# Name: ${name}`)
        if (description) headerLines.push(`# Description: ${description}`)
        headerLines.push(`# Updated: ${new Date().toISOString()}`)
        headerLines.push('')
        
        // 找到第一个非注释行
        let contentStartIndex = 0
        for (let i = 0; i < lines.length; i++) {
          if (!lines[i].startsWith('#') && lines[i].trim() !== '') {
            contentStartIndex = i
            break
          }
        }
        
        newContent = headerLines.join('\n') + lines.slice(contentStartIndex).join('\n')
      }
      
      await fs.writeFile(filePath, newContent, 'utf-8')
      
      const stats = await fs.stat(filePath)
      
      res.json({
        success: true,
        data: {
          id,
          name: name || id,
          description: description || '',
          type: 'canvas',
          status: 'ready',
          createdAt: stats.birthtime,
          updatedAt: stats.mtime,
          size: stats.size
        }
      })
    } catch (error) {
      console.error('更新背景图失败:', error)
      res.status(500).json({
        success: false,
        message: '更新背景图失败',
        error: error.message
      })
    }
  }

  // 删除背景图
  async deleteCanvas(req, res) {
    try {
      const { id } = req.params
      const canvasDir = path.join(process.env.VRAIN_ROOT || '/app', 'canvas')
      const filePath = path.join(canvasDir, `${id}.pl`)
      
      // 检查文件是否存在
      try {
        await fs.access(filePath)
      } catch (error) {
        return res.status(404).json({
          success: false,
          message: '背景图不存在'
        })
      }
      
      await fs.unlink(filePath)
      
      res.json({
        success: true,
        message: '背景图删除成功'
      })
    } catch (error) {
      console.error('删除背景图失败:', error)
      res.status(500).json({
        success: false,
        message: '删除背景图失败',
        error: error.message
      })
    }
  }

  // 生成背景图预览
  async generatePreview(req, res) {
    try {
      const { id } = req.params
      const canvasDir = path.join(process.env.VRAIN_ROOT || '/app', 'canvas')
      const filePath = path.join(canvasDir, `${id}.pl`)
      
      // 检查文件是否存在
      try {
        await fs.access(filePath)
      } catch (error) {
        return res.status(404).json({
          success: false,
          message: '背景图不存在'
        })
      }
      
      // 执行背景图脚本生成预览
      const outputDir = path.join(process.env.VRAIN_ROOT || '/app', 'output')
      const previewPath = path.join(outputDir, `${id}_preview.png`)
      
      try {
        const { stdout, stderr } = await execAsync(`perl "${filePath}" --preview --output "${previewPath}"`)
        
        res.json({
          success: true,
          data: {
            previewPath: `/output/${id}_preview.png`,
            message: '预览生成成功'
          }
        })
      } catch (execError) {
        console.error('生成预览失败:', execError)
        res.status(500).json({
          success: false,
          message: '生成预览失败',
          error: execError.message
        })
      }
    } catch (error) {
      console.error('生成背景图预览失败:', error)
      res.status(500).json({
        success: false,
        message: '生成背景图预览失败',
        error: error.message
      })
    }
  }

  // 获取背景图配置
  async getCanvasConfig(req, res) {
    try {
      const { id } = req.params
      const canvasDir = path.join(process.env.VRAIN_ROOT || '/app', 'canvas')
      const filePath = path.join(canvasDir, `${id}.pl`)

      // 检查文件是否存在
      try {
        await fs.access(filePath)
      } catch (error) {
        return res.status(404).json({
          success: false,
          message: '背景图不存在'
        })
      }

      const content = await fs.readFile(filePath, 'utf-8')

      res.json({
        success: true,
        data: {
          id,
          config: content
        }
      })
    } catch (error) {
      console.error('获取背景图配置失败:', error)
      res.status(500).json({
        success: false,
        message: '获取背景图配置失败',
        error: error.message
      })
    }
  }

  // 更新背景图配置
  async updateCanvasConfig(req, res) {
    try {
      const { id } = req.params
      const { config } = req.body

      if (!config) {
        return res.status(400).json({
          success: false,
          message: '配置内容不能为空'
        })
      }

      const canvasDir = path.join(process.env.VRAIN_ROOT || '/app', 'canvas')
      const filePath = path.join(canvasDir, `${id}.pl`)

      // 检查文件是否存在
      try {
        await fs.access(filePath)
      } catch (error) {
        return res.status(404).json({
          success: false,
          message: '背景图不存在'
        })
      }

      await fs.writeFile(filePath, config, 'utf-8')

      res.json({
        success: true,
        message: '背景图配置更新成功'
      })
    } catch (error) {
      console.error('更新背景图配置失败:', error)
      res.status(500).json({
        success: false,
        message: '更新背景图配置失败',
        error: error.message
      })
    }
  }

  // 生成背景图
  async generateCanvas(req, res) {
    try {
      const { id } = req.params
      const canvasDir = path.join(process.env.VRAIN_ROOT || '/app', 'canvas')
      const filePath = path.join(canvasDir, `${id}.pl`)

      // 检查文件是否存在
      try {
        await fs.access(filePath)
      } catch (error) {
        return res.status(404).json({
          success: false,
          message: '背景图不存在'
        })
      }

      // 执行背景图脚本
      const outputDir = path.join(process.env.VRAIN_ROOT || '/app', 'output')
      const outputPath = path.join(outputDir, `${id}.png`)

      try {
        const { stdout, stderr } = await execAsync(`perl "${filePath}" --output "${outputPath}"`)

        res.json({
          success: true,
          data: {
            outputPath: `/output/${id}.png`,
            message: '背景图生成成功',
            stdout,
            stderr
          }
        })
      } catch (execError) {
        console.error('生成背景图失败:', execError)
        res.status(500).json({
          success: false,
          message: '生成背景图失败',
          error: execError.message,
          stderr: execError.stderr || '',
          stdout: execError.stdout || ''
        })
      }
    } catch (error) {
      console.error('生成背景图失败:', error)
      res.status(500).json({
        success: false,
        message: '生成背景图失败',
        error: error.message
      })
    }
  }

  // 预览背景图
  async previewCanvas(req, res) {
    try {
      const { id } = req.params
      const outputDir = path.join(process.env.VRAIN_ROOT || '/app', 'output')
      const previewPath = path.join(outputDir, `${id}_preview.png`)

      // 检查预览文件是否存在
      try {
        await fs.access(previewPath)
        res.json({
          success: true,
          data: {
            previewPath: `/output/${id}_preview.png`,
            exists: true
          }
        })
      } catch (error) {
        res.json({
          success: true,
          data: {
            previewPath: `/output/${id}_preview.png`,
            exists: false,
            message: '预览文件不存在，请先生成预览'
          }
        })
      }
    } catch (error) {
      console.error('获取背景图预览失败:', error)
      res.status(500).json({
        success: false,
        message: '获取背景图预览失败',
        error: error.message
      })
    }
  }
}
