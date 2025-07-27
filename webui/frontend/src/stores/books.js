import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { booksApi } from '@/utils/api'

export const useBooksStore = defineStore('books', () => {
  // 状态
  const books = ref([])
  const currentBook = ref(null)
  const loading = ref(false)
  const error = ref(null)
  
  // 计算属性
  const bookCount = computed(() => books.value.length)
  const booksByStatus = computed(() => {
    return books.value.reduce((acc, book) => {
      const status = book.status || 'draft'
      if (!acc[status]) acc[status] = []
      acc[status].push(book)
      return acc
    }, {})
  })
  
  // 方法
  const fetchBooks = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await booksApi.getBooks()
      // 处理后端返回的数据结构 {success: true, data: [...], pagination: {...}}
      books.value = response.data.data || []
    } catch (err) {
      error.value = err.message
      console.error('获取书籍列表失败:', err)
    } finally {
      loading.value = false
    }
  }
  
  const fetchBook = async (id) => {
    loading.value = true
    error.value = null
    try {
      const response = await booksApi.getBook(id)
      // 处理后端返回的数据结构
      const bookData = response.data.data || response.data
      currentBook.value = bookData
      return bookData
    } catch (err) {
      error.value = err.message
      console.error('获取书籍详情失败:', err)
      throw err
    } finally {
      loading.value = false
    }
  }
  
  const createBook = async (bookData) => {
    loading.value = true
    error.value = null
    try {
      const response = await booksApi.createBook(bookData)
      // 处理后端返回的数据结构
      const newBook = response.data.data || response.data
      books.value.push(newBook)
      return newBook
    } catch (err) {
      error.value = err.message
      console.error('创建书籍失败:', err)
      throw err
    } finally {
      loading.value = false
    }
  }
  
  const updateBook = async (id, bookData) => {
    loading.value = true
    error.value = null
    try {
      const response = await booksApi.updateBook(id, bookData)
      // 处理后端返回的数据结构
      const updatedBook = response.data.data || response.data
      const index = books.value.findIndex(book => book.id === id)
      if (index !== -1) {
        books.value[index] = updatedBook
      }
      if (currentBook.value && currentBook.value.id === id) {
        currentBook.value = updatedBook
      }
      return updatedBook
    } catch (err) {
      error.value = err.message
      console.error('更新书籍失败:', err)
      throw err
    } finally {
      loading.value = false
    }
  }
  
  const deleteBook = async (id) => {
    loading.value = true
    error.value = null
    try {
      await booksApi.deleteBook(id)
      books.value = books.value.filter(book => book.id !== id)
      if (currentBook.value && currentBook.value.id === id) {
        currentBook.value = null
      }
    } catch (err) {
      error.value = err.message
      console.error('删除书籍失败:', err)
      throw err
    } finally {
      loading.value = false
    }
  }
  
  const generateBook = async (id, options = {}) => {
    loading.value = true
    error.value = null
    try {
      const response = await booksApi.generateBook(id, options)
      // 处理后端返回的数据结构
      return response.data.data || response.data
    } catch (err) {
      error.value = err.message
      console.error('生成书籍失败:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const previewBook = async (id, options = {}) => {
    loading.value = true
    error.value = null
    try {
      const response = await booksApi.previewBook(id, options)
      // 处理后端返回的数据结构
      return response.data.data || response.data
    } catch (err) {
      error.value = err.message
      console.error('预览书籍失败:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const getBookFiles = async (id) => {
    loading.value = true
    error.value = null
    try {
      const response = await booksApi.getBookTexts(id)
      // 处理后端返回的数据结构
      return response.data.data || response.data
    } catch (err) {
      error.value = err.message
      console.error('获取书籍文件失败:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const getBookGenerateStatus = async (id) => {
    error.value = null
    try {
      const response = await booksApi.getGenerateStatus(id)
      // 处理后端返回的数据结构
      return response.data.data || response.data
    } catch (err) {
      error.value = err.message
      console.error('获取生成状态失败:', err)
      throw err
    }
  }

  const downloadFile = async (id, filename) => {
    error.value = null
    try {
      const response = await booksApi.downloadFile(id, filename)
      // 下载文件返回的是blob数据，不需要额外处理
      return response.data
    } catch (err) {
      error.value = err.message
      console.error('下载文件失败:', err)
      throw err
    }
  }

  const deleteFile = async (id, filename) => {
    error.value = null
    try {
      await booksApi.deleteText(id, filename)
    } catch (err) {
      error.value = err.message
      console.error('删除文件失败:', err)
      throw err
    }
  }
  
  const clearError = () => {
    error.value = null
  }
  
  const setCurrentBook = (book) => {
    currentBook.value = book
  }
  
  return {
    // 状态
    books,
    currentBook,
    loading,
    error,

    // 计算属性
    bookCount,
    booksByStatus,

    // 方法
    fetchBooks,
    fetchBook,
    createBook,
    updateBook,
    deleteBook,
    generateBook,
    previewBook,
    getBookFiles,
    getBookGenerateStatus,
    downloadFile,
    deleteFile,
    clearError,
    setCurrentBook
  }
})
