import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import CreateDiaryView from '../views/CreateDiaryView.vue'
import DiaryDetailView from '../views/DiaryDetailView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/create',
      name: 'create-diary',
      component: CreateDiaryView
    },
    {
      path: '/diary/:id',
      name: 'diary-detail',
      component: DiaryDetailView
    }
  ]
})

export default router