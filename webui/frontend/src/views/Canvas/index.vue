<template>
  <div class="page-container">
    <div class="page-header">
      <div class="page-title">背景图管理</div>
      <div class="page-description">管理背景图模板，支持多种风格的背景图生成</div>
    </div>
    
    <div class="page-content">
      <!-- 工具栏 -->
      <div class="toolbar">
        <div class="toolbar-left">
          <el-button type="primary" @click="handleCreate">
            <el-icon><Plus /></el-icon>
            新建背景图
          </el-button>
          <el-button @click="handleRefresh">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </div>
        
        <div class="toolbar-right">
          <el-input
            v-model="searchText"
            placeholder="搜索背景图..."
            style="width: 240px"
            clearable
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
          
          <el-select v-model="styleFilter" placeholder="风格筛选" style="width: 120px">
            <el-option label="全部" value="" />
            <el-option label="普通" value="normal" />
            <el-option label="宣纸做旧" value="vintage" />
            <el-option label="竹简" value="bamboo" />
          </el-select>
        </div>
      </div>
      
      <!-- 背景图列表 -->
      <div class="canvas-grid" v-loading="loading">
        <div
          v-for="canvas in filteredCanvases"
          :key="canvas.id"
          class="canvas-card"
          @click="handleView(canvas)"
        >
          <div class="canvas-preview">
            <img
              v-if="canvas.previewUrl"
              :src="canvas.previewUrl"
              :alt="canvas.name"
              class="preview-image"
            />
            <div v-else class="preview-placeholder">
              <el-icon size="48"><Picture /></el-icon>
            </div>
            
            <div class="canvas-style">
              <el-tag :type="getStyleType(canvas.style)" size="small">
                {{ getStyleText(canvas.style) }}
              </el-tag>
            </div>
          </div>
          
          <div class="canvas-info">
            <h3 class="canvas-name">{{ canvas.name }}</h3>
            <p class="canvas-id">ID: {{ canvas.id }}</p>
            <div class="canvas-meta">
              <span class="meta-item">
                <el-icon><Calendar /></el-icon>
                {{ formatDate(canvas.updatedAt) }}
              </span>
            </div>
          </div>
          
          <div class="canvas-actions" @click.stop>
            <el-button
              type="primary"
              size="small"
              @click="handleGenerate(canvas)"
              :loading="canvas.generating"
            >
              <el-icon><Picture /></el-icon>
              生成
            </el-button>
            <el-dropdown @command="(command) => handleAction(command, canvas)">
              <el-button size="small">
                <el-icon><MoreFilled /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="edit">
                    <el-icon><Edit /></el-icon>
                    编辑
                  </el-dropdown-item>
                  <el-dropdown-item command="duplicate">
                    <el-icon><CopyDocument /></el-icon>
                    复制
                  </el-dropdown-item>
                  <el-dropdown-item command="export">
                    <el-icon><Download /></el-icon>
                    导出配置
                  </el-dropdown-item>
                  <el-dropdown-item command="delete" divided>
                    <el-icon><Delete /></el-icon>
                    删除
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
        
        <!-- 空状态 -->
        <div v-if="filteredCanvases.length === 0 && !loading" class="empty-state">
          <el-empty description="暂无背景图模板">
            <el-button type="primary" @click="handleCreate">创建第一个背景图</el-button>
          </el-empty>
        </div>
      </div>
    </div>
    
    <!-- 创建/编辑对话框 -->
    <CanvasDialog
      v-model="dialogVisible"
      :canvas="currentCanvas"
      @success="handleDialogSuccess"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { formatDate } from '@/utils/format'

const router = useRouter()

// 响应式数据
const loading = ref(false)
const searchText = ref('')
const styleFilter = ref('')
const dialogVisible = ref(false)
const currentCanvas = ref(null)
const canvases = ref([
  {
    id: '01_Black',
    name: '经典黑框',
    description: '传统黑色边框背景图',
    style: 'normal',
    previewUrl: '/static/canvas/01_Black/preview.png',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z'
  },
  {
    id: '01_Blue',
    name: '蓝色边框',
    description: '蓝色边框背景图',
    style: 'normal',
    previewUrl: '/static/canvas/01_Blue/preview.png',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z'
  },
  {
    id: '28_Black',
    name: '28列黑框',
    description: '28列黑色边框背景图',
    style: 'normal',
    previewUrl: '/static/canvas/28_Black/preview.png',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z'
  }
])

// 计算属性
const filteredCanvases = computed(() => {
  let filtered = canvases.value
  
  // 搜索过滤
  if (searchText.value) {
    const search = searchText.value.toLowerCase()
    filtered = filtered.filter(canvas => 
      canvas.name.toLowerCase().includes(search) ||
      canvas.id.toLowerCase().includes(search)
    )
  }
  
  // 风格过滤
  if (styleFilter.value) {
    filtered = filtered.filter(canvas => canvas.style === styleFilter.value)
  }
  
  return filtered
})

// 方法
const handleCreate = () => {
  currentCanvas.value = null
  dialogVisible.value = true
}

const handleView = (canvas) => {
  router.push(`/canvas/${canvas.id}`)
}

const handleGenerate = async (canvas) => {
  try {
    canvas.generating = true
    // 模拟生成过程
    await new Promise(resolve => setTimeout(resolve, 2000))
    ElMessage.success('背景图生成成功')
  } catch (error) {
    ElMessage.error('背景图生成失败')
  } finally {
    canvas.generating = false
  }
}

const handleAction = async (command, canvas) => {
  currentCanvas.value = canvas
  
  switch (command) {
    case 'edit':
      dialogVisible.value = true
      break
    case 'duplicate':
      await handleDuplicate(canvas)
      break
    case 'export':
      await handleExport(canvas)
      break
    case 'delete':
      await handleDelete(canvas)
      break
  }
}

const handleDuplicate = async (canvas) => {
  try {
    const newCanvas = {
      ...canvas,
      id: `${canvas.id}_copy`,
      name: `${canvas.name} - 副本`
    }
    canvases.value.push(newCanvas)
    ElMessage.success('背景图复制成功')
  } catch (error) {
    ElMessage.error('背景图复制失败')
  }
}

const handleExport = async (canvas) => {
  ElMessage.info('配置导出功能开发中...')
}

const handleDelete = async (canvas) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除背景图"${canvas.name}"吗？此操作不可恢复。`,
      '确认删除',
      {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const index = canvases.value.findIndex(c => c.id === canvas.id)
    if (index !== -1) {
      canvases.value.splice(index, 1)
    }
    ElMessage.success('背景图删除成功')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('背景图删除失败')
    }
  }
}

const handleRefresh = () => {
  // 刷新数据
  ElMessage.success('数据已刷新')
}

const handleDialogSuccess = () => {
  dialogVisible.value = false
  handleRefresh()
}

const getStyleType = (style) => {
  const types = {
    normal: '',
    vintage: 'warning',
    bamboo: 'success'
  }
  return types[style] || ''
}

const getStyleText = (style) => {
  const texts = {
    normal: '普通',
    vintage: '宣纸做旧',
    bamboo: '竹简'
  }
  return texts[style] || style
}

// 生命周期
onMounted(() => {
  // 初始化数据
})
</script>

<style lang="scss" scoped>
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  
  .toolbar-left,
  .toolbar-right {
    display: flex;
    align-items: center;
    gap: 12px;
  }
}

.canvas-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  
  .canvas-card {
    background: var(--el-bg-color);
    border: 1px solid var(--el-border-color);
    border-radius: 8px;
    overflow: hidden;
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:hover {
      box-shadow: var(--el-box-shadow-light);
      transform: translateY(-2px);
    }
    
    .canvas-preview {
      position: relative;
      height: 200px;
      background: var(--el-fill-color-lighter);
      
      .preview-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      
      .preview-placeholder {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        color: var(--el-text-color-placeholder);
      }
      
      .canvas-style {
        position: absolute;
        top: 12px;
        right: 12px;
      }
    }
    
    .canvas-info {
      padding: 16px;
      
      .canvas-name {
        font-size: 16px;
        font-weight: 600;
        color: var(--el-text-color-primary);
        margin: 0 0 4px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      
      .canvas-id {
        color: var(--el-text-color-regular);
        margin: 0 0 12px;
        font-size: 12px;
        font-family: monospace;
      }
      
      .canvas-meta {
        display: flex;
        gap: 16px;
        
        .meta-item {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          color: var(--el-text-color-secondary);
        }
      }
    }
    
    .canvas-actions {
      padding: 12px 16px;
      border-top: 1px solid var(--el-border-color-lighter);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }
}

.empty-state {
  grid-column: 1 / -1;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
}
</style>
