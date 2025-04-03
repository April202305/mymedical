<template>
  <div class="quiz-container">
    <el-row :gutter="20">
      <!-- 左侧答题区域 -->
      <el-col :span="16">
        <el-card class="quiz-card">
          <template #header>
            <div class="quiz-header">
              <h2>医学知识答题</h2>
              <div class="quiz-info">
                <span>当前积分：{{ currentScore }}</span>
                <span>题目进度：{{ currentIndex + 1 }}/{{ questions.length }}</span>
              </div>
            </div>
          </template>
          
          <div v-if="!quizCompleted" class="quiz-content">
            <div class="question">
              <h3>{{ currentQuestion.question }}</h3>
              <div class="options">
                <el-radio-group v-model="selectedAnswer">
                  <el-radio 
                    v-for="(option, index) in currentQuestion.options" 
                    :key="index"
                    :label="index"
                    class="option-item"
                  >
                    {{ option }}
                  </el-radio>
                </el-radio-group>
              </div>
            </div>
            
            <div class="quiz-actions">
              <el-button 
                type="primary" 
                @click="submitAnswer" 
                :disabled="selectedAnswer === null"
              >
                提交答案
              </el-button>
            </div>
          </div>
          
          <div v-else class="quiz-result">
            <h3>答题完成！</h3>
            <div class="result-info">
              <p>最终得分：{{ currentScore }}</p>
              <p>正确率：{{ (correctCount / questions.length * 100).toFixed(1) }}%</p>
            </div>
            <el-button type="primary" @click="restartQuiz">重新开始</el-button>
          </div>
        </el-card>
      </el-col>
      
      <!-- 右侧排行榜 -->
      <el-col :span="8">
        <el-card class="leaderboard-card">
          <template #header>
            <h2>排行榜</h2>
          </template>
          <el-table :data="leaderboard" style="width: 100%">
            <el-table-column prop="rank" label="排名" width="80" />
            <el-table-column prop="username" label="用户名" />
            <el-table-column prop="score" label="积分" width="100" />
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { useQuizStore } from '../store/quiz'

export default {
  name: 'Quiz',
  components: {},
  setup() {
    const quizStore = useQuizStore()
    
    // 题目数据
    const questions = ref([
      {
        question: '以下哪种疾病不属于心血管系统疾病？',
        options: ['高血压', '糖尿病', '冠心病', '心律失常'],
        correctAnswer: 1
      },
      {
        question: '人体最大的器官是什么？',
        options: ['心脏', '大脑', '皮肤', '肝脏'],
        correctAnswer: 2
      },
      {
        question: '以下哪种维生素对骨骼健康最重要？',
        options: ['维生素A', '维生素B', '维生素C', '维生素D'],
        correctAnswer: 3
      },
      {
        question: '正常人的体温范围是多少？',
        options: ['35.5-36.5℃', '36.5-37.5℃', '37.5-38.5℃', '38.5-39.5℃'],
        correctAnswer: 1
      },
      {
        question: '以下哪种不是传染病的传播途径？',
        options: ['空气传播', '接触传播', '遗传传播', '血液传播'],
        correctAnswer: 2
      }
    ])

    const currentIndex = ref(0)
    const selectedAnswer = ref(null)
    const currentScore = ref(0)
    const correctCount = ref(0)
    const quizCompleted = ref(false)

    // 当前题目
    const currentQuestion = computed(() => {
      return questions.value[currentIndex.value]
    })

    // 模拟排行榜数据
    const leaderboard = ref([
      { rank: 1, username: 'admin', score: 1000 },
      { rank: 2, username: 'user1', score: 800 },
      { rank: 3, username: 'user2', score: 600 },
      { rank: 4, username: 'user3', score: 400 },
      { rank: 5, username: 'user4', score: 200 }
    ])

    // 提交答案
    const submitAnswer = () => {
      if (selectedAnswer.value === currentQuestion.value.correctAnswer) {
        currentScore.value += 20
        correctCount.value++
        ElMessage.success('回答正确！')
      } else {
        ElMessage.error('回答错误，正确答案是：' + 
          currentQuestion.value.options[currentQuestion.value.correctAnswer])
      }

      // 检查是否完成所有题目
      if (currentIndex.value < questions.value.length - 1) {
        currentIndex.value++
        selectedAnswer.value = null
      } else {
        quizCompleted.value = true
        updateLeaderboard()
      }
    }

    // 重新开始答题
    const restartQuiz = () => {
      currentIndex.value = 0
      selectedAnswer.value = null
      currentScore.value = 0
      correctCount.value = 0
      quizCompleted.value = false
    }

    // 更新排行榜
    const updateLeaderboard = () => {
      const username = JSON.parse(localStorage.getItem('user'))?.username || 'anonymous'
      const newScore = currentScore.value
      
      // 更新或添加用户分数
      const userIndex = leaderboard.value.findIndex(item => item.username === username)
      if (userIndex !== -1) {
        leaderboard.value[userIndex].score = newScore
      } else {
        leaderboard.value.push({ rank: 0, username, score: newScore })
      }
      
      // 重新排序
      leaderboard.value.sort((a, b) => b.score - a.score)
      
      // 更新排名
      leaderboard.value.forEach((item, index) => {
        item.rank = index + 1
      })
      
      // 只保留前5名
      leaderboard.value = leaderboard.value.slice(0, 5)
    }

    const handleSubmit = () => {
      const score = Math.round((correctCount.value / questions.value.length) * 100)
      quizStore.updateQuizStats(score)
      quizCompleted.value = true
      currentScore.value = score
    }

    return {
      questions,
      currentIndex,
      selectedAnswer,
      currentScore,
      correctCount,
      quizCompleted,
      currentQuestion,
      leaderboard,
      submitAnswer,
      restartQuiz,
      handleSubmit
    }
  }
}
</script>

<style scoped>
.quiz-container {
  padding: 20px;
}

.quiz-card {
  margin-bottom: 20px;
}

.quiz-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.quiz-info {
  display: flex;
  gap: 20px;
}

.question {
  margin-bottom: 30px;
}

.question h3 {
  margin-bottom: 20px;
  color: #303133;
}

.options {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.option-item {
  margin-bottom: 10px;
  padding: 10px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.option-item:hover {
  background-color: #f5f7fa;
}

.quiz-actions {
  display: flex;
  justify-content: center;
  margin-top: 30px;
}

.quiz-result {
  text-align: center;
  padding: 40px 0;
}

.result-info {
  margin: 20px 0;
  font-size: 18px;
}

.result-info p {
  margin: 10px 0;
}

.leaderboard-card {
  height: 100%;
}

h2 {
  margin: 0;
  color: #409EFF;
}

h3 {
  margin: 0;
  color: #303133;
}
</style> 