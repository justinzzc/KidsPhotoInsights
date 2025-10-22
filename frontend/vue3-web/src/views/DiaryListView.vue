<template>
  <div class="diary-list-view">
    <!-- 页面标题 -->
    <div class="header mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">我的日记</h1>
      <p class="text-gray-600">记录生活中的美好时光</p>
    </div>

    <!-- 日记列表组件 -->
    <DiaryList />
  </div>
</template>

<script setup>
import DiaryList from '@/components/DiaryList.vue'
</script>

<style scoped>
.diary-list-view {
  max-width: 72rem;
  margin-left: auto;
  margin-right: auto;
  padding-left: 1rem;
  padding-right: 1rem;
  padding-top: 2rem;
  padding-bottom: 2rem;
}

.header {
  text-align: center;
}
</style>