<template>
  <div style="max-width: 1024px; margin: 0 auto;">
    <!-- 草稿提示 -->
    <div v-if="diaryStore.hasDraft" style="background-color: #fefce8; border: 1px solid #fbbf24; border-radius: 0.5rem; padding: 1rem; margin-bottom: 1.5rem;">
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <div style="display: flex; align-items: center;">
          <span>💡</span>
          <span style="margin-left: 0.5rem; color: #92400e;">您有未完成的草稿</span>
        </div>
        <button 
          @click="continueDraft" 
          style="padding: 0.25rem 0.75rem; background-color: #f59e0b; color: white; border-radius: 0.25rem; font-size: 0.875rem; border: none; cursor: pointer;"
        >
          继续编辑
        </button>
      </div>
    </div>

    <!-- 创建新日记按钮 -->
    <div style="margin-bottom: 1.5rem;">
      <router-link 
        to="/create" 
        style="display: inline-flex; align-items: center; padding: 0.75rem 1.5rem; background-color: #3b82f6; color: white; border-radius: 0.5rem; text-decoration: none; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);"
      >
        <span style="margin-right: 0.5rem;">✏️</span>
        创建新日记
      </router-link>
    </div>

    <!-- 加载状态 -->
    <div v-if="diaryStore.loading" style="text-align: center; padding: 2rem 0;">
      <div style="display: inline-block; animation: spin 1s linear infinite; width: 2rem; height: 2rem; border: 2px solid #e5e7eb; border-top: 2px solid #3b82f6; border-radius: 50%;"></div>
      <p style="margin-top: 0.5rem; color: #6b7280;">加载中...</p>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="diaryStore.error" style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 0.5rem; padding: 1rem; margin-bottom: 1.5rem;">
      <div style="display: flex; align-items: center;">
        <span>❌</span>
        <span style="margin-left: 0.5rem; color: #b91c1c;">{{ diaryStore.error }}</span>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else-if="diaryStore.diaries.length === 0" style="text-align: center; padding: 3rem 0;">
      <div style="color: #9ca3af; font-size: 3rem; margin-bottom: 1rem;">📖</div>
      <h3 style="font-size: 1.25rem; font-weight: 500; color: #4b5563; margin-bottom: 0.5rem;">还没有日记</h3>
      <p style="color: #6b7280; margin-bottom: 1.5rem;">开始记录你的第一个美好时光吧！</p>
      <router-link 
        to="/create" 
        style="display: inline-flex; align-items: center; padding: 0.75rem 1.5rem; background-color: #3b82f6; color: white; border-radius: 0.5rem; text-decoration: none; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);"
      >
        <span style="margin-right: 0.5rem;">✨</span>
        创建第一篇日记
      </router-link>
    </div>

    <!-- 日记列表 -->
    <div v-else>
      <div 
        v-for="diary in diaryStore.diaries" 
        :key="diary.id"
        style="background-color: white; border-radius: 0.5rem; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); border: 1px solid #e5e7eb; padding: 1.5rem; margin-bottom: 1rem; cursor: pointer;"
        @click="viewDiary(diary.id)"
      >
        <div style="display: flex; align-items: flex-start; justify-content: space-between;">
          <div style="flex: 1;">
            <h3 style="font-size: 1.125rem; font-weight: 600; color: #1f2937; margin-bottom: 0.5rem;">{{ diary.title }}</h3>
            <p style="color: #4b5563; margin-bottom: 0.75rem; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">{{ diary.content }}</p>
            <div style="display: flex; align-items: center; font-size: 0.875rem; color: #6b7280;">
              <span>📅</span>
              <span style="margin-left: 0.25rem;">{{ formatDate(diary.created_at) }}</span>
              <span style="margin: 0 0.5rem;">•</span>
              <span>🌤️</span>
              <span style="margin-left: 0.25rem;">{{ diary.weather }}</span>
              <span style="margin: 0 0.5rem;">•</span>
              <span>{{ diary.mood }}</span>
            </div>
          </div>
          <div v-if="diary.image_url" style="margin-left: 1rem;">
            <img 
              :src="diary.image_url" 
              :alt="diary.title"
              style="width: 4rem; height: 4rem; object-fit: cover; border-radius: 0.5rem;"
            >
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useDiaryStore } from '@/stores/diary'

const router = useRouter()
const diaryStore = useDiaryStore()

onMounted(() => {
  diaryStore.loadDiaries()
})

const viewDiary = (id) => {
  router.push(`/diary/${id}`)
}

const continueDraft = () => {
  router.push('/create')
}

const formatDate = (dateString) => {
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
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>