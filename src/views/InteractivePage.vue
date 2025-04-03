<template>
  <div class="interactive-container">
    <el-row :gutter="20">
      <el-col :span="16">
        <el-card class="main-content">
          <template #header>
            <div class="card-header">
              <h2>互动学习</h2>
            </div>
          </template>
          
          <div class="avatar-section">
            <div class="avatar-container">
              <!-- 这里放置虚拟形象组件 -->
              <div class="avatar-placeholder">
                <el-icon class="avatar-icon"><Monitor /></el-icon>
                <p>虚拟助手</p>
              </div>
            </div>
            
            <div class="interaction-controls">
              <el-input
                v-model="userInput"
                type="textarea"
                :rows="3"
                placeholder="请输入您的问题..."
                @keyup.enter="handleSend"
              />
              <el-button type="primary" @click="handleSend" :loading="loading">
                发送
              </el-button>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="8">
        <el-card class="chat-history">
          <template #header>
            <div class="card-header">
              <h2>对话历史</h2>
              <el-button type="text" @click="clearHistory">清空历史</el-button>
            </div>
          </template>
          
          <div class="chat-messages" ref="chatContainer">
            <div
              v-for="(message, index) in chatHistory"
              :key="index"
              :class="['message', message.type]"
            >
              <div class="message-content">
                <p>{{ message.content }}</p>
                <span class="message-time">{{ message.time }}</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { ref, onMounted, nextTick } from 'vue'
import { Monitor } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

export default {
  name: 'Interactive',
  components: {
    Monitor
  },
  setup() {
    const userInput = ref('')
    const loading = ref(false)
    const chatHistory = ref([])
    const chatContainer = ref(null)

    const handleSend = async () => {
      if (!userInput.value.trim()) {
        ElMessage.warning('请输入内容')
        return
      }

      // 添加用户消息
      addMessage(userInput.value, 'user')
      
      loading.value = true
      try {
        // 模拟AI响应
        await new Promise(resolve => setTimeout(resolve, 1000))
        const response = '我是AI助手，很高兴为您服务！'
        addMessage(response, 'assistant')
      } catch (error) {
        ElMessage.error('发送失败，请重试')
      } finally {
        loading.value = false
        userInput.value = ''
      }
    }

    const addMessage = (content, type) => {
      chatHistory.value.push({
        content,
        type,
        time: new Date().toLocaleTimeString()
      })
      
      // 保存到本地存储
      localStorage.setItem('chatHistory', JSON.stringify(chatHistory.value))
      
      // 滚动到底部
      nextTick(() => {
        if (chatContainer.value) {
          chatContainer.value.scrollTop = chatContainer.value.scrollHeight
        }
      })
    }

    const clearHistory = () => {
      chatHistory.value = []
      localStorage.removeItem('chatHistory')
      ElMessage.success('历史记录已清空')
    }

    onMounted(() => {
      // 加载历史记录
      const savedHistory = localStorage.getItem('chatHistory')
      if (savedHistory) {
        chatHistory.value = JSON.parse(savedHistory)
      }
    })

    return {
      userInput,
      loading,
      chatHistory,
      chatContainer,
      handleSend,
      clearHistory
    }
  }
}
</script>

<style scoped>
.interactive-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h2 {
  margin: 0;
  font-size: 18px;
  color: #409EFF;
}

.avatar-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.avatar-container {
  height: 400px;
  background-color: #f5f7fa;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.avatar-placeholder {
  text-align: center;
  color: #909399;
}

.avatar-icon {
  font-size: 48px;
  margin-bottom: 10px;
}

.interaction-controls {
  display: flex;
  gap: 10px;
}

.interaction-controls .el-input {
  flex: 1;
}

.chat-history {
  height: 100%;
}

.chat-messages {
  height: 500px;
  overflow-y: auto;
  padding: 10px;
}

.message {
  margin-bottom: 15px;
  display: flex;
  flex-direction: column;
}

.message-content {
  max-width: 80%;
  padding: 10px;
  border-radius: 8px;
  position: relative;
}

.message.user {
  align-items: flex-end;
}

.message.user .message-content {
  background-color: #ecf5ff;
}

.message.assistant {
  align-items: flex-start;
}

.message.assistant .message-content {
  background-color: #f5f7fa;
}

.message-content p {
  margin: 0;
  word-break: break-word;
}

.message-time {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}
</style> 