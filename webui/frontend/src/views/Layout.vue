<template>
  <div class="layout-container">
    <el-container>
      <!-- 侧边栏 -->
      <el-aside :width="sidebarWidth" class="sidebar">
        <div class="sidebar-header">
          <div class="logo">
            <el-icon size="32" color="#409EFF">
              <Collection />
            </el-icon>
            <span v-show="!appStore.sidebarCollapsed" class="logo-text">vRain WebUI</span>
          </div>
        </div>
        
        <el-menu
          :default-active="$route.path"
          :collapse="appStore.sidebarCollapsed"
          :unique-opened="true"
          router
          class="sidebar-menu"
        >
          <template v-for="route in menuRoutes" :key="route.path">
            <el-menu-item
              v-if="!route.meta?.hidden"
              :index="route.path"
              :disabled="route.meta?.disabled"
            >
              <el-icon>
                <component :is="route.meta?.icon || 'Document'" />
              </el-icon>
              <template #title>{{ route.meta?.title }}</template>
            </el-menu-item>
          </template>
        </el-menu>
      </el-aside>
      
      <!-- 主内容区 -->
      <el-container>
        <!-- 顶部导航 -->
        <el-header class="header">
          <div class="header-left">
            <el-button
              type="text"
              @click="appStore.toggleSidebar"
              class="sidebar-toggle"
            >
              <el-icon size="20">
                <Expand v-if="appStore.sidebarCollapsed" />
                <Fold v-else />
              </el-icon>
            </el-button>
            
            <el-breadcrumb separator="/">
              <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
              <el-breadcrumb-item v-if="currentRoute.meta?.title">
                {{ currentRoute.meta.title }}
              </el-breadcrumb-item>
            </el-breadcrumb>
          </div>
          
          <div class="header-right">
            <el-button
              type="text"
              @click="appStore.toggleTheme"
              class="theme-toggle"
            >
              <el-icon size="18">
                <Sunny v-if="appStore.isDark" />
                <Moon v-else />
              </el-icon>
            </el-button>
            
            <el-dropdown>
              <el-button type="text" class="user-dropdown">
                <el-icon size="18">
                  <User />
                </el-icon>
                <span class="ml-1">管理员</span>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="handleSettings">
                    <el-icon><Setting /></el-icon>
                    系统设置
                  </el-dropdown-item>
                  <el-dropdown-item divided @click="handleAbout">
                    <el-icon><InfoFilled /></el-icon>
                    关于
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </el-header>
        
        <!-- 主内容 -->
        <el-main class="main-content">
          <router-view v-slot="{ Component }">
            <transition name="fade" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </el-main>
      </el-container>
    </el-container>
    
    <!-- 关于对话框 -->
    <el-dialog v-model="aboutVisible" title="关于 vRain WebUI" width="500px">
      <div class="about-content">
        <div class="about-logo">
          <el-icon size="64" color="#409EFF">
            <Collection />
          </el-icon>
        </div>
        <h3>vRain WebUI</h3>
        <p>现代化的中文古籍刻本风格电子书制作工具Web界面</p>
        <div class="about-info">
          <p><strong>版本:</strong> 1.0.0</p>
          <p><strong>技术栈:</strong> Vue.js 3 + Element Plus + Express.js</p>
          <p><strong>作者:</strong> 兀雨书屋</p>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()

// 响应式数据
const aboutVisible = ref(false)

// 计算属性
const sidebarWidth = computed(() => {
  return appStore.sidebarCollapsed ? '64px' : '240px'
})

const currentRoute = computed(() => route)

const menuRoutes = computed(() => {
  return router.getRoutes().find(r => r.name === 'Layout')?.children || []
})

// 方法
const handleSettings = () => {
  router.push('/settings')
}

const handleAbout = () => {
  aboutVisible.value = true
}

// 初始化 - 在组件挂载后执行
onMounted(() => {
  appStore.initTheme()
})
</script>

<style lang="scss" scoped>
.layout-container {
  height: 100vh;
  
  .el-container {
    height: 100%;
  }
}

.sidebar {
  background: var(--el-bg-color);
  border-right: 1px solid var(--el-border-color);
  transition: width 0.3s ease;
  
  .sidebar-header {
    height: 60px;
    display: flex;
    align-items: center;
    padding: 0 20px;
    border-bottom: 1px solid var(--el-border-color);
    
    .logo {
      display: flex;
      align-items: center;
      gap: 12px;
      
      .logo-text {
        font-size: 18px;
        font-weight: 600;
        color: var(--el-text-color-primary);
        white-space: nowrap;
      }
    }
  }
  
  .sidebar-menu {
    border: none;
    height: calc(100vh - 60px);
    overflow-y: auto;
  }
}

.header {
  background: var(--el-bg-color);
  border-bottom: 1px solid var(--el-border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  
  .header-left {
    display: flex;
    align-items: center;
    gap: 16px;
    
    .sidebar-toggle {
      padding: 8px;
      
      &:hover {
        background: var(--el-fill-color-light);
      }
    }
  }
  
  .header-right {
    display: flex;
    align-items: center;
    gap: 12px;
    
    .theme-toggle,
    .user-dropdown {
      padding: 8px;
      
      &:hover {
        background: var(--el-fill-color-light);
      }
    }
  }
}

.main-content {
  background: var(--el-bg-color-page);
  overflow-y: auto;
}

.about-content {
  text-align: center;
  
  .about-logo {
    margin-bottom: 16px;
  }
  
  h3 {
    margin: 16px 0 8px;
    color: var(--el-text-color-primary);
  }
  
  p {
    margin: 8px 0;
    color: var(--el-text-color-regular);
  }
  
  .about-info {
    margin-top: 24px;
    text-align: left;
    
    p {
      margin: 8px 0;
    }
  }
}
</style>
