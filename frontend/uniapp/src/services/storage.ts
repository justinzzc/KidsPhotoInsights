// 本地存储服务，用于保存草稿和日记列表
import { ref } from 'vue'

export interface DiaryEntry {
  id: string
  ts: number
  text: string
  mood?: string
  weather?: string
  childState?: string
  imageUrl?: string
  isDraft?: boolean
}

// 响应式日记列表
export const diaryEntries = ref<DiaryEntry[]>([])

// 本地存储键
const STORAGE_KEY = 'kids-photo-diary-entries'

// 初始化从本地存储加载数据
export function initStorage() {
  try {
    const stored = uni.getStorageSync(STORAGE_KEY)
    if (stored) {
      diaryEntries.value = JSON.parse(stored)
    }
  } catch (e) {
    console.error('加载本地存储失败', e)
  }
}

// 保存到本地存储
function saveToStorage() {
  try {
    uni.setStorageSync(STORAGE_KEY, JSON.stringify(diaryEntries.value))
  } catch (e) {
    console.error('保存到本地存储失败', e)
  }
}

// 保存草稿或日记
export function saveDiary(entry: DiaryEntry) {
  // 如果已存在则更新，否则添加
  const index = diaryEntries.value.findIndex(e => e.id === entry.id)
  if (index >= 0) {
    diaryEntries.value[index] = { ...diaryEntries.value[index], ...entry }
  } else {
    diaryEntries.value.unshift(entry)
  }
  saveToStorage()
  return entry
}

// 保存分析结果为草稿
export function saveAnalysisAsDraft(data: { 
  childState?: string; 
  mood?: string; 
  weather?: string;
  text?: string;
}, imageBase64?: string) {
  const entry: DiaryEntry = {
    id: `draft-${Date.now()}`,
    ts: Date.now(),
    text: data.text || '',
    mood: data.mood,
    weather: data.weather,
    childState: data.childState,
    imageUrl: imageBase64,
    isDraft: true
  }
  return saveDiary(entry)
}

// 删除日记
export function deleteDiary(id: string) {
  const index = diaryEntries.value.findIndex(e => e.id === id)
  if (index >= 0) {
    diaryEntries.value.splice(index, 1)
    saveToStorage()
    return true
  }
  return false
}

// 获取日记列表
export function getDiaryList(includeDrafts = true): DiaryEntry[] {
  if (includeDrafts) {
    return diaryEntries.value
  }
  return diaryEntries.value.filter(e => !e.isDraft)
}