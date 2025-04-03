import { reactive } from 'vue'

const state = reactive({
  quizHistory: [],
  totalQuizzes: 0,
  totalScore: 0,
  averageScore: 0
})

export const useQuizStore = () => {
  const updateQuizStats = (score) => {
    state.totalQuizzes++
    state.totalScore += score
    state.averageScore = Math.round(state.totalScore / state.totalQuizzes)
    
    // 保存到本地存储
    localStorage.setItem('quizStats', JSON.stringify({
      totalQuizzes: state.totalQuizzes,
      totalScore: state.totalScore,
      averageScore: state.averageScore
    }))
  }

  const loadQuizStats = () => {
    const savedStats = localStorage.getItem('quizStats')
    if (savedStats) {
      const stats = JSON.parse(savedStats)
      state.totalQuizzes = stats.totalQuizzes
      state.totalScore = stats.totalScore
      state.averageScore = stats.averageScore
    }
  }

  return {
    state,
    updateQuizStats,
    loadQuizStats
  }
} 