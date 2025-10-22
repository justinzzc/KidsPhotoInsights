// Pinia Stores 统一导出
export { useDiaryStore } from './diary'
export { useUserStore } from './user'
export { useDraftStore } from './draft'
export { useAppStore } from './app'

// 类型导出
export type { DiaryEntry, UserState, DraftState, AppState } from '@/types'

// Store 初始化工具
import { useAppStore } from './app'
import { useUserStore } from './user'
import { useDraftStore } from './draft'

/**
 * 初始化所有 stores
 * 在应用启动时调用
 */
export async function initializeStores() {
  const appStore = useAppStore()
  const userStore = useUserStore()
  const draftStore = useDraftStore()

  try {
    // 初始化应用状态
    await appStore.initializeApp()
    
    // 初始化用户状态
    await userStore.initialize()
    
    // 初始化草稿状态
    await draftStore.initialize()
    
    console.log('All stores initialized successfully')
  } catch (error) {
    console.error('Failed to initialize stores:', error)
    throw error
  }
}

/**
 * 重置所有 stores
 * 用于测试或清理数据
 */
export function resetAllStores() {
  const appStore = useAppStore()
  const userStore = useUserStore()
  const draftStore = useDraftStore()

  appStore.resetAppState()
  userStore.reset()
  draftStore.reset()
  
  console.log('All stores reset')
}

/**
 * 获取所有 stores 的状态摘要
 */
export function getStoresSummary() {
  const appStore = useAppStore()
  const userStore = useUserStore()
  const draftStore = useDraftStore()

  return {
    app: appStore.getAppStatusSummary(),
    user: {
      hasPreferences: !!userStore.preferences,
      currentChildId: userStore.currentChildId,
      theme: userStore.preferences?.theme
    },
    draft: {
      hasDraft: !!draftStore.currentDraft,
      hasUnsavedChanges: draftStore.hasUnsavedChanges,
      autoSaveEnabled: draftStore.isAutoSaveEnabled
    }
  }
}