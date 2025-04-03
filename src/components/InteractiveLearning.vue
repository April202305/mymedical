<template>
  <div class="interactive-learning">
    <back-to-home />
    <div class="learning-container">
      <div class="avatar-section">
        <VirtualAvatar />
      </div>
      <div class="content-section">
        <div class="question-container">
          <h2>{{ currentQuestion.title }}</h2>
          <div class="options">
            <el-radio-group v-model="selectedAnswer">
              <el-radio 
                v-for="option in currentQuestion.options" 
                :key="option.id" 
                :value="option.id"
              >
                {{ option.text }}
              </el-radio>
            </el-radio-group>
          </div>
          <div class="image-container" v-if="currentQuestion.image">
            <img :src="currentQuestion.image" :alt="currentQuestion.title">
          </div>
        </div>
        <div class="controls">
          <el-button 
            type="primary" 
            @click="submitAnswer"
            :disabled="!selectedAnswer"
          >
            提交答案
          </el-button>
          <el-button 
            type="info" 
            @click="nextQuestion"
            v-if="showNext"
          >
            下一题
          </el-button>
        </div>
        <div class="feedback" v-if="showFeedback">
          <el-alert
            :title="feedbackMessage"
            :type="isCorrect ? 'success' : 'error'"
            show-icon
          >
          </el-alert>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import VirtualAvatar from './VirtualAvatar.vue'
import BackToHome from './BackToHome.vue'

export default {
  name: 'InteractiveLearning',
  components: {
    VirtualAvatar,
    BackToHome
  },
  setup() {
    const currentQuestionIndex = ref(0)
    const selectedAnswer = ref('')
    const showFeedback = ref(false)
    const isCorrect = ref(false)
    const showNext = ref(false)

    const questions = [
      {
        id: 1,
        title: '请识别这张胸部X光片中的异常',
        options: [
          { id: 'a', text: '左肺上叶结节' },
          { id: 'b', text: '右肺下叶浸润' },
          { id: 'c', text: '胸腔积液' },
          { id: 'd', text: '正常' }
        ],
        image: '/images/chest-xray-1.jpg',
        correctAnswer: 'b'
      },
      // 可以添加更多问题
    ]

    const currentQuestion = computed(() => questions[currentQuestionIndex.value])

    const feedbackMessage = computed(() => {
      if (!showFeedback.value) return ''
      return isCorrect.value 
        ? '回答正确！' 
        : '回答错误，请仔细分析图像特征。'
    })

    const submitAnswer = () => {
      showFeedback.value = true
      isCorrect.value = selectedAnswer.value === currentQuestion.value.correctAnswer
      showNext.value = true
    }

    const nextQuestion = () => {
      if (currentQuestionIndex.value < questions.length - 1) {
        currentQuestionIndex.value++
        selectedAnswer.value = ''
        showFeedback.value = false
        showNext.value = false
      }
    }

    return {
      currentQuestion,
      selectedAnswer,
      showFeedback,
      isCorrect,
      showNext,
      feedbackMessage,
      submitAnswer,
      nextQuestion
    }
  }
}
</script>

<style scoped>
.interactive-learning {
  position: relative;
  padding: 20px;
}

.learning-container {
  display: flex;
  gap: 20px;
  height: 100%;
}

.avatar-section {
  flex: 1;
  background: #f5f5f5;
  border-radius: 8px;
  overflow: hidden;
  min-height: 400px;
  position: relative;
}

.avatar-section :deep(.avatar-container) {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
}

.content-section {
  flex: 2;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.question-container {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.options {
  margin: 20px 0;
}

.image-container {
  margin: 20px 0;
  text-align: center;
}

.image-container img {
  max-width: 100%;
  max-height: 400px;
  border-radius: 4px;
}

.controls {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.feedback {
  margin-top: 20px;
}
</style> 