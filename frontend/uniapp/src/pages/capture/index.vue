<template>
  <view class="page">
    <view class="tabs">
      <view class="tab" :class="{ active: activeTab === 'capture' }" @click="activeTab = 'capture'">拍照分析</view>
      <view class="tab" :class="{ active: activeTab === 'list' }" @click="activeTab = 'list'">日记列表</view>
    </view>
    
    <view v-if="activeTab === 'capture'" class="tab-content">
      <button @click="chooseImage">选择图片（H5）</button>
      <image v-if="preview" :src="preview" mode="widthFix" />
      <button v-if="preview" @click="analyze">分析并生成文字</button>
      <view v-if="resultText" class="result-text">{{ resultText }}</view>
      <view v-if="resultText" class="actions">
        <button @click="saveDraft">保存草稿</button>
      </view>
    </view>
    
    <view v-if="activeTab === 'list'" class="tab-content">
      <button @click="loadDiaryEntries">刷新列表</button>
      <view v-if="diaryEntries.length === 0" class="empty-list">暂无日记</view>
      <view v-else class="diary-list">
        <view v-for="entry in diaryEntries" :key="entry.id" class="diary-item">
          <view class="diary-header">
            <text class="diary-date">{{ formatDate(entry.ts) }}</text>
            <text v-if="entry.isDraft" class="diary-draft">草稿</text>
          </view>
          <view class="diary-content">{{ entry.text || `心情: ${entry.mood || '未知'}；天气: ${entry.weather || '未知'}` }}</view>
          <view class="diary-actions">
            <button size="mini" @click="deleteDiaryItem(entry.id)">删除</button>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { analyzePhoto, fetchDiaryEntries, deleteDiaryEntry } from '../../services/api'
import { DiaryEntry, initStorage, diaryEntries as localDiaryEntries, saveAnalysisAsDraft, deleteDiary } from '../../services/storage'

const activeTab = ref<'capture' | 'list'>('capture')
const preview = ref<string | null>(null)
const base64Data = ref<string | null>(null)
const resultText = ref<string>('')
const analysisResult = ref<any>(null)
const diaryEntries = ref<DiaryEntry[]>([])

// 初始化
onMounted(() => {
  initStorage()
  loadDiaryEntries()
})

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
    analysisResult.value = data
    resultText.value = `孩子状态: ${data.childState || '未知'}；心情: ${data.mood || '未知'}；天气: ${data.weather || '未知'}`
  } catch (e) {
    console.error(e)
    uni.showToast({ title: '分析失败', icon: 'none' })
  }
}

// 保存草稿
function saveDraft() {
  if (!analysisResult.value) return
  
  saveAnalysisAsDraft(analysisResult.value, base64Data.value || undefined)
  uni.showToast({ title: '草稿已保存', icon: 'success' })
  
  // 重置状态
  setTimeout(() => {
    loadDiaryEntries()
  }, 500)
}

// 加载日记列表
async function loadDiaryEntries() {
  try {
    // 先加载本地数据
    diaryEntries.value = [...localDiaryEntries.value]
    
    // 再尝试从服务器获取
    const serverEntries = await fetchDiaryEntries()
    if (serverEntries && serverEntries.length > 0) {
      // 合并服务器数据（避免重复）
      const serverIds = new Set(serverEntries.map(e => e.id))
      const localOnlyEntries = diaryEntries.value.filter(e => !serverIds.has(e.id) || e.isDraft)
      
      diaryEntries.value = [...serverEntries, ...localOnlyEntries]
        .sort((a, b) => b.ts - a.ts) // 按时间倒序
    }
  } catch (e) {
    console.error('加载日记列表失败', e)
  }
}

// 删除日记
async function deleteDiaryItem(id: string) {
  uni.showModal({
    title: '确认删除',
    content: '确定要删除这条日记吗？',
    success: async (res) => {
      if (res.confirm) {
        // 先从本地删除
        deleteDiary(id)
        
        // 再尝试从服务器删除
        await deleteDiaryEntry(id)
        
        // 刷新列表
        loadDiaryEntries()
        uni.showToast({ title: '删除成功', icon: 'success' })
      }
    }
  })
}

// 格式化日期
function formatDate(timestamp: number) {
  const date = new Date(timestamp)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}
</script>

<style>
.page { padding: 16px; }
image { width: 100%; margin-top: 12px; }

.tabs {
  display: flex;
  border-bottom: 1px solid #eee;
  margin-bottom: 16px;
}

.tab {
  flex: 1;
  text-align: center;
  padding: 12px 0;
  font-size: 16px;
  color: #666;
}

.tab.active {
  color: #007aff;
  border-bottom: 2px solid #007aff;
}

.tab-content {
  min-height: 300px;
}

.result-text {
  margin: 16px 0;
  padding: 12px;
  background: #f5f5f5;
  border-radius: 8px;
}

.actions {
  margin-top: 16px;
}

.diary-list {
  margin-top: 16px;
}

.diary-item {
  margin-bottom: 16px;
  padding: 12px;
  background: #f9f9f9;
  border-radius: 8px;
  border-left: 3px solid #007aff;
}

.diary-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.diary-date {
  font-size: 14px;
  color: #666;
}

.diary-draft {
  font-size: 12px;
  color: #ff9500;
  background: rgba(255, 149, 0, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
}

.diary-content {
  margin-bottom: 12px;
  line-height: 1.5;
}

.diary-actions {
  display: flex;
  justify-content: flex-end;
}

.empty-list {
  text-align: center;
  color: #999;
  padding: 32px 0;
}
</style>