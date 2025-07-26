<template>
  <div class="page-container">
    <div class="page-header">
      <div class="page-title">系统设置</div>
      <div class="page-description">配置系统参数和用户偏好设置</div>
    </div>
    
    <div class="page-content">
      <el-row :gutter="24">
        <!-- 设置菜单 -->
        <el-col :span="6">
          <el-menu
            v-model:default-active="activeTab"
            class="settings-menu"
            @select="handleTabChange"
          >
            <el-menu-item index="general">
              <el-icon><Setting /></el-icon>
              <span>常规设置</span>
            </el-menu-item>
            <el-menu-item index="generator">
              <el-icon><DocumentAdd /></el-icon>
              <span>生成器设置</span>
            </el-menu-item>
            <el-menu-item index="storage">
              <el-icon><FolderOpened /></el-icon>
              <span>存储设置</span>
            </el-menu-item>
            <el-menu-item index="security">
              <el-icon><Lock /></el-icon>
              <span>安全设置</span>
            </el-menu-item>
            <el-menu-item index="about">
              <el-icon><InfoFilled /></el-icon>
              <span>关于系统</span>
            </el-menu-item>
          </el-menu>
        </el-col>
        
        <!-- 设置内容 -->
        <el-col :span="18">
          <div class="settings-content">
            <!-- 常规设置 -->
            <div v-show="activeTab === 'general'" class="settings-panel">
              <h3>常规设置</h3>
              <el-form :model="generalSettings" label-width="120px">
                <el-form-item label="系统语言">
                  <el-select v-model="generalSettings.language" style="width: 200px">
                    <el-option label="简体中文" value="zh-CN" />
                    <el-option label="English" value="en-US" />
                  </el-select>
                </el-form-item>
                
                <el-form-item label="主题模式">
                  <el-radio-group v-model="generalSettings.theme">
                    <el-radio value="light">浅色模式</el-radio>
                    <el-radio value="dark">深色模式</el-radio>
                    <el-radio value="auto">跟随系统</el-radio>
                  </el-radio-group>
                </el-form-item>
                
                <el-form-item label="自动保存">
                  <el-switch v-model="generalSettings.autoSave" />
                  <span class="form-help">编辑时自动保存更改</span>
                </el-form-item>
                
                <el-form-item label="保存间隔">
                  <el-input-number
                    v-model="generalSettings.saveInterval"
                    :min="10"
                    :max="300"
                    :step="10"
                    :disabled="!generalSettings.autoSave"
                  />
                  <span class="form-help">秒</span>
                </el-form-item>
              </el-form>
            </div>
            
            <!-- 生成器设置 -->
            <div v-show="activeTab === 'generator'" class="settings-panel">
              <h3>生成器设置</h3>
              <el-form :model="generatorSettings" label-width="120px">
                <el-form-item label="并发任务数">
                  <el-input-number
                    v-model="generatorSettings.maxConcurrent"
                    :min="1"
                    :max="10"
                  />
                  <span class="form-help">同时运行的生成任务数量</span>
                </el-form-item>
                
                <el-form-item label="输出质量">
                  <el-select v-model="generatorSettings.quality" style="width: 200px">
                    <el-option label="高质量" value="high" />
                    <el-option label="标准质量" value="medium" />
                    <el-option label="快速生成" value="low" />
                  </el-select>
                </el-form-item>
                
                <el-form-item label="默认字体">
                  <el-input v-model="generatorSettings.defaultFont" style="width: 300px" />
                </el-form-item>
                
                <el-form-item label="默认字号">
                  <el-input-number
                    v-model="generatorSettings.defaultFontSize"
                    :min="8"
                    :max="72"
                  />
                  <span class="form-help">pt</span>
                </el-form-item>
                
                <el-form-item label="生成完成通知">
                  <el-switch v-model="generatorSettings.notification" />
                </el-form-item>
              </el-form>
            </div>
            
            <!-- 存储设置 -->
            <div v-show="activeTab === 'storage'" class="settings-panel">
              <h3>存储设置</h3>
              <el-form :model="storageSettings" label-width="120px">
                <el-form-item label="工作目录">
                  <el-input v-model="storageSettings.workDir" style="width: 400px" />
                  <el-button @click="selectDirectory">选择目录</el-button>
                </el-form-item>
                
                <el-form-item label="输出目录">
                  <el-input v-model="storageSettings.outputDir" style="width: 400px" />
                  <el-button @click="selectDirectory">选择目录</el-button>
                </el-form-item>
                
                <el-form-item label="自动清理">
                  <el-switch v-model="storageSettings.autoClean" />
                  <span class="form-help">自动清理临时文件</span>
                </el-form-item>
                
                <el-form-item label="清理周期">
                  <el-select v-model="storageSettings.cleanInterval" style="width: 200px">
                    <el-option label="每天" value="daily" />
                    <el-option label="每周" value="weekly" />
                    <el-option label="每月" value="monthly" />
                  </el-select>
                </el-form-item>
                
                <el-form-item label="存储使用情况">
                  <div class="storage-info">
                    <div class="storage-item">
                      <span>工作目录:</span>
                      <span>2.5 GB / 10 GB</span>
                      <el-progress :percentage="25" />
                    </div>
                    <div class="storage-item">
                      <span>输出目录:</span>
                      <span>1.2 GB / 5 GB</span>
                      <el-progress :percentage="24" />
                    </div>
                  </div>
                </el-form-item>
              </el-form>
            </div>
            
            <!-- 安全设置 -->
            <div v-show="activeTab === 'security'" class="settings-panel">
              <h3>安全设置</h3>
              <el-form :model="securitySettings" label-width="120px">
                <el-form-item label="启用认证">
                  <el-switch v-model="securitySettings.enableAuth" />
                </el-form-item>
                
                <el-form-item label="会话超时">
                  <el-input-number
                    v-model="securitySettings.sessionTimeout"
                    :min="5"
                    :max="1440"
                    :disabled="!securitySettings.enableAuth"
                  />
                  <span class="form-help">分钟</span>
                </el-form-item>
                
                <el-form-item label="API访问控制">
                  <el-switch v-model="securitySettings.apiControl" />
                </el-form-item>
                
                <el-form-item label="允许的IP">
                  <el-input
                    v-model="securitySettings.allowedIPs"
                    type="textarea"
                    :rows="3"
                    placeholder="每行一个IP地址或CIDR"
                    :disabled="!securitySettings.apiControl"
                  />
                </el-form-item>
              </el-form>
            </div>
            
            <!-- 关于系统 -->
            <div v-show="activeTab === 'about'" class="settings-panel">
              <h3>关于系统</h3>
              <div class="about-info">
                <div class="about-item">
                  <strong>系统名称:</strong>
                  <span>vRain WebUI</span>
                </div>
                <div class="about-item">
                  <strong>版本:</strong>
                  <span>1.0.0</span>
                </div>
                <div class="about-item">
                  <strong>构建时间:</strong>
                  <span>2025-01-01 00:00:00</span>
                </div>
                <div class="about-item">
                  <strong>运行时间:</strong>
                  <span>2天 3小时 45分钟</span>
                </div>
                <div class="about-item">
                  <strong>系统信息:</strong>
                  <span>Linux x86_64</span>
                </div>
                <div class="about-item">
                  <strong>Node.js版本:</strong>
                  <span>18.19.0</span>
                </div>
              </div>
              
              <div class="about-actions">
                <el-button type="primary" @click="checkUpdate">检查更新</el-button>
                <el-button @click="exportConfig">导出配置</el-button>
                <el-button @click="importConfig">导入配置</el-button>
              </div>
            </div>
            
            <!-- 保存按钮 -->
            <div class="settings-actions" v-if="activeTab !== 'about'">
              <el-button type="primary" @click="saveSettings" :loading="saving">
                保存设置
              </el-button>
              <el-button @click="resetSettings">重置为默认</el-button>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 响应式数据
const activeTab = ref('general')
const saving = ref(false)

const generalSettings = reactive({
  language: 'zh-CN',
  theme: 'light',
  autoSave: true,
  saveInterval: 30
})

const generatorSettings = reactive({
  maxConcurrent: 2,
  quality: 'medium',
  defaultFont: 'SimSun',
  defaultFontSize: 12,
  notification: true
})

const storageSettings = reactive({
  workDir: '/app/data/work',
  outputDir: '/app/data/output',
  autoClean: true,
  cleanInterval: 'weekly'
})

const securitySettings = reactive({
  enableAuth: false,
  sessionTimeout: 60,
  apiControl: false,
  allowedIPs: '127.0.0.1\n192.168.1.0/24'
})

// 方法
const handleTabChange = (key) => {
  activeTab.value = key
}

const saveSettings = async () => {
  try {
    saving.value = true
    
    // 模拟保存
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    ElMessage.success('设置保存成功')
  } catch (error) {
    ElMessage.error('设置保存失败')
  } finally {
    saving.value = false
  }
}

const resetSettings = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要重置为默认设置吗？当前设置将会丢失。',
      '确认重置',
      {
        confirmButtonText: '重置',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // 重置设置
    ElMessage.success('设置已重置为默认值')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('重置失败')
    }
  }
}

const selectDirectory = () => {
  ElMessage.info('目录选择功能开发中...')
}

const checkUpdate = () => {
  ElMessage.info('当前已是最新版本')
}

const exportConfig = () => {
  const config = {
    general: generalSettings,
    generator: generatorSettings,
    storage: storageSettings,
    security: securitySettings
  }
  
  const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'vrain-config.json'
  link.click()
  URL.revokeObjectURL(url)
  
  ElMessage.success('配置导出成功')
}

const importConfig = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json'
  input.onchange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const config = JSON.parse(e.target.result)
          // 应用配置
          ElMessage.success('配置导入成功')
        } catch (error) {
          ElMessage.error('配置文件格式错误')
        }
      }
      reader.readAsText(file)
    }
  }
  input.click()
}
</script>

<style lang="scss" scoped>
.settings-menu {
  border-right: 1px solid var(--el-border-color);
}

.settings-content {
  padding-left: 24px;
  
  .settings-panel {
    h3 {
      margin: 0 0 24px;
      font-size: 18px;
      font-weight: 600;
      color: var(--el-text-color-primary);
    }
    
    .form-help {
      margin-left: 8px;
      font-size: 12px;
      color: var(--el-text-color-placeholder);
    }
    
    .storage-info {
      .storage-item {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 12px;
        
        span:first-child {
          width: 80px;
          font-weight: 500;
        }
        
        span:nth-child(2) {
          width: 100px;
          font-size: 12px;
        }
        
        .el-progress {
          flex: 1;
        }
      }
    }
    
    .about-info {
      .about-item {
        display: flex;
        margin-bottom: 12px;
        
        strong {
          width: 120px;
          color: var(--el-text-color-regular);
        }
      }
    }
    
    .about-actions {
      margin-top: 24px;
      display: flex;
      gap: 12px;
    }
  }
  
  .settings-actions {
    margin-top: 32px;
    padding-top: 24px;
    border-top: 1px solid var(--el-border-color);
    display: flex;
    gap: 12px;
  }
}
</style>
