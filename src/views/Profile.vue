<template>
  <div class="profile">
    <h1>个人中心</h1>
    <div class="stats-container">
      <el-card class="stat-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <span>完成题目</span>
          </div>
        </template>
        <div class="stat-value">25</div>
        <div class="stat-label">题</div>
      </el-card>

      <el-card class="stat-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <span>正确率</span>
          </div>
        </template>
        <div class="stat-value">85%</div>
        <div class="stat-label">准确度</div>
      </el-card>

      <el-card class="stat-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <span>学习时长</span>
          </div>
        </template>
        <div class="stat-value">12.5</div>
        <div class="stat-label">小时</div>
      </el-card>
    </div>

    <el-card class="history-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>最近学习记录</span>
        </div>
      </template>
      <el-timeline>
        <el-timeline-item
          v-for="(activity, index) in activities"
          :key="index"
          :timestamp="activity.timestamp"
          :type="activity.type"
        >
          {{ activity.content }}
        </el-timeline-item>
      </el-timeline>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'ProfilePage',
  data() {
    return {
      activities: [
        {
          content: '完成胸部X光诊断练习',
          timestamp: '2024-01-20 18:30',
          type: 'success'
        },
        {
          content: '开始新的学习单元',
          timestamp: '2024-01-19 16:00',
          type: 'primary'
        },
        {
          content: '完成每周测试',
          timestamp: '2024-01-18 10:00',
          type: 'success'
        }
      ]
    }
  }
}
</script>

<style scoped>
.profile {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

h1 {
  text-align: center;
  color: #409EFF;
  margin-bottom: 40px;
}

.stats-container {
  display: flex;
  gap: 20px;
  margin-bottom: 40px;
  justify-content: center;
}

.stat-card {
  width: 200px;
  text-align: center;
}

.stat-value {
  font-size: 36px;
  font-weight: bold;
  color: #409EFF;
  margin: 10px 0;
}

.stat-label {
  color: #909399;
  font-size: 14px;
}

.history-card {
  margin-top: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style> 