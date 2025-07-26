import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/utils/api'

export const useCanvasStore = defineStore('canvas', () => {
  const canvases = ref([])
  const loading = ref(false)

  // 获取背景图列表
  const getCanvases = async () => {
    try {
      loading.value = true
      const response = await api.get('/canvas')
      canvases.value = response.data
      return response.data
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
      const response = await api.get(`/canvas/${id}`)
      return response.data
    } catch (error) {
      console.error('获取背景图详情失败:', error)
      throw error
    }
  }

  // 创建背景图
  const createCanvas = async (data) => {
    try {
      const response = await api.post('/canvas', data)
      canvases.value.push(response.data)
      return response.data
    } catch (error) {
      console.error('创建背景图失败:', error)
      throw error
    }
  }

  // 更新背景图
  const updateCanvas = async (id, data) => {
    try {
      const response = await api.put(`/canvas/${id}`, data)
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
      await api.delete(`/canvas/${id}`)
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
      const response = await api.get(`/canvas/${id}/config`)
      return response.data
    } catch (error) {
      console.error('获取背景图配置失败:', error)
      throw error
    }
  }

  // 更新背景图配置
  const updateCanvasConfig = async (id, config) => {
    try {
      const response = await api.put(`/canvas/${id}/config`, config)
      return response.data
    } catch (error) {
      console.error('更新背景图配置失败:', error)
      throw error
    }
  }

  // 生成背景图
  const generateCanvas = async (id) => {
    try {
      const response = await api.post(`/canvas/${id}/generate`)
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
