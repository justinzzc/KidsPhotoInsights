<template>
  <div style="min-height: 100vh; background-color: #f9fafb;">
    <div class="container" style="padding: 2rem 1rem;">
      <h1 style="font-size: 1.875rem; font-weight: 700; color: #1f2937; margin-bottom: 2rem; text-align: center;">
        📸 儿童拍照智能日记
      </h1>
      <DiaryList />
    </div>
  </div>
</template>

<script setup>
import DiaryList from '@/components/DiaryList.vue'
</script>