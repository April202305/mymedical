import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '../store/user'
import HomePage from '../views/HomePage.vue'
import LoginPage from '../views/LoginPage.vue'
import RegisterPage from '../views/RegisterPage.vue'
import UserProfile from '../views/UserProfile.vue'
import QuizPage from '../views/QuizPage.vue'
import InteractivePage from '../views/InteractivePage.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomePage
  },
  {
    path: '/login',
    name: 'login',
    component: LoginPage
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterPage
  },
  {
    path: '/profile',
    name: 'profile',
    component: UserProfile,
    meta: { requiresAuth: true }
  },
  {
    path: '/quiz',
    name: 'quiz',
    component: QuizPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/interactive',
    name: 'interactive',
    component: InteractivePage,
    meta: { requiresAuth: true }
  },
  {
    path: '/manage-quiz',
    name: 'ManageQuiz',
    component: () => import('../views/ManageQuizPage.vue'),
    meta: { 
      requiresAuth: true,
      requiresAdmin: true 
    }
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

// 导航守卫
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()

  // 检查是否需要认证
  if (to.meta.requiresAuth && !userStore.isAuthenticated()) {
    next('/login')
    return
  }

  // 检查是否需要管理员权限
  if (to.meta.requiresAdmin && !userStore.isAdmin()) {
    next('/')
    return
  }

  // 如果已登录用户访问登录或注册页面，重定向到首页
  if ((to.name === 'login' || to.name === 'register') && userStore.isAuthenticated()) {
    next('/')
    return
  }

  next()
})

export default router 