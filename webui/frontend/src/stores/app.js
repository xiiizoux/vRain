import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAppStore = defineStore('app', () => {
  // 状态
  const sidebarCollapsed = ref(false)
  const theme = ref('light')
  const loading = ref(false)
  const currentUser = ref(null)
  
  // 计算属性
  const isDark = computed(() => theme.value === 'dark')
  
  // 方法
  const toggleSidebar = () => {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }
  
  const toggleTheme = () => {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
    // 更新HTML类名
    if (typeof document !== 'undefined' && document.documentElement) {
      if (theme.value === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
    // 保存主题设置
    saveTheme()
  }
  
  const setLoading = (value) => {
    loading.value = value
  }
  
  const setUser = (user) => {
    currentUser.value = user
  }
  
  // 初始化主题
  const initTheme = () => {
    // 确保在浏览器环境中运行
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return
    }

    try {
      const savedTheme = localStorage.getItem('vrain-theme')
      if (savedTheme) {
        theme.value = savedTheme
        if (savedTheme === 'dark' && document?.documentElement) {
          document.documentElement.classList.add('dark')
        }
      }
    } catch (error) {
      console.warn('Failed to initialize theme:', error)
    }
  }
  
  // 保存主题到本地存储
  const saveTheme = () => {
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem('vrain-theme', theme.value)
      } catch (error) {
        console.warn('Failed to save theme:', error)
      }
    }
  }
  
  return {
    // 状态
    sidebarCollapsed,
    theme,
    loading,
    currentUser,
    
    // 计算属性
    isDark,
    
    // 方法
    toggleSidebar,
    toggleTheme,
    setLoading,
    setUser,
    initTheme,
    saveTheme
  }
})
