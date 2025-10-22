import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { diaryAPI } from '@/services/api'

export const useDiaryStore = defineStore('diary', () => {
  // 状态
  const diaries = ref([])
  const loading = ref(false)
  const error = ref(null)
  const draft = ref(null)

  // 计算属性
  const hasDraft = computed(() => {
    return draft.value !== null
  })

  const diaryCount = computed(() => {
    return diaries.value.length
  })

  // 方法
  const loadDiaries = async () => {
    loading.value = true
    error.value = null
    
    try {
      const data = await diaryAPI.getAll()
      diaries.value = data
    } catch (err) {
      error.value = err.message || '获取日记列表失败'
      console.error('加载日记失败:', err)
    } finally {
      loading.value = false
    }
  }

  const createDiaryEntry = async (diaryData) => {
    loading.value = true
    error.value = null
    
    try {
      const newDiary = await diaryAPI.create(diaryData)
      diaries.value.unshift(newDiary)
      return newDiary
    } catch (err) {
      error.value = err.message || '创建日记失败'
      console.error('创建日记失败:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const removeDiary = async (id) => {
    loading.value = true
    error.value = null
    
    try {
      await diaryAPI.delete(id)
      diaries.value = diaries.value.filter(diary => diary.id !== id)
    } catch (err) {
      error.value = err.message || '删除日记失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  const saveDraft = (draftData) => {
    draft.value = { ...draftData }
    localStorage.setItem('diary-draft', JSON.stringify(draftData))
  }

  const loadDraft = () => {
    try {
      const savedDraft = localStorage.getItem('diary-draft')
      if (savedDraft) {
        draft.value = JSON.parse(savedDraft)
      }
    } catch (err) {
      console.error('Failed to load draft:', err)
      draft.value = null
    }
  }

  const clearDraft = () => {
    draft.value = null
    localStorage.removeItem('diary-draft')
  }

  const getDiaryById = (id) => {
    return diaries.value.find(diary => diary.id === id)
  }

  // 初始化时加载草稿
  loadDraft()

  return {
    // 状态
    diaries,
    loading,
    error,
    draft,
    
    // 计算属性
    hasDraft,
    diaryCount,
    
    // 方法
    loadDiaries,
    createDiary: createDiaryEntry,
    deleteDiary: removeDiary,
    saveDraft,
    loadDraft,
    clearDraft,
    getDiaryById
  }
})