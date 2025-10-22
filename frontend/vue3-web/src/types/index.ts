// 基础类型定义，与后端数据模型对齐

export interface SuggestionItem {
  name: string
  qty?: number
  unit?: string
}

export interface Suggestion {
  id: string
  category: '出行' | '健康' | '学习' | '娱乐' | '其他'
  items: SuggestionItem[]
  reasoning: string
  source?: 'analysis' | 'user' | 'template'
}

export interface AnalysisResult {
  childState?: '活跃' | '疲劳' | '专注' | '放松' | '不适'
  mood?: '愉快' | '平静' | '沮丧' | '兴奋' | '疲劳'
  weather?: '晴' | '多云' | '雨' | '雪' | '阴' | '风'
  tags: string[]
  suggestions: Suggestion[]
}

export interface Location {
  lat: number
  lng: number
  name?: string
}

export interface Photo {
  id: string
  uri: string
  createdAt: string
  qualityMetrics?: {
    brightness: number
    blur: number
    occlusion: number
  }
  facesCount?: number
  processedFlag: boolean
}

// 日记条目 - 与后端 DiaryEntry 对齐
export interface DiaryEntry {
  id: string
  ts: number // 后端使用的时间戳
  text?: string // 后端字段
  mood?: '愉快' | '平静' | '沮丧' | '兴奋' | '疲劳'
  weather?: '晴' | '多云' | '雨' | '雪' | '阴' | '风'
  // 前端扩展字段（后端已支持）
  title?: string
  content?: string
  created_at?: string // ISO format timestamp
  image_url?: string
  scene?: string
  suggestion?: Record<string, any>
  // 本地字段
  location?: Location
  photoRef?: string
  childState?: '活跃' | '疲劳' | '专注' | '放松' | '不适'
  suggestions?: Suggestion[]
  childId?: string
  status: 'draft' | 'saved' | 'exported'
}

// 创建日记请求 - 与后端 DiaryCreateRequest 对齐
export interface DiaryCreateRequest {
  title?: string
  content?: string
  mood?: string
  weather?: string
  image_url?: string
  scene?: string
  suggestion?: Record<string, any>
}

// 分析请求 - 与后端 AnalyzeRequest 对齐
export interface AnalyzeRequest {
  imageBase64: string
  timestamp?: number
  regionHint?: string
}

// API 响应类型
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// 应用状态类型
export interface AppState {
  isLoading: boolean
  error: string | null
  isOnline: boolean
}

// 用户状态类型
export interface UserState {
  currentChildId?: string
  preferences: {
    autoSave: boolean
    defaultLocation?: Location
    theme: 'light' | 'dark' | 'auto'
  }
}

// 草稿状态类型
export interface DraftState {
  currentDraft?: Partial<DiaryEntry>
  autoSaveEnabled: boolean
  lastSaved?: string
}

// 文件上传相关类型
export interface FileUploadOptions {
  maxSize?: number // bytes
  quality?: number // 0-1
  maxWidth?: number
  maxHeight?: number
}

export interface UploadResult {
  success: boolean
  data?: {
    base64: string
    size: number
    width: number
    height: number
  }
  error?: string
}

// 导出选项类型
export interface ExportOptions {
  includeImage: boolean
  includeText: boolean
  format: 'jpg' | 'png'
  quality: number
  textPosition: 'top' | 'bottom' | 'overlay'
}

// 枚举类型映射（用于国际化）
export const MoodLabels: Record<string, string> = {
  '愉快': 'happy',
  '平静': 'calm',
  '沮丧': 'sad',
  '兴奋': 'excited',
  '疲劳': 'tired'
}

export const WeatherLabels: Record<string, string> = {
  '晴': 'sunny',
  '多云': 'cloudy',
  '雨': 'rainy',
  '雪': 'snowy',
  '阴': 'overcast',
  '风': 'windy'
}

export const ChildStateLabels: Record<string, string> = {
  '活跃': 'active',
  '疲劳': 'tired',
  '专注': 'focused',
  '放松': 'relaxed',
  '不适': 'uncomfortable'
}

export const SuggestionCategoryLabels: Record<string, string> = {
  '出行': 'travel',
  '健康': 'health',
  '学习': 'learning',
  '娱乐': 'entertainment',
  '其他': 'other'
}