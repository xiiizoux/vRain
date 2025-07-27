<template>
  <div class="book-config">
    <div class="page-header">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/books' }">书籍管理</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: `/books/${bookId}` }">{{ book?.title || '书籍详情' }}</el-breadcrumb-item>
        <el-breadcrumb-item>配置参数</el-breadcrumb-item>
      </el-breadcrumb>
      
      <div class="header-actions">
        <el-button @click="$router.go(-1)">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <el-button type="primary" @click="handleSave" :loading="saving">
          <el-icon><Check /></el-icon>
          保存配置
        </el-button>
      </div>
    </div>

    <div class="config-content" v-loading="loading">
      <el-row :gutter="24" v-if="config">
        <!-- 基本配置 -->
        <el-col :span="12">
          <el-card title="基本配置" class="config-card">
            <el-form :model="config" label-width="120px">
              <el-form-item label="书名">
                <el-input v-model="config.title" />
              </el-form-item>
              <el-form-item label="作者">
                <el-input v-model="config.author" />
              </el-form-item>
              <el-form-item label="背景图模板">
                <el-select v-model="config.canvas_id" placeholder="选择背景图模板">
                  <el-option label="01_Black - 黑色经典" value="01_Black" />
                  <el-option label="01_Blue - 蓝色经典" value="01_Blue" />
                  <el-option label="01_Red - 红色经典" value="01_Red" />
                  <el-option label="28_Black - 28列黑色" value="28_Black" />
                  <el-option label="bamboo - 竹简风格" value="bamboo" />
                  <el-option label="vintage - 古典风格" value="vintage" />
                </el-select>
              </el-form-item>
              <el-form-item label="每列字数">
                <el-input-number v-model="config.row_num" :min="10" :max="50" />
              </el-form-item>
              <el-form-item label="列底边距">
                <el-input-number v-model="config.row_delta_y" :min="5" :max="30" />
              </el-form-item>
            </el-form>
          </el-card>
        </el-col>

        <!-- 字体配置 -->
        <el-col :span="12">
          <el-card title="字体配置" class="config-card">
            <el-form :model="config" label-width="120px">
              <el-form-item label="主字体">
                <el-input v-model="config.font1" placeholder="font1.ttf" />
              </el-form-item>
              <el-form-item label="备用字体1">
                <el-input v-model="config.font2" placeholder="font2.ttf" />
              </el-form-item>
              <el-form-item label="备用字体2">
                <el-input v-model="config.font3" placeholder="font3.ttf" />
              </el-form-item>
              <el-form-item label="繁简转换">
                <el-switch 
                  v-model="config.try_st" 
                  :active-value="1" 
                  :inactive-value="0"
                  active-text="启用"
                  inactive-text="禁用"
                />
              </el-form-item>
            </el-form>
          </el-card>
        </el-col>

        <!-- 正文字体大小 -->
        <el-col :span="12">
          <el-card title="正文字体" class="config-card">
            <el-form :model="config" label-width="120px">
              <el-form-item label="主字体大小">
                <el-input-number v-model="config.text_font1_size" :min="20" :max="100" />
              </el-form-item>
              <el-form-item label="备用字体1大小">
                <el-input-number v-model="config.text_font2_size" :min="20" :max="100" />
              </el-form-item>
              <el-form-item label="备用字体2大小">
                <el-input-number v-model="config.text_font3_size" :min="20" :max="100" />
              </el-form-item>
              <el-form-item label="正文字体颜色">
                <el-input v-model="config.text_font_color" />
              </el-form-item>
            </el-form>
          </el-card>
        </el-col>

        <!-- 批注字体大小 -->
        <el-col :span="12">
          <el-card title="批注字体" class="config-card">
            <el-form :model="config" label-width="120px">
              <el-form-item label="主字体大小">
                <el-input-number v-model="config.comment_font1_size" :min="15" :max="80" />
              </el-form-item>
              <el-form-item label="备用字体1大小">
                <el-input-number v-model="config.comment_font2_size" :min="15" :max="80" />
              </el-form-item>
              <el-form-item label="备用字体2大小">
                <el-input-number v-model="config.comment_font3_size" :min="15" :max="80" />
              </el-form-item>
              <el-form-item label="批注字体颜色">
                <el-input v-model="config.comment_font_color" />
              </el-form-item>
            </el-form>
          </el-card>
        </el-col>

        <!-- 封面配置 -->
        <el-col :span="12">
          <el-card title="封面配置" class="config-card">
            <el-form :model="config" label-width="120px">
              <el-form-item label="标题字体大小">
                <el-input-number v-model="config.cover_title_font_size" :min="50" :max="200" />
              </el-form-item>
              <el-form-item label="标题Y位置">
                <el-input-number v-model="config.cover_title_y" :min="100" :max="500" />
              </el-form-item>
              <el-form-item label="作者字体大小">
                <el-input-number v-model="config.cover_author_font_size" :min="30" :max="150" />
              </el-form-item>
              <el-form-item label="作者Y位置">
                <el-input-number v-model="config.cover_author_y" :min="300" :max="800" />
              </el-form-item>
              <el-form-item label="封面字体颜色">
                <el-input v-model="config.cover_font_color" />
              </el-form-item>
            </el-form>
          </el-card>
        </el-col>

        <!-- 版心配置 -->
        <el-col :span="12">
          <el-card title="版心配置" class="config-card">
            <el-form :model="config" label-width="120px">
              <el-form-item label="标题居中">
                <el-switch 
                  v-model="config.if_tpcenter" 
                  :active-value="1" 
                  :inactive-value="0"
                  active-text="居中"
                  inactive-text="居左"
                />
              </el-form-item>
              <el-form-item label="标题字体大小">
                <el-input-number v-model="config.title_font_size" :min="40" :max="120" />
              </el-form-item>
              <el-form-item label="标题Y位置">
                <el-input-number v-model="config.title_y" :min="800" :max="1500" />
              </el-form-item>
              <el-form-item label="标题后缀">
                <el-input v-model="config.title_postfix" placeholder="卷X" />
              </el-form-item>
              <el-form-item label="生成PDF目录">
                <el-switch 
                  v-model="config.title_directory" 
                  :active-value="1" 
                  :inactive-value="0"
                  active-text="启用"
                  inactive-text="禁用"
                />
              </el-form-item>
            </el-form>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { booksApi } from '@/utils/api'

const route = useRoute()
const router = useRouter()

const bookId = computed(() => route.params.id)
const book = ref(null)
const config = ref(null)
const loading = ref(false)
const saving = ref(false)

// 获取书籍信息
const fetchBook = async () => {
  try {
    const response = await booksApi.getBook(bookId.value)
    book.value = response.data
  } catch (error) {
    ElMessage.error('获取书籍信息失败')
  }
}

// 获取配置
const fetchConfig = async () => {
  try {
    loading.value = true
    const response = await booksApi.getBookConfig(bookId.value)
    config.value = response.data
  } catch (error) {
    ElMessage.error('获取配置失败')
    router.push(`/books/${bookId.value}`)
  } finally {
    loading.value = false
  }
}

// 保存配置
const handleSave = async () => {
  try {
    saving.value = true
    await booksApi.updateBookConfig(bookId.value, config.value)
    ElMessage.success('配置保存成功')
  } catch (error) {
    ElMessage.error('配置保存失败')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  fetchBook()
  fetchConfig()
})
</script>

<style lang="scss" scoped>
.book-config {
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
  
  .config-card {
    margin-bottom: 24px;
    height: fit-content;
  }
}
</style>
