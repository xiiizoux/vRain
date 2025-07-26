<template>
  <el-dialog
    v-model="visible"
    title="生成电子书"
    width="700px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div class="generate-content">
      <!-- 书籍信息 -->
      <div class="book-info">
        <h4>书籍信息</h4>
        <div class="info-item">
          <span class="label">书名:</span>
          <span>{{ book?.title }}</span>
        </div>
        <div class="info-item">
          <span class="label">作者:</span>
          <span>{{ book?.author }}</span>
        </div>
        <div class="info-item">
          <span class="label">文件数:</span>
          <span>{{ book?.fileCount || 0 }} 个</span>
        </div>
      </div>
      
      <!-- 生成选项 -->
      <div class="generate-options">
        <h4>生成选项</h4>
        <el-form :model="options" label-width="120px">
          <el-form-item label="生成类型">
            <el-radio-group v-model="options.type">
              <el-radio value="full">完整生成</el-radio>
              <el-radio value="preview">预览生成</el-radio>
            </el-radio-group>
          </el-form-item>
          
          <el-form-item label="输出格式">
            <el-checkbox-group v-model="options.formats">
              <el-checkbox value="pdf">PDF</el-checkbox>
              <el-checkbox value="epub">EPUB</el-checkbox>
              <el-checkbox value="mobi">MOBI</el-checkbox>
            </el-checkbox-group>
          </el-form-item>
          
          <el-form-item label="背景图模板">
            <el-select v-model="options.canvasId" placeholder="选择背景图模板" style="width: 100%">
              <el-option
                v-for="canvas in canvasList"
                :key="canvas.id"
                :label="canvas.name"
                :value="canvas.id"
              />
            </el-select>
          </el-form-item>
          
          <el-form-item label="质量设置">
            <el-select v-model="options.quality" style="width: 100%">
              <el-option label="高质量 (较慢)" value="high" />
              <el-option label="标准质量" value="medium" />
              <el-option label="快速生成 (较快)" value="low" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="页面范围">
            <el-radio-group v-model="options.pageRange">
              <el-radio value="all">全部页面</el-radio>
              <el-radio value="custom">自定义范围</el-radio>
            </el-radio-group>
            <div v-if="options.pageRange === 'custom'" class="page-range-input">
              <el-input-number
                v-model="options.startPage"
                :min="1"
                placeholder="起始页"
                style="width: 120px"
              />
              <span style="margin: 0 8px">-</span>
              <el-input-number
                v-model="options.endPage"
                :min="options.startPage || 1"
                placeholder="结束页"
                style="width: 120px"
              />
            </div>
          </el-form-item>
          
          <el-form-item label="生成完成后">
            <el-checkbox v-model="options.autoDownload">自动下载</el-checkbox>
            <el-checkbox v-model="options.notification">桌面通知</el-checkbox>
          </el-form-item>
        </el-form>
      </div>
      
      <!-- 预估信息 -->
      <div class="estimate-info">
        <h4>预估信息</h4>
        <div class="estimate-item">
          <span class="label">预估页数:</span>
          <span>{{ estimatedPages }} 页</span>
        </div>
        <div class="estimate-item">
          <span class="label">预估时间:</span>
          <span>{{ estimatedTime }}</span>
        </div>
        <div class="estimate-item">
          <span class="label">文件大小:</span>
          <span>约 {{ estimatedSize }}</span>
        </div>
      </div>
    </div>
    
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleGenerate" :loading="generating">
          <el-icon><VideoPlay /></el-icon>
          开始生成
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  book: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'success'])

const generating = ref(false)

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const options = reactive({
  type: 'full',
  formats: ['pdf'],
  canvasId: '',
  quality: 'medium',
  pageRange: 'all',
  startPage: 1,
  endPage: null,
  autoDownload: true,
  notification: true
})

// 模拟背景图列表
const canvasList = ref([
  { id: '01_Black', name: '经典黑框' },
  { id: '01_Blue', name: '蓝色边框' },
  { id: '28_Black', name: '28列黑框' }
])

// 预估信息
const estimatedPages = computed(() => {
  const fileCount = props.book?.fileCount || 0
  return Math.max(1, fileCount * 10) // 假设每个文件约10页
})

const estimatedTime = computed(() => {
  const pages = estimatedPages.value
  const qualityMultiplier = {
    high: 1.5,
    medium: 1.0,
    low: 0.7
  }[options.quality]
  
  const minutes = Math.ceil(pages * 0.1 * qualityMultiplier)
  
  if (minutes < 1) return '< 1分钟'
  if (minutes < 60) return `${minutes}分钟`
  
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return `${hours}小时${remainingMinutes}分钟`
})

const estimatedSize = computed(() => {
  const pages = estimatedPages.value
  const formatMultiplier = {
    pdf: 1.0,
    epub: 0.3,
    mobi: 0.4
  }
  
  let totalSize = 0
  options.formats.forEach(format => {
    totalSize += pages * 0.5 * formatMultiplier[format] // 假设每页0.5MB
  })
  
  if (totalSize < 1) return `${Math.round(totalSize * 1024)}KB`
  return `${totalSize.toFixed(1)}MB`
})

const handleGenerate = async () => {
  try {
    // 验证必填项
    if (options.formats.length === 0) {
      ElMessage.warning('请选择至少一种输出格式')
      return
    }
    
    if (!options.canvasId) {
      ElMessage.warning('请选择背景图模板')
      return
    }
    
    generating.value = true
    
    // 模拟生成过程
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    ElMessage.success('生成任务已启动')
    emit('success', {
      bookId: props.book?.id,
      options: { ...options }
    })
    handleClose()
  } catch (error) {
    ElMessage.error('生成失败')
  } finally {
    generating.value = false
  }
}

const handleClose = () => {
  visible.value = false
}
</script>

<style lang="scss" scoped>
.generate-content {
  .book-info,
  .generate-options,
  .estimate-info {
    margin-bottom: 24px;
    
    h4 {
      margin: 0 0 16px;
      font-size: 16px;
      font-weight: 600;
      color: var(--el-text-color-primary);
      border-bottom: 1px solid var(--el-border-color-lighter);
      padding-bottom: 8px;
    }
  }
  
  .info-item,
  .estimate-item {
    display: flex;
    margin-bottom: 8px;
    
    .label {
      width: 80px;
      font-weight: 500;
      color: var(--el-text-color-regular);
    }
  }
  
  .page-range-input {
    margin-top: 8px;
    display: flex;
    align-items: center;
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
