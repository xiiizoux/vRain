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
      books.value = response.data
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
      currentBook.value = response.data
      return response.data
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
      books.value.push(response.data)
      return response.data
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
      const index = books.value.findIndex(book => book.id === id)
      if (index !== -1) {
        books.value[index] = response.data
      }
      if (currentBook.value && currentBook.value.id === id) {
        currentBook.value = response.data
      }
      return response.data
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
      return response.data
    } catch (err) {
      error.value = err.message
      console.error('生成书籍失败:', err)
      throw err
    } finally {
      loading.value = false
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
    clearError,
    setCurrentBook
  }
})
