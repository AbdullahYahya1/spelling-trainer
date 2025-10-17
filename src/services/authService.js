import api from './api';

export const authService = {

  isTokenExpired(token) {
    try {
      if (!token) return true;

      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      
      const payload = JSON.parse(jsonPayload);
      const currentTime = Math.floor(Date.now() / 1000);
      
      return payload.exp < currentTime;
    } catch (error) {
      console.error('Error checking token expiration:', error);
      return true; // If we can't parse the token, consider it expired
    }
  },

  cleanupExpiredToken() {
    const token = localStorage.getItem('authToken');
    if (token && this.isTokenExpired(token)) {
      console.log('Token expired, cleaning up...');
      this.logout();
      return true;
    }
    return false;
  },

  async login(username, password) {
    try {
      const response = await api.post('/auth/login', { username, password });
      const { token, username: userUsername, email } = response.data;

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

      if (this.isTokenExpired(token)) {
        console.log('Token is expired, cleaning up...');
        this.logout();
        return { success: false, expired: true };
      }
      
      const response = await api.post('/auth/validate', token, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return { success: true, data: response.data };
    } catch (error) {

      if (error.response?.status === 401) {
        console.log('Server says token is invalid, cleaning up...');
        this.logout();
        return { success: false, expired: true };
      }
      return { success: false };
    }
  },

  logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  },

  isAuthenticated() {
    const token = localStorage.getItem('authToken');
    if (!token) return false;

    if (this.isTokenExpired(token)) {
      console.log('Token is expired, cleaning up...');
      this.logout();
      return false;
    }
    
    return true;
  },

  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }
};
