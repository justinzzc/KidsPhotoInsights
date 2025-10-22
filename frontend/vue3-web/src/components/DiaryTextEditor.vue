<template>
  <div class="diary-text-editor">
    <div class="editor-container bg-white rounded-lg shadow-sm border border-gray-200">
      <!-- 标题编辑 -->
      <div class="title-section p-4 border-b border-gray-100">
        <input
          v-model="localTitle"
          type="text"
          placeholder="请输入日记标题..."
          class="w-full text-xl font-semibold text-gray-800 placeholder-gray-400 border-none outline-none resize-none"
          @input="handleTitleChange"
        />
      </div>

      <!-- 内容编辑 -->
      <div class="content-section p-4">
        <textarea
          v-model="localContent"
          placeholder="请输入日记内容..."
          class="w-full min-h-[200px] text-gray-700 placeholder-gray-400 border-none outline-none resize-none leading-relaxed"
          @input="handleContentChange"
          @keydown="handleKeyDown"
        ></textarea>
      </div>

      <!-- 分析结果展示 -->
      <div v-if="analysisResult" class="analysis-section p-4 border-t border-gray-100 bg-gray-50">
        <h4 class="text-sm font-medium text-gray-600 mb-3">AI 分析结果</h4>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div class="analysis-item">
            <span class="label text-xs text-gray-500">状态</span>
            <span class="value text-sm font-medium text-gray-800">{{ analysisResult.childState }}</span>
          </div>
          <div class="analysis-item">
            <span class="label text-xs text-gray-500">心情</span>
            <span class="value text-sm font-medium text-gray-800">{{ analysisResult.mood }}</span>
          </div>
          <div class="analysis-item">
            <span class="label text-xs text-gray-500">天气</span>
            <span class="value text-sm font-medium text-gray-800">{{ analysisResult.weather }}</span>
          </div>
        </div>

        <!-- 建议列表 -->
        <div v-if="analysisResult.suggestions && analysisResult.suggestions.length > 0" class="suggestions-section">
          <h5 class="text-sm font-medium text-gray-600 mb-2">AI 建议</h5>
          <div class="space-y-2">
            <div 
              v-for="suggestion in analysisResult.suggestions" 
              :key="suggestion.id"
              class="suggestion-item p-3 bg-white rounded-md border border-gray-200"
            >
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <div class="flex items-center space-x-2 mb-1">
                    <span class="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                      {{ suggestion.category }}
                    </span>
                  </div>
                  <p class="text-sm text-gray-700 mb-2">{{ suggestion.reasoning }}</p>
                  <div v-if="suggestion.items && suggestion.items.length > 0" class="items-list">
                    <ul class="text-xs text-gray-600 space-y-1">
                      <li v-for="item in suggestion.items" :key="item.name" class="flex items-center space-x-1">
                        <span>•</span>
                        <span>{{ item.name }}</span>
                        <span v-if="item.qty" class="text-gray-500">({{ item.qty }}{{ item.unit }})</span>
                      </li>
                    </ul>
                  </div>
                </div>
                <button
                  @click="addSuggestionToContent(suggestion)"
                  class="ml-3 px-3 py-1 text-xs bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                >
                  添加到日记
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="actions-section p-4 border-t border-gray-100 bg-gray-50">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-2 text-sm text-gray-500">
            <span>字数: {{ contentLength }}</span>
            <span v-if="lastSaved">• 上次保存: {{ formatTime(lastSaved) }}</span>
          </div>
          <div class="flex items-center space-x-3">
            <button
              @click="saveDraft"
              :disabled="isSaving"
              class="px-4 py-2 text-sm text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors disabled:opacity-50"
            >
              {{ isSaving ? '保存中...' : '保存草稿' }}
            </button>
            <button
              @click="saveDiary"
              :disabled="isSaving || !canSave"
              class="px-4 py-2 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              {{ isSaving ? '保存中...' : '保存日记' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 保存状态提示 -->
    <div v-if="saveStatus" class="mt-4 p-3 rounded-md" :class="saveStatusClass">
      <p class="text-sm">{{ saveStatus }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'

const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  content: {
    type: String,
    default: ''
  },
  analysisResult: {
    type: Object,
    default: null
  },
  autoSave: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:title', 'update:content', 'save-draft', 'save-diary'])

// 本地状态
const localTitle = ref(props.title)
const localContent = ref(props.content)
const isSaving = ref(false)
const lastSaved = ref(null)
const saveStatus = ref('')
const saveTimeout = ref(null)

// 计算属性
const contentLength = computed(() => localContent.value.length)
const canSave = computed(() => localTitle.value.trim() || localContent.value.trim())
const saveStatusClass = computed(() => {
  if (saveStatus.value.includes('成功')) {
    return 'bg-green-50 text-green-700 border border-green-200'
  } else if (saveStatus.value.includes('失败')) {
    return 'bg-red-50 text-red-700 border border-red-200'
  }
  return 'bg-blue-50 text-blue-700 border border-blue-200'
})

// 监听 props 变化
watch(() => props.title, (newTitle) => {
  localTitle.value = newTitle
})

watch(() => props.content, (newContent) => {
  localContent.value = newContent
})

// 自动保存逻辑
watch([localTitle, localContent], () => {
  if (props.autoSave) {
    clearTimeout(saveTimeout.value)
    saveTimeout.value = setTimeout(() => {
      saveDraft()
    }, 2000) // 2秒后自动保存草稿
  }
}, { deep: true })

// 事件处理
const handleTitleChange = () => {
  emit('update:title', localTitle.value)
}

const handleContentChange = () => {
  emit('update:content', localContent.value)
}

const handleKeyDown = (event) => {
  // Ctrl+S 保存
  if (event.ctrlKey && event.key === 's') {
    event.preventDefault()
    saveDiary()
  }
  // Ctrl+D 保存草稿
  if (event.ctrlKey && event.key === 'd') {
    event.preventDefault()
    saveDraft()
  }
}

const addSuggestionToContent = (suggestion) => {
  const suggestionText = `\n\n💡 ${suggestion.category}建议：${suggestion.reasoning}`
  
  if (suggestion.items && suggestion.items.length > 0) {
    const itemsText = suggestion.items
      .map(item => `• ${item.name}${item.qty ? ` (${item.qty}${item.unit})` : ''}`)
      .join('\n')
    localContent.value += suggestionText + '\n' + itemsText
  } else {
    localContent.value += suggestionText
  }
  
  handleContentChange()
}

const saveDraft = async () => {
  if (isSaving.value) return
  
  isSaving.value = true
  saveStatus.value = '正在保存草稿...'
  
  try {
    await emit('save-draft', {
      title: localTitle.value,
      content: localContent.value
    })
    
    lastSaved.value = new Date()
    saveStatus.value = '草稿保存成功'
    
    // 3秒后清除状态
    setTimeout(() => {
      saveStatus.value = ''
    }, 3000)
  } catch (error) {
    saveStatus.value = '草稿保存失败，请重试'
    console.error('Save draft error:', error)
  } finally {
    isSaving.value = false
  }
}

const saveDiary = async () => {
  if (isSaving.value || !canSave.value) return
  
  isSaving.value = true
  saveStatus.value = '正在保存日记...'
  
  try {
    await emit('save-diary', {
      title: localTitle.value,
      content: localContent.value
    })
    
    lastSaved.value = new Date()
    saveStatus.value = '日记保存成功'
    
    // 3秒后清除状态
    setTimeout(() => {
      saveStatus.value = ''
    }, 3000)
  } catch (error) {
    saveStatus.value = '日记保存失败，请重试'
    console.error('Save diary error:', error)
  } finally {
    isSaving.value = false
  }
}

const formatTime = (date) => {
  if (!date) return ''
  return date.toLocaleTimeString('zh-CN', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

// 暴露方法给父组件
defineExpose({
  saveDraft,
  saveDiary,
  getTitle: () => localTitle.value,
  getContent: () => localContent.value,
  setTitle: (title) => { localTitle.value = title },
  setContent: (content) => { localContent.value = content }
})
</script>

<style scoped>
.analysis-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.analysis-item .label {
  display: block;
}

.analysis-item .value {
  display: block;
}

/* 自定义滚动条 */
textarea::-webkit-scrollbar {
  width: 6px;
}

textarea::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

textarea::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

textarea::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>