<template>
  <div class="book-files">
    <div class="page-header">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/books' }">书籍管理</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: `/books/${bookId}` }">{{ book?.title || '书籍详情' }}</el-breadcrumb-item>
        <el-breadcrumb-item>文件管理</el-breadcrumb-item>
      </el-breadcrumb>
      
      <div class="header-actions">
        <el-button @click="$router.go(-1)">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <el-button type="primary" @click="showUploadDialog = true">
          <el-icon><Upload /></el-icon>
          上传文件
        </el-button>
      </div>
    </div>

    <div class="files-content">
      <!-- 文本文件列表 -->
      <el-card title="文本文件" class="files-card">
        <template #header>
          <div class="card-header">
            <span>文本文件 ({{ textFiles.length }})</span>
            <el-button type="primary" size="small" @click="showUploadDialog = true">
              <el-icon><Plus /></el-icon>
              添加文件
            </el-button>
          </div>
        </template>
        
        <el-table :data="textFiles" v-loading="loading">
          <el-table-column prop="filename" label="文件名" />
          <el-table-column prop="size" label="大小" :formatter="formatFileSize" />
          <el-table-column prop="modifiedAt" label="修改时间" :formatter="formatDate" />
          <el-table-column label="操作" width="250">
            <template #default="{ row }">
              <el-button type="text" @click="handleEditFile(row)">
                <el-icon><Edit /></el-icon>
                编辑
              </el-button>
              <el-button type="text" @click="handleViewFile(row)">
                <el-icon><View /></el-icon>
                查看
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

      <!-- 生成的文件列表 -->
      <el-card title="生成的文件" class="files-card">
        <template #header>
          <div class="card-header">
            <span>生成的文件 ({{ generatedFiles.length }})</span>
            <el-button type="primary" size="small" @click="refreshGeneratedFiles">
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
          </div>
        </template>
        
        <el-table :data="generatedFiles" v-loading="generatedLoading">
          <el-table-column prop="filename" label="文件名" />
          <el-table-column prop="size" label="大小" :formatter="formatFileSize" />
          <el-table-column prop="modifiedAt" label="生成时间" :formatter="formatDate" />
          <el-table-column label="类型" width="100">
            <template #default="{ row }">
              <el-tag :type="row.isCompressed ? 'success' : 'info'">
                {{ row.isCompressed ? '已压缩' : '原始' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150">
            <template #default="{ row }">
              <el-button type="text" @click="handleDownloadGenerated(row)">
                <el-icon><Download /></el-icon>
                下载
              </el-button>
              <el-button type="text" @click="handlePreviewPdf(row)">
                <el-icon><View /></el-icon>
                预览
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>

    <!-- 上传文件对话框 -->
    <el-dialog v-model="showUploadDialog" title="上传文本文件" width="500px">
      <el-upload
        ref="uploadRef"
        :action="`/api/books/${bookId}/texts`"
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

    <!-- 文件编辑对话框 -->
    <el-dialog v-model="showEditDialog" title="编辑文件" width="80%" :close-on-click-modal="false">
      <div class="file-editor">
        <div class="editor-header">
          <span>{{ currentFile?.filename }}</span>
          <div class="editor-actions">
            <el-button @click="showEditDialog = false">取消</el-button>
            <el-button type="primary" @click="handleSaveFile" :loading="saving">保存</el-button>
          </div>
        </div>
        <el-input
          v-model="fileContent"
          type="textarea"
          :rows="20"
          placeholder="请输入文件内容..."
          class="file-textarea"
        />
      </div>
    </el-dialog>

    <!-- 文件查看对话框 -->
    <el-dialog v-model="showViewDialog" title="查看文件" width="70%">
      <div class="file-viewer">
        <div class="viewer-header">
          <span>{{ currentFile?.filename }}</span>
        </div>
        <div class="file-content">
          {{ fileContent }}
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { booksApi } from '@/utils/api'
import { formatDate, formatFileSize } from '@/utils/format'

const route = useRoute()
const router = useRouter()

const bookId = computed(() => route.params.id)
const book = ref(null)
const textFiles = ref([])
const generatedFiles = ref([])
const currentFile = ref(null)
const fileContent = ref('')

const loading = ref(false)
const generatedLoading = ref(false)
const saving = ref(false)
const showUploadDialog = ref(false)
const showEditDialog = ref(false)
const showViewDialog = ref(false)

// 获取书籍信息
const fetchBook = async () => {
  try {
    const response = await booksApi.getBook(bookId.value)
    book.value = response.data
  } catch (error) {
    ElMessage.error('获取书籍信息失败')
  }
}

// 获取文本文件列表
const fetchTextFiles = async () => {
  try {
    loading.value = true
    const response = await booksApi.getBookTexts(bookId.value)
    textFiles.value = response.data
  } catch (error) {
    ElMessage.error('获取文本文件列表失败')
  } finally {
    loading.value = false
  }
}

// 获取生成的文件列表
const fetchGeneratedFiles = async () => {
  try {
    generatedLoading.value = true
    const response = await booksApi.getGeneratedFiles(bookId.value)
    generatedFiles.value = response.data
  } catch (error) {
    ElMessage.error('获取生成文件列表失败')
  } finally {
    generatedLoading.value = false
  }
}

// 刷新生成的文件
const refreshGeneratedFiles = () => {
  fetchGeneratedFiles()
}

// 文件操作
const handleEditFile = async (file) => {
  try {
    currentFile.value = file
    const response = await booksApi.getTextContent(bookId.value, file.filename)
    fileContent.value = response.data.content
    showEditDialog.value = true
  } catch (error) {
    ElMessage.error('获取文件内容失败')
  }
}

const handleViewFile = async (file) => {
  try {
    currentFile.value = file
    const response = await booksApi.getTextContent(bookId.value, file.filename)
    fileContent.value = response.data.content
    showViewDialog.value = true
  } catch (error) {
    ElMessage.error('获取文件内容失败')
  }
}

const handleSaveFile = async () => {
  try {
    saving.value = true
    await booksApi.updateTextContent(bookId.value, currentFile.value.filename, { content: fileContent.value })
    ElMessage.success('文件保存成功')
    showEditDialog.value = false
    fetchTextFiles()
  } catch (error) {
    ElMessage.error('文件保存失败')
  } finally {
    saving.value = false
  }
}

const handleDownloadFile = async (file) => {
  try {
    const response = await booksApi.getTextContent(bookId.value, file.filename)
    const blob = new Blob([response.data.content], { type: 'text/plain' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = file.filename
    a.click()
    window.URL.revokeObjectURL(url)
  } catch (error) {
    ElMessage.error('下载失败')
  }
}

const handleDownloadGenerated = async (file) => {
  try {
    const response = await booksApi.downloadFile(bookId.value, file.filename)
    const url = window.URL.createObjectURL(response.data)
    const a = document.createElement('a')
    a.href = url
    a.download = file.filename
    a.click()
    window.URL.revokeObjectURL(url)
  } catch (error) {
    ElMessage.error('下载失败')
  }
}

const handlePreviewPdf = (file) => {
  const url = `/static/books/${bookId.value}/${file.filename}`
  window.open(url, '_blank')
}

const handleDeleteFile = async (file) => {
  try {
    await ElMessageBox.confirm(`确定要删除文件 ${file.filename} 吗？`, '确认删除', {
      type: 'warning'
    })
    
    await booksApi.deleteText(bookId.value, file.filename)
    ElMessage.success('删除成功')
    fetchTextFiles()
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
  fetchTextFiles()
}

const handleUploadError = () => {
  ElMessage.error('上传失败')
}

onMounted(() => {
  fetchBook()
  fetchTextFiles()
  fetchGeneratedFiles()
})
</script>

<style lang="scss" scoped>
.book-files {
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
  
  .files-card {
    margin-bottom: 24px;
    
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }
  
  .file-editor {
    .editor-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--el-border-color);
      
      .editor-actions {
        display: flex;
        gap: 12px;
      }
    }
    
    .file-textarea {
      font-family: 'Courier New', monospace;
    }
  }
  
  .file-viewer {
    .viewer-header {
      margin-bottom: 16px;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--el-border-color);
      font-weight: 600;
    }
    
    .file-content {
      white-space: pre-wrap;
      font-family: 'Courier New', monospace;
      background: var(--el-fill-color-lighter);
      padding: 16px;
      border-radius: 4px;
      max-height: 400px;
      overflow-y: auto;
    }
  }
}
</style>
