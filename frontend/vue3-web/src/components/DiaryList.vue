<template>
  <div class="diary-list-container">
    <!-- 草稿提示 -->
    <div v-if="draftStore.currentDraft" class="draft-notice">
      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <span class="text-xl">💡</span>
          <span class="ml-2 text-amber-700">您有未完成的草稿</span>
        </div>
        <button 
          @click="continueDraft" 
          class="px-3 py-1 bg-amber-500 text-white rounded text-sm hover:bg-amber-600 transition-colors"
        >
          继续编辑
        </button>
      </div>
    </div>

    <!-- 创建新日记按钮 -->
    <div class="mb-6">
      <router-link 
        to="/create" 
        class="inline-flex items-center px-6 py-3 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition-colors"
      >
        <span class="mr-2">✏️</span>
        创建新日记
      </router-link>
    </div>

    <!-- 加载状态 -->
    <div v-if="diaryStore.isLoading" class="loading-state">
      <div class="loading-spinner"></div>
      <p class="mt-2 text-gray-500">加载中...</p>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="diaryStore.error" class="error-state">
      <div class="flex items-center">
        <span class="text-xl">❌</span>
        <span class="ml-2 text-red-700">{{ diaryStore.error }}</span>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else-if="diaryStore.diaries.length === 0" class="empty-state">
      <div class="text-6xl text-gray-300 mb-4">📖</div>
      <h3 class="text-xl font-medium text-gray-700 mb-2">还没有日记</h3>
      <p class="text-gray-500 mb-6">开始记录你的第一个美好时光吧！</p>
      <router-link 
        to="/create" 
        class="inline-flex items-center px-6 py-3 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition-colors"
      >
        <span class="mr-2">✨</span>
        创建第一篇日记
      </router-link>
    </div>

    <!-- 日记列表 -->
    <div v-else class="diary-grid">
      <div 
        v-for="diary in diaryStore.diaries" 
        :key="diary.id"
        class="diary-card"
        @click="viewDiary(diary.id)"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <h3 class="text-lg font-semibold text-gray-900 mb-2">{{ diary.title }}</h3>
            <p class="text-gray-600 mb-3 line-clamp-2">{{ diary.content }}</p>
            <div class="flex items-center text-sm text-gray-500">
              <span class="mr-1">📅</span>
              <span>{{ formatDate(diary.created_at) }}</span>
              <span class="mx-2">•</span>
              <span class="mr-1">🌤️</span>
              <span>{{ diary.weather || '未知' }}</span>
              <span class="mx-2">•</span>
              <span>{{ diary.mood || '未知' }}</span>
            </div>
          </div>
          <div v-if="diary.image_url" class="ml-4">
            <img 
              :src="diary.image_url" 
              :alt="diary.title"
              class="w-16 h-16 object-cover rounded-lg"
            >
          </div>
        </div>
        
        <!-- 删除按钮 -->
        <div class="mt-4 flex justify-end">
          <button
            @click.stop="deleteDiary(diary.id)"
            class="px-3 py-1 text-red-600 border border-red-300 rounded hover:bg-red-50 transition-colors text-sm"
          >
            删除
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useDiaryStore } from '@/stores/diary'
import { useDraftStore } from '@/stores/draft'

const router = useRouter()
const diaryStore = useDiaryStore()
const draftStore = useDraftStore()

onMounted(() => {
  diaryStore.loadDiaries()
})

const viewDiary = (id) => {
  router.push(`/diary/${id}`)
}

const continueDraft = () => {
  router.push('/create')
}

const deleteDiary = async (id) => {
  if (confirm('确定要删除这篇日记吗？此操作无法撤销。')) {
    const success = await diaryStore.removeDiary(id)
    if (success) {
      // 删除成功，列表会自动更新
    } else {
      alert('删除失败，请重试')
    }
  }
}

const formatDate = (dateString) => {
  if (!dateString) return '未知时间'
  
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style scoped>
.diary-list-container {
  max-width: 56rem;
  margin-left: auto;
  margin-right: auto;
}

.draft-notice {
  background-color: #fffbeb;
  border: 1px solid #fde68a;
  border-radius: 0.5rem;
  padding: 1rem;
  margin-bottom: 1.5rem;
}

.loading-state {
  text-align: center;
  padding-top: 3rem;
  padding-bottom: 3rem;
}

.loading-spinner {
  display: inline-block;
  animation: spin 1s linear infinite;
  width: 2rem;
  height: 2rem;
  border: 2px solid #e5e7eb;
  border-top-color: #3b82f6;
  border-radius: 50%;
}

.error-state {
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 0.5rem;
  padding: 1rem;
  margin-bottom: 1.5rem;
}

.empty-state {
  text-align: center;
  padding-top: 3rem;
  padding-bottom: 3rem;
}

.diary-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.diary-card {
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;
  padding: 1.5rem;
  cursor: pointer;
  transition: box-shadow 0.15s ease-in-out;
}

.diary-card:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>