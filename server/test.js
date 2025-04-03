const axios = require('axios');

const testRegister = async () => {
  try {
    const response = await axios.post('http://localhost:5000/api/auth/register', {
      username: 'testadmin',
      password: '123456',
      name: '测试管理员',
      email: 'test@example.com',
      role: 'admin'
    });

    console.log('注册响应:', response.data);
  } catch (error) {
    console.error('注册失败:', error.response ? error.response.data : error.message);
  }
};

testRegister(); 