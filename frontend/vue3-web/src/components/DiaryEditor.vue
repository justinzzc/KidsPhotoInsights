<template>
  <div class="diary-editor">
    <!-- 照片上传区域 -->
    <div class="mb-6">
      <PhotoUploader 
        ref="photoUploaderRef"
        @analysis-complete="handleAnalysisComplete" 
        @image-selected="handleImageSelected"
      />
    </div>

    <!-- 文本编辑区域 -->
    <div class="mb-6">
      <DiaryTextEditor
        ref="textEditorRef"
        :title="diary.title"
        :content="diary.content"
        :analysis-result="analysisResult"
        :auto-save="true"
        @update:title="handleTitleUpdate"
        @update:content="handleContentUpdate"
        @save-draft="handleSaveDraft"
        @save-diary="handleSaveDiary"
      />
    </div>

    <!-- 操作按钮区域 -->
    <div class="flex justify-between items-center mt-6">
      <div class="flex space-x-3">
        <button
          @click="clearAll"
          :disabled="!hasContent"
          class="px-4 py-2 text-red-600 border border-red-300 rounded-md hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          清空重新开始
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
          @click="goToDiaryList"
          class="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
        >
          查看日记列表
        </button>
      </div>
    </div>

    <!-- 状态提示 -->
    <div v-if="saveStatus" class="mt-4 p-3 rounded-md" :class="saveStatusClass">
      <p class="text-sm">{{ saveStatus }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useDiaryStore } from '@/stores/diary'
import { useDraftStore } from '@/stores/draft'
import PhotoUploader from '@/components/PhotoUploader.vue'
import DiaryTextEditor from '@/components/DiaryTextEditor.vue'

const router = useRouter()
const diaryStore = useDiaryStore()
const draftStore = useDraftStore()

// 组件引用
const photoUploaderRef = ref(null)
const textEditorRef = ref(null)

// 状态数据
const diary = ref({
  title: '',
  content: '',
  imageUrl: '',
  base64Data: '',
  scene: '',
  weather: '',
  mood: '',
  childState: '',
  suggestions: []
})

const analysisResult = ref(null)
const saveStatus = ref('')

// 初始化
onMounted(async () => {
  // 初始化草稿状态
  draftStore.initializeDraft()
  
  // 如果有现有草稿，加载草稿
  if (draftStore.currentDraft) {
    const draft = draftStore.currentDraft
    diary.value = {
      title: draft.title || '',
      content: draft.content || draft.text || '',
      imageUrl: draft.image_url || '',
      base64Data: draft.base64Data || '',
      scene: draft.scene || '',
      weather: draft.weather || '',
      mood: draft.mood || '',
      childState: draft.childState || '',
      suggestions: draft.suggestions || []
    }
    
    // 重建分析结果
    if (draft.scene || draft.weather || draft.mood) {
      analysisResult.value = {
        scene: draft.scene,
        weather: draft.weather,
        mood: draft.mood,
        childState: draft.childState,
        suggestions: draft.suggestions || []
      }
    }
  } else {
    // 创建新草稿
    draftStore.createNewDraft()
  }
})

// 计算属性
const hasContent = computed(() => {
  return diary.value.title.trim() || diary.value.content.trim() || diary.value.imageUrl
})

const canSave = computed(() => {
  return diary.value.title.trim() && diary.value.content.trim()
})

const saveStatusClass = computed(() => {
  if (saveStatus.value.includes('成功')) {
    return 'bg-green-50 text-green-700 border border-green-200'
  } else if (saveStatus.value.includes('失败')) {
    return 'bg-red-50 text-red-700 border border-red-200'
  }
  return 'bg-blue-50 text-blue-700 border border-blue-200'
})

// 事件处理
const handleImageSelected = (imageData) => {
  diary.value.imageUrl = imageData.url
  diary.value.base64Data = imageData.base64
  
  // 更新草稿
  draftStore.updateDraft({
    image_url: imageData.url,
    base64Data: imageData.base64
  })
}

const handleAnalysisComplete = (result) => {
  analysisResult.value = result
  
  // 更新日记数据
  diary.value.scene = result.scene || ''
  diary.value.weather = result.weather || ''
  diary.value.mood = result.mood || ''
  diary.value.childState = result.childState || ''
  diary.value.suggestions = result.suggestions || []
  
  // 如果有生成的文本，更新内容
  if (result.generatedText) {
    diary.value.content = result.generatedText
    // 通知文本编辑器更新
    nextTick(() => {
      if (textEditorRef.value) {
        textEditorRef.value.setContent(result.generatedText)
      }
    })
  }
  
  // 更新草稿
  draftStore.updateDraft({
    scene: result.scene,
    weather: result.weather,
    mood: result.mood,
    childState: result.childState,
    suggestions: result.suggestions,
    content: result.generatedText || diary.value.content
  })
}

const handleTitleUpdate = (title) => {
  diary.value.title = title
  draftStore.setDraftTitle(title)
}

const handleContentUpdate = (content) => {
  diary.value.content = content
  draftStore.setDraftContent(content)
}

const handleSaveDraft = async (data) => {
  try {
    // 更新本地数据
    diary.value.title = data.title
    diary.value.content = data.content
    
    // 保存到草稿存储
    const success = draftStore.saveDraft()
    
    if (success) {
      saveStatus.value = '草稿保存成功'
    } else {
      throw new Error('草稿保存失败')
    }
  } catch (error) {
    saveStatus.value = '草稿保存失败：' + error.message
    console.error('Save draft error:', error)
  }
  
  // 清除状态提示
  setTimeout(() => {
    saveStatus.value = ''
  }, 3000)
}

 const handleSaveDiary = async (data) => {
   try {
     // 准备日记数据
     const diaryData = {
       title: data.title || diary.value.title,
       content: data.content || diary.value.content,
       mood: analysisResult.value?.mood,
       weather: analysisResult.value?.weather,
       scene: analysisResult.value?.scene || diary.value.scene,
       suggestion: analysisResult.value?.suggestions || diary.value.suggestions,
       image_url: diary.value.imageUrl,
       status: 'published'
     }
     
     // 保存到日记存储
     const savedDiary = await diaryStore.createDiary(diaryData)
     
     if (savedDiary) {
       // 清除草稿
       draftStore.clearDraft()
       
       saveStatus.value = '日记保存成功！即将跳转到日记列表...'
       
       // 跳转到日记列表
       setTimeout(() => {
         router.push('/diary-list')
       }, 2000)
     } else {
       throw new Error('保存失败')
     }
     
   } catch (error) {
     saveStatus.value = '日记保存失败：' + error.message
     console.error('Save diary error:', error)
   }
 }

const clearAll = () => {
  if (confirm('确定要清空所有内容吗？这将删除当前草稿。')) {
    // 重置日记数据
    diary.value = {
      title: '',
      content: '',
      imageUrl: '',
      base64Data: '',
      scene: '',
      weather: '',
      mood: '',
      childState: '',
      suggestions: []
    }
    
    // 清空分析结果
    analysisResult.value = null
    
    // 清除草稿
    draftStore.clearDraft()
    
    // 重置组件
    if (photoUploaderRef.value) {
      photoUploaderRef.value.removeImage()
    }
    
    if (textEditorRef.value) {
      textEditorRef.value.setTitle('')
      textEditorRef.value.setContent('')
    }
    
    saveStatus.value = '内容已清空，可以重新开始'
    
    setTimeout(() => {
      saveStatus.value = ''
    }, 3000)
  }
}

const cancel = () => {
  if (hasContent.value && !confirm('确定要放弃编辑吗？未保存的内容将会丢失。')) {
    return
  }
  
  // 如果有未保存的更改，提示保存草稿
  if (draftStore.hasUnsavedChanges && draftStore.shouldPromptSave()) {
    if (confirm('检测到未保存的更改，是否保存为草稿？')) {
      draftStore.saveDraft()
    }
  }
  
  router.push('/')
}

const goToDiaryList = () => {
  // 如果有未保存的更改，自动保存草稿
  if (draftStore.hasUnsavedChanges) {
    draftStore.saveDraft()
  }
  
  router.push('/diary-list')
}

// 暴露方法给父组件
defineExpose({
  saveDraft: () => draftStore.saveDraft(),
  clearDraft: () => draftStore.clearDraft(),
  getDiary: () => diary.value,
  getAnalysisResult: () => analysisResult.value
})
</script>

<style scoped>
.diary-editor {
  max-width: 56rem;
  margin-left: auto;
  margin-right: auto;
}
</style>