import api from './api';

// 上传单个图片，添加题库ID关联
export const uploadImage = async (file, quizId = null) => {
  const formData = new FormData();
  formData.append('file', file);
  if (quizId) {
    formData.append('quizId', quizId);
  }
  const response = await api.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  
  // 确保返回的数据格式正确
  if (response.data && response.data.success && response.data.data) {
    // 记录返回数据结构
    console.log('上传图片响应数据:', response.data);
    return response.data;
  }
  
  return response.data;
};

// 上传多个图片，添加题库ID关联
export const uploadImages = async (files, quizId = null) => {
  const formData = new FormData();
  files.forEach(file => {
    formData.append('files', file);
  });
  if (quizId) {
    formData.append('quizId', quizId);
  }
  const response = await api.post('/upload/multiple', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  
  // 确保返回的数据格式正确
  if (response.data && response.data.success && response.data.data) {
    // 记录返回数据结构
    console.log('批量上传图片响应数据:', response.data);
    return response.data;
  }
  
  return response.data;
};

// 从图片URL中提取图片ID
export const getImageIdFromUrl = (url) => {
  if (!url) return null;
  
  // 检查是否是GridFS URL格式
  if (url.startsWith('/api/image/')) {
    return url.replace('/api/image/', '');
  }
  
  // 旧的URL格式，无法提取ID
  return null;
};

// 获取图片信息
export const getImageInfo = async (imageId) => {
  if (!imageId) return null;
  
  try {
    const response = await api.get(`/image/info/${imageId}`);
    if (response.data && response.data.success) {
      return response.data.data;
    }
    return null;
  } catch (error) {
    console.error('获取图片信息失败:', error);
    return null;
  }
}; 