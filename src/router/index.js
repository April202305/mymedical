import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../views/Home.vue'
import ProfilePage from '../views/Profile.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomePage
  },
  {
    path: '/profile',
    name: 'profile',
    component: ProfilePage
  },
  {
    path: '/interactive',
    name: 'interactive',
    component: () => import('../components/InteractiveLearning.vue')
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router 