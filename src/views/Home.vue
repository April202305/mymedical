<template>
  <div class="home">
    <h1>医学教育平台</h1>
    <div class="feature-cards">
      <el-card class="feature-card" shadow="hover">
        <h2>互动学习</h2>
        <p>通过虚拟数字人进行医学知识学习</p>
        <el-button type="primary" @click="$router.push('/interactive')">开始学习</el-button>
      </el-card>
      <el-card class="feature-card" shadow="hover">
        <h2>个人中心</h2>
        <p>查看学习进度和成绩统计</p>
        <el-button type="primary" @click="$router.push('/profile')">查看详情</el-button>
      </el-card>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HomePage'
}
</script>

<style scoped>
.home {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.feature-cards {
  display: flex;
  gap: 20px;
  margin-top: 40px;
  justify-content: center;
}

.feature-card {
  width: 300px;
  text-align: center;
}

h1 {
  text-align: center;
  color: #409EFF;
  margin-bottom: 40px;
}

h2 {
  color: #303133;
  margin-bottom: 15px;
}

p {
  color: #606266;
  margin-bottom: 20px;
}
</style> 