// 用户状态管理 Store
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { UserState, Location } from '@/types'
import { StorageService } from '@/services/storage'

export const useUserStore = defineStore('user', () => {
  // 状态
  const userState = ref<UserState>({
    preferences: {
      autoSave: true,
      theme: 'auto'
    }
  })
  
  const isInitialized = ref(false)

  // 计算属性
  const currentChildId = computed(() => userState.value.currentChildId)
  
  const preferences = computed(() => userState.value.preferences)
  
  const autoSaveEnabled = computed(() => userState.value.preferences.autoSave)
  
  const currentTheme = computed(() => userState.value.preferences.theme)
  
  const defaultLocation = computed(() => userState.value.preferences.defaultLocation)

  // 操作方法
  
  /**
   * 初始化用户状态
   */
  function initializeUser() {
    if (isInitialized.value) return
    
    try {
      const savedState = StorageService.getUserState()
      userState.value = savedState
      isInitialized.value = true
    } catch (error) {
      console.error('Failed to initialize user state:', error)
      // 使用默认状态
      userState.value = {
        preferences: {
          autoSave: true,
          theme: 'auto'
        }
      }
      isInitialized.value = true
    }
  }

  /**
   * 保存用户状态到本地存储
   */
  function saveUserState(): boolean {
    try {
      return StorageService.setUserState(userState.value)
    } catch (error) {
      console.error('Failed to save user state:', error)
      return false
    }
  }

  /**
   * 设置当前孩子ID
   */
  function setCurrentChildId(childId: string | undefined) {
    userState.value.currentChildId = childId
    saveUserState()
  }

  /**
   * 更新用户偏好设置
   */
  function updatePreferences(updates: Partial<UserState['preferences']>) {
    userState.value.preferences = {
      ...userState.value.preferences,
      ...updates
    }
    saveUserState()
  }

  /**
   * 设置自动保存开关
   */
  function setAutoSave(enabled: boolean) {
    updatePreferences({ autoSave: enabled })
  }

  /**
   * 设置主题
   */
  function setTheme(theme: 'light' | 'dark' | 'auto') {
    updatePreferences({ theme })
  }

  /**
   * 设置默认位置
   */
  function setDefaultLocation(location: Location | undefined) {
    updatePreferences({ defaultLocation: location })
  }

  /**
   * 获取当前有效主题
   */
  function getEffectiveTheme(): 'light' | 'dark' {
    const theme = userState.value.preferences.theme
    
    if (theme === 'auto') {
      // 根据系统偏好自动判断
      if (typeof window !== 'undefined' && window.matchMedia) {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      }
      return 'light' // 默认浅色主题
    }
    
    return theme
  }

  /**
   * 监听系统主题变化
   */
  function watchSystemTheme(callback: (theme: 'light' | 'dark') => void) {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return () => {} // 返回空的清理函数
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    const handler = (e: MediaQueryListEvent) => {
      if (userState.value.preferences.theme === 'auto') {
        callback(e.matches ? 'dark' : 'light')
      }
    }

    mediaQuery.addEventListener('change', handler)
    
    // 返回清理函数
    return () => {
      mediaQuery.removeEventListener('change', handler)
    }
  }

  /**
   * 重置用户状态
   */
  function resetUserState() {
    userState.value = {
      preferences: {
        autoSave: true,
        theme: 'auto'
      }
    }
    saveUserState()
  }

  /**
   * 导出用户数据
   */
  function exportUserData(): string {
    return JSON.stringify({
      userState: userState.value,
      exportTime: new Date().toISOString()
    }, null, 2)
  }

  /**
   * 导入用户数据
   */
  function importUserData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData)
      
      if (data.userState) {
        userState.value = data.userState
        saveUserState()
        return true
      }
      
      return false
    } catch (error) {
      console.error('Failed to import user data:', error)
      return false
    }
  }

  // 自动初始化
  if (typeof window !== 'undefined') {
    initializeUser()
  }

  return {
    // 状态
    userState,
    isInitialized,
    
    // 计算属性
    currentChildId,
    preferences,
    autoSaveEnabled,
    currentTheme,
    defaultLocation,
    
    // 方法
    initializeUser,
    saveUserState,
    setCurrentChildId,
    updatePreferences,
    setAutoSave,
    setTheme,
    setDefaultLocation,
    getEffectiveTheme,
    watchSystemTheme,
    resetUserState,
    exportUserData,
    importUserData
  }
})