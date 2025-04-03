import axios from 'axios'

const API_URL = 'http://localhost:5000/api'

export const login = async (username, password) => {
  const response = await axios.post(`${API_URL}/auth/login`, {
    username,
    password
  })
  if (response.data.success) {
    localStorage.setItem('token', response.data.token)
    localStorage.setItem('user', JSON.stringify(response.data.user))
    localStorage.setItem('isLoggedIn', 'true')
  }
  return response.data
}

export const register = async (userData) => {
  const response = await axios.post(`${API_URL}/auth/register`, userData)
  return response.data
}

export const logout = async () => {
  try {
    const response = await axios.post(`${API_URL}/auth/logout`);
    if (response.data.success) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return response.data;
    } else {
      throw new Error(response.data.message);
    }
  } catch (error) {
    console.error('登出失败:', error);
    throw error;
  }
}

export const getCurrentUser = () => {
  const user = localStorage.getItem('user')
  return user ? JSON.parse(user) : null
}

export const isAuthenticated = () => {
  return !!localStorage.getItem('token') && !!localStorage.getItem('user')
} 