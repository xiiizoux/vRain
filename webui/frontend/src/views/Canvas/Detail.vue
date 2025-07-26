<template>
  <div class="canvas-detail">
    <div class="page-header">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/canvas' }">背景图管理</el-breadcrumb-item>
        <el-breadcrumb-item>{{ canvas?.name || '背景图详情' }}</el-breadcrumb-item>
      </el-breadcrumb>
      
      <div class="header-actions">
        <el-button @click="$router.go(-1)">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <el-button type="primary" @click="handleGenerate" :loading="generating">
          <el-icon><Picture /></el-icon>
          生成背景图
        </el-button>
      </div>
    </div>

    <div class="detail-content" v-loading="loading">
      <el-row :gutter="24" v-if="canvas">
        <!-- 基本信息 -->
        <el-col :span="12">
          <el-card title="基本信息" class="detail-card">
            <template #header>
              <div class="card-header">
                <span>基本信息</span>
                <el-button type="text" @click="editMode = !editMode">
                  <el-icon><Edit /></el-icon>
                  {{ editMode ? '取消编辑' : '编辑' }}
                </el-button>
              </div>
            </template>
            
            <el-form :model="canvas" label-width="100px" v-if="!editMode">
              <el-form-item label="背景图ID">
                <span>{{ canvas.id }}</span>
              </el-form-item>
              <el-form-item label="名称">
                <span>{{ canvas.name }}</span>
              </el-form-item>
              <el-form-item label="描述">
                <span>{{ canvas.description || '暂无描述' }}</span>
              </el-form-item>
              <el-form-item label="风格">
                <el-tag>{{ getStyleText(canvas.style) }}</el-tag>
              </el-form-item>
              <el-form-item label="创建时间">
                <span>{{ formatDate(canvas.createdAt) }}</span>
              </el-form-item>
            </el-form>
            
            <!-- 编辑模式 -->
            <el-form :model="editForm" :rules="rules" ref="editFormRef" v-else>
              <el-form-item label="名称" prop="name">
                <el-input v-model="editForm.name" />
              </el-form-item>
              <el-form-item label="描述">
                <el-input v-model="editForm.description" type="textarea" :rows="3" />
              </el-form-item>
              <el-form-item label="风格" prop="style">
                <el-select v-model="editForm.style" style="width: 100%">
                  <el-option label="普通" value="normal" />
                  <el-option label="宣纸做旧" value="vintage" />
                  <el-option label="竹简" value="bamboo" />
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="handleSave" :loading="saving">保存</el-button>
                <el-button @click="editMode = false">取消</el-button>
              </el-form-item>
            </el-form>
          </el-card>
        </el-col>

        <!-- 预览 -->
        <el-col :span="12">
          <el-card title="预览" class="detail-card">
            <div class="canvas-preview">
              <img 
                v-if="canvas.previewUrl" 
                :src="canvas.previewUrl" 
                :alt="canvas.name"
                class="preview-image"
              />
              <div v-else class="preview-placeholder">
                <el-icon size="64"><Picture /></el-icon>
                <p>暂无预览图</p>
                <el-button type="primary" @click="handleGenerate">生成预览</el-button>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 配置参数 -->
      <el-card title="配置参数" class="detail-card config-card" v-if="canvas">
        <template #header>
          <div class="card-header">
            <span>配置参数</span>
            <el-button type="primary" @click="configMode = !configMode">
              <el-icon><Setting /></el-icon>
              {{ configMode ? '取消配置' : '编辑配置' }}
            </el-button>
          </div>
        </template>
        
        <div v-if="!configMode" class="config-display">
          <el-row :gutter="24">
            <el-col :span="8">
              <div class="config-group">
                <h4>画布设置</h4>
                <div class="config-item">
                  <span class="label">宽度:</span>
                  <span>{{ config.canvas_width || 1654 }}px</span>
                </div>
                <div class="config-item">
                  <span class="label">高度:</span>
                  <span>{{ config.canvas_height || 2339 }}px</span>
                </div>
                <div class="config-item">
                  <span class="label">背景色:</span>
                  <span>{{ config.canvas_color || '#FFFFFF' }}</span>
                </div>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="config-group">
                <h4>边距设置</h4>
                <div class="config-item">
                  <span class="label">左边距:</span>
                  <span>{{ config.margin_left || 100 }}px</span>
                </div>
                <div class="config-item">
                  <span class="label">右边距:</span>
                  <span>{{ config.margin_right || 100 }}px</span>
                </div>
                <div class="config-item">
                  <span class="label">上边距:</span>
                  <span>{{ config.margin_top || 150 }}px</span>
                </div>
                <div class="config-item">
                  <span class="label">下边距:</span>
                  <span>{{ config.margin_bottom || 150 }}px</span>
                </div>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="config-group">
                <h4>版面设置</h4>
                <div class="config-item">
                  <span class="label">列数:</span>
                  <span>{{ config.leaf_col || 2 }}</span>
                </div>
                <div class="config-item">
                  <span class="label">列宽:</span>
                  <span>{{ config.leaf_col_width || 600 }}px</span>
                </div>
              </div>
            </el-col>
          </el-row>
        </div>
        
        <!-- 配置编辑模式 -->
        <el-form :model="configForm" v-else class="config-form">
          <el-row :gutter="24">
            <el-col :span="8">
              <h4>画布设置</h4>
              <el-form-item label="宽度">
                <el-input-number v-model="configForm.canvas_width" :min="500" :max="5000" />
              </el-form-item>
              <el-form-item label="高度">
                <el-input-number v-model="configForm.canvas_height" :min="700" :max="7000" />
              </el-form-item>
              <el-form-item label="背景色">
                <el-color-picker v-model="configForm.canvas_color" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <h4>边距设置</h4>
              <el-form-item label="左边距">
                <el-input-number v-model="configForm.margin_left" :min="20" :max="200" />
              </el-form-item>
              <el-form-item label="右边距">
                <el-input-number v-model="configForm.margin_right" :min="20" :max="200" />
              </el-form-item>
              <el-form-item label="上边距">
                <el-input-number v-model="configForm.margin_top" :min="20" :max="200" />
              </el-form-item>
              <el-form-item label="下边距">
                <el-input-number v-model="configForm.margin_bottom" :min="20" :max="200" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <h4>版面设置</h4>
              <el-form-item label="列数">
                <el-input-number v-model="configForm.leaf_col" :min="1" :max="20" />
              </el-form-item>
              <el-form-item label="列宽">
                <el-input-number v-model="configForm.leaf_col_width" :min="50" :max="500" />
              </el-form-item>
            </el-col>
          </el-row>
          
          <el-form-item>
            <el-button type="primary" @click="handleSaveConfig" :loading="configSaving">
              保存配置
            </el-button>
            <el-button @click="configMode = false">取消</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useCanvasStore } from '@/stores/canvas'
import { formatDate } from '@/utils/format'

const route = useRoute()
const router = useRouter()
const canvasStore = useCanvasStore()

const canvasId = computed(() => route.params.id)
const canvas = ref(null)
const config = ref({})

const loading = ref(false)
const editMode = ref(false)
const configMode = ref(false)
const saving = ref(false)
const configSaving = ref(false)
const generating = ref(false)

const editForm = reactive({
  name: '',
  description: '',
  style: 'normal'
})

const configForm = reactive({
  canvas_width: 1654,
  canvas_height: 2339,
  canvas_color: '#FFFFFF',
  margin_left: 100,
  margin_right: 100,
  margin_top: 150,
  margin_bottom: 150,
  leaf_col: 2,
  leaf_col_width: 600
})

const rules = {
  name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
  style: [{ required: true, message: '请选择风格', trigger: 'change' }]
}

// 获取背景图详情
const fetchCanvasDetail = async () => {
  try {
    loading.value = true
    canvas.value = await canvasStore.getCanvas(canvasId.value)
    config.value = await canvasStore.getCanvasConfig(canvasId.value)
    
    // 初始化编辑表单
    Object.assign(editForm, {
      name: canvas.value.name,
      description: canvas.value.description || '',
      style: canvas.value.style || 'normal'
    })
    
    // 初始化配置表单
    Object.assign(configForm, config.value)
  } catch (error) {
    ElMessage.error('获取背景图详情失败')
    router.push('/canvas')
  } finally {
    loading.value = false
  }
}

// 保存基本信息
const handleSave = async () => {
  try {
    saving.value = true
    await canvasStore.updateCanvas(canvasId.value, editForm)
    canvas.value = { ...canvas.value, ...editForm }
    editMode.value = false
    ElMessage.success('保存成功')
  } catch (error) {
    ElMessage.error('保存失败')
  } finally {
    saving.value = false
  }
}

// 保存配置
const handleSaveConfig = async () => {
  try {
    configSaving.value = true
    await canvasStore.updateCanvasConfig(canvasId.value, configForm)
    config.value = { ...configForm }
    configMode.value = false
    ElMessage.success('配置保存成功')
  } catch (error) {
    ElMessage.error('配置保存失败')
  } finally {
    configSaving.value = false
  }
}

// 生成背景图
const handleGenerate = async () => {
  try {
    generating.value = true
    await canvasStore.generateCanvas(canvasId.value)
    ElMessage.success('开始生成背景图')
    // 重新获取详情以更新预览图
    setTimeout(() => {
      fetchCanvasDetail()
    }, 2000)
  } catch (error) {
    ElMessage.error('生成失败')
  } finally {
    generating.value = false
  }
}

// 工具函数
const getStyleText = (style) => {
  const styleMap = {
    normal: '普通',
    vintage: '宣纸做旧',
    bamboo: '竹简'
  }
  return styleMap[style] || style
}

onMounted(() => {
  fetchCanvasDetail()
})
</script>

<style lang="scss" scoped>
.canvas-detail {
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    
    .header-actions {
      display: flex;
      gap: 12px;
    }
  }
  
  .detail-card {
    margin-bottom: 24px;
    
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }
  
  .canvas-preview {
    text-align: center;
    
    .preview-image {
      max-width: 100%;
      max-height: 400px;
      border: 1px solid var(--el-border-color);
      border-radius: 4px;
    }
    
    .preview-placeholder {
      padding: 60px 20px;
      color: var(--el-text-color-placeholder);
      
      p {
        margin: 16px 0;
      }
    }
  }
  
  .config-display {
    .config-group {
      h4 {
        margin: 0 0 16px;
        color: var(--el-text-color-primary);
        border-bottom: 1px solid var(--el-border-color-lighter);
        padding-bottom: 8px;
      }
      
      .config-item {
        display: flex;
        justify-content: space-between;
        margin-bottom: 8px;
        
        .label {
          font-weight: 500;
          color: var(--el-text-color-regular);
        }
      }
    }
  }
  
  .config-form {
    h4 {
      margin: 0 0 16px;
      color: var(--el-text-color-primary);
      border-bottom: 1px solid var(--el-border-color-lighter);
      padding-bottom: 8px;
    }
  }
}
</style>
