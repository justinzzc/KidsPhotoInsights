<template>
  <div class="diary-detail">
    <div class="container mx-auto px-4 py-8">
      <header class="mb-8">
        <div class="flex items-center justify-between">
          <button
            @click="$router.push('/')"
            class="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
            <span>返回列表</span>
          </button>
          
          <div class="flex space-x-3">
            <button
              @click="editDiary"
              class="px-4 py-2 text-blue-600 border border-blue-300 rounded-md hover:bg-blue-50 transition-colors"
            >
              编辑
            </button>
            <button
              @click="deleteDiary"
              class="px-4 py-2 text-red-600 border border-red-300 rounded-md hover:bg-red-50 transition-colors"
            >
              删除
            </button>
          </div>
        </div>
      </header>

      <main v-if="diary" class="max-w-4xl mx-auto">
        <article class="bg-white rounded-lg shadow-lg overflow-hidden">
          <div v-if="diary.imageUrl" class="h-96 overflow-hidden">
            <img :src="diary.imageUrl" :alt="diary.title" class="w-full h-full object-cover" />
          </div>
          
          <div class="p-8">
            <header class="mb-6">
              <h1 class="text-3xl font-bold text-gray-800 mb-4">{{ diary.title }}</h1>
              
              <div class="flex items-center space-x-6 text-sm text-gray-600">
                <div class="flex items-center space-x-2">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>{{ formatDate(diary.createdAt) }}</span>
                </div>
                
                <div v-if="diary.weather" class="flex items-center space-x-2">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                  </svg>
                  <span>{{ diary.weather }}</span>
                </div>
                
                <div v-if="diary.mood" class="flex items-center space-x-2">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{{ diary.mood }}</span>
                </div>
              </div>
            </header>

            <div v-if="diary.scene" class="mb-6 p-4 bg-blue-50 rounded-lg">
              <h3 class="font-medium text-blue-800 mb-2">AI 分析</h3>
              <div class="text-blue-700 space-y-1">
                <p><strong>场景：</strong>{{ diary.scene }}</p>
                <p v-if="diary.suggestion"><strong>建议：</strong>{{ diary.suggestion }}</p>
              </div>
            </div>

            <div class="prose max-w-none">
              <div class="text-gray-700 leading-relaxed whitespace-pre-wrap">{{ diary.content }}</div>
            </div>
          </div>
        </article>
      </main>

      <div v-else-if="loading" class="text-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        <p class="mt-2 text-gray-600">加载中...</p>
      </div>

      <div v-else class="text-center py-12">
        <div class="text-gray-400 mb-4">
          <svg class="mx-auto h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 class="text-lg font-medium text-gray-600 mb-2">日记不存在</h3>
        <p class="text-gray-500 mb-4">这篇日记可能已被删除或不存在</p>
        <button
          @click="$router.push('/')"
          class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          返回首页
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDiaryStore } from '@/stores/diary'

const route = useRoute()
const router = useRouter()
const diaryStore = useDiaryStore()

const diary = ref(null)
const loading = ref(true)

onMounted(async () => {
  const id = route.params.id
  if (id) {
    try {
      // 先从本地存储中查找
      const localDiary = diaryStore.getDiaryById(id)
      if (localDiary) {
        diary.value = localDiary
      } else {
        // 如果本地没有，尝试从服务器获取
        await diaryStore.loadDiaries()
        const foundDiary = diaryStore.getDiaryById(id)
        if (foundDiary) {
          diary.value = foundDiary
        }
      }
    } catch (error) {
      console.error('Failed to load diary:', error)
    } finally {
      loading.value = false
    }
  }
})

const editDiary = () => {
  // TODO: 实现编辑功能
  alert('编辑功能开发中...')
}

const deleteDiary = async () => {
  if (confirm('确定要删除这篇日记吗？')) {
    try {
      await diaryStore.deleteDiary(diary.value.id)
      router.push('/')
    } catch (error) {
      alert('删除失败：' + error.message)
    }
  }
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>