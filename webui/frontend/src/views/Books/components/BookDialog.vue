<template>
  <el-dialog
    v-model="visible"
    :title="isEdit ? '编辑书籍' : '创建书籍'"
    width="600px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="100px"
      class="vrain-form"
    >
      <el-form-item label="书籍ID" prop="id" v-if="!isEdit">
        <el-input
          v-model="form.id"
          placeholder="留空自动生成"
          maxlength="20"
          show-word-limit
        />
        <div class="form-tip">书籍ID用于标识项目，建议使用数字或字母</div>
      </el-form-item>
      
      <el-form-item label="书名" prop="title">
        <el-input
          v-model="form.title"
          placeholder="请输入书名"
          maxlength="100"
          show-word-limit
        />
      </el-form-item>
      
      <el-form-item label="作者" prop="author">
        <el-input
          v-model="form.author"
          placeholder="请输入作者"
          maxlength="100"
          show-word-limit
        />
      </el-form-item>
      
      <el-form-item label="描述" prop="description">
        <el-input
          v-model="form.description"
          type="textarea"
          :rows="3"
          placeholder="请输入书籍描述（可选）"
          maxlength="500"
          show-word-limit
        />
      </el-form-item>
      
      <el-form-item label="背景图" prop="canvas_id">
        <el-select
          v-model="form.canvas_id"
          placeholder="选择背景图模板"
          style="width: 100%"
        >
          <el-option
            v-for="canvas in canvasOptions"
            :key="canvas.id"
            :label="canvas.name"
            :value="canvas.id"
          />
        </el-select>
      </el-form-item>
      
      <el-form-item label="每列字数" prop="row_num">
        <el-input-number
          v-model="form.row_num"
          :min="10"
          :max="50"
          :step="1"
          style="width: 100%"
        />
        <div class="form-tip">建议20-30字，根据背景图调整</div>
      </el-form-item>
    </el-form>
    
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="loading">
          {{ isEdit ? '更新' : '创建' }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { useBooksStore } from '@/stores/books'

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

const booksStore = useBooksStore()
const formRef = ref()
const loading = ref(false)

// 响应式数据
const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const isEdit = computed(() => !!props.book)

const form = ref({
  id: '',
  title: '',
  author: '',
  description: '',
  canvas_id: '01_Black',
  row_num: 24
})

const canvasOptions = ref([
  { id: '01_Black', name: '经典黑框' },
  { id: '01_Blue', name: '蓝色边框' },
  { id: '01_Red', name: '红色边框' },
  { id: '28_Black', name: '28列黑框' },
  { id: 'vintage', name: '宣纸做旧' },
  { id: 'bamboo', name: '竹简风格' }
])

const rules = {
  title: [
    { required: true, message: '请输入书名', trigger: 'blur' },
    { min: 1, max: 100, message: '书名长度在1-100个字符', trigger: 'blur' }
  ],
  author: [
    { required: true, message: '请输入作者', trigger: 'blur' },
    { min: 1, max: 100, message: '作者长度在1-100个字符', trigger: 'blur' }
  ],
  id: [
    { pattern: /^[a-zA-Z0-9]+$/, message: 'ID只能包含字母和数字', trigger: 'blur' },
    { min: 2, max: 20, message: 'ID长度在2-20个字符', trigger: 'blur' }
  ],
  canvas_id: [
    { required: true, message: '请选择背景图', trigger: 'change' }
  ],
  row_num: [
    { required: true, message: '请设置每列字数', trigger: 'blur' },
    { type: 'number', min: 10, max: 50, message: '每列字数在10-50之间', trigger: 'blur' }
  ]
}

// 监听书籍数据变化
watch(() => props.book, (newBook) => {
  if (newBook) {
    form.value = {
      id: newBook.id || '',
      title: newBook.title || '',
      author: newBook.author || '',
      description: newBook.description || '',
      canvas_id: newBook.canvas_id || '01_Black',
      row_num: newBook.row_num || 24
    }
  } else {
    resetForm()
  }
}, { immediate: true })

// 方法
const resetForm = () => {
  form.value = {
    id: '',
    title: '',
    author: '',
    description: '',
    canvas_id: '01_Black',
    row_num: 24
  }
  
  nextTick(() => {
    formRef.value?.clearValidate()
  })
}

const handleClose = () => {
  visible.value = false
  resetForm()
}

const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    
    loading.value = true
    
    const bookData = { ...form.value }
    
    // 如果是创建且没有指定ID，则删除ID字段让后端自动生成
    if (!isEdit.value && !bookData.id) {
      delete bookData.id
    }
    
    if (isEdit.value) {
      await booksStore.updateBook(props.book.id, bookData)
      ElMessage.success('书籍更新成功')
    } else {
      await booksStore.createBook(bookData)
      ElMessage.success('书籍创建成功')
    }
    
    emit('success')
    handleClose()
  } catch (error) {
    console.error('提交失败:', error)
    ElMessage.error(error.message || '操作失败')
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
.vrain-form {
  .form-tip {
    font-size: 12px;
    color: var(--el-text-color-secondary);
    margin-top: 4px;
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
