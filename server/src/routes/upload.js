const express = require('express');
const router = express.Router();
const multer = require('multer');
const { GridFsStorage } = require('multer-gridfs-storage');
const mongoose = require('mongoose');
const { protect } = require('../middlewares/auth');
const crypto = require('crypto');
const path = require('path');

// 创建存储引擎
const storage = new GridFsStorage({
  url: process.env.MONGODB_URI,
  options: { useNewUrlParser: true, useUnifiedTopology: true },
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      // 生成随机名
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }
        
        const fileInfo = {
          filename: buf.toString('hex') + path.extname(file.originalname),
          bucketName: 'uploads',
          metadata: {
            originalname: file.originalname,
            quizId: req.body.quizId || null,
            uploadedBy: req.user?._id || null
          }
        };
        
        resolve(fileInfo);
      });
    });
  }
});

// 文件过滤器
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('只能上传图片文件！'), false);
  }
};

// 配置上传
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 限制 5MB
  }
});

// 上传单个文件
router.post('/', protect, upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: '请选择要上传的文件'
      });
    }
    
    // 文件信息
    const file = req.file;
    const quizId = req.body.quizId || null;
    
    // 构建返回的URL格式
    const fileUrl = `/api/image/${file.id}`;
    
    res.json({
      success: true,
      data: {
        url: fileUrl,
        id: file.id,
        filename: file.filename,
        quizId: quizId
      }
    });
  } catch (error) {
    console.error('文件上传失败:', error);
    res.status(500).json({
      success: false,
      message: '文件上传失败',
      error: error.message
    });
  }
});

// 上传多个文件
router.post('/multiple', protect, upload.array('files', 10), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: '请选择要上传的文件'
      });
    }
    
    const quizId = req.body.quizId || null;
    const files = req.files.map(file => ({
      url: `/api/image/${file.id}`,
      id: file.id,
      filename: file.filename,
      quizId: quizId
    }));
    
    res.json({
      success: true,
      data: files
    });
  } catch (error) {
    console.error('文件上传失败:', error);
    res.status(500).json({
      success: false,
      message: '文件上传失败',
      error: error.message
    });
  }
});

module.exports = router; 