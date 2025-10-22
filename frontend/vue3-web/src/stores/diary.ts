// 日记状态管理 Store
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { DiaryEntry, DiaryCreateRequest, AnalysisResult } from '@/types'
import { StorageService } from '@/services/storage'
import { diaryAPI, analysisAPI } from '@/services/api'

export const useDiaryStore = defineStore('diary', () => {
  // 状态
  const diaries = ref<DiaryEntry[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const currentDiary = ref<DiaryEntry | null>(null)

  // 计算属性
  const diaryCount = computed(() => diaries.value.length)
  
  const savedDiaries = computed(() => 
    diaries.value.filter(d => d.status === 'saved')
  )
  
  const draftDiaries = computed(() => 
    diaries.value.filter(d => d.status === 'draft')
  )
  
  const exportedDiaries = computed(() => 
    diaries.value.filter(d => d.status === 'exported')
  )

  const recentDiaries = computed(() => 
    [...diaries.value]
      .sort((a, b) => b.ts - a.ts)
      .slice(0, 10)
  )

  // 操作方法
  
  /**
   * 加载所有日记
   */
  async function loadDiaries() {
    isLoading.value = true
    error.value = null
    
    try {
      // 先从本地存储加载
      const localDiaries = StorageService.getDiaryEntries()
      diaries.value = localDiaries
      
      // 尝试从服务器同步
      const response = await diaryAPI.getAll()
      if (response.success && response.data) {
        // 合并服务器数据（以服务器为准，但保留本地草稿）
        const serverDiaries = response.data
        const localDrafts = localDiaries.filter(d => d.status === 'draft')
        
        diaries.value = [...serverDiaries, ...localDrafts]
        
        // 更新本地存储
        StorageService.setDiaryEntries(diaries.value)
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : '加载日记失败'
      console.error('Failed to load diaries:', err)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 创建新日记
   */
  async function createDiaryEntry(diaryData: DiaryCreateRequest): Promise<DiaryEntry | null> {
    isLoading.value = true
    error.value = null
    
    try {
      // 先创建本地条目
      const localEntry: DiaryEntry = {
        id: `diary_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ts: Date.now() / 1000,
        title: diaryData.title || '新日记',
        content: diaryData.content || '',
        text: diaryData.content || '',
        mood: diaryData.mood,
        weather: diaryData.weather,
        image_url: diaryData.image_url,
        scene: diaryData.scene,
        suggestion: diaryData.suggestion,
        created_at: new Date().toISOString(),
        status: 'draft'
      }
      
      // 添加到本地列表
      diaries.value.unshift(localEntry)
      StorageService.addDiaryEntry(localEntry)
      
      // 尝试同步到服务器
      const response = await diaryAPI.create(diaryData)
      if (response.success && response.data) {
        // 更新为服务器返回的数据
        const serverEntry = { ...response.data, status: 'saved' as const }
        const index = diaries.value.findIndex(d => d.id === localEntry.id)
        if (index >= 0) {
          diaries.value[index] = serverEntry
          StorageService.addDiaryEntry(serverEntry)
        }
        return serverEntry
      }
      
      return localEntry
    } catch (err) {
      error.value = err instanceof Error ? err.message : '创建日记失败'
      console.error('Failed to create diary entry:', err)
      return null
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 更新日记
   */
  function updateDiaryEntry(id: string, updates: Partial<DiaryEntry>): boolean {
    try {
      const index = diaries.value.findIndex(d => d.id === id)
      if (index >= 0) {
        diaries.value[index] = { ...diaries.value[index], ...updates }
        StorageService.addDiaryEntry(diaries.value[index])
        return true
      }
      return false
    } catch (err) {
      error.value = err instanceof Error ? err.message : '更新日记失败'
      console.error('Failed to update diary entry:', err)
      return false
    }
  }

  /**
   * 删除日记
   */
  async function removeDiary(id: string): Promise<boolean> {
    isLoading.value = true
    error.value = null
    
    try {
      // 先从本地删除
      const index = diaries.value.findIndex(d => d.id === id)
      if (index >= 0) {
        diaries.value.splice(index, 1)
        StorageService.removeDiaryEntry(id)
      }
      
      // 尝试从服务器删除
      const response = await diaryAPI.delete(id)
      if (!response.success) {
        console.warn('Failed to delete from server:', response.error)
        // 即使服务器删除失败，本地删除仍然有效
      }
      
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : '删除日记失败'
      console.error('Failed to remove diary:', err)
      return false
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 获取单个日记
   */
  function getDiaryById(id: string): DiaryEntry | null {
    return diaries.value.find(d => d.id === id) || null
  }

  /**
   * 设置当前日记
   */
  function setCurrentDiary(diary: DiaryEntry | null) {
    currentDiary.value = diary
  }

  /**
   * 分析照片并生成日记内容
   */
  async function analyzePhotoAndCreateDiary(
    imageBase64: string, 
    regionHint?: string
  ): Promise<{ diary: DiaryEntry | null; analysis: AnalysisResult | null }> {
    isLoading.value = true
    error.value = null
    
    try {
      // 调用分析API
      const analysisResponse = await analysisAPI.analyzePhoto({
        imageBase64,
        timestamp: Date.now() / 1000,
        regionHint
      })
      
      if (!analysisResponse.success || !analysisResponse.data) {
        throw new Error(analysisResponse.error || '照片分析失败')
      }
      
      const analysis = analysisResponse.data
      
      // 根据分析结果生成日记内容
      const content = generateDiaryContent(analysis)
      
      // 创建日记条目
      const diaryData: DiaryCreateRequest = {
        title: `${new Date().toLocaleDateString()} 的日记`,
        content,
        mood: analysis.mood,
        weather: analysis.weather,
        image_url: `data:image/jpeg;base64,${imageBase64}`,
        scene: analysis.tags.join(', '),
        suggestion: analysis.suggestions.length > 0 ? {
          suggestions: analysis.suggestions
        } : undefined
      }
      
      const diary = await createDiaryEntry(diaryData)
      
      return { diary, analysis }
    } catch (err) {
      error.value = err instanceof Error ? err.message : '照片分析失败'
      console.error('Failed to analyze photo:', err)
      return { diary: null, analysis: null }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 保存草稿
   */
  function saveDraft(draftData: Partial<DiaryEntry>): DiaryEntry {
    const draft: DiaryEntry = {
      id: draftData.id || `draft_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ts: draftData.ts || Date.now() / 1000,
      title: draftData.title || '草稿',
      content: draftData.content || '',
      text: draftData.content || '',
      mood: draftData.mood,
      weather: draftData.weather,
      image_url: draftData.image_url,
      scene: draftData.scene,
      suggestion: draftData.suggestion,
      created_at: draftData.created_at || new Date().toISOString(),
      status: 'draft',
      ...draftData
    }
    
    const existingIndex = diaries.value.findIndex(d => d.id === draft.id)
    if (existingIndex >= 0) {
      diaries.value[existingIndex] = draft
    } else {
      diaries.value.unshift(draft)
    }
    
    StorageService.addDiaryEntry(draft)
    return draft
  }

  /**
   * 将草稿转为正式日记
   */
  async function publishDraft(draftId: string): Promise<DiaryEntry | null> {
    const draft = getDiaryById(draftId)
    if (!draft || draft.status !== 'draft') {
      return null
    }
    
    const diaryData: DiaryCreateRequest = {
      title: draft.title,
      content: draft.content,
      mood: draft.mood,
      weather: draft.weather,
      image_url: draft.image_url,
      scene: draft.scene,
      suggestion: draft.suggestion
    }
    
    const publishedDiary = await createDiaryEntry(diaryData)
    
    if (publishedDiary) {
      // 删除草稿
      await removeDiary(draftId)
    }
    
    return publishedDiary
  }

  /**
   * 清除错误状态
   */
  function clearError() {
    error.value = null
  }

  /**
   * 重置状态
   */
  function reset() {
    diaries.value = []
    currentDiary.value = null
    isLoading.value = false
    error.value = null
  }

  return {
    // 状态
    diaries,
    isLoading,
    error,
    currentDiary,
    
    // 计算属性
    diaryCount,
    savedDiaries,
    draftDiaries,
    exportedDiaries,
    recentDiaries,
    
    // 方法
    loadDiaries,
    createDiaryEntry,
    updateDiaryEntry,
    removeDiary,
    getDiaryById,
    setCurrentDiary,
    analyzePhotoAndCreateDiary,
    saveDraft,
    publishDraft,
    clearError,
    reset
  }
})

/**
 * 根据分析结果生成日记内容
 */
function generateDiaryContent(analysis: AnalysisResult): string {
  const parts: string[] = []
  
  // 基础描述
  parts.push('今天拍了一张照片。')
  
  // 天气和心情
  if (analysis.weather || analysis.mood) {
    const weatherText = analysis.weather ? `天气${analysis.weather}` : ''
    const moodText = analysis.mood ? `心情${analysis.mood}` : ''
    const connector = weatherText && moodText ? '，' : ''
    parts.push(`${weatherText}${connector}${moodText}。`)
  }
  
  // 孩子状态
  if (analysis.childState) {
    parts.push(`孩子看起来很${analysis.childState}。`)
  }
  
  // 场景标签
  if (analysis.tags.length > 0) {
    parts.push(`照片中有：${analysis.tags.join('、')}。`)
  }
  
  // 建议
  if (analysis.suggestions.length > 0) {
    parts.push('\n根据照片分析，有以下建议：')
    analysis.suggestions.forEach((suggestion, index) => {
      parts.push(`\n${index + 1}. ${suggestion.category}：${suggestion.reasoning}`)
      if (suggestion.items.length > 0) {
        const itemsText = suggestion.items
          .map(item => `${item.name}${item.qty ? `(${item.qty}${item.unit || ''})` : ''}`)
          .join('、')
        parts.push(`   - ${itemsText}`)
      }
    })
  }
  
  return parts.join('')
}