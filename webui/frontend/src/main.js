import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import zhCn from 'element-plus/es/locale/lang/zh-cn'

import App from './App.vue'
import router from './router'
import './assets/styles/main.scss'

// 安全的应用初始化
async function initApp() {
  try {
    const app = createApp(App)

    // 注册Element Plus图标
    for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
      app.component(key, component)
    }

    // 创建 Pinia 实例
    const pinia = createPinia()

    // 按顺序注册插件
    app.use(pinia)
    app.use(router)
    app.use(ElementPlus, {
      locale: zhCn,
    })

    // 等待 DOM 准备就绪
    await new Promise(resolve => {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', resolve)
      } else {
        resolve()
      }
    })

    // 挂载应用
    app.mount('#app')
  } catch (error) {
    console.error('应用初始化失败:', error)
  }
}

// 启动应用
initApp()
