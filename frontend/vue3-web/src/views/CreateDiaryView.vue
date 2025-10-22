<template>
  <div class="create-diary">
    <div class="container mx-auto px-4 py-8">
      <header class="mb-8">
        <h1 class="text-3xl font-bold text-gray-800">创建新日记</h1>
        <p class="text-gray-600 mt-2">上传照片，让AI帮你分析并生成日记内容</p>
      </header>

      <main>
        <DiaryEditor />
      </main>
    </div>
  </div>
</template>

<script setup>
import DiaryEditor from '@/components/DiaryEditor.vue'
</script>