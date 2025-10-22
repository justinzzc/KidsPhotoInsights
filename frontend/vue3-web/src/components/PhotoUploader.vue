<template>
  <div class="photo-uploader">
    <div 
      class="upload-area border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 transition-colors"
      @click="triggerFileInput"
      @drop.prevent="handleDrop"
      @dragover.prevent
      @dragenter.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      :class="{ 'border-blue-400 bg-blue-50': isDragging }"
    >
      <div v-if="!previewImage" class="space-y-4">
        <div class="text-gray-500">
          <svg class="mx-auto h-12 w-12" stroke="currentColor" fill="none" viewBox="0 0 48 48">
            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </div>
        <div>
          <p class="text-lg font-medium text-gray-700">点击或拖拽照片到此处</p>
          <p class="text-sm text-gray-500">支持 JPG、PNG 格式，文件大小不超过 5MB</p>
        </div>
      </div>
      
      <div v-else class="space-y-4">
        <img :src="previewImage" alt="预览" class="max-w-full max-h-64 mx-auto rounded-lg shadow-md" />
        <div class="flex justify-center space-x-4">
          <button
            @click.stop="triggerFileInput"
            class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            重新选择
          </button>
          <button
            @click.stop="removeImage"
            class="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
          >
            删除
          </button>
        </div>
      </div>
    </div>

    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      @change="handleFileSelect"
      class="hidden"
    />

    <div v-if="isAnalyzing" class="mt-4 p-4 bg-blue-50 rounded-lg">
      <div class="flex items-center space-x-3">
        <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
        <span class="text-blue-700">正在分析照片...</span>
      </div>
    </div>

    <div v-if="analysisResult" class="mt-4 p-4 bg-green-50 rounded-lg">
      <h3 class="font-medium text-green-800 mb-2">分析结果</h3>
      <div class="text-green-700 space-y-1">
        <p><strong>状态：</strong>{{ analysisResult.childState }}</p>
        <p><strong>心情：</strong>{{ analysisResult.mood }}</p>
        <p><strong>天气：</strong>{{ analysisResult.weather }}</p>
        <div v-if="analysisResult.suggestions && analysisResult.suggestions.length > 0">
          <p><strong>建议：</strong></p>
          <ul class="list-disc list-inside ml-4">
            <li v-for="suggestion in analysisResult.suggestions" :key="suggestion.id">
              {{ suggestion.reasoning }}
            </li>
          </ul>
        </div>
      </div>
    </div>

    <div v-if="error" class="mt-4 p-4 bg-red-50 rounded-lg">
      <p class="text-red-700">{{ error }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { analysisAPI } from '@/services/api'
import { UploadService } from '@/services/upload'

const emit = defineEmits(['analysis-complete', 'image-selected'])

const fileInput = ref(null)
const selectedFile = ref(null)
const previewImage = ref(null)
const isDragging = ref(false)
const isAnalyzing = ref(false)
const analysisResult = ref(null)
const error = ref(null)
const base64Data = ref(null)

const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileSelect = (event) => {
  const file = event.target.files[0]
  if (file) {
    processFile(file)
  }
}

const handleDrop = (event) => {
  isDragging.value = false
  const file = event.dataTransfer.files[0]
  if (file && file.type.startsWith('image/')) {
    processFile(file)
  }
}

const processFile = async (file) => {
  if (file.size > 5 * 1024 * 1024) {
    error.value = '文件大小不能超过 5MB'
    return
  }

  selectedFile.value = file
  error.value = null
  analysisResult.value = null

  // 创建预览
  const reader = new FileReader()
  reader.onload = (e) => {
    previewImage.value = e.target.result
  }
  reader.readAsDataURL(file)

  // 转换为Base64并分析
  try {
    const uploadResult = await UploadService.fileToBase64(file, {
      quality: 0.8,
      maxWidth: 1920,
      maxHeight: 1080
    })

    if (uploadResult.success) {
      base64Data.value = uploadResult.data.base64
      emit('image-selected', {
        file,
        base64: uploadResult.data.base64,
        preview: previewImage.value
      })
      
      // 自动分析照片
      await analyzePhotoFile(uploadResult.data.base64)
    } else {
      error.value = uploadResult.error || '图片处理失败'
    }
  } catch (err) {
    error.value = '图片处理失败，请重试'
    console.error('Image processing error:', err)
  }
}

const removeImage = () => {
  selectedFile.value = null
  previewImage.value = null
  analysisResult.value = null
  error.value = null
  base64Data.value = null
  fileInput.value.value = ''
  
  emit('image-selected', null)
}

const analyzePhotoFile = async (base64) => {
  if (!base64) return

  isAnalyzing.value = true
  error.value = null

  try {
    const result = await analysisAPI.analyzePhoto({
      image: base64,
      regionHint: 'China'
    })
    
    if (result.success) {
      analysisResult.value = result.data
      emit('analysis-complete', result.data)
    } else {
      error.value = result.error || '分析失败，请重试'
    }
  } catch (err) {
    error.value = err.message || '分析失败，请重试'
    console.error('Photo analysis error:', err)
  } finally {
    isAnalyzing.value = false
  }
}

// 暴露方法给父组件
defineExpose({
  getBase64Data: () => base64Data.value,
  getAnalysisResult: () => analysisResult.value,
  removeImage
})
</script>