// API 服务层，封装后端接口调用
import type { 
  DiaryEntry, 
  DiaryCreateRequest, 
  AnalyzeRequest, 
  AnalysisResult, 
  ApiResponse 
} from '@/types'

// API 配置
const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  TIMEOUT: 30000,
  RETRY_COUNT: 3
}

// HTTP 客户端类
class HttpClient {
  private baseURL: string
  private timeout: number

  constructor(baseURL: string, timeout: number = 30000) {
    this.baseURL = baseURL
    this.timeout = timeout
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`
    const controller = new AbortController()
    
    // 设置超时
    const timeoutId = setTimeout(() => controller.abort(), this.timeout)

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      return {
        success: true,
        data
      }
    } catch (error) {
      clearTimeout(timeoutId)
      
      if (error instanceof Error) {
        return {
          success: false,
          error: error.message
        }
      }
      
      return {
        success: false,
        error: 'Unknown error occurred'
      }
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined
    })
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined
    })
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }
}

// 创建 HTTP 客户端实例
const httpClient = new HttpClient(API_CONFIG.BASE_URL, API_CONFIG.TIMEOUT)

// 日记 API 服务
export const diaryAPI = {
  /**
   * 获取所有日记条目
   */
  async getAll(): Promise<ApiResponse<DiaryEntry[]>> {
    try {
      const response = await httpClient.get<DiaryEntry[]>('/v1/diary-entries')
      
      // 开发环境返回模拟数据
      if (!response.success && import.meta.env.DEV) {
        return {
          success: true,
          data: []
        }
      }
      
      return response
    } catch (error) {
      console.error('Failed to fetch diary entries:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch diary entries'
      }
    }
  },

  /**
   * 创建日记条目
   */
  async create(diaryData: DiaryCreateRequest): Promise<ApiResponse<DiaryEntry>> {
    try {
      const response = await httpClient.post<DiaryEntry>('/v1/diary-entries', diaryData)
      
      // 开发环境返回模拟数据
      if (!response.success && import.meta.env.DEV) {
        const mockEntry: DiaryEntry = {
          id: `diary_${Date.now()}`,
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
          status: 'saved'
        }
        
        return {
          success: true,
          data: mockEntry
        }
      }
      
      return response
    } catch (error) {
      console.error('Failed to create diary entry:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create diary entry'
      }
    }
  },

  /**
   * 删除日记条目
   */
  async delete(entryId: string): Promise<ApiResponse<void>> {
    try {
      const response = await httpClient.delete<void>(`/v1/diary-entries/${entryId}`)
      
      // 开发环境总是返回成功
      if (!response.success && import.meta.env.DEV) {
        return {
          success: true,
          data: undefined
        }
      }
      
      return response
    } catch (error) {
      console.error('Failed to delete diary entry:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete diary entry'
      }
    }
  }
}

// 照片分析 API 服务
export const analysisAPI = {
  /**
   * 分析照片
   */
  async analyzePhoto(request: AnalyzeRequest): Promise<ApiResponse<AnalysisResult>> {
    try {
      const response = await httpClient.post<AnalysisResult>('/v1/analyze-photo', request)
      
      // 开发环境返回模拟数据
      if (!response.success && import.meta.env.DEV) {
        const mockResult: AnalysisResult = {
          childState: '活跃',
          mood: '愉快',
          weather: '晴',
          tags: ['户外活动', '阳光明媚', '孩子开心'],
          suggestions: [
            {
              id: `suggestion_${Date.now()}`,
              category: '健康',
              items: [
                { name: '多喝水', qty: 2, unit: '杯' },
                { name: '防晒霜', qty: 1, unit: '次' }
              ],
              reasoning: '在阳光下活动需要注意补水和防晒',
              source: 'analysis'
            }
          ]
        }
        
        return {
          success: true,
          data: mockResult
        }
      }
      
      return response
    } catch (error) {
      console.error('Failed to analyze photo:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to analyze photo'
      }
    }
  }
}

// 健康检查 API
export const healthAPI = {
  /**
   * 检查 API 健康状态
   */
  async check(): Promise<ApiResponse<{ status: string; timestamp: string }>> {
    try {
      const response = await httpClient.get<{ status: string; timestamp: string }>('/v1/health')
      
      // 开发环境返回模拟数据
      if (!response.success && import.meta.env.DEV) {
        return {
          success: true,
          data: {
            status: 'ok',
            timestamp: new Date().toISOString()
          }
        }
      }
      
      return response
    } catch (error) {
      console.error('Health check failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Health check failed'
      }
    }
  }
}

// API 工具函数
export const apiUtils = {
  /**
   * 检查网络连接状态
   */
  isOnline(): boolean {
    return navigator.onLine
  },

  /**
   * 重试机制
   */
  async retry<T>(
    fn: () => Promise<ApiResponse<T>>, 
    maxRetries: number = API_CONFIG.RETRY_COUNT
  ): Promise<ApiResponse<T>> {
    let lastError: ApiResponse<T> | null = null
    
    for (let i = 0; i <= maxRetries; i++) {
      try {
        const result = await fn()
        if (result.success) {
          return result
        }
        lastError = result
      } catch (error) {
        lastError = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }
      
      // 如果不是最后一次尝试，等待一段时间再重试
      if (i < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000))
      }
    }
    
    return lastError || {
      success: false,
      error: 'Max retries exceeded'
    }
  },

  /**
   * 批量请求
   */
  async batch<T>(
    requests: (() => Promise<ApiResponse<T>>)[]
  ): Promise<ApiResponse<T>[]> {
    try {
      const results = await Promise.allSettled(
        requests.map(request => request())
      )
      
      return results.map(result => {
        if (result.status === 'fulfilled') {
          return result.value
        } else {
          return {
            success: false,
            error: result.reason?.message || 'Request failed'
          }
        }
      })
    } catch (error) {
      console.error('Batch request failed:', error)
      return requests.map(() => ({
        success: false,
        error: 'Batch request failed'
      }))
    }
  }
}

// 导出默认 API 实例
export default {
  diary: diaryAPI,
  analysis: analysisAPI,
  health: healthAPI,
  utils: apiUtils
}