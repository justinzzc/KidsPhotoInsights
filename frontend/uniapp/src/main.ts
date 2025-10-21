import { createSSRApp } from 'vue'
import App from './App.vue'
import { initStorage } from './services/storage'

// 初始化本地存储
initStorage()

export function createApp() {
  const app = createSSRApp(App)
  return {
    app,
  }
}