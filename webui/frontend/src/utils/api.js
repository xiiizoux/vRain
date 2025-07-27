import axios from 'axios'
import { ElMessage } from 'element-plus'

// 创建axios实例
const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    // 可以在这里添加token等认证信息
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    const message = error.response?.data?.message || error.message || '请求失败'
    ElMessage.error(message)
    return Promise.reject(error)
  }
)

// 书籍相关API
export const booksApi = {
  // 获取书籍列表
  getBooks: () => api.get('/books'),
  
  // 获取书籍详情
  getBook: (id) => api.get(`/books/${id}`),
  
  // 创建书籍
  createBook: (data) => api.post('/books', data),
  
  // 更新书籍
  updateBook: (id, data) => api.put(`/books/${id}`, data),
  
  // 删除书籍
  deleteBook: (id) => api.delete(`/books/${id}`),
  
  // 生成书籍
  generateBook: (id, options) => api.post(`/books/${id}/generate`, options),

  // 预览书籍
  previewBook: (id, options) => api.post(`/books/${id}/preview`, options),

  // 获取生成状态
  getGenerateStatus: (id) => api.get(`/books/${id}/generate/status`),

  // 取消生成
  cancelGenerate: (id) => api.post(`/books/${id}/generate/cancel`),

  // 获取生成的文件列表
  getGeneratedFiles: (id) => api.get(`/books/${id}/files`),

  // 下载生成的文件
  downloadFile: (id, filename) => api.get(`/books/${id}/files/${filename}/download`, { responseType: 'blob' }),
  
  // 获取书籍配置
  getBookConfig: (id) => api.get(`/books/${id}/config`),
  
  // 更新书籍配置
  updateBookConfig: (id, config) => api.put(`/books/${id}/config`, config),
  
  // 获取书籍文本文件列表
  getBookTexts: (id) => api.get(`/books/${id}/texts`),
  
  // 上传文本文件
  uploadText: (id, file) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post(`/books/${id}/texts`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  
  // 删除文本文件
  deleteText: (id, filename) => api.delete(`/books/${id}/texts/${filename}`),

  // 获取文本内容
  getTextContent: (id, filename) => api.get(`/books/${id}/texts/${filename}`),

  // 更新文本内容
  updateTextContent: (id, filename, data) => api.put(`/books/${id}/texts/${filename}`, data)
}

// 背景图相关API
export const canvasApi = {
  // 获取背景图列表
  getCanvases: () => api.get('/canvas'),
  
  // 获取背景图详情
  getCanvas: (id) => api.get(`/canvas/${id}`),
  
  // 创建背景图
  createCanvas: (data) => api.post('/canvas', data),
  
  // 更新背景图
  updateCanvas: (id, data) => api.put(`/canvas/${id}`, data),
  
  // 删除背景图
  deleteCanvas: (id) => api.delete(`/canvas/${id}`),
  
  // 生成背景图
  generateCanvas: (id, style = 'normal') => api.post(`/canvas/${id}/generate`, { style }),
  
  // 获取背景图配置
  getCanvasConfig: (id) => api.get(`/canvas/${id}/config`),
  
  // 更新背景图配置
  updateCanvasConfig: (id, config) => api.put(`/canvas/${id}/config`, config)
}

// 任务相关API
export const tasksApi = {
  // 获取任务列表
  getTasks: () => api.get('/tasks'),
  
  // 获取任务详情
  getTask: (id) => api.get(`/tasks/${id}`),
  
  // 取消任务
  cancelTask: (id) => api.post(`/tasks/${id}/cancel`),
  
  // 获取任务日志
  getTaskLogs: (id) => api.get(`/tasks/${id}/logs`)
}

// 工具相关API
export const toolsApi = {
  // 字体检查
  fontCheck: (bookId, options) => api.post('/tools/fontcheck', { bookId, ...options }),
  
  // 文本格式化
  formatText: (bookId, options) => api.post('/tools/format', { bookId, ...options }),
  
  // 插入图片
  insertImage: (bookId, options) => api.post('/tools/insertimg', { bookId, ...options }),
  
  // PDF压缩
  compressPdf: (filePath) => api.post('/tools/compress', { filePath })
}

// 系统相关API
export const systemApi = {
  // 获取系统信息
  getSystemInfo: () => api.get('/system/info'),
  
  // 获取日志
  getLogs: (type = 'all', limit = 100) => api.get('/system/logs', { params: { type, limit } }),
  
  // 获取设置
  getSettings: () => api.get('/system/settings'),
  
  // 更新设置
  updateSettings: (settings) => api.put('/system/settings', settings)
}

export default api
