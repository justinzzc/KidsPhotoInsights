<template>
  <div id="app">
    <nav style="background-color: white; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); border-bottom: 1px solid #e5e7eb;">
      <div class="container" style="padding: 1rem 1.5rem;">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <router-link to="/" style="font-size: 1.25rem; font-weight: 700; color: #1f2937; text-decoration: none;">
            📸 儿童拍照日记
          </router-link>
          
          <div style="display: flex; align-items: center; gap: 1rem;">
            <router-link 
              to="/" 
              style="color: #4b5563; text-decoration: none;"
              :style="{ color: $route.path === '/' ? '#2563eb' : '#4b5563', fontWeight: $route.path === '/' ? '500' : 'normal' }"
            >
              日记列表
            </router-link>
            <router-link 
              to="/create" 
              class="btn btn-primary"
            >
              写日记
            </router-link>
          </div>
        </div>
      </div>
    </nav>

    <main style="min-height: 100vh; background-color: #f9fafb;">
      <router-view />
    </main>
  </div>
</template>

<script setup>
// App component logic
</script>

<style>
/* 全局样式已在 main.css 中定义 */
</style>
