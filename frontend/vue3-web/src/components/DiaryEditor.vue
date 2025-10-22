<template>
  <div class="diary-editor">
    <div class="mb-6">
      <label class="block text-sm font-medium text-gray-700 mb-2">标题</label>
      <input
        v-model="diary.title"
        type="text"
        placeholder="给这篇日记起个标题..."
        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>

    <div class="mb-6">
      <PhotoUploader @analysis-complete="handleAnalysisComplete" />
    </div>

    <div v-if="analysisResult" class="mb-6 p-4 bg-blue-50 rounded-lg">
      <h3 class="font-medium text-blue-800 mb-2">AI 分析结果</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div>
          <span class="font-medium text-blue-700">场景：</span>
          <span class="text-blue-600">{{ analysisResult.scene }}</span>
        </div>
        <div>
          <span class="font-medium text-blue-700">天气：</span>
          <span class="text-blue-600">{{ analysisResult.weather }}</span>
        </div>
        <div>
          <span class="font-medium text-blue-700">心情：</span>
          <span class="text-blue-600">{{ analysisResult.mood }}</span>
        </div>
      </div>
      <div v-if="analysisResult.suggestion" class="mt-2">
        <span class="font-medium text-blue-700">建议：</span>
        <span class="text-blue-600">{{ analysisResult.suggestion }}</span>
      </div>
    </div>

    <div class="mb-6">
      <label class="block text-sm font-medium text-gray-700 mb-2">日记内容</label>
      <textarea
        v-model="diary.content"
        rows="8"
        placeholder="记录今天的美好瞬间..."
        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
      ></textarea>
    </div>

    <div class="flex justify-between items-center">
      <div class="flex space-x-3">
        <button
          @click="saveDraft"
          :disabled="!hasContent"
          class="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          保存草稿
        </button>
        <button
          @click="clearAll"
          :disabled="!hasContent"
          class="px-4 py-2 text-red-600 border border-red-300 rounded-md hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          清空
        </button>
      </div>
      
      <div class="flex space-x-3">
        <button
          @click="cancel"
          class="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
        >
          取消
        </button>
        <button
          @click="saveDiary"
          :disabled="!canSave"
          class="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          保存日记
        </button>
      </div>
    </div>

    <div v-if="saveStatus" class="mt-4 p-3 rounded-md" :class="saveStatus.type">
      <p class="text-sm">{{ saveStatus.message }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useDiaryStore } from '@/stores/diary'
import PhotoUploader from '@/components/PhotoUploader.vue'

const router = useRouter()
const diaryStore = useDiaryStore()

const diary = ref({
  title: '',
  content: '',
  imageUrl: '',
  scene: '',
  weather: '',
  mood: '',
  suggestion: ''
})

const analysisResult = ref(null)
const saveStatus = ref(null)

onMounted(() => {
  // 如果有草稿，加载草稿
  if (diaryStore.draft) {
    diary.value = { ...diaryStore.draft }
    analysisResult.value = diary.value.scene ? {
      scene: diary.value.scene,
      weather: diary.value.weather,
      mood: diary.value.mood,
      suggestion: diary.value.suggestion
    } : null
  }
})

const hasContent = computed(() => {
  return diary.value.title.trim() || diary.value.content.trim()
})

const canSave = computed(() => {
  return diary.value.title.trim() && diary.value.content.trim()
})

const handleAnalysisComplete = (result) => {
  analysisResult.value = result
  diary.value.scene = result.scene
  diary.value.weather = result.weather
  diary.value.mood = result.mood
  diary.value.suggestion = result.suggestion
}

const saveDraft = () => {
  diaryStore.saveDraft(diary.value)
  showSaveStatus('success', '草稿已保存')
}

const saveDiary = async () => {
  if (!canSave.value) return

  try {
    await diaryStore.createDiary(diary.value)
    diaryStore.clearDraft()
    showSaveStatus('success', '日记保存成功！')
    
    setTimeout(() => {
      router.push('/')
    }, 1500)
  } catch (error) {
    showSaveStatus('error', '保存失败：' + error.message)
  }
}

const clearAll = () => {
  if (confirm('确定要清空所有内容吗？')) {
    diary.value = {
      title: '',
      content: '',
      imageUrl: '',
      scene: '',
      weather: '',
      mood: '',
      suggestion: ''
    }
    analysisResult.value = null
    diaryStore.clearDraft()
    showSaveStatus('info', '内容已清空')
  }
}

const cancel = () => {
  if (hasContent.value && !confirm('确定要放弃编辑吗？')) {
    return
  }
  router.push('/')
}

const showSaveStatus = (type, message) => {
  saveStatus.value = { type, message }
  
  const typeClasses = {
    success: 'bg-green-50 text-green-700 border border-green-200',
    error: 'bg-red-50 text-red-700 border border-red-200',
    info: 'bg-blue-50 text-blue-700 border border-blue-200'
  }
  
  saveStatus.value.type = typeClasses[type]
  
  setTimeout(() => {
    saveStatus.value = null
  }, 3000)
}
</script>