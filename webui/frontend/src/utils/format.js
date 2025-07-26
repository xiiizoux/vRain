import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.locale('zh-cn')
dayjs.extend(relativeTime)

// 格式化日期
export function formatDate(date, format = 'YYYY-MM-DD HH:mm:ss') {
  if (!date) return ''
  return dayjs(date).format(format)
}

// 格式化相对时间
export function formatRelativeTime(date) {
  if (!date) return ''
  return dayjs(date).fromNow()
}

// 格式化文件大小
export function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 格式化数字
export function formatNumber(num, precision = 0) {
  if (num === null || num === undefined) return ''
  return Number(num).toLocaleString('zh-CN', {
    minimumFractionDigits: precision,
    maximumFractionDigits: precision
  })
}

// 格式化百分比
export function formatPercent(value, precision = 1) {
  if (value === null || value === undefined) return ''
  return (value * 100).toFixed(precision) + '%'
}

// 格式化时长（秒）
export function formatDuration(seconds) {
  if (!seconds || seconds < 0) return '0秒'
  
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  
  if (hours > 0) {
    return `${hours}小时${minutes}分钟${secs}秒`
  } else if (minutes > 0) {
    return `${minutes}分钟${secs}秒`
  } else {
    return `${secs}秒`
  }
}

// 截断文本
export function truncateText(text, maxLength = 50, suffix = '...') {
  if (!text || text.length <= maxLength) return text
  return text.substring(0, maxLength) + suffix
}

// 格式化状态文本
export function formatStatus(status) {
  const statusMap = {
    draft: '草稿',
    configuring: '配置中',
    ready: '就绪',
    generating: '生成中',
    completed: '已完成',
    failed: '失败',
    cancelled: '已取消',
    pending: '等待中',
    running: '运行中'
  }
  return statusMap[status] || status
}

// 格式化任务类型
export function formatTaskType(type) {
  const typeMap = {
    generate: '生成电子书',
    preview: '预览生成',
    canvas: '生成背景图',
    fontcheck: '字体检查',
    format: '文本格式化',
    compress: 'PDF压缩'
  }
  return typeMap[type] || type
}

// 高亮搜索关键词
export function highlightKeyword(text, keyword) {
  if (!text || !keyword) return text
  
  const regex = new RegExp(`(${keyword})`, 'gi')
  return text.replace(regex, '<mark>$1</mark>')
}

// 验证邮箱格式
export function isValidEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email)
}

// 验证URL格式
export function isValidUrl(url) {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

// 生成随机颜色
export function randomColor() {
  const colors = [
    '#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#909399',
    '#36CFC9', '#722ED1', '#13C2C2', '#52C41A', '#FA8C16'
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}

// 深拷贝对象
export function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj
  if (obj instanceof Date) return new Date(obj.getTime())
  if (obj instanceof Array) return obj.map(item => deepClone(item))
  if (typeof obj === 'object') {
    const clonedObj = {}
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key])
      }
    }
    return clonedObj
  }
}

// 防抖函数
export function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// 节流函数
export function throttle(func, limit) {
  let inThrottle
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}
