<template>
  <view class="page">
    <button @click="chooseImage">选择图片（H5）</button>
    <image v-if="preview" :src="preview" mode="widthFix" />
    <button v-if="preview" @click="analyze">分析并生成文字</button>
    <view v-if="resultText">{{ resultText }}</view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { analyzePhoto } from '../../services/api'

const preview = ref<string | null>(null)
const base64Data = ref<string | null>(null)
const resultText = ref<string>('')

function chooseImage() {
  uni.chooseImage({
    count: 1,
    success(res) {
      const path = res.tempFilePaths?.[0]
      preview.value = path
      const tempFile = (res as any).tempFiles?.[0]?.file
      if (tempFile) {
        const reader = new FileReader()
        reader.onload = (e: any) => {
          base64Data.value = e.target.result as string
        }
        reader.onerror = () => {
          uni.showToast({ title: '读取图片失败', icon: 'none' })
        }
        reader.readAsDataURL(tempFile)
      } else {
        uni.showToast({ title: '不支持的环境，请使用 H5', icon: 'none' })
      }
    },
    fail() {
      uni.showToast({ title: '选择图片失败', icon: 'none' })
    },
  })
}

async function analyze() {
  if (!base64Data.value) return
  try {
    const data = await analyzePhoto({
      imageBase64: base64Data.value,
      timestamp: Date.now() / 1000,
    })
    resultText.value = `孩子状态: ${data.childState || '未知'}；心情: ${data.mood || '未知'}；天气: ${data.weather || '未知'}`
  } catch (e) {
    console.error(e)
    uni.showToast({ title: '分析失败', icon: 'none' })
  }
}
</script>

<style>
.page { padding: 16px; }
image { width: 100%; margin-top: 12px; }
</style>