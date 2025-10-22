<template>
  <div>
    <h1>Vue 3 应用测试</h1>
    <p>如果看到这个页面，说明Vue 3应用正常运行</p>
    <button @click="testFunction">点击测试</button>
    <p>{{ message }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const message = ref('')

const testFunction = () => {
  message.value = '按钮点击成功！Vue 3应用正常运行。'
}
</script>

<style>
button {
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #0056b3;
}
</style>