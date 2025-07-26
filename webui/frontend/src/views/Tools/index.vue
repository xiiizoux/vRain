<template>
  <div class="page-container">
    <div class="page-header">
      <div class="page-title">工具集</div>
      <div class="page-description">提供各种实用工具，帮助您更好地管理和处理电子书</div>
    </div>
    
    <div class="page-content">
      <div class="tools-grid">
        <!-- 文本处理工具 -->
        <div class="tool-category">
          <h3 class="category-title">文本处理</h3>
          <div class="tools-row">
            <div class="tool-card" @click="openTool('text-converter')">
              <div class="tool-icon">
                <el-icon size="32"><DocumentCopy /></el-icon>
              </div>
              <div class="tool-info">
                <h4>文本格式转换</h4>
                <p>支持多种文本格式之间的转换</p>
              </div>
            </div>
            
            <div class="tool-card" @click="openTool('text-cleaner')">
              <div class="tool-icon">
                <el-icon size="32"><Brush /></el-icon>
              </div>
              <div class="tool-info">
                <h4>文本清理</h4>
                <p>清理文本中的多余空格、换行等</p>
              </div>
            </div>
            
            <div class="tool-card" @click="openTool('text-splitter')">
              <div class="tool-icon">
                <el-icon size="32"><Scissors /></el-icon>
              </div>
              <div class="tool-info">
                <h4>文本分割</h4>
                <p>按章节、段落等规则分割文本</p>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 图像处理工具 -->
        <div class="tool-category">
          <h3 class="category-title">图像处理</h3>
          <div class="tools-row">
            <div class="tool-card" @click="openTool('image-converter')">
              <div class="tool-icon">
                <el-icon size="32"><Picture /></el-icon>
              </div>
              <div class="tool-info">
                <h4>图像格式转换</h4>
                <p>支持多种图像格式之间的转换</p>
              </div>
            </div>
            
            <div class="tool-card" @click="openTool('image-resizer')">
              <div class="tool-icon">
                <el-icon size="32"><Crop /></el-icon>
              </div>
              <div class="tool-info">
                <h4>图像尺寸调整</h4>
                <p>批量调整图像尺寸和质量</p>
              </div>
            </div>
            
            <div class="tool-card" @click="openTool('watermark')">
              <div class="tool-icon">
                <el-icon size="32"><Stamp /></el-icon>
              </div>
              <div class="tool-info">
                <h4>水印添加</h4>
                <p>为图像批量添加文字或图像水印</p>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 文件管理工具 -->
        <div class="tool-category">
          <h3 class="category-title">文件管理</h3>
          <div class="tools-row">
            <div class="tool-card" @click="openTool('file-organizer')">
              <div class="tool-icon">
                <el-icon size="32"><FolderOpened /></el-icon>
              </div>
              <div class="tool-info">
                <h4>文件整理</h4>
                <p>按规则自动整理和分类文件</p>
              </div>
            </div>
            
            <div class="tool-card" @click="openTool('batch-rename')">
              <div class="tool-icon">
                <el-icon size="32"><EditPen /></el-icon>
              </div>
              <div class="tool-info">
                <h4>批量重命名</h4>
                <p>按模式批量重命名文件</p>
              </div>
            </div>
            
            <div class="tool-card" @click="openTool('duplicate-finder')">
              <div class="tool-icon">
                <el-icon size="32"><CopyDocument /></el-icon>
              </div>
              <div class="tool-info">
                <h4>重复文件查找</h4>
                <p>查找和清理重复的文件</p>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 系统工具 -->
        <div class="tool-category">
          <h3 class="category-title">系统工具</h3>
          <div class="tools-row">
            <div class="tool-card" @click="openTool('system-info')">
              <div class="tool-icon">
                <el-icon size="32"><Monitor /></el-icon>
              </div>
              <div class="tool-info">
                <h4>系统信息</h4>
                <p>查看系统资源使用情况</p>
              </div>
            </div>
            
            <div class="tool-card" @click="openTool('cache-cleaner')">
              <div class="tool-icon">
                <el-icon size="32"><Delete /></el-icon>
              </div>
              <div class="tool-info">
                <h4>缓存清理</h4>
                <p>清理系统临时文件和缓存</p>
              </div>
            </div>
            
            <div class="tool-card" @click="openTool('backup-restore')">
              <div class="tool-icon">
                <el-icon size="32"><Download /></el-icon>
              </div>
              <div class="tool-info">
                <h4>备份恢复</h4>
                <p>备份和恢复系统配置</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 工具对话框 -->
    <el-dialog
      v-model="toolDialogVisible"
      :title="currentTool?.title"
      width="80%"
      :close-on-click-modal="false"
    >
      <div class="tool-content">
        <component
          v-if="currentTool"
          :is="currentTool.component"
          @close="toolDialogVisible = false"
        />
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

// 响应式数据
const toolDialogVisible = ref(false)
const currentTool = ref(null)

// 工具配置
const tools = {
  'text-converter': {
    title: '文本格式转换',
    component: 'TextConverter'
  },
  'text-cleaner': {
    title: '文本清理',
    component: 'TextCleaner'
  },
  'text-splitter': {
    title: '文本分割',
    component: 'TextSplitter'
  },
  'image-converter': {
    title: '图像格式转换',
    component: 'ImageConverter'
  },
  'image-resizer': {
    title: '图像尺寸调整',
    component: 'ImageResizer'
  },
  'watermark': {
    title: '水印添加',
    component: 'Watermark'
  },
  'file-organizer': {
    title: '文件整理',
    component: 'FileOrganizer'
  },
  'batch-rename': {
    title: '批量重命名',
    component: 'BatchRename'
  },
  'duplicate-finder': {
    title: '重复文件查找',
    component: 'DuplicateFinder'
  },
  'system-info': {
    title: '系统信息',
    component: 'SystemInfo'
  },
  'cache-cleaner': {
    title: '缓存清理',
    component: 'CacheCleaner'
  },
  'backup-restore': {
    title: '备份恢复',
    component: 'BackupRestore'
  }
}

// 方法
const openTool = (toolId) => {
  const tool = tools[toolId]
  if (tool) {
    currentTool.value = tool
    toolDialogVisible.value = true
  } else {
    ElMessage.info(`工具"${toolId}"正在开发中...`)
  }
}
</script>

<style lang="scss" scoped>
.tools-grid {
  .tool-category {
    margin-bottom: 40px;
    
    .category-title {
      font-size: 18px;
      font-weight: 600;
      color: var(--el-text-color-primary);
      margin: 0 0 20px;
      padding-bottom: 8px;
      border-bottom: 2px solid var(--el-color-primary);
    }
    
    .tools-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
    }
  }
  
  .tool-card {
    display: flex;
    align-items: center;
    padding: 20px;
    background: var(--el-bg-color);
    border: 1px solid var(--el-border-color);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:hover {
      box-shadow: var(--el-box-shadow-light);
      transform: translateY(-2px);
      border-color: var(--el-color-primary);
    }
    
    .tool-icon {
      flex-shrink: 0;
      width: 64px;
      height: 64px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--el-color-primary-light-9);
      border-radius: 8px;
      color: var(--el-color-primary);
      margin-right: 16px;
    }
    
    .tool-info {
      flex: 1;
      
      h4 {
        font-size: 16px;
        font-weight: 600;
        color: var(--el-text-color-primary);
        margin: 0 0 8px;
      }
      
      p {
        font-size: 14px;
        color: var(--el-text-color-regular);
        margin: 0;
        line-height: 1.5;
      }
    }
  }
}

.tool-content {
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--el-text-color-placeholder);
  font-size: 16px;
}
</style>
