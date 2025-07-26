<template>
  <div class="error-page">
    <div class="error-content">
      <div class="error-icon">
        <el-icon size="120" color="#409EFF">
          <DocumentDelete />
        </el-icon>
      </div>
      
      <h1 class="error-title">404</h1>
      <p class="error-message">抱歉，您访问的页面不存在</p>
      <p class="error-description">
        可能是页面地址错误，或者页面已被删除
      </p>
      
      <div class="error-actions">
        <el-button type="primary" @click="goHome">
          <el-icon><HomeFilled /></el-icon>
          返回首页
        </el-button>
        <el-button @click="goBack">
          <el-icon><Back /></el-icon>
          返回上页
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => {
  router.push('/')
}

const goBack = () => {
  router.go(-1)
}
</script>

<style lang="scss" scoped>
.error-page {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--el-bg-color-page);
}

.error-content {
  text-align: center;
  max-width: 500px;
  padding: 40px;
  
  .error-icon {
    margin-bottom: 24px;
  }
  
  .error-title {
    font-size: 72px;
    font-weight: 700;
    color: var(--el-color-primary);
    margin: 0 0 16px;
    line-height: 1;
  }
  
  .error-message {
    font-size: 24px;
    color: var(--el-text-color-primary);
    margin: 0 0 12px;
  }
  
  .error-description {
    font-size: 16px;
    color: var(--el-text-color-regular);
    margin: 0 0 32px;
    line-height: 1.5;
  }
  
  .error-actions {
    display: flex;
    gap: 16px;
    justify-content: center;
  }
}
</style>
