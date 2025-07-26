<template>
  <div class="page-container">
    <div class="page-header">
      <div class="page-title">日志查看</div>
      <div class="page-description">查看系统运行日志，监控系统状态和错误信息</div>
    </div>
    
    <div class="page-content">
      <!-- 工具栏 -->
      <div class="toolbar">
        <div class="toolbar-left">
          <el-button @click="handleRefresh">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
          <el-button @click="handleClear">
            <el-icon><Delete /></el-icon>
            清空日志
          </el-button>
          <el-button @click="handleDownload">
            <el-icon><Download /></el-icon>
            下载日志
          </el-button>
        </div>
        
        <div class="toolbar-right">
          <el-input
            v-model="searchText"
            placeholder="搜索日志..."
            style="width: 240px"
            clearable
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
          
          <el-select v-model="levelFilter" placeholder="级别筛选" style="width: 100px">
            <el-option label="全部" value="" />
            <el-option label="DEBUG" value="debug" />
            <el-option label="INFO" value="info" />
            <el-option label="WARN" value="warn" />
            <el-option label="ERROR" value="error" />
          </el-select>
          
          <el-select v-model="moduleFilter" placeholder="模块筛选" style="width: 120px">
            <el-option label="全部" value="" />
            <el-option label="系统" value="system" />
            <el-option label="生成器" value="generator" />
            <el-option label="API" value="api" />
            <el-option label="数据库" value="database" />
          </el-select>
        </div>
      </div>
      
      <!-- 日志统计 -->
      <div class="log-stats">
        <div class="stat-item">
          <div class="stat-value">{{ stats.total }}</div>
          <div class="stat-label">总计</div>
        </div>
        <div class="stat-item error">
          <div class="stat-value">{{ stats.error }}</div>
          <div class="stat-label">错误</div>
        </div>
        <div class="stat-item warn">
          <div class="stat-value">{{ stats.warn }}</div>
          <div class="stat-label">警告</div>
        </div>
        <div class="stat-item info">
          <div class="stat-value">{{ stats.info }}</div>
          <div class="stat-label">信息</div>
        </div>
        <div class="stat-item debug">
          <div class="stat-value">{{ stats.debug }}</div>
          <div class="stat-label">调试</div>
        </div>
      </div>
      
      <!-- 日志列表 -->
      <div class="log-container" v-loading="loading">
        <div class="log-header">
          <div class="log-controls">
            <el-switch
              v-model="autoScroll"
              active-text="自动滚动"
              inactive-text="停止滚动"
            />
            <el-switch
              v-model="showTimestamp"
              active-text="显示时间"
              inactive-text="隐藏时间"
            />
          </div>
        </div>
        
        <div class="log-content" ref="logContentRef">
          <div
            v-for="log in filteredLogs"
            :key="log.id"
            :class="['log-entry', `log-${log.level}`]"
          >
            <div class="log-time" v-if="showTimestamp">
              {{ formatTime(log.timestamp) }}
            </div>
            <div class="log-level">
              <el-tag :type="getLevelType(log.level)" size="small">
                {{ log.level.toUpperCase() }}
              </el-tag>
            </div>
            <div class="log-module">
              [{{ log.module }}]
            </div>
            <div class="log-message">
              {{ log.message }}
            </div>
          </div>
          
          <!-- 空状态 -->
          <div v-if="filteredLogs.length === 0 && !loading" class="empty-logs">
            <el-empty description="暂无日志数据" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 响应式数据
const loading = ref(false)
const searchText = ref('')
const levelFilter = ref('')
const moduleFilter = ref('')
const autoScroll = ref(true)
const showTimestamp = ref(true)
const logContentRef = ref(null)

const logs = ref([
  {
    id: 1,
    timestamp: '2025-01-01T10:00:00Z',
    level: 'info',
    module: 'system',
    message: '系统启动成功'
  },
  {
    id: 2,
    timestamp: '2025-01-01T10:01:00Z',
    level: 'info',
    module: 'api',
    message: 'API服务器启动，监听端口 3000'
  },
  {
    id: 3,
    timestamp: '2025-01-01T10:02:00Z',
    level: 'debug',
    module: 'database',
    message: '数据库连接建立成功'
  },
  {
    id: 4,
    timestamp: '2025-01-01T10:03:00Z',
    level: 'warn',
    module: 'generator',
    message: '生成器内存使用率较高: 85%'
  },
  {
    id: 5,
    timestamp: '2025-01-01T10:04:00Z',
    level: 'error',
    module: 'generator',
    message: '生成任务失败: 文件不存在 /path/to/file.txt'
  }
])

let logTimer = null

// 计算属性
const filteredLogs = computed(() => {
  let filtered = logs.value
  
  // 搜索过滤
  if (searchText.value) {
    const search = searchText.value.toLowerCase()
    filtered = filtered.filter(log => 
      log.message.toLowerCase().includes(search) ||
      log.module.toLowerCase().includes(search)
    )
  }
  
  // 级别过滤
  if (levelFilter.value) {
    filtered = filtered.filter(log => log.level === levelFilter.value)
  }
  
  // 模块过滤
  if (moduleFilter.value) {
    filtered = filtered.filter(log => log.module === moduleFilter.value)
  }
  
  return filtered.slice(-1000) // 只显示最近1000条
})

const stats = computed(() => {
  const result = {
    total: logs.value.length,
    error: 0,
    warn: 0,
    info: 0,
    debug: 0
  }
  
  logs.value.forEach(log => {
    if (result[log.level] !== undefined) {
      result[log.level]++
    }
  })
  
  return result
})

// 方法
const handleRefresh = () => {
  // 刷新日志
  ElMessage.success('日志已刷新')
}

const handleClear = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要清空所有日志吗？此操作不可恢复。',
      '确认清空',
      {
        confirmButtonText: '清空',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    logs.value = []
    ElMessage.success('日志已清空')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('清空失败')
    }
  }
}

const handleDownload = () => {
  const content = logs.value.map(log => 
    `${log.timestamp} [${log.level.toUpperCase()}] [${log.module}] ${log.message}`
  ).join('\n')
  
  const blob = new Blob([content], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `vrain-logs-${new Date().toISOString().split('T')[0]}.txt`
  link.click()
  URL.revokeObjectURL(url)
  
  ElMessage.success('日志下载成功')
}

const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

const getLevelType = (level) => {
  const types = {
    debug: 'info',
    info: 'success',
    warn: 'warning',
    error: 'danger'
  }
  return types[level] || ''
}

const scrollToBottom = () => {
  if (autoScroll.value && logContentRef.value) {
    nextTick(() => {
      logContentRef.value.scrollTop = logContentRef.value.scrollHeight
    })
  }
}

// 模拟新日志
const addRandomLog = () => {
  const levels = ['debug', 'info', 'warn', 'error']
  const modules = ['system', 'generator', 'api', 'database']
  const messages = [
    '任务执行成功',
    '文件处理完成',
    '内存使用率: 75%',
    '网络连接超时',
    '数据库查询完成',
    '用户认证成功',
    '配置文件加载',
    '缓存清理完成'
  ]
  
  const newLog = {
    id: Date.now(),
    timestamp: new Date().toISOString(),
    level: levels[Math.floor(Math.random() * levels.length)],
    module: modules[Math.floor(Math.random() * modules.length)],
    message: messages[Math.floor(Math.random() * messages.length)]
  }
  
  logs.value.push(newLog)
  scrollToBottom()
}

// 生命周期
onMounted(() => {
  // 模拟实时日志
  logTimer = setInterval(addRandomLog, 3000)
  scrollToBottom()
})

onUnmounted(() => {
  if (logTimer) {
    clearInterval(logTimer)
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

.log-stats {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  
  .stat-item {
    flex: 1;
    background: var(--el-bg-color);
    border: 1px solid var(--el-border-color);
    border-radius: 8px;
    padding: 16px;
    text-align: center;
    
    .stat-value {
      font-size: 24px;
      font-weight: 600;
      color: var(--el-text-color-primary);
    }
    
    .stat-label {
      font-size: 12px;
      color: var(--el-text-color-regular);
      margin-top: 4px;
    }
    
    &.error {
      border-color: var(--el-color-danger);
      .stat-value { color: var(--el-color-danger); }
    }
    
    &.warn {
      border-color: var(--el-color-warning);
      .stat-value { color: var(--el-color-warning); }
    }
    
    &.info {
      border-color: var(--el-color-success);
      .stat-value { color: var(--el-color-success); }
    }
    
    &.debug {
      border-color: var(--el-color-info);
      .stat-value { color: var(--el-color-info); }
    }
  }
}

.log-container {
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  overflow: hidden;
  
  .log-header {
    padding: 12px 16px;
    border-bottom: 1px solid var(--el-border-color);
    background: var(--el-fill-color-lighter);
    
    .log-controls {
      display: flex;
      gap: 20px;
    }
  }
  
  .log-content {
    height: 500px;
    overflow-y: auto;
    font-family: 'Courier New', monospace;
    font-size: 12px;
    
    .log-entry {
      display: flex;
      align-items: center;
      padding: 4px 16px;
      border-bottom: 1px solid var(--el-border-color-lighter);
      
      &:hover {
        background: var(--el-fill-color-lighter);
      }
      
      .log-time {
        width: 160px;
        color: var(--el-text-color-secondary);
        flex-shrink: 0;
      }
      
      .log-level {
        width: 80px;
        flex-shrink: 0;
      }
      
      .log-module {
        width: 100px;
        color: var(--el-text-color-regular);
        flex-shrink: 0;
      }
      
      .log-message {
        flex: 1;
        color: var(--el-text-color-primary);
        word-break: break-all;
      }
      
      &.log-error {
        background: rgba(245, 108, 108, 0.1);
      }
      
      &.log-warn {
        background: rgba(230, 162, 60, 0.1);
      }
    }
    
    .empty-logs {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
    }
  }
}
</style>
