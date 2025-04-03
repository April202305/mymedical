const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;

// 通过ID获取图片
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // 检查ID格式
    if (!id || !ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: '无效的图片ID'
      });
    }
    
    const conn = req.app.locals.conn;
    if (!conn) {
      return res.status(500).json({
        success: false,
        message: 'GridFS连接未初始化'
      });
    }
    
    const gridfsBucket = new mongoose.mongo.GridFSBucket(conn.db, {
      bucketName: 'uploads'
    });
    
    // 从GridFS查询文件
    const files = await conn.db.collection('uploads.files').findOne({ _id: new ObjectId(id) });
    
    // 检查文件是否存在
    if (!files || files.length === 0) {
      return res.status(404).json({
        success: false,
        message: '找不到图片'
      });
    }
    
    // 检查是否是图片
    if (files.contentType.startsWith('image/')) {
      // 设置头部
      res.set('Content-Type', files.contentType);
      res.set('Content-Length', files.length);
      
      // 创建下载流
      const downloadStream = gridfsBucket.openDownloadStream(new ObjectId(id));
      
      // 管道到响应
      downloadStream.pipe(res);
    } else {
      return res.status(400).json({
        success: false,
        message: '不是图片文件'
      });
    }
  } catch (error) {
    console.error('获取图片错误:', error);
    res.status(500).json({
      success: false,
      message: '获取图片失败',
      error: error.message
    });
  }
});

// 查询图片信息
router.get('/info/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || !ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: '无效的图片ID'
      });
    }
    
    const conn = req.app.locals.conn;
    if (!conn) {
      return res.status(500).json({
        success: false,
        message: 'GridFS连接未初始化'
      });
    }
    
    // 从GridFS查询文件
    const file = await conn.db.collection('uploads.files').findOne({ _id: new ObjectId(id) });
    
    if (!file) {
      return res.status(404).json({
        success: false,
        message: '找不到图片'
      });
    }
    
    res.json({
      success: true,
      data: {
        id: file._id,
        filename: file.filename,
        contentType: file.contentType,
        size: file.length,
        uploadDate: file.uploadDate,
        metadata: file.metadata || {}
      }
    });
  } catch (error) {
    console.error('获取图片信息错误:', error);
    res.status(500).json({
      success: false,
      message: '获取图片信息失败',
      error: error.message
    });
  }
});

// 通过quiz ID获取所有相关图片
router.get('/quiz/:quizId', async (req, res) => {
  try {
    const { quizId } = req.params;
    
    if (!quizId) {
      return res.status(400).json({
        success: false,
        message: '请提供题目ID'
      });
    }
    
    const conn = req.app.locals.conn;
    if (!conn) {
      return res.status(500).json({
        success: false,
        message: 'GridFS连接未初始化'
      });
    }
    
    // 查询与quizId相关的所有图片
    const files = await conn.db.collection('uploads.files')
      .find({ 'metadata.quizId': quizId })
      .toArray();
    
    if (!files || files.length === 0) {
      return res.json({
        success: true,
        message: '未找到相关图片',
        data: []
      });
    }
    
    // 转换为更友好的格式
    const images = files.map(file => ({
      id: file._id,
      filename: file.filename,
      contentType: file.contentType,
      size: file.length,
      uploadDate: file.uploadDate,
      metadata: file.metadata || {},
      url: `/api/image/${file._id}`
    }));
    
    res.json({
      success: true,
      data: images
    });
  } catch (error) {
    console.error('获取题目图片错误:', error);
    res.status(500).json({
      success: false,
      message: '获取题目图片失败',
      error: error.message
    });
  }
});

// 删除图片
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || !ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: '无效的图片ID'
      });
    }
    
    const conn = req.app.locals.conn;
    if (!conn) {
      return res.status(500).json({
        success: false,
        message: 'GridFS连接未初始化'
      });
    }
    
    const gridfsBucket = new mongoose.mongo.GridFSBucket(conn.db, {
      bucketName: 'uploads'
    });
    
    // 删除文件
    await gridfsBucket.delete(new ObjectId(id));
    
    res.json({
      success: true,
      message: '图片删除成功'
    });
  } catch (error) {
    console.error('删除图片错误:', error);
    res.status(500).json({
      success: false,
      message: '删除图片失败',
      error: error.message
    });
  }
});

module.exports = router; 