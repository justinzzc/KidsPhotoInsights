import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'
const API_KEY = import.meta.env.VITE_API_KEY || ''

const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === 'true'

const api = axios.create({
  baseURL: `${API_BASE_URL}/v1`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    // 添加API key认证头部
    if (API_KEY) {
      config.headers['X-API-Key'] = API_KEY
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    console.error('API Error:', error)
    
    // 处理认证失败
    if (error.response?.status === 401) {
      console.error('API认证失败，请检查API key配置')
      // 可以在这里添加用户提示或重定向逻辑
    }
    
    return Promise.reject(error)
  }
)

// 将图片文件转换为base64格式
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result)
    reader.onerror = error => reject(error)
  })
}

// 照片分析
export const analyzePhoto = async (imageFile) => {
  // 开发模式下使用模拟数据
  if (USE_MOCK_API) {
    await new Promise(resolve => setTimeout(resolve, 1000))
    return {
      childState: '活跃',
      mood: '愉快',
      weather: '晴',
      tags: ['outdoor', 'child'],
      suggestions: [
        {
          id: 'sugg-1',
          category: '出行',
          items: [
            { name: '水壶' },
            { name: '帽子' }
          ],
          reasoning: '阳光较强，补水与防晒更好',
          source: 'analysis'
        }
      ]
    }
  }
  
  // 将图片文件转换为base64
  const imageBase64 = await fileToBase64(imageFile)
  
  const response = await api.post('/analyze-photo', {
    imageBase64: imageBase64,
    timestamp: Date.now() / 1000
  })
  return response.data
}

// 日记管理
export const diaryAPI = {
  // 获取所有日记
  getAll: async () => {
    // 开发模式下使用模拟数据
    if (USE_MOCK_API) {
      await new Promise(resolve => setTimeout(resolve, 800))
      return [
        {
          id: '1',
          ts: 1705310400,
          text: '孩子状态: 活跃；心情: 愉快；天气: 晴',
          mood: '愉快',
          weather: '晴'
        },
        {
          id: '2',
          ts: 1705224000,
          text: '孩子状态: 安静；心情: 好奇；天气: 雨',
          mood: '好奇',
          weather: '雨'
        }
      ]
    }
    
    const response = await api.get('/diary-entries')
    return response.data
  },

  // 删除日记
  delete: async (id) => {
    // 开发模式下使用模拟数据
    if (USE_MOCK_API) {
      await new Promise(resolve => setTimeout(resolve, 500))
      return { success: true }
    }
    
    await api.delete(`/diary-entries/${id}`)
    return { success: true }
  }
}

// 健康检查
export const healthCheck = async () => {
  const response = await api.get('/health')
  return response.data
}

export default api