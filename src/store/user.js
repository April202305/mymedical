import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
  const user = ref(JSON.parse(localStorage.getItem('user')) || null)
  const token = ref(localStorage.getItem('token') || null)

  const setUser = (userData) => {
    user.value = userData
    localStorage.setItem('user', JSON.stringify(userData))
  }

  const setToken = (newToken) => {
    token.value = newToken
    localStorage.setItem('token', newToken)
  }

  const clearUser = () => {
    user.value = null
    token.value = null
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    localStorage.removeItem('isLoggedIn')
  }

  const isAuthenticated = () => {
    return !!token.value && !!user.value
  }

  const isAdmin = () => {
    return user.value?.role === 'admin'
  }

  // 初始化时从 localStorage 加载用户状态
  const initializeFromStorage = () => {
    const storedUser = localStorage.getItem('user')
    const storedToken = localStorage.getItem('token')
    if (storedUser && storedToken) {
      user.value = JSON.parse(storedUser)
      token.value = storedToken
    }
  }

  // 在创建 store 时立即初始化
  initializeFromStorage()

  return {
    user,
    token,
    setUser,
    setToken,
    clearUser,
    isAuthenticated,
    isAdmin,
    initializeFromStorage
  }
}) 