<template>
  <div id="app">
    <el-container>
      <el-header>
        <h1>医学影像互动学习系统</h1>
        <el-menu mode="horizontal" :router="true">
          <el-menu-item index="/">首页</el-menu-item>
          <el-menu-item index="/learning">互动学习</el-menu-item>
          <el-menu-item index="/profile">个人中心</el-menu-item>
        </el-menu>
      </el-header>
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

.el-header {
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 0 20px;
}

.el-header h1 {
  margin: 0;
  line-height: 60px;
  color: #409EFF;
}

.el-main {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 60px);
}
</style>
