// 应用全局状态管理 Store
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { AppState } from '@/types'
import { healthAPI } from '@/services/api'

export const useAppStore = defineStore('app', () => {
  // 状态
  const appState = ref<AppState>({
    isLoading: false,
    error: null,
    isOnline: navigator.onLine
  })
  
  const apiStatus = ref<'unknown' | 'healthy' | 'error'>('unknown')
  const lastHealthCheck = ref<string | null>(null)

  // 计算属性
  const isLoading = computed(() => appState.value.isLoading)
  const error = computed(() => appState.value.error)
  const isOnline = computed(() => appState.value.isOnline)
  const isApiHealthy = computed(() => apiStatus.value === 'healthy')

  // 操作方法
  
  /**
   * 设置加载状态
   */
  function setLoading(loading: boolean) {
    appState.value.isLoading = loading
  }

  /**
   * 设置错误信息
   */
  function setError(error: string | null) {
    appState.value.error = error
  }

  /**
   * 设置在线状态
   */
  function setOnline(online: boolean) {
    appState.value.isOnline = online
  }

  /**
   * 清除错误
   */
  function clearError() {
    appState.value.error = null
  }

  /**
   * 显示错误消息
   */
  function showError(message: string, duration: number = 5000) {
    setError(message)
    
    // 自动清除错误
    setTimeout(() => {
      if (appState.value.error === message) {
        clearError()
      }
    }, duration)
  }

  /**
   * 检查API健康状态
   */
  async function checkApiHealth(): Promise<boolean> {
    try {
      const response = await healthAPI.check()
      
      if (response.success) {
        apiStatus.value = 'healthy'
        lastHealthCheck.value = new Date().toISOString()
        return true
      } else {
        apiStatus.value = 'error'
        return false
      }
    } catch (error) {
      apiStatus.value = 'error'
      console.error('API health check failed:', error)
      return false
    }
  }

  /**
   * 初始化应用状态
   */
  async function initializeApp() {
    setLoading(true)
    
    try {
      // 检查网络状态
      setOnline(navigator.onLine)
      
      // 检查API健康状态
      if (appState.value.isOnline) {
        await checkApiHealth()
      }
      
      // 监听网络状态变化
      setupNetworkListeners()
      
    } catch (error) {
      console.error('Failed to initialize app:', error)
      showError('应用初始化失败')
    } finally {
      setLoading(false)
    }
  }

  /**
   * 设置网络状态监听器
   */
  function setupNetworkListeners() {
    if (typeof window === 'undefined') return

    window.addEventListener('online', () => {
      setOnline(true)
      checkApiHealth()
    })

    window.addEventListener('offline', () => {
      setOnline(false)
      apiStatus.value = 'unknown'
    })
  }

  /**
   * 重试操作
   */
  async function retryOperation<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T | null> {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await operation()
      } catch (error) {
        console.warn(`Operation failed, attempt ${i + 1}/${maxRetries}:`, error)
        
        if (i === maxRetries - 1) {
          throw error
        }
        
        // 等待后重试
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)))
      }
    }
    
    return null
  }

  /**
   * 获取应用状态摘要
   */
  function getAppStatusSummary(): {
    isReady: boolean
    hasError: boolean
    isOnline: boolean
    apiHealthy: boolean
    lastHealthCheck?: string
  } {
    return {
      isReady: !appState.value.isLoading && !appState.value.error,
      hasError: !!appState.value.error,
      isOnline: appState.value.isOnline,
      apiHealthy: apiStatus.value === 'healthy',
      lastHealthCheck: lastHealthCheck.value || undefined
    }
  }

  /**
   * 重置应用状态
   */
  function resetAppState() {
    appState.value = {
      isLoading: false,
      error: null,
      isOnline: navigator.onLine
    }
    apiStatus.value = 'unknown'
    lastHealthCheck.value = null
  }

  return {
    // 状态
    appState,
    apiStatus,
    lastHealthCheck,
    
    // 计算属性
    isLoading,
    error,
    isOnline,
    isApiHealthy,
    
    // 方法
    setLoading,
    setError,
    setOnline,
    clearError,
    showError,
    checkApiHealth,
    initializeApp,
    setupNetworkListeners,
    retryOperation,
    getAppStatusSummary,
    resetAppState
  }
})