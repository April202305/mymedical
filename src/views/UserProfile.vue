<template>
  <div class="profile-container">
    <el-row :gutter="20">
      <el-col :span="16">
        <el-card class="profile-card">
          <template #header>
            <h2>个人中心</h2>
          </template>
          <div class="profile-content">
            <el-form label-width="100px">
              <el-form-item label="用户名">
                <el-input v-model="userInfo.username" disabled />
              </el-form-item>
              <el-form-item label="注册时间">
                <el-input v-model="userInfo.registerTime" disabled />
              </el-form-item>
            </el-form>
          </div>
        </el-card>

        <el-card class="stats-card">
          <template #header>
            <h2>学习统计</h2>
          </template>
          <el-row :gutter="20">
            <el-col :span="8">
              <div class="stat-item">
                <div class="stat-value">{{ stats.totalQuizzes }}</div>
                <div class="stat-label">完成答题</div>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="stat-item">
                <div class="stat-value">{{ stats.averageScore }}%</div>
                <div class="stat-label">平均正确率</div>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="stat-item">
                <div class="stat-value">{{ stats.totalScore }}</div>
                <div class="stat-label">总积分</div>
              </div>
            </el-col>
          </el-row>
        </el-card>
      </el-col>

      <el-col :span="8">
        <el-card class="achievement-card">
          <template #header>
            <h2>成就系统</h2>
          </template>
          <div class="achievement-list">
            <div v-for="(achievement, index) in achievements" 
                 :key="index" 
                 class="achievement-item"
                 :class="{ 'achievement-unlocked': achievement.unlocked }">
              <el-icon><Trophy /></el-icon>
              <div class="achievement-info">
                <div class="achievement-name">{{ achievement.name }}</div>
                <div class="achievement-desc">{{ achievement.description }}</div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { reactive, onMounted } from 'vue'
import { Trophy } from '@element-plus/icons-vue'
import { useQuizStore } from '../store/quiz'

export default {
  name: 'Profile',
  components: {
    Trophy
  },
  setup() {
    const quizStore = useQuizStore()
    
    const userInfo = reactive({
      username: JSON.parse(localStorage.getItem('user'))?.username || '',
      registerTime: new Date().toLocaleDateString()
    })

    const stats = reactive({
      totalQuizzes: 0,
      averageScore: 0,
      totalScore: 0
    })

    const achievements = [
      {
        name: '初出茅庐',
        description: '完成第一次答题',
        unlocked: false
      },
      {
        name: '学霸养成',
        description: '答题正确率达到90%',
        unlocked: false
      },
      {
        name: '坚持不懈',
        description: '连续答题7天',
        unlocked: false
      },
      {
        name: '知识达人',
        description: '累计获得1000积分',
        unlocked: false
      }
    ]

    onMounted(() => {
      quizStore.loadQuizStats()
      stats.totalQuizzes = quizStore.state.totalQuizzes
      stats.averageScore = quizStore.state.averageScore
      stats.totalScore = quizStore.state.totalScore

      // 更新成就状态
      achievements[0].unlocked = stats.totalQuizzes > 0
      achievements[1].unlocked = stats.averageScore >= 90
      achievements[3].unlocked = stats.totalScore >= 1000
    })

    return {
      userInfo,
      stats,
      achievements
    }
  }
}
</script>

<style scoped>
.profile-container {
  padding: 20px;
}

.profile-card,
.stats-card,
.achievement-card {
  margin-bottom: 20px;
}

.profile-card :deep(.el-card__header),
.stats-card :deep(.el-card__header),
.achievement-card :deep(.el-card__header) {
  text-align: center;
}

h2 {
  margin: 0;
  color: #409EFF;
}

.profile-content {
  padding: 20px;
}

.stats-card {
  margin-top: 20px;
}

.stat-item {
  text-align: center;
  padding: 20px;
}

.stat-value {
  font-size: 36px;
  font-weight: bold;
  color: #409EFF;
  margin-bottom: 10px;
}

.stat-label {
  color: #909399;
  font-size: 14px;
}

.achievement-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.achievement-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 10px;
  border-radius: 4px;
  background-color: #f5f7fa;
  opacity: 0.6;
}

.achievement-unlocked {
  opacity: 1;
  background-color: #ecf5ff;
}

.achievement-item .el-icon {
  font-size: 24px;
  color: #409EFF;
}

.achievement-info {
  flex: 1;
}

.achievement-name {
  font-weight: bold;
  color: #303133;
  margin-bottom: 5px;
}

.achievement-desc {
  font-size: 14px;
  color: #909399;
}
</style> 