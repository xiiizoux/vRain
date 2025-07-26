import { exec } from 'child_process'
import { promisify } from 'util'
import path from 'path'
import fs from 'fs/promises'
import os from 'os'

const execAsync = promisify(exec)

export class SystemController {
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

  // 获取日志
  async getLogs(req, res) {
    try {
      const logsDir = path.join(process.env.VRAIN_ROOT || '/app', 'logs')
      const logs = []
      
      try {
        const files = await fs.readdir(logsDir)
        for (const file of files) {
          if (file.endsWith('.log')) {
            const filePath = path.join(logsDir, file)
            const stats = await fs.stat(filePath)
            logs.push({
              name: file,
              size: stats.size,
              modified: stats.mtime
            })
          }
        }
      } catch (error) {
        // 目录不存在或无法访问
      }

      res.json({
        success: true,
        data: logs
      })
    } catch (error) {
      console.error('获取日志失败:', error)
      res.status(500).json({
        success: false,
        message: '获取日志失败',
        error: error.message
      })
    }
  }

  // 获取设置
  async getSettings(req, res) {
    try {
      const settings = {
        theme: 'light',
        language: 'zh-CN',
        vrainRoot: process.env.VRAIN_ROOT || '/app',
        webuiPort: process.env.WEBUI_PORT || 3001,
        nginxPort: process.env.NGINX_PORT || 3012
      }
      
      res.json({
        success: true,
        data: settings
      })
    } catch (error) {
      console.error('获取设置失败:', error)
      res.status(500).json({
        success: false,
        message: '获取设置失败',
        error: error.message
      })
    }
  }

  // 获取系统状态
  async getSystemStatus(req, res) {
    try {
      const status = {
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        cpu: os.cpus(),
        platform: process.platform,
        arch: process.arch,
        nodeVersion: process.version,
        loadAverage: os.loadavg(),
        freeMemory: os.freemem(),
        totalMemory: os.totalmem(),
        hostname: os.hostname()
      }

      // 获取磁盘使用情况
      try {
        const { stdout } = await execAsync('df -h')
        status.diskUsage = stdout
      } catch (error) {
        status.diskUsage = 'N/A'
      }

      res.json({
        success: true,
        data: status
      })
    } catch (error) {
      console.error('获取系统状态失败:', error)
      res.status(500).json({
        success: false,
        message: '获取系统状态失败',
        error: error.message
      })
    }
  }

  // 获取服务状态
  async getServiceStatus(req, res) {
    try {
      const services = {
        webui: {
          name: 'WebUI Backend',
          status: 'running',
          port: process.env.WEBUI_PORT || 3001,
          pid: process.pid,
          uptime: process.uptime()
        },
        nginx: {
          name: 'Nginx',
          status: 'unknown',
          port: process.env.NGINX_PORT || 3012
        }
      }

      // 检查Nginx状态
      try {
        const { stdout } = await execAsync('pgrep nginx')
        if (stdout.trim()) {
          services.nginx.status = 'running'
          services.nginx.pid = stdout.trim().split('\n')[0]
        } else {
          services.nginx.status = 'stopped'
        }
      } catch (error) {
        services.nginx.status = 'stopped'
      }

      res.json({
        success: true,
        data: services
      })
    } catch (error) {
      console.error('获取服务状态失败:', error)
      res.status(500).json({
        success: false,
        message: '获取服务状态失败',
        error: error.message
      })
    }
  }

  // 重启服务
  async restartService(req, res) {
    try {
      const { service } = req.params

      switch (service) {
        case 'nginx':
          try {
            await execAsync('nginx -s reload')
            res.json({
              success: true,
              message: 'Nginx服务已重新加载'
            })
          } catch (error) {
            throw new Error(`重启Nginx失败: ${error.message}`)
          }
          break

        case 'webui':
          res.json({
            success: true,
            message: 'WebUI后端重启请求已接收，请等待容器重启'
          })
          
          // 延迟退出进程，让响应先发送
          setTimeout(() => {
            process.exit(0)
          }, 1000)
          break

        default:
          res.status(400).json({
            success: false,
            message: `不支持的服务: ${service}`
          })
      }
    } catch (error) {
      console.error('重启服务失败:', error)
      res.status(500).json({
        success: false,
        message: '重启服务失败',
        error: error.message
      })
    }
  }

  // 获取环境变量
  async getEnvironment(req, res) {
    try {
      const environment = {
        NODE_ENV: process.env.NODE_ENV,
        WEBUI_PORT: process.env.WEBUI_PORT,
        NGINX_PORT: process.env.NGINX_PORT,
        VRAIN_ROOT: process.env.VRAIN_ROOT,
        PATH: process.env.PATH,
        HOME: process.env.HOME,
        USER: process.env.USER,
        PWD: process.cwd()
      }

      res.json({
        success: true,
        data: environment
      })
    } catch (error) {
      console.error('获取环境变量失败:', error)
      res.status(500).json({
        success: false,
        message: '获取环境变量失败',
        error: error.message
      })
    }
  }

  // 获取健康检查状态
  async getHealthCheck(req, res) {
    try {
      const health = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        checks: {
          webui: { status: 'ok', message: 'WebUI后端运行正常' },
          filesystem: { status: 'unknown', message: '' },
          dependencies: { status: 'unknown', message: '' }
        }
      }

      // 检查文件系统
      try {
        const vrainRoot = process.env.VRAIN_ROOT || '/app'
        await fs.access(vrainRoot)
        health.checks.filesystem.status = 'ok'
        health.checks.filesystem.message = '文件系统访问正常'
      } catch (error) {
        health.checks.filesystem.status = 'error'
        health.checks.filesystem.message = `文件系统访问失败: ${error.message}`
        health.status = 'unhealthy'
      }

      // 检查关键依赖
      try {
        await execAsync('perl --version')
        health.checks.dependencies.status = 'ok'
        health.checks.dependencies.message = 'Perl依赖正常'
      } catch (error) {
        health.checks.dependencies.status = 'warning'
        health.checks.dependencies.message = 'Perl依赖不可用'
      }

      res.json({
        success: true,
        data: health
      })
    } catch (error) {
      console.error('健康检查失败:', error)
      res.status(500).json({
        success: false,
        message: '健康检查失败',
        error: error.message
      })
    }
  }

  // 更新设置
  async updateSettings(req, res) {
    try {
      const { theme, language } = req.body

      // 模拟设置更新逻辑
      const updatedSettings = {
        theme: theme || 'light',
        language: language || 'zh-CN',
        vrainRoot: process.env.VRAIN_ROOT || '/app',
        webuiPort: process.env.WEBUI_PORT || 3001,
        nginxPort: process.env.NGINX_PORT || 3012
      }

      res.json({
        success: true,
        data: updatedSettings,
        message: '设置更新成功'
      })
    } catch (error) {
      console.error('更新设置失败:', error)
      res.status(500).json({
        success: false,
        message: '更新设置失败',
        error: error.message
      })
    }
  }
}
