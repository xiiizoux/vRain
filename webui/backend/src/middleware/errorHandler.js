import { logger } from '../utils/logger.js'

// 错误处理中间件
const errorHandler = (err, req, res, next) => {
  let error = { ...err }
  error.message = err.message

  // 记录错误日志
  logger.error('API错误:', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  })

  // Mongoose错误处理
  if (err.name === 'CastError') {
    const message = '资源未找到'
    error = { message, statusCode: 404 }
  }

  // Mongoose重复字段错误
  if (err.code === 11000) {
    const message = '重复的字段值'
    error = { message, statusCode: 400 }
  }

  // Mongoose验证错误
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ')
    error = { message, statusCode: 400 }
  }

  // JWT错误
  if (err.name === 'JsonWebTokenError') {
    const message = '无效的token'
    error = { message, statusCode: 401 }
  }

  // JWT过期错误
  if (err.name === 'TokenExpiredError') {
    const message = 'Token已过期'
    error = { message, statusCode: 401 }
  }

  // 文件上传错误
  if (err.code === 'LIMIT_FILE_SIZE') {
    const message = '文件大小超出限制'
    error = { message, statusCode: 400 }
  }

  // 文件类型错误
  if (err.message && err.message.includes('只允许上传')) {
    error = { message: err.message, statusCode: 400 }
  }

  // 权限错误
  if (err.message && err.message.includes('权限')) {
    error = { message: err.message, statusCode: 403 }
  }

  // 文件不存在错误
  if (err.code === 'ENOENT') {
    const message = '文件或目录不存在'
    error = { message, statusCode: 404 }
  }

  // 磁盘空间不足
  if (err.code === 'ENOSPC') {
    const message = '磁盘空间不足'
    error = { message, statusCode: 507 }
  }

  // 权限不足
  if (err.code === 'EACCES') {
    const message = '文件权限不足'
    error = { message, statusCode: 403 }
  }

  // 默认错误
  const statusCode = error.statusCode || 500
  const message = error.message || '服务器内部错误'

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      details: error
    })
  })
}

export default errorHandler
