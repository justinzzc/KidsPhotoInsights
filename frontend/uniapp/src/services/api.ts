import axios from 'axios'
import { DiaryEntry } from './storage'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  timeout: 15000,
})

api.interceptors.request.use((config) => {
  const key = import.meta.env.VITE_API_KEY as string | undefined
  if (key) config.headers['X-API-Key'] = key
  return config
})

export async function analyzePhoto(payload: { imageBase64: string; timestamp?: number; regionHint?: string }) {
  const { data } = await api.post('/v1/analyze-photo', payload)
  return data
}

// 获取日记列表
export async function fetchDiaryEntries(): Promise<DiaryEntry[]> {
  try {
    const { data } = await api.get('/v1/diary-entries')
    return data || []
  } catch (e) {
    console.error('获取日记列表失败', e)
    return []
  }
}

// 删除日记
export async function deleteDiaryEntry(id: string): Promise<boolean> {
  try {
    await api.delete(`/v1/diary-entries/${id}`)
    return true
  } catch (e) {
    console.error('删除日记失败', e)
    return false
  }
}

export default api