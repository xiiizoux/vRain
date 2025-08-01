import { defineStore } from 'pinia'
import { ref } from 'vue'
import api, { canvasApi } from '@/utils/api'

export const useCanvasStore = defineStore('canvas', () => {
  const canvases = ref([])
  const loading = ref(false)

  // 获取背景图列表
  const getCanvases = async () => {
    try {
      loading.value = true
      const response = await canvasApi.getCanvases()
      // 处理后端返回的数据结构
      const canvasData = response.data.data || response.data
      canvases.value = canvasData
      return canvasData
    } catch (error) {
      console.error('获取背景图列表失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // 获取单个背景图
  const getCanvas = async (id) => {
    try {
      const response = await canvasApi.getCanvas(id)
      // 处理后端返回的数据结构
      return response.data.data || response.data
    } catch (error) {
      console.error('获取背景图详情失败:', error)
      throw error
    }
  }

  // 创建背景图
  const createCanvas = async (data) => {
    try {
      const response = await canvasApi.createCanvas(data)
      // 处理后端返回的数据结构
      const newCanvas = response.data.data || response.data
      canvases.value.push(newCanvas)
      return newCanvas
    } catch (error) {
      console.error('创建背景图失败:', error)
      throw error
    }
  }

  // 更新背景图
  const updateCanvas = async (id, data) => {
    try {
      const response = await canvasApi.updateCanvas(id, data)
      const index = canvases.value.findIndex(c => c.id === id)
      if (index !== -1) {
        canvases.value[index] = response.data
      }
      return response.data
    } catch (error) {
      console.error('更新背景图失败:', error)
      throw error
    }
  }

  // 删除背景图
  const deleteCanvas = async (id) => {
    try {
      await canvasApi.deleteCanvas(id)
      const index = canvases.value.findIndex(c => c.id === id)
      if (index !== -1) {
        canvases.value.splice(index, 1)
      }
    } catch (error) {
      console.error('删除背景图失败:', error)
      throw error
    }
  }

  // 获取背景图配置
  const getCanvasConfig = async (id) => {
    try {
      const response = await canvasApi.getCanvasConfig(id)
      return response.data
    } catch (error) {
      console.error('获取背景图配置失败:', error)
      throw error
    }
  }

  // 更新背景图配置
  const updateCanvasConfig = async (id, config) => {
    try {
      const response = await canvasApi.updateCanvasConfig(id, config)
      return response.data
    } catch (error) {
      console.error('更新背景图配置失败:', error)
      throw error
    }
  }

  // 生成背景图
  const generateCanvas = async (id, style = 'normal') => {
    try {
      const response = await canvasApi.generateCanvas(id, style)
      return response.data
    } catch (error) {
      console.error('生成背景图失败:', error)
      throw error
    }
  }

  // 复制背景图
  const duplicateCanvas = async (id) => {
    try {
      const response = await api.post(`/canvas/${id}/duplicate`)
      canvases.value.push(response.data)
      return response.data
    } catch (error) {
      console.error('复制背景图失败:', error)
      throw error
    }
  }

  // 导出背景图配置
  const exportCanvasConfig = async (id) => {
    try {
      const response = await api.get(`/canvas/${id}/export`)
      return response.data
    } catch (error) {
      console.error('导出背景图配置失败:', error)
      throw error
    }
  }

  // 导入背景图配置
  const importCanvasConfig = async (data) => {
    try {
      const response = await api.post('/canvas/import', data)
      canvases.value.push(response.data)
      return response.data
    } catch (error) {
      console.error('导入背景图配置失败:', error)
      throw error
    }
  }

  return {
    canvases,
    loading,
    getCanvases,
    getCanvas,
    createCanvas,
    updateCanvas,
    deleteCanvas,
    getCanvasConfig,
    updateCanvasConfig,
    generateCanvas,
    duplicateCanvas,
    exportCanvasConfig,
    importCanvasConfig
  }
})
