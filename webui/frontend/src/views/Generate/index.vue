<template>
  <div class="page-container">
    <div class="page-header">
      <div class="page-title">生成管理</div>
      <div class="page-description">管理电子书生成任务，查看生成进度和结果</div>
    </div>
    
    <div class="page-content">
      <!-- 工具栏 -->
      <div class="toolbar">
        <div class="toolbar-left">
          <el-button @click="handleRefresh">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
          <el-button @click="handleClearCompleted">
            <el-icon><Delete /></el-icon>
            清理已完成
          </el-button>
        </div>
        
        <div class="toolbar-right">
          <el-select v-model="statusFilter" placeholder="状态筛选" style="width: 120px">
            <el-option label="全部" value="" />
            <el-option label="等待中" value="pending" />
            <el-option label="生成中" value="running" />
            <el-option label="已完成" value="completed" />
            <el-option label="失败" value="failed" />
          </el-select>
        </div>
      </div>
      
      <!-- 任务列表 -->
      <el-table :data="filteredTasks" v-loading="loading">
        <el-table-column prop="id" label="任务ID" width="120" />
        <el-table-column prop="bookTitle" label="书籍" min-width="200" />
        <el-table-column prop="type" label="类型" width="100">
          <template #default="{ row }">
            <el-tag :type="getTypeColor(row.type)">
              {{ formatType(row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusColor(row.status)">
              {{ formatStatus(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="progress" label="进度" width="150">
          <template #default="{ row }">
            <el-progress
              :percentage="row.progress"
              :status="getProgressStatus(row.status)"
              :stroke-width="8"
            />
          </template>
        </el-table-column>
        <el-table-column prop="startTime" label="开始时间" width="180" :formatter="formatDate" />
        <el-table-column prop="duration" label="耗时" width="100">
          <template #default="{ row }">
            {{ formatDuration(row.duration) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="row.status === 'running'"
              type="danger"
              size="small"
              @click="handleCancel(row)"
            >
              <el-icon><Close /></el-icon>
              取消
            </el-button>
            <el-button
              v-if="row.status === 'completed'"
              type="primary"
              size="small"
              @click="handleDownload(row)"
            >
              <el-icon><Download /></el-icon>
              下载
            </el-button>
            <el-button
              v-if="row.status === 'failed'"
              type="warning"
              size="small"
              @click="handleRetry(row)"
            >
              <el-icon><RefreshRight /></el-icon>
              重试
            </el-button>
            <el-button
              type="text"
              size="small"
              @click="handleViewLog(row)"
            >
              <el-icon><Document /></el-icon>
              日志
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
    
    <!-- 日志查看对话框 -->
    <el-dialog v-model="logDialogVisible" title="任务日志" width="80%">
      <div class="log-content">
        <pre>{{ currentLog }}</pre>
      </div>
      <template #footer>
        <el-button @click="logDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { formatDate } from '@/utils/format'
import { tasksApi } from '@/utils/api'

// 响应式数据
const loading = ref(false)
const statusFilter = ref('')
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)
const logDialogVisible = ref(false)
const currentLog = ref('')

const tasks = ref([])

let refreshTimer = null

// 计算属性
const filteredTasks = computed(() => {
  let filtered = tasks.value
  
  // 状态过滤
  if (statusFilter.value) {
    filtered = filtered.filter(task => task.status === statusFilter.value)
  }
  
  total.value = filtered.length
  
  // 分页
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filtered.slice(start, end)
})

// 方法
const fetchTasks = async () => {
  try {
    loading.value = true
    const response = await tasksApi.getTasks()
    tasks.value = response.data
  } catch (error) {
    ElMessage.error('获取任务列表失败')
  } finally {
    loading.value = false
  }
}

const handleRefresh = () => {
  fetchTasks()
}

const handleClearCompleted = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要清理所有已完成的任务吗？',
      '确认清理',
      {
        confirmButtonText: '清理',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    tasks.value = tasks.value.filter(task => task.status !== 'completed')
    ElMessage.success('已完成任务清理成功')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('清理失败')
    }
  }
}

const handleCancel = async (task) => {
  try {
    await ElMessageBox.confirm(
      `确定要取消任务"${task.bookTitle}"吗？`,
      '确认取消',
      {
        confirmButtonText: '取消任务',
        cancelButtonText: '继续执行',
        type: 'warning'
      }
    )

    await tasksApi.cancelTask(task.id)
    ElMessage.success('任务已取消')
    fetchTasks() // 刷新任务列表
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('取消失败')
    }
  }
}

const handleDownload = (task) => {
  // 模拟下载
  const link = document.createElement('a')
  link.href = task.outputPath
  link.download = `${task.bookTitle}.pdf`
  link.click()
  ElMessage.success('开始下载')
}

const handleRetry = async (task) => {
  try {
    task.status = 'pending'
    task.progress = 0
    task.error = null
    task.startTime = new Date().toISOString()
    
    // 模拟重新开始任务
    setTimeout(() => {
      task.status = 'running'
    }, 1000)
    
    ElMessage.success('任务已重新开始')
  } catch (error) {
    ElMessage.error('重试失败')
  }
}

const handleViewLog = async (task) => {
  try {
    const response = await tasksApi.getTaskLogs(task.id)
    currentLog.value = response.data.logs.map(log =>
      `[${formatDate(log.timestamp)}] ${log.message}`
    ).join('\n')
  } catch (error) {
    currentLog.value = `任务ID: ${task.id}
书籍: ${task.bookTitle || task.bookId}
类型: ${formatType(task.type)}
状态: ${formatStatus(task.status)}
开始时间: ${formatDate(task.startedAt)}
${task.completedAt ? `结束时间: ${formatDate(task.completedAt)}` : ''}
${task.error ? `错误信息: ${task.error}` : ''}

=== 详细日志 ===
${task.logs ? task.logs.map(log => `[${formatDate(log.timestamp)}] ${log.message}`).join('\n') : '暂无日志'}`
  }

  logDialogVisible.value = true
}

const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
}

const handleCurrentChange = (page) => {
  currentPage.value = page
}

// 工具函数
const getTypeColor = (type) => {
  const colors = {
    generate: 'primary',
    preview: 'success'
  }
  return colors[type] || ''
}

const getStatusColor = (status) => {
  const colors = {
    pending: 'info',
    running: 'warning',
    completed: 'success',
    failed: 'danger'
  }
  return colors[status] || ''
}

const getProgressStatus = (status) => {
  const statusMap = {
    running: '',
    completed: 'success',
    failed: 'exception'
  }
  return statusMap[status] || ''
}

const formatType = (type) => {
  const types = {
    generate: '生成',
    preview: '预览'
  }
  return types[type] || type
}

const formatStatus = (status) => {
  const statuses = {
    pending: '等待中',
    running: '生成中',
    completed: '已完成',
    failed: '失败'
  }
  return statuses[status] || status
}

const formatDuration = (duration) => {
  if (!duration) return '-'
  
  const seconds = Math.floor(duration / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`
  } else {
    return `${seconds}s`
  }
}

// 模拟进度更新
const updateProgress = () => {
  tasks.value.forEach(task => {
    if (task.status === 'running' && task.progress < 100) {
      task.progress = Math.min(100, task.progress + Math.random() * 10)
      task.duration = Date.now() - new Date(task.startTime).getTime()
      
      if (task.progress >= 100) {
        task.status = 'completed'
        task.endTime = new Date().toISOString()
        task.outputPath = `/output/${task.bookId}.pdf`
      }
    }
  })
}

// 生命周期
onMounted(() => {
  fetchTasks()
  // 定时更新进度
  refreshTimer = setInterval(() => {
    fetchTasks()
  }, 5000)
})

onUnmounted(() => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
  }
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

.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.log-content {
  max-height: 400px;
  overflow-y: auto;
  background: var(--el-fill-color-lighter);
  padding: 16px;
  border-radius: 4px;
  
  pre {
    margin: 0;
    font-family: 'Courier New', monospace;
    font-size: 12px;
    line-height: 1.5;
    white-space: pre-wrap;
    word-wrap: break-word;
  }
}
</style>
