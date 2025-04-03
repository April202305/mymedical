const express = require('express');
const router = express.Router();
const Quiz = require('../models/Quiz');
const User = require('../models/User');
const { protect, restrictTo } = require('../middlewares/auth');

// 获取所有题目
router.get('/', protect, async (req, res) => {
  try {
    const quizzes = await Quiz.find().populate('createdBy', 'username');
    res.json({
      success: true,
      data: quizzes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取题目失败',
      error: error.message
    });
  }
});

// 创建新题目（仅管理员）
router.post('/', protect, restrictTo('admin'), async (req, res) => {
  try {
    const { type, question, options, optionImages, answer, explanation, difficulty, tags, images } = req.body;

    const quizData = {
      type,
      question,
      options: options || [],
      optionImages: optionImages || [],
      answer,
      explanation,
      difficulty: difficulty || 'medium',
      tags: tags || [],
      images: images || [],
      createdBy: req.user._id
    };

    const quiz = await Quiz.create(quizData);

    res.status(201).json({
      success: true,
      data: quiz
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '创建题目失败',
      error: error.message
    });
  }
});

// 更新题目
router.put('/:id', protect, restrictTo('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    delete updateData._id; // 移除_id字段，避免MongoDB报错
    
    const quiz = await Quiz.findByIdAndUpdate(
      id,
      updateData,
      { new: true } // 返回更新后的文档
    );

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: '题目不存在'
      });
    }

    res.json({
      success: true,
      message: '更新成功',
      data: quiz
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '更新题目失败',
      error: error.message
    });
  }
});

// 删除题目
router.delete('/:id', protect, restrictTo('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const quiz = await Quiz.findByIdAndDelete(id);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: '题目不存在'
      });
    }

    res.json({
      success: true,
      message: '删除成功',
      data: quiz
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '删除题目失败',
      error: error.message
    });
  }
});

// 提交答案
router.post('/:id/submit', protect, async (req, res) => {
  try {
    const { answer } = req.body;
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: '题目不存在'
      });
    }

    let isCorrect = false;
    
    // 根据题型判断答案是否正确
    if (quiz.type === 'single' || quiz.type === 'true-false') {
      isCorrect = answer === quiz.answer;
    } else if (quiz.type === 'multiple') {
      // 多选题：答案应该是一个数组，所有选择必须完全匹配
      const userAnswers = answer.split(',').sort().join(',');
      const correctAnswers = quiz.answer.split(',').sort().join(',');
      isCorrect = userAnswers === correctAnswers;
    } else if (quiz.type === 'fill' || quiz.type === 'essay') {
      // 填空题和问答题：简单判断是否包含关键字，更复杂的逻辑可以在此扩展
      isCorrect = answer.includes(quiz.answer);
    }

    // 记录成绩
    await User.findByIdAndUpdate(
      req.user._id,
      {
        $push: {
          scores: {
            quizId: quiz._id,
            score: isCorrect ? 1 : 0
          }
        }
      }
    );

    res.json({
      success: true,
      data: {
        isCorrect,
        correctAnswer: quiz.answer,
        explanation: quiz.explanation
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '提交答案失败',
      error: error.message
    });
  }
});

// 获取题库管理接口
router.get('/questions', protect, restrictTo('admin'), async (req, res) => {
  try {
    const questions = await Quiz.find().populate('createdBy', 'username');
    res.json({
      success: true,
      data: questions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取题库失败',
      error: error.message
    });
  }
});

// 批量导入题目
router.post('/batch', protect, restrictTo('admin'), async (req, res) => {
  try {
    if (!Array.isArray(req.body)) {
      return res.status(400).json({
        success: false,
        message: '请求体必须是题目数组'
      });
    }

    const questions = req.body.map(question => ({
      ...question,
      createdBy: req.user._id
    }));

    const insertedQuestions = await Quiz.insertMany(questions);

    res.status(201).json({
      success: true,
      message: `成功导入 ${insertedQuestions.length} 道题目`,
      data: insertedQuestions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '批量导入题目失败',
      error: error.message
    });
  }
});

// 批量删除题目
router.post('/batch-delete', protect, restrictTo('admin'), async (req, res) => {
  try {
    const { ids } = req.body;
    
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: '请提供要删除的题目ID数组'
      });
    }

    const result = await Quiz.deleteMany({ _id: { $in: ids } });

    res.json({
      success: true,
      message: `成功删除 ${result.deletedCount} 道题目`,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '批量删除题目失败',
      error: error.message
    });
  }
});

module.exports = router; 