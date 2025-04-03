const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, restrictTo } = require('../middlewares/auth');

// 获取所有用户（仅管理员）
router.get('/list', protect, restrictTo('admin'), async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取用户列表失败',
      error: error.message
    });
  }
});

// 获取用户信息
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('scores.quizId');

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取用户信息失败',
      error: error.message
    });
  }
});

// 更新用户信息
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, email } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, email },
      { new: true }
    ).select('-password');

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '更新用户信息失败',
      error: error.message
    });
  }
});

// 获取用户成绩
router.get('/scores', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('scores')
      .populate('scores.quizId');

    res.json({
      success: true,
      data: user.scores
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取成绩失败',
      error: error.message
    });
  }
});

// 获取排行榜
router.get('/leaderboard', protect, async (req, res) => {
  try {
    const users = await User.aggregate([
      { $unwind: '$scores' },
      {
        $group: {
          _id: '$_id',
          username: { $first: '$username' },
          name: { $first: '$name' },
          totalScore: { $sum: '$scores.score' },
          totalQuizzes: { $sum: 1 }
        }
      },
      { $sort: { totalScore: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取排行榜失败',
      error: error.message
    });
  }
});

module.exports = router; 