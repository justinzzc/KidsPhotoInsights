// 草稿状态管理 Store
import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import type { DraftState, DiaryEntry } from '@/types'
import { StorageService } from '@/services/storage'
import { useUserStore } from './user'

export const useDraftStore = defineStore('draft', () => {
  // 状态
  const draftState = ref<DraftState>({
    autoSaveEnabled: true
  })
  
  const isInitialized = ref(false)
  const autoSaveTimer = ref<number | null>(null)
  const AUTO_SAVE_DELAY = 2000 // 2秒后自动保存

  // 依赖其他 store
  const userStore = useUserStore()

  // 计算属性
  const currentDraft = computed(() => draftState.value.currentDraft)
  
  const autoSaveEnabled = computed(() => 
    draftState.value.autoSaveEnabled && userStore.autoSaveEnabled
  )
  
  const lastSaved = computed(() => draftState.value.lastSaved)
  
  const hasUnsavedChanges = computed(() => {
    if (!currentDraft.value) return false
    
    const lastSavedTime = draftState.value.lastSaved
    if (!lastSavedTime) return true
    
    // 检查是否有内容变更
    return currentDraft.value.content !== '' || 
           currentDraft.value.title !== '' ||
           currentDraft.value.image_url !== undefined
  })

  // 操作方法
  
  /**
   * 初始化草稿状态
   */
  function initializeDraft() {
    if (isInitialized.value) return
    
    try {
      const savedState = StorageService.getDraftState()
      draftState.value = savedState
      isInitialized.value = true
    } catch (error) {
      console.error('Failed to initialize draft state:', error)
      draftState.value = {
        autoSaveEnabled: true
      }
      isInitialized.value = true
    }
  }

  /**
   * 保存草稿状态到本地存储
   */
  function saveDraftState(): boolean {
    try {
      return StorageService.setDraftState(draftState.value)
    } catch (error) {
      console.error('Failed to save draft state:', error)
      return false
    }
  }

  /**
   * 创建新草稿
   */
  function createNewDraft(initialData?: Partial<DiaryEntry>) {
    const newDraft: Partial<DiaryEntry> = {
      id: `draft_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: '',
      content: '',
      created_at: new Date().toISOString(),
      status: 'draft',
      ...initialData
    }
    
    draftState.value.currentDraft = newDraft
    draftState.value.lastSaved = undefined
    saveDraftState()
    
    return newDraft
  }

  /**
   * 加载现有草稿
   */
  function loadDraft(draft: Partial<DiaryEntry>) {
    draftState.value.currentDraft = { ...draft }
    draftState.value.lastSaved = new Date().toISOString()
    saveDraftState()
  }

  /**
   * 更新草稿内容
   */
  function updateDraft(updates: Partial<DiaryEntry>) {
    if (!draftState.value.currentDraft) {
      createNewDraft(updates)
      return
    }
    
    draftState.value.currentDraft = {
      ...draftState.value.currentDraft,
      ...updates
    }
    
    // 触发自动保存
    if (autoSaveEnabled.value) {
      scheduleAutoSave()
    }
    
    saveDraftState()
  }

  /**
   * 设置草稿标题
   */
  function setDraftTitle(title: string) {
    updateDraft({ title })
  }

  /**
   * 设置草稿内容
   */
  function setDraftContent(content: string) {
    updateDraft({ content, text: content })
  }

  /**
   * 设置草稿图片
   */
  function setDraftImage(imageUrl: string) {
    updateDraft({ image_url: imageUrl })
  }

  /**
   * 设置草稿心情
   */
  function setDraftMood(mood: string) {
    updateDraft({ mood })
  }

  /**
   * 设置草稿天气
   */
  function setDraftWeather(weather: string) {
    updateDraft({ weather })
  }

  /**
   * 设置草稿场景
   */
  function setDraftScene(scene: string) {
    updateDraft({ scene })
  }

  /**
   * 手动保存草稿
   */
  function saveDraft(): boolean {
    if (!draftState.value.currentDraft) {
      return false
    }
    
    try {
      // 这里可以调用 diary store 的 saveDraft 方法
      // 或者直接保存到本地存储
      draftState.value.lastSaved = new Date().toISOString()
      saveDraftState()
      
      // 清除自动保存定时器
      if (autoSaveTimer.value) {
        clearTimeout(autoSaveTimer.value)
        autoSaveTimer.value = null
      }
      
      return true
    } catch (error) {
      console.error('Failed to save draft:', error)
      return false
    }
  }

  /**
   * 安排自动保存
   */
  function scheduleAutoSave() {
    // 清除现有定时器
    if (autoSaveTimer.value) {
      clearTimeout(autoSaveTimer.value)
    }
    
    // 设置新的定时器
    autoSaveTimer.value = window.setTimeout(() => {
      saveDraft()
    }, AUTO_SAVE_DELAY)
  }

  /**
   * 清除当前草稿
   */
  function clearDraft() {
    draftState.value.currentDraft = undefined
    draftState.value.lastSaved = undefined
    
    // 清除自动保存定时器
    if (autoSaveTimer.value) {
      clearTimeout(autoSaveTimer.value)
      autoSaveTimer.value = null
    }
    
    saveDraftState()
  }

  /**
   * 设置自动保存开关
   */
  function setAutoSaveEnabled(enabled: boolean) {
    draftState.value.autoSaveEnabled = enabled
    
    if (!enabled && autoSaveTimer.value) {
      clearTimeout(autoSaveTimer.value)
      autoSaveTimer.value = null
    }
    
    saveDraftState()
  }

  /**
   * 检查是否需要保存提醒
   */
  function shouldPromptSave(): boolean {
    return hasUnsavedChanges.value && !autoSaveEnabled.value
  }

  /**
   * 获取草稿摘要信息
   */
  function getDraftSummary(): { 
    hasContent: boolean
    wordCount: number
    hasImage: boolean
    lastModified?: string
  } {
    const draft = currentDraft.value
    
    if (!draft) {
      return {
        hasContent: false,
        wordCount: 0,
        hasImage: false
      }
    }
    
    const content = draft.content || ''
    
    return {
      hasContent: content.length > 0 || (draft.title?.length || 0) > 0,
      wordCount: content.length,
      hasImage: !!draft.image_url,
      lastModified: draftState.value.lastSaved
    }
  }

  /**
   * 重置草稿状态
   */
  function resetDraftState() {
    clearDraft()
    draftState.value = {
      autoSaveEnabled: true
    }
    saveDraftState()
  }

  /**
   * 导出草稿数据
   */
  function exportDraftData(): string {
    return JSON.stringify({
      draftState: draftState.value,
      exportTime: new Date().toISOString()
    }, null, 2)
  }

  /**
   * 导入草稿数据
   */
  function importDraftData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData)
      
      if (data.draftState) {
        draftState.value = data.draftState
        saveDraftState()
        return true
      }
      
      return false
    } catch (error) {
      console.error('Failed to import draft data:', error)
      return false
    }
  }

  // 监听草稿变化，实现自动保存
  watch(
    () => draftState.value.currentDraft,
    (newDraft) => {
      if (newDraft && autoSaveEnabled.value) {
        scheduleAutoSave()
      }
    },
    { deep: true }
  )

  // 页面卸载前保存草稿
  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', (event) => {
      if (shouldPromptSave()) {
        event.preventDefault()
        event.returnValue = '您有未保存的草稿，确定要离开吗？'
        return event.returnValue
      }
    })
  }

  // 自动初始化
  if (typeof window !== 'undefined') {
    initializeDraft()
  }

  return {
    // 状态
    draftState,
    isInitialized,
    
    // 计算属性
    currentDraft,
    autoSaveEnabled,
    lastSaved,
    hasUnsavedChanges,
    
    // 方法
    initializeDraft,
    saveDraftState,
    createNewDraft,
    loadDraft,
    updateDraft,
    setDraftTitle,
    setDraftContent,
    setDraftImage,
    setDraftMood,
    setDraftWeather,
    setDraftScene,
    saveDraft,
    scheduleAutoSave,
    clearDraft,
    setAutoSaveEnabled,
    shouldPromptSave,
    getDraftSummary,
    resetDraftState,
    exportDraftData,
    importDraftData
  }
})