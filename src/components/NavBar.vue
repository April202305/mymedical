<template>
  <div class="nav-container">
    <div class="nav-content">
      <h1 class="site-title">医学教育平台</h1>
      <el-menu
        :default-active="activeIndex"
        class="nav-menu"
        mode="horizontal"
        router
      >
        <div class="nav-left">
          <el-menu-item index="/">
            <el-icon><HomeFilled /></el-icon>
            首页
          </el-menu-item>
          <el-menu-item index="/interactive">
            <el-icon><Monitor /></el-icon>
            互动学习
          </el-menu-item>
          <el-menu-item index="/quiz">
            <el-icon><Edit /></el-icon>
            知识测试
          </el-menu-item>
          <el-menu-item v-if="isAdmin" index="/manage-quiz">
            <el-icon><Setting /></el-icon>
            题库管理
          </el-menu-item>
        </div>

        <div class="nav-right">
          <template v-if="isAuthenticated">
            <div class="user-info">
              <el-tag :type="isAdmin ? 'danger' : 'success'" class="role-tag">
                {{ isAdmin ? '管理员' : '学员' }}
              </el-tag>
              <el-menu-item index="/profile">
                <el-icon><User /></el-icon>
                {{ username }}
              </el-menu-item>
              <el-menu-item index="" @click="handleLogout">
                <el-icon><SwitchButton /></el-icon>
                退出登录
              </el-menu-item>
            </div>
          </template>
          <template v-else>
            <el-menu-item index="/login">
              <el-icon><Key /></el-icon>
              登录
            </el-menu-item>
            <el-menu-item index="/register">
              <el-icon><Plus /></el-icon>
              注册
            </el-menu-item>
          </template>
        </div>
      </el-menu>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../store/user'
import { 
  HomeFilled, 
  Monitor, 
  Edit, 
  Setting, 
  User, 
  SwitchButton,
  Key,
  Plus
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { logout } from '../services/auth'

const router = useRouter()
const userStore = useUserStore()

const activeIndex = ref('/')

const username = computed(() => userStore.user?.name || userStore.user?.username || '')
const isAuthenticated = computed(() => userStore.isAuthenticated())
const isAdmin = computed(() => userStore.isAdmin())

const handleLogout = async () => {
  try {
    await logout()
    userStore.clearUser()
    ElMessage.success('退出登录成功')
    router.push('/login')
  } catch (error) {
    console.error('退出登录失败:', error)
    ElMessage.error('退出登录失败')
  }
}
</script>

<style scoped>
.nav-container {
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.nav-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  height: 60px;
}

.site-title {
  margin: 0;
  font-size: 20px;
  color: #409EFF;
  white-space: nowrap;
}

.nav-menu {
  display: flex;
  justify-content: space-between;
  padding: 0 20px;
  height: 60px;
  line-height: 60px;
}

.nav-left {
  display: flex;
  align-items: center;
}

.nav-right {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.role-tag {
  margin: 0 10px;
}

:deep(.el-menu-item) {
  display: flex;
  align-items: center;
}

:deep(.el-menu-item .el-icon) {
  margin-right: 5px;
  font-size: 18px;
}

:deep(.el-menu--horizontal .el-menu-item) {
  border-bottom: none;
}

:deep(.el-menu-item.is-active) {
  font-weight: bold;
}

:deep(.el-button) {
  display: flex;
  align-items: center;
  gap: 5px;
  height: 100%;
  padding: 0 20px;
}

:deep(.el-button .el-icon) {
  margin-right: 5px;
  font-size: 18px;
}
</style> 