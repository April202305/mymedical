<template>
  <div class="back-to-home">
    <el-button type="primary" @click="goHome" plain>
      <el-icon><ArrowLeft /></el-icon>
      返回首页
    </el-button>
  </div>
</template>

<script>
import { useRouter } from 'vue-router'
import { ArrowLeft } from '@element-plus/icons-vue'

export default {
  name: 'BackToHome',
  components: {
    ArrowLeft
  },
  setup() {
    const router = useRouter()

    const goHome = () => {
      router.push('/')
    }

    return {
      goHome
    }
  }
}
</script>

<style scoped>
.back-to-home {
  position: fixed;
  top: 80px;
  left: 20px;
  z-index: 100;
}
</style> 