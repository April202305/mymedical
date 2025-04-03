<template>
  <div class="home">
    <el-row :gutter="20">
      <el-col :span="8">
        <el-card class="module-card" @click="goToInteractive">
          <div class="module-content">
            <el-icon class="module-icon"><Monitor /></el-icon>
            <h2>互动学习</h2>
            <p>与虚拟数字人进行互动学习</p>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="module-card" @click="goToQuiz">
          <div class="module-content">
            <el-icon class="module-icon"><Edit /></el-icon>
            <h2>知识答题</h2>
            <p>测试医学知识，赢取积分</p>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="module-card" @click="goToProfile">
          <div class="module-content">
            <el-icon class="module-icon"><User /></el-icon>
            <h2>个人中心</h2>
            <p>查看学习进度和成绩统计</p>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { useRouter } from 'vue-router'
import { Monitor, Edit, User } from '@element-plus/icons-vue'

export default {
  name: 'Home',
  components: {
    Monitor,
    Edit,
    User
  },
  setup() {
    const router = useRouter()

    const goToInteractive = () => {
      router.push('/interactive')
    }

    const goToQuiz = () => {
      router.push('/quiz')
    }

    const goToProfile = () => {
      router.push('/profile')
    }

    return {
      goToInteractive,
      goToQuiz,
      goToProfile
    }
  }
}
</script>

<style scoped>
.home {
  padding: 20px;
}

.module-card {
  height: 200px;
  cursor: pointer;
  transition: transform 0.3s;
}

.module-card:hover {
  transform: translateY(-5px);
}

.module-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.module-icon {
  font-size: 48px;
  color: #409EFF;
  margin-bottom: 20px;
}

h2 {
  margin: 0 0 10px 0;
  color: #303133;
}

p {
  margin: 0;
  color: #909399;
}
</style> 