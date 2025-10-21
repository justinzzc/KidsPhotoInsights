import axios from 'axios'

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

export default api