const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['single', 'multiple', 'true-false', 'fill', 'essay'],
    required: true
  },
  question: {
    type: String,
    required: true
  },
  images: [{
    type: String
  }],
  options: [{
    type: String
  }],
  optionImages: [{
    type: String
  }],
  answer: {
    type: String,
    required: true
  },
  explanation: {
    type: String
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  tags: [{
    type: String
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// 更新时间中间件
quizSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

quizSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: Date.now() });
  next();
});

const Quiz = mongoose.model('Quiz', quizSchema);

module.exports = Quiz; 