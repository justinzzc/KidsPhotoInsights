// localStorage 服务，替代 uni-app Storage
import type { DiaryEntry, UserState, DraftState } from '@/types'

export class StorageService {
  private static readonly KEYS = {
    DIARY_ENTRIES: 'diary_entries',
    USER_STATE: 'user_state',
    DRAFT_STATE: 'draft_state',
    APP_SETTINGS: 'app_settings'
  } as const

  /**
   * 获取所有日记条目
   */
  static getDiaryEntries(): DiaryEntry[] {
    try {
      const data = localStorage.getItem(this.KEYS.DIARY_ENTRIES)
      return data ? JSON.parse(data) : []
    } catch (error) {
      console.error('Failed to get diary entries from storage:', error)
      return []
    }
  }

  /**
   * 保存日记条目列表
   */
  static setDiaryEntries(entries: DiaryEntry[]): boolean {
    try {
      localStorage.setItem(this.KEYS.DIARY_ENTRIES, JSON.stringify(entries))
      return true
    } catch (error) {
      console.error('Failed to save diary entries to storage:', error)
      return false
    }
  }

  /**
   * 添加单个日记条目
   */
  static addDiaryEntry(entry: DiaryEntry): boolean {
    try {
      const entries = this.getDiaryEntries()
      const existingIndex = entries.findIndex(e => e.id === entry.id)
      
      if (existingIndex >= 0) {
        entries[existingIndex] = entry
      } else {
        entries.unshift(entry) // 新条目添加到开头
      }
      
      return this.setDiaryEntries(entries)
    } catch (error) {
      console.error('Failed to add diary entry:', error)
      return false
    }
  }

  /**
   * 删除日记条目
   */
  static removeDiaryEntry(id: string): boolean {
    try {
      const entries = this.getDiaryEntries()
      const filteredEntries = entries.filter(e => e.id !== id)
      return this.setDiaryEntries(filteredEntries)
    } catch (error) {
      console.error('Failed to remove diary entry:', error)
      return false
    }
  }

  /**
   * 获取单个日记条目
   */
  static getDiaryEntry(id: string): DiaryEntry | null {
    try {
      const entries = this.getDiaryEntries()
      return entries.find(e => e.id === id) || null
    } catch (error) {
      console.error('Failed to get diary entry:', error)
      return null
    }
  }

  /**
   * 获取用户状态
   */
  static getUserState(): UserState {
    try {
      const data = localStorage.getItem(this.KEYS.USER_STATE)
      return data ? JSON.parse(data) : {
        preferences: {
          autoSave: true,
          theme: 'auto' as const
        }
      }
    } catch (error) {
      console.error('Failed to get user state:', error)
      return {
        preferences: {
          autoSave: true,
          theme: 'auto' as const
        }
      }
    }
  }

  /**
   * 保存用户状态
   */
  static setUserState(state: UserState): boolean {
    try {
      localStorage.setItem(this.KEYS.USER_STATE, JSON.stringify(state))
      return true
    } catch (error) {
      console.error('Failed to save user state:', error)
      return false
    }
  }

  /**
   * 获取草稿状态
   */
  static getDraftState(): DraftState {
    try {
      const data = localStorage.getItem(this.KEYS.DRAFT_STATE)
      return data ? JSON.parse(data) : {
        autoSaveEnabled: true
      }
    } catch (error) {
      console.error('Failed to get draft state:', error)
      return {
        autoSaveEnabled: true
      }
    }
  }

  /**
   * 保存草稿状态
   */
  static setDraftState(state: DraftState): boolean {
    try {
      localStorage.setItem(this.KEYS.DRAFT_STATE, JSON.stringify(state))
      return true
    } catch (error) {
      console.error('Failed to save draft state:', error)
      return false
    }
  }

  /**
   * 获取应用设置
   */
  static getAppSettings(): Record<string, any> {
    try {
      const data = localStorage.getItem(this.KEYS.APP_SETTINGS)
      return data ? JSON.parse(data) : {}
    } catch (error) {
      console.error('Failed to get app settings:', error)
      return {}
    }
  }

  /**
   * 保存应用设置
   */
  static setAppSettings(settings: Record<string, any>): boolean {
    try {
      localStorage.setItem(this.KEYS.APP_SETTINGS, JSON.stringify(settings))
      return true
    } catch (error) {
      console.error('Failed to save app settings:', error)
      return false
    }
  }

  /**
   * 清除所有数据
   */
  static clearAll(): boolean {
    try {
      Object.values(this.KEYS).forEach(key => {
        localStorage.removeItem(key)
      })
      return true
    } catch (error) {
      console.error('Failed to clear storage:', error)
      return false
    }
  }

  /**
   * 获取存储使用情况
   */
  static getStorageInfo(): { used: number; available: number; total: number } {
    try {
      let used = 0
      Object.values(this.KEYS).forEach(key => {
        const data = localStorage.getItem(key)
        if (data) {
          used += new Blob([data]).size
        }
      })

      // 估算可用空间（大多数浏览器限制为 5-10MB）
      const total = 5 * 1024 * 1024 // 5MB
      const available = total - used

      return { used, available, total }
    } catch (error) {
      console.error('Failed to get storage info:', error)
      return { used: 0, available: 0, total: 0 }
    }
  }

  /**
   * 检查存储是否可用
   */
  static isStorageAvailable(): boolean {
    try {
      const testKey = '__storage_test__'
      localStorage.setItem(testKey, 'test')
      localStorage.removeItem(testKey)
      return true
    } catch (error) {
      console.error('Storage is not available:', error)
      return false
    }
  }

  /**
   * 导出所有数据
   */
  static exportData(): string {
    try {
      const data = {
        diaryEntries: this.getDiaryEntries(),
        userState: this.getUserState(),
        draftState: this.getDraftState(),
        appSettings: this.getAppSettings(),
        exportTime: new Date().toISOString()
      }
      return JSON.stringify(data, null, 2)
    } catch (error) {
      console.error('Failed to export data:', error)
      throw error
    }
  }

  /**
   * 导入数据
   */
  static importData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData)
      
      if (data.diaryEntries) {
        this.setDiaryEntries(data.diaryEntries)
      }
      if (data.userState) {
        this.setUserState(data.userState)
      }
      if (data.draftState) {
        this.setDraftState(data.draftState)
      }
      if (data.appSettings) {
        this.setAppSettings(data.appSettings)
      }
      
      return true
    } catch (error) {
      console.error('Failed to import data:', error)
      return false
    }
  }
}