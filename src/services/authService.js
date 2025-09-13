import api from './api';

export const authService = {
  async login(username, password) {
    try {
      const response = await api.post('/auth/login', { username, password });
      const { token, username: userUsername, email } = response.data;
      
      // Store token and user info
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify({ username: userUsername, email }));
      
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Login failed' 
      };
    }
  },

  async register(username, email, password) {
    try {
      const response = await api.post('/auth/register', { username, email, password });
      const { token, username: userUsername, email: userEmail } = response.data;
      
      // Store token and user info
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify({ username: userUsername, email: userEmail }));
      
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Registration failed' 
      };
    }
  },

  async validateToken() {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return { success: false };
      
      const response = await api.post('/auth/validate', token, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false };
    }
  },

  logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  },

  isAuthenticated() {
    return !!localStorage.getItem('authToken');
  },

  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }
};
