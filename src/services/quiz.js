import api from './api';

export const getQuizzes = () => {
  return api.get('/quiz');
};

export const createQuiz = (formData) => {
  return api.post('/quiz', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

export const updateQuiz = (id, formData) => {
  return api.put(`/quiz/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

export const deleteQuiz = (id) => {
  return api.delete(`/quiz/${id}`);
};

export const submitAnswer = (quizId, answer) => {
  return api.post(`/quiz/${quizId}/submit`, { answer });
};

export const getUserScores = () => {
  return api.get('/user/scores');
};

export const getLeaderboard = () => {
  return api.get('/user/leaderboard');
};

// 题库管理相关接口
export const getQuestions = () => {
  return api.get('/quiz');
};

export const getQuestionById = (id) => {
  return api.get(`/quiz/${id}`);
};

export const createQuestion = (question) => {
  return api.post('/quiz', question);
};

export const updateQuestion = (id, question) => {
  return api.put(`/quiz/${id}`, question);
};

export const deleteQuestion = (id) => {
  return api.delete(`/quiz/${id}`);
};

export const batchImportQuestions = (questions) => {
  return api.post('/quiz/batch', questions);
};

// 批量删除题目
export const batchDeleteQuestions = (ids) => {
  return api.post('/quiz/batch-delete', { ids });
}; 