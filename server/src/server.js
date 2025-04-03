const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');
const { GridFsStorage } = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
require('dotenv').config();

const app = express();

// 中间件
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// MongoDB连接
const mongoURI = process.env.MONGODB_URI;
const conn = mongoose.createConnection(mongoURI);

// 全局连接变量
let gfs, gridfsBucket;

// 初始化GridFS
conn.once('open', () => {
  // 初始化GridFSBucket
  gridfsBucket = new mongoose.mongo.GridFSBucket(conn.db, {
    bucketName: 'uploads'
  });

  // 设置gridfs-stream
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection('uploads');
  
  console.log('GridFS 连接成功');
});

// 导出GridFS实例供其他文件使用
app.locals.gridfsBucket = gridfsBucket;
app.locals.gfs = gfs;
app.locals.conn = conn;

// 静态文件服务 - uploads目录 (保留向后兼容)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// 路由
app.use('/api/auth', require('./routes/auth'));
app.use('/api/quiz', require('./routes/quiz'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/image', require('./routes/image')); // 添加图片访问路由

// 数据库连接 (主连接)
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB 主连接成功'))
  .catch(err => console.error('MongoDB 连接失败:', err));

// 启动服务器
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
}); 