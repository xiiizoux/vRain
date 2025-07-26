<template>
  <div class="book-detail">
    <div class="page-header">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/books' }">书籍管理</el-breadcrumb-item>
        <el-breadcrumb-item>{{ book?.title || '书籍详情' }}</el-breadcrumb-item>
      </el-breadcrumb>
      
      <div class="header-actions">
        <el-button @click="$router.go(-1)">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <el-button type="primary" @click="handleGenerate" :loading="generating">
          <el-icon><VideoPlay /></el-icon>
          生成电子书
        </el-button>
      </div>
    </div>

    <div class="detail-content" v-loading="loading">
      <el-row :gutter="24" v-if="book">
        <!-- 基本信息 -->
        <el-col :span="16">
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
            
            <el-form :model="book" label-width="100px" v-if="!editMode">
              <el-form-item label="书籍ID">
                <span>{{ book.id }}</span>
              </el-form-item>
              <el-form-item label="书名">
                <span>{{ book.title }}</span>
              </el-form-item>
              <el-form-item label="作者">
                <span>{{ book.author }}</span>
              </el-form-item>
              <el-form-item label="描述">
                <span>{{ book.description || '暂无描述' }}</span>
              </el-form-item>
              <el-form-item label="状态">
                <el-tag :type="getStatusType(book.status)">
                  {{ formatStatus(book.status) }}
                </el-tag>
              </el-form-item>
              <el-form-item label="创建时间">
                <span>{{ formatDate(book.createdAt) }}</span>
              </el-form-item>
            </el-form>
            
            <!-- 编辑模式 -->
            <el-form :model="editForm" :rules="rules" ref="editFormRef" v-else>
              <el-form-item label="书名" prop="title">
                <el-input v-model="editForm.title" />
              </el-form-item>
              <el-form-item label="作者" prop="author">
                <el-input v-model="editForm.author" />
              </el-form-item>
              <el-form-item label="描述">
                <el-input v-model="editForm.description" type="textarea" :rows="3" />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="handleSave" :loading="saving">保存</el-button>
                <el-button @click="editMode = false">取消</el-button>
              </el-form-item>
            </el-form>
          </el-card>
        </el-col>

        <!-- 操作面板 -->
        <el-col :span="8">
          <el-card title="快速操作" class="detail-card">
            <div class="action-buttons">
              <el-button type="primary" block @click="handleGenerate" :loading="generating">
                <el-icon><VideoPlay /></el-icon>
                生成电子书
              </el-button>
              <el-button block @click="handlePreview" :loading="previewing">
                <el-icon><View /></el-icon>
                预览生成
              </el-button>
              <el-button block @click="$router.push(`/books/${book.id}/config`)">
                <el-icon><Setting /></el-icon>
                配置参数
              </el-button>
              <el-button block @click="$router.push(`/books/${book.id}/files`)">
                <el-icon><Document /></el-icon>
                文件管理
              </el-button>
            </div>
          </el-card>

          <!-- 生成状态 -->
          <el-card title="生成状态" class="detail-card" v-if="generateStatus">
            <div class="generate-status">
              <div class="status-item">
                <span class="label">当前状态:</span>
                <el-tag :type="generateStatus.isGenerating ? 'warning' : 'success'">
                  {{ generateStatus.isGenerating ? '生成中' : '空闲' }}
                </el-tag>
              </div>
              <div class="status-item" v-if="generateStatus.currentTask">
                <span class="label">当前任务:</span>
                <span>{{ generateStatus.currentTask.type === 'generate' ? '生成电子书' : '预览生成' }}</span>
              </div>
              <div class="status-item" v-if="generateStatus.currentTask">
                <span class="label">进度:</span>
                <el-progress :percentage="generateStatus.currentTask.progress" />
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 文件列表 -->
      <el-card title="文本文件" class="detail-card files-card" v-if="book">
        <template #header>
          <div class="card-header">
            <span>文本文件 ({{ files.length }})</span>
            <el-button type="primary" @click="showUploadDialog = true">
              <el-icon><Upload /></el-icon>
              上传文件
            </el-button>
          </div>
        </template>
        
        <el-table :data="files" v-loading="filesLoading">
          <el-table-column prop="name" label="文件名" />
          <el-table-column prop="size" label="大小" :formatter="formatFileSize" />
          <el-table-column prop="modifiedAt" label="修改时间" :formatter="formatDate" />
          <el-table-column label="操作" width="200">
            <template #default="{ row }">
              <el-button type="text" @click="handleEditFile(row)">
                <el-icon><Edit /></el-icon>
                编辑
              </el-button>
              <el-button type="text" @click="handleDownloadFile(row)">
                <el-icon><Download /></el-icon>
                下载
              </el-button>
              <el-button type="text" danger @click="handleDeleteFile(row)">
                <el-icon><Delete /></el-icon>
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>

    <!-- 上传文件对话框 -->
    <el-dialog v-model="showUploadDialog" title="上传文件" width="500px">
      <el-upload
        ref="uploadRef"
        :action="`/api/books/${bookId}/files`"
        :headers="{ 'Authorization': `Bearer ${token}` }"
        :on-success="handleUploadSuccess"
        :on-error="handleUploadError"
        :before-upload="beforeUpload"
        drag
        multiple
      >
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">
          将文件拖到此处，或<em>点击上传</em>
        </div>
        <template #tip>
          <div class="el-upload__tip">
            只能上传.txt文件，且不超过10MB
          </div>
        </template>
      </el-upload>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useBooksStore } from '@/stores/books'
import { formatDate, formatFileSize, formatStatus } from '@/utils/format'

const route = useRoute()
const router = useRouter()
const booksStore = useBooksStore()

const bookId = computed(() => route.params.id)
const book = ref(null)
const files = ref([])
const generateStatus = ref(null)

const loading = ref(false)
const filesLoading = ref(false)
const editMode = ref(false)
const saving = ref(false)
const generating = ref(false)
const previewing = ref(false)
const showUploadDialog = ref(false)

const editForm = reactive({
  title: '',
  author: '',
  description: ''
})

const rules = {
  title: [{ required: true, message: '请输入书名', trigger: 'blur' }],
  author: [{ required: true, message: '请输入作者', trigger: 'blur' }]
}

// 获取书籍详情
const fetchBookDetail = async () => {
  try {
    loading.value = true
    book.value = await booksStore.getBook(bookId.value)
    
    // 初始化编辑表单
    Object.assign(editForm, {
      title: book.value.title,
      author: book.value.author,
      description: book.value.description || ''
    })
  } catch (error) {
    ElMessage.error('获取书籍详情失败')
    router.push('/books')
  } finally {
    loading.value = false
  }
}

// 获取文件列表
const fetchFiles = async () => {
  try {
    filesLoading.value = true
    files.value = await booksStore.getBookFiles(bookId.value)
  } catch (error) {
    ElMessage.error('获取文件列表失败')
  } finally {
    filesLoading.value = false
  }
}

// 获取生成状态
const fetchGenerateStatus = async () => {
  try {
    generateStatus.value = await booksStore.getBookGenerateStatus(bookId.value)
  } catch (error) {
    console.error('获取生成状态失败:', error)
  }
}

// 保存编辑
const handleSave = async () => {
  try {
    saving.value = true
    await booksStore.updateBook(bookId.value, editForm)
    book.value = { ...book.value, ...editForm }
    editMode.value = false
    ElMessage.success('保存成功')
  } catch (error) {
    ElMessage.error('保存失败')
  } finally {
    saving.value = false
  }
}

// 生成电子书
const handleGenerate = async () => {
  try {
    generating.value = true
    await booksStore.generateBook(bookId.value)
    ElMessage.success('开始生成电子书')
    fetchGenerateStatus()
  } catch (error) {
    ElMessage.error('生成失败')
  } finally {
    generating.value = false
  }
}

// 预览生成
const handlePreview = async () => {
  try {
    previewing.value = true
    await booksStore.previewBook(bookId.value)
    ElMessage.success('开始预览生成')
    fetchGenerateStatus()
  } catch (error) {
    ElMessage.error('预览失败')
  } finally {
    previewing.value = false
  }
}

// 文件操作
const handleEditFile = (file) => {
  router.push(`/books/${bookId.value}/files/${file.name}/edit`)
}

const handleDownloadFile = async (file) => {
  try {
    await booksStore.downloadFile(bookId.value, file.name)
  } catch (error) {
    ElMessage.error('下载失败')
  }
}

const handleDeleteFile = async (file) => {
  try {
    await ElMessageBox.confirm(`确定要删除文件 ${file.name} 吗？`, '确认删除', {
      type: 'warning'
    })
    
    await booksStore.deleteFile(bookId.value, file.name)
    ElMessage.success('删除成功')
    fetchFiles()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 上传相关
const beforeUpload = (file) => {
  const isText = file.type === 'text/plain' || file.name.endsWith('.txt')
  const isLt10M = file.size / 1024 / 1024 < 10

  if (!isText) {
    ElMessage.error('只能上传.txt格式的文件!')
    return false
  }
  if (!isLt10M) {
    ElMessage.error('文件大小不能超过10MB!')
    return false
  }
  return true
}

const handleUploadSuccess = () => {
  ElMessage.success('上传成功')
  showUploadDialog.value = false
  fetchFiles()
}

const handleUploadError = () => {
  ElMessage.error('上传失败')
}

// 工具函数
const getStatusType = (status) => {
  const typeMap = {
    draft: '',
    configuring: 'warning',
    ready: 'success',
    generating: 'warning',
    completed: 'success'
  }
  return typeMap[status] || ''
}

onMounted(() => {
  fetchBookDetail()
  fetchFiles()
  fetchGenerateStatus()
})
</script>

<style lang="scss" scoped>
.book-detail {
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
  
  .action-buttons {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  
  .generate-status {
    .status-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      
      .label {
        font-weight: 500;
        color: var(--el-text-color-regular);
      }
    }
  }
  
  .files-card {
    .el-table {
      margin-top: 16px;
    }
  }
}
</style>
