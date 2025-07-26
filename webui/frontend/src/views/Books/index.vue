<template>
  <div class="page-container">
    <div class="page-header">
      <div class="page-title">书籍管理</div>
      <div class="page-description">管理您的古籍电子书项目，创建、编辑和生成电子书</div>
    </div>
    
    <div class="page-content">
      <!-- 工具栏 -->
      <div class="toolbar">
        <div class="toolbar-left">
          <el-button type="primary" @click="handleCreate">
            <el-icon><Plus /></el-icon>
            新建书籍
          </el-button>
          <el-button @click="handleRefresh">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </div>
        
        <div class="toolbar-right">
          <el-input
            v-model="searchText"
            placeholder="搜索书籍..."
            style="width: 240px"
            clearable
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
          
          <el-select v-model="statusFilter" placeholder="状态筛选" style="width: 120px">
            <el-option label="全部" value="" />
            <el-option label="草稿" value="draft" />
            <el-option label="配置中" value="configuring" />
            <el-option label="就绪" value="ready" />
            <el-option label="生成中" value="generating" />
            <el-option label="已完成" value="completed" />
          </el-select>
        </div>
      </div>
      
      <!-- 书籍列表 -->
      <div class="books-grid" v-loading="booksStore.loading">
        <div
          v-for="book in filteredBooks"
          :key="book.id"
          class="book-card"
          @click="handleView(book)"
        >
          <div class="book-cover">
            <img
              v-if="book.cover"
              :src="book.cover"
              :alt="book.title"
              class="cover-image"
            />
            <div v-else class="cover-placeholder">
              <el-icon size="48"><Collection /></el-icon>
            </div>
            
            <div class="book-status">
              <el-tag :type="getStatusType(book.status)" size="small">
                {{ getStatusText(book.status) }}
              </el-tag>
            </div>
          </div>
          
          <div class="book-info">
            <h3 class="book-title">{{ book.title }}</h3>
            <p class="book-author">{{ book.author }}</p>
            <div class="book-meta">
              <span class="meta-item">
                <el-icon><Document /></el-icon>
                {{ book.textCount || 0 }} 个文本
              </span>
              <span class="meta-item">
                <el-icon><Calendar /></el-icon>
                {{ formatDate(book.updatedAt) }}
              </span>
            </div>
          </div>
          
          <div class="book-actions" @click.stop>
            <el-button
              type="primary"
              size="small"
              @click="handleGenerate(book)"
              :disabled="book.status === 'generating'"
            >
              <el-icon><DocumentAdd /></el-icon>
              生成
            </el-button>
            <el-dropdown @command="(command) => handleAction(command, book)">
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
        <div v-if="filteredBooks.length === 0 && !booksStore.loading" class="empty-state">
          <el-empty description="暂无书籍项目">
            <el-button type="primary" @click="handleCreate">创建第一个书籍</el-button>
          </el-empty>
        </div>
      </div>
    </div>
    
    <!-- 创建/编辑对话框 -->
    <BookDialog
      v-model="dialogVisible"
      :book="currentBook"
      @success="handleDialogSuccess"
    />
    
    <!-- 生成对话框 -->
    <GenerateDialog
      v-model="generateVisible"
      :book="currentBook"
      @success="handleGenerateSuccess"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useBooksStore } from '@/stores/books'
import BookDialog from './components/BookDialog.vue'
import GenerateDialog from './components/GenerateDialog.vue'
import { formatDate } from '@/utils/format'

const router = useRouter()
const booksStore = useBooksStore()

// 响应式数据
const searchText = ref('')
const statusFilter = ref('')
const dialogVisible = ref(false)
const generateVisible = ref(false)
const currentBook = ref(null)

// 计算属性
const filteredBooks = computed(() => {
  let books = booksStore.books
  
  // 搜索过滤
  if (searchText.value) {
    const search = searchText.value.toLowerCase()
    books = books.filter(book => 
      book.title.toLowerCase().includes(search) ||
      book.author.toLowerCase().includes(search)
    )
  }
  
  // 状态过滤
  if (statusFilter.value) {
    books = books.filter(book => book.status === statusFilter.value)
  }
  
  return books
})

// 方法
const handleCreate = () => {
  currentBook.value = null
  dialogVisible.value = true
}

const handleView = (book) => {
  router.push(`/books/${book.id}`)
}

const handleGenerate = (book) => {
  currentBook.value = book
  generateVisible.value = true
}

const handleAction = async (command, book) => {
  currentBook.value = book
  
  switch (command) {
    case 'edit':
      dialogVisible.value = true
      break
    case 'duplicate':
      await handleDuplicate(book)
      break
    case 'export':
      await handleExport(book)
      break
    case 'delete':
      await handleDelete(book)
      break
  }
}

const handleDuplicate = async (book) => {
  try {
    const newBook = {
      ...book,
      title: `${book.title} - 副本`,
      id: undefined
    }
    await booksStore.createBook(newBook)
    ElMessage.success('书籍复制成功')
  } catch (error) {
    ElMessage.error('书籍复制失败')
  }
}

const handleExport = async (book) => {
  // TODO: 实现配置导出功能
  ElMessage.info('配置导出功能开发中...')
}

const handleDelete = async (book) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除书籍"${book.title}"吗？此操作不可恢复。`,
      '确认删除',
      {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await booksStore.deleteBook(book.id)
    ElMessage.success('书籍删除成功')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('书籍删除失败')
    }
  }
}

const handleRefresh = () => {
  booksStore.fetchBooks()
}

const handleDialogSuccess = () => {
  dialogVisible.value = false
  handleRefresh()
}

const handleGenerateSuccess = () => {
  generateVisible.value = false
  handleRefresh()
}

const getStatusType = (status) => {
  const types = {
    draft: '',
    configuring: 'warning',
    ready: 'success',
    generating: 'info',
    completed: 'success'
  }
  return types[status] || ''
}

const getStatusText = (status) => {
  const texts = {
    draft: '草稿',
    configuring: '配置中',
    ready: '就绪',
    generating: '生成中',
    completed: '已完成'
  }
  return texts[status] || '未知'
}

// 生命周期
onMounted(() => {
  booksStore.fetchBooks()
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

.books-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
  
  .book-card {
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
    
    .book-cover {
      position: relative;
      height: 180px;
      background: var(--el-fill-color-lighter);
      
      .cover-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      
      .cover-placeholder {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        color: var(--el-text-color-placeholder);
      }
      
      .book-status {
        position: absolute;
        top: 12px;
        right: 12px;
      }
    }
    
    .book-info {
      padding: 16px;
      
      .book-title {
        font-size: 16px;
        font-weight: 600;
        color: var(--el-text-color-primary);
        margin: 0 0 8px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      
      .book-author {
        color: var(--el-text-color-regular);
        margin: 0 0 12px;
        font-size: 14px;
      }
      
      .book-meta {
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
    
    .book-actions {
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
